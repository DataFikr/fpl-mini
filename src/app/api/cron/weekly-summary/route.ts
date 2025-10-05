import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EmailService } from '@/services/email-service';
import { FPLApiService } from '@/services/fpl-api';

/**
 * Weekly Gameweek Summary Email Cron Job
 *
 * This endpoint should be called after each gameweek completes (Sunday/Monday)
 * to send weekly summary emails to all active subscribers.
 *
 * To set up with Vercel Cron Jobs, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 12 * * 1"  // Every Monday at 12:00 PM UTC
 *   }]
 * }
 *
 * For manual testing: POST to /api/cron/weekly-summary
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting weekly gameweek summary email cron job...');

    // Get current gameweek
    const fplApi = new FPLApiService();
    const currentGameweek = await fplApi.getCurrentGameweek();

    console.log(`📅 Current gameweek: ${currentGameweek}`);

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

        console.log(`📨 Sending emails for league: ${leagueName} (${leagueSubs.length} subscribers)`);

        // Send email to each subscriber in this league
        for (const sub of leagueSubs) {
          try {
            // Generate top headlines/stories for the league (you can customize this)
            const stories = [
              {
                title: 'Weekly Performance Summary',
                description: 'Check out this week\'s top performers and biggest movers in your league',
                icon: '📊'
              },
              {
                title: 'League Standings Update',
                description: 'See the latest rankings and points for all teams in your mini-league',
                icon: '🏆'
              }
            ];

            const result = await emailService.sendGameweekSummary(
              sub.email,
              leagueName,
              stories,
              currentGameweek
            );

            if (result.success) {
              successCount++;
              // Update last sent timestamp
              await prisma.newsletterSubscription.update({
                where: { id: sub.id },
                data: { lastSentAt: new Date() }
              });
              console.log(`✅ Email sent to ${sub.email}`);
            } else {
              failureCount++;
              console.error(`❌ Failed to send email to ${sub.email}:`, result.error);
            }
          } catch (emailError) {
            failureCount++;
            console.error(`❌ Error sending email to ${sub.email}:`, emailError);
          }
        }
      } catch (leagueError) {
        console.error(`❌ Error processing league ${leagueId}:`, leagueError);
        failureCount += leagueSubs.length;
      }
    }

    console.log(`✅ Weekly summary email job completed. Success: ${successCount}, Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: 'Weekly summary emails processed',
      sent: successCount,
      failed: failureCount,
      totalSubscriptions: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Weekly summary cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process weekly summary emails' },
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
