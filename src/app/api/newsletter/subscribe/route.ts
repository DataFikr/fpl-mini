import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { FPLApiService } from '@/services/fpl-api';
import { EmailService } from '@/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, leagueId, leagueName, stories, gameweek, subscriptionType = 'newsletter' } = await request.json();

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

    // Save subscription to database
    let subscription;
    try {
      const existingSubscription = await prisma.newsletterSubscription.findFirst({
        where: {
          email: email.toLowerCase(),
          leagueId: parseInt(leagueId)
        }
      });

      if (existingSubscription) {
        subscription = await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            isActive: true,
            lastSentAt: new Date()
          }
        });
      } else {
        subscription = await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            leagueId: parseInt(leagueId),
            isActive: true,
            lastSentAt: new Date()
          }
        });
      }

      console.log(`📧 Email subscription saved: ${email} for league ${leagueId} (ID: ${subscription.id})`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Get email service instance
    const emailService = EmailService.getInstance();

    // Handle different subscription types
    if (subscriptionType === 'team-analysis' || (gameweek && !stories)) {
      console.log(`📧 Team analysis subscription confirmed for ${email} for league ${leagueId}, gameweek ${gameweek}`);

      // Send actual team analysis email
      const emailResult = await emailService.sendTeamAnalysis(
        email,
        leagueName || `League ${leagueId}`,
        currentGameweek
      );

      if (!emailResult.success) {
        console.error('Failed to send team analysis email:', emailResult.error);

        // Check if it's a configuration issue
        const isConfigurationError = emailResult.error?.includes('API key is invalid') ||
                                     emailResult.error?.includes('not configured');

        return NextResponse.json({
          success: false,
          message: isConfigurationError
            ? 'Subscription saved! Email service is currently in demo mode. Please configure RESEND_API_KEY for actual email delivery.'
            : 'Subscription saved but failed to send email. Please try again later.',
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
        message: 'Team analysis email sent successfully and subscription saved!',
        emailId: emailResult.messageId
      });
    }

    // Send gameweek summary newsletter
    const emailResult = await emailService.sendGameweekSummary(
      email,
      leagueName || `League ${leagueId}`,
      stories || [],
      currentGameweek
    );

    if (!emailResult.success) {
      console.error('Failed to send newsletter:', emailResult.error);

      // Check if it's a configuration issue
      const isConfigurationError = emailResult.error?.includes('API key is invalid') ||
                                   emailResult.error?.includes('not configured');

      return NextResponse.json({
        success: false,
        message: isConfigurationError
          ? 'Subscription saved! Email service is currently in demo mode. Please configure RESEND_API_KEY for actual email delivery.'
          : 'Subscription saved but failed to send email. Please try again later.',
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
      message: 'Newsletter sent successfully and subscription saved!',
      emailId: emailResult.messageId
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter subscription' },
      { status: 500 }
    );
  }
}