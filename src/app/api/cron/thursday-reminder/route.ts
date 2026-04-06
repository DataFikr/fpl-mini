import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EmailService } from '@/services/email-service';
import { FPLApiService } from '@/services/fpl-api';
import redis from '@/lib/redis';

/**
 * Deadline Reminder Email Cron Job
 *
 * Runs daily and checks if the next gameweek deadline is ~2 days away.
 * Only sends reminder emails when the deadline is 36-60 hours away.
 *
 * vercel.json schedule: "0 8 * * *" (daily at 8:00 AM UTC)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting deadline reminder check...');

    const fplApi = new FPLApiService();
    const bootstrap = await fplApi.getBootstrapData();

    // Find the next gameweek with a deadline
    const nextEvent = bootstrap.events.find((e) => e.is_next);
    if (!nextEvent) {
      return NextResponse.json({
        success: true,
        message: 'No upcoming gameweek found (season may be over)',
        sent: 0
      });
    }

    const deadline = new Date(nextEvent.deadline_time);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log(`📅 Next deadline: GW${nextEvent.id} at ${deadline.toISOString()} (${hoursUntilDeadline.toFixed(1)} hours away)`);

    // Only send if deadline is 36-60 hours away (roughly 2 days before)
    if (hoursUntilDeadline < 36 || hoursUntilDeadline > 60) {
      return NextResponse.json({
        success: true,
        message: `Not time to send reminder. GW${nextEvent.id} deadline in ${hoursUntilDeadline.toFixed(1)} hours.`,
        sent: 0
      });
    }

    // Check if we already sent reminders for this GW
    const sentKey = `cron:reminder:sent:gw:${nextEvent.id}`;
    try {
      const alreadySent = await redis.get(sentKey);
      if (alreadySent) {
        return NextResponse.json({
          success: true,
          message: `Reminder already sent for GW${nextEvent.id}`,
          sent: 0
        });
      }
    } catch {
      // Redis unavailable, continue anyway
    }

    // Get all active subscriptions
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: { isActive: true }
    });

    console.log(`📧 Found ${subscriptions.length} active subscriptions`);

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscriptions found', sent: 0 });
    }

    // Group subscriptions by league
    const leagueSubscriptions = new Map<number, typeof subscriptions>();
    for (const sub of subscriptions) {
      if (!leagueSubscriptions.has(sub.leagueId)) {
        leagueSubscriptions.set(sub.leagueId, []);
      }
      leagueSubscriptions.get(sub.leagueId)!.push(sub);
    }

    const emailService = EmailService.getInstance();
    let successCount = 0;
    let failureCount = 0;

    for (const [leagueId, leagueSubs] of leagueSubscriptions.entries()) {
      try {
        const leagueResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/leagues/${leagueId}`);
        const leagueData = await leagueResponse.json();
        const leagueName = leagueData.name || `League ${leagueId}`;

        console.log(`📨 Sending deadline reminders for ${leagueName} (${leagueSubs.length} subscribers)`);

        for (const sub of leagueSubs) {
          try {
            const result = await emailService.sendThursdayReminder(
              sub.email,
              leagueName,
              leagueId,
              nextEvent.id,
              nextEvent.deadline_time
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

    // Mark as sent to prevent duplicates
    try {
      await redis.setEx(sentKey, 604800, 'true'); // 7 day TTL
    } catch {
      // Redis unavailable, skip dedup
    }

    console.log(`✅ Deadline reminder job completed. Success: ${successCount}, Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: `Deadline reminders sent for GW${nextEvent.id}`,
      sent: successCount,
      failed: failureCount,
      totalSubscriptions: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Deadline reminder cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process deadline reminder emails' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  return POST(request);
}
