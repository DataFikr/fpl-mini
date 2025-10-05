import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EmailService } from '@/services/email-service';
import { FPLApiService } from '@/services/fpl-api';

/**
 * Thursday Reminder Email Cron Job
 *
 * This endpoint sends reminder emails every Thursday to subscribers
 * to update their fantasy teams before the gameweek deadline.
 *
 * To set up with Vercel Cron Jobs, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/thursday-reminder",
 *     "schedule": "0 10 * * 4"  // Every Thursday at 10:00 AM UTC
 *   }]
 * }
 *
 * For manual testing: POST to /api/cron/thursday-reminder
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting Thursday reminder email cron job...');

    // Get current gameweek
    const fplApi = new FPLApiService();
    const currentGameweek = await fplApi.getCurrentGameweek();
    const upcomingGameweek = currentGameweek + 1;

    console.log(`📅 Upcoming gameweek: ${upcomingGameweek}`);

    // Get all active subscriptions
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true
      }
    });

    console.log(`📧 Found ${subscriptions.length} active subscriptions`);

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        sent: 0
      });
    }

    // Group subscriptions by league
    const leagueSubscriptions = new Map<number, typeof subscriptions>();
    for (const sub of subscriptions) {
      const leagueId = sub.leagueId;
      if (!leagueSubscriptions.has(leagueId)) {
        leagueSubscriptions.set(leagueId, []);
      }
      leagueSubscriptions.get(leagueId)!.push(sub);
    }

    console.log(`🏆 Processing ${leagueSubscriptions.size} unique leagues`);

    const emailService = EmailService.getInstance();
    let successCount = 0;
    let failureCount = 0;

    // Process each league
    for (const [leagueId, leagueSubs] of leagueSubscriptions.entries()) {
      try {
        // Fetch league data
        const leagueResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/leagues/${leagueId}`);
        const leagueData = await leagueResponse.json();

        const leagueName = leagueData.name || `League ${leagueId}`;

        console.log(`📨 Sending Thursday reminders for league: ${leagueName} (${leagueSubs.length} subscribers)`);

        // Send reminder email to each subscriber in this league
        for (const sub of leagueSubs) {
          try {
            const result = await emailService.sendThursdayReminder(
              sub.email,
              leagueName,
              leagueId,
              upcomingGameweek
            );

            if (result.success) {
              successCount++;
              console.log(`✅ Reminder sent to ${sub.email}`);
            } else {
              failureCount++;
              console.error(`❌ Failed to send reminder to ${sub.email}:`, result.error);
            }
          } catch (emailError) {
            failureCount++;
            console.error(`❌ Error sending reminder to ${sub.email}:`, emailError);
          }
        }
      } catch (leagueError) {
        console.error(`❌ Error processing league ${leagueId}:`, leagueError);
        failureCount += leagueSubs.length;
      }
    }

    console.log(`✅ Thursday reminder job completed. Success: ${successCount}, Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: 'Thursday reminder emails processed',
      sent: successCount,
      failed: failureCount,
      totalSubscriptions: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Thursday reminder cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process Thursday reminder emails' },
      { status: 500 }
    );
  }
}

// Allow GET for manual trigger (in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  return POST(request);
}
