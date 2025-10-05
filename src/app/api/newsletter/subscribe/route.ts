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
      console.log(`📧 Attempting to save subscription: ${email} for league ${leagueId}`);

      // First, check if the table exists by attempting to find
      const existingSubscription = await prisma.newsletterSubscription.findFirst({
        where: {
          email: email.toLowerCase(),
          leagueId: parseInt(leagueId)
        }
      });

      if (existingSubscription) {
        console.log(`📧 Updating existing subscription (ID: ${existingSubscription.id})`);
        subscription = await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            isActive: true,
            lastSentAt: new Date()
          }
        });
      } else {
        console.log(`📧 Creating new subscription for ${email}`);
        subscription = await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            leagueId: parseInt(leagueId),
            isActive: true,
            lastSentAt: new Date()
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