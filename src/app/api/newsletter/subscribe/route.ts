import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { FPLApiService } from '@/services/fpl-api';
import { EmailService } from '@/services/email-service';
import { clientIp, rateLimitAll, tooManyRequests } from '@/lib/rate-limit';

const PER_EMAIL = { limit: 3, windowSec: 60 * 60 };
const PER_IP = { limit: 8, windowSec: 60 * 60 };

export async function POST(request: NextRequest) {
  try {
    const { email, leagueId, leagueName, gameweek, subscriptionType = 'newsletter', rivalData } = await request.json();

    // Get current gameweek dynamically if not provided
    let currentGameweek = gameweek;
    if (!currentGameweek) {
      try {
        const fplApi = new FPLApiService();
        currentGameweek = await fplApi.getCurrentGameweek();
      } catch (error) {
        console.warn('Failed to fetch current gameweek, using fallback:', error);
        currentGameweek = 6; // Fallback to current gameweek
      }
    }

    if (!email || !leagueId) {
      return NextResponse.json(
        { error: 'Email and league ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limited on both subjects (added 2026-09-07): subscribing sends a
    // confirmation email, so an unthrottled endpoint lets anyone sign a third
    // party up repeatedly and spend Resend quota doing it.
    const limited = await rateLimitAll([
      { key: `subscribe:email:${email.toLowerCase()}`, rule: PER_EMAIL },
      { key: `subscribe:ip:${clientIp(request)}`, rule: PER_IP },
    ]);
    if (!limited.ok) {
      return tooManyRequests(
        limited.retryAfter,
        'Too many subscription attempts. Please check your inbox and try again shortly.'
      );
    }

    // Save subscription to database
    let subscription;
    try {
      console.log(`📧 Attempting to save subscription: ${email} for league ${leagueId}`);

      // First, check if the table exists by attempting to find
      const existingSubscription = await prisma.newsletterSubscription.findFirst({
        where: {
          email: email.toLowerCase(),
          leagueId: parseInt(leagueId)
        }
      });

      // Single opt-in: `verifiedAt` is stamped here rather than by a click in a
      // confirmation email.
      //
      // Double opt-in cost 80% of the list (5 "Confirm your spot" sends → 1
      // "You're in") — the Sep 2026 diagnostic's largest single conversion loss.
      // That trade buys deliverability protection worth having at 50k
      // subscribers and nothing at all at 16, where the whole list is people who
      // typed their address into a form thirty seconds earlier. Every send still
      // carries a one-click unsubscribe, which is what actually keeps complaint
      // rates down. Revisit above ~500 subscribers.
      const now = new Date();
      if (existingSubscription) {
        console.log(`📧 Updating existing subscription (ID: ${existingSubscription.id})`);
        subscription = await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            isActive: true,
            // Preserve an existing confirmation timestamp so a re-subscribe does
            // not rewrite when consent was first given.
            verifiedAt: existingSubscription.verifiedAt ?? now,
            lastSentAt: now
          }
        });
      } else {
        console.log(`📧 Creating new subscription for ${email}`);
        subscription = await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            leagueId: parseInt(leagueId),
            isActive: true,
            verifiedAt: now,
            lastSentAt: now
          }
        });
      }

      console.log(`✅ Email subscription saved successfully: ${email} for league ${leagueId} (ID: ${subscription.id})`);
    } catch (dbError) {
      console.error('❌ Database error details:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      console.error('Error message:', errorMessage);
      console.error('Full error object:', JSON.stringify(dbError, null, 2));

      // Check if this is a table not found error
      const isTableNotFoundError = errorMessage.toLowerCase().includes('relation') &&
                                    errorMessage.toLowerCase().includes('does not exist');

      const isConnectionError = errorMessage.toLowerCase().includes('connection') ||
                               errorMessage.toLowerCase().includes('connect') ||
                               errorMessage.toLowerCase().includes('timeout');

      if (isTableNotFoundError) {
        return NextResponse.json(
          {
            error: 'Database table not found',
            details: 'Please run database migrations: npx prisma migrate deploy',
            technicalDetails: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          },
          { status: 503 }
        );
      }

      if (isConnectionError) {
        return NextResponse.json(
          {
            error: 'Database connection failed',
            details: 'Unable to connect to the database. Please check DATABASE_URL environment variable.',
            technicalDetails: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to save subscription',
          details: 'An error occurred while saving your subscription. Please try again.',
          technicalDetails: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Get email service instance
    const emailService = EmailService.getInstance();

    // Sportify-themed subscribe email, carrying the same league infographic the
    // app's Share → Download produces. Always the welcome variant now that the
    // subscription is live on submit — there is nothing left to confirm, so an
    // email asking them to click again would only be a second chance to drop
    // out. The one-click unsubscribe link is what carries the consent contract.
    try {
      const { signSubToken } = await import('@/lib/newsletter-token');
      const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://fplranker.com').replace(/\/$/, '');
      const token = signSubToken(email, parseInt(leagueId));
      await emailService.sendNewsletterWelcome({
        to: email,
        leagueId: parseInt(leagueId),
        leagueName: leagueName || `League ${leagueId}`,
        mode: 'welcome',
        unsubscribeUrl: `${base}/api/newsletter/unsubscribe?token=${token}`,
      });
    } catch (e) {
      console.warn('Subscribe email failed (continuing):', e);
    }

    // Handle different subscription types
    if (subscriptionType === 'rival-analysis') {
      console.log(`📧 Rival analysis email requested for ${email} for league ${leagueId}, gameweek ${gameweek}`);

      // Send rival analysis email with full table data
      const emailResult = await emailService.sendRivalAnalysis(
        email,
        leagueName || `League ${leagueId}`,
        currentGameweek,
        rivalData || []
      );

      if (!emailResult.success) {
        console.error('Failed to send rival analysis email:', emailResult.error);

        // Check if it's a configuration issue
        const isConfigurationError = emailResult.error?.includes('API key is invalid') ||
                                     emailResult.error?.includes('not configured');

        return NextResponse.json({
          success: false,
          message: isConfigurationError
            ? 'Email service is currently in demo mode. Please configure RESEND_API_KEY for actual email delivery.'
            : 'Failed to send email. Please try again later.',
          error: emailResult.error,
          isDemo: isConfigurationError
        }, { status: isConfigurationError ? 200 : 500 });
      }

      // Update database with successful send
      await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: { lastSentAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: 'Rival analysis email sent successfully!',
        emailId: emailResult.messageId
      });
    }

    // Subscribing sends exactly one email: the confirm/welcome above, which
    // already carries the league's live OG infographic. It used to be followed
    // by a second, older summary/analysis template — two emails per subscribe,
    // for the same mini-league. The gameweek summary belongs to the scheduled
    // bulk send (/api/newsletter/send-bulk), which goes only to verified
    // addresses, so nothing is lost by not firing one here.
    return NextResponse.json({
      success: true,
      message: "You're subscribed — reports start with the next gameweek.",
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter subscription' },
      { status: 500 }
    );
  }
}