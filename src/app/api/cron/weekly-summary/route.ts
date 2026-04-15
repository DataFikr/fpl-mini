import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EmailService } from '@/services/email-service';
import { FPLApiService } from '@/services/fpl-api';
import redis from '@/lib/redis';

/**
 * Gameweek Summary Email Cron Job
 *
 * Runs daily and checks if a gameweek recently finished.
 * Sends summary emails 1 day after gameweek completion.
 *
 * vercel.json schedule: "0 10 * * *" (daily at 10:00 AM UTC)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting gameweek summary check...');

    const fplApi = new FPLApiService();
    const bootstrap = await fplApi.getBootstrapData();

    // Find the most recently finished gameweek
    const finishedEvents = bootstrap.events
      .filter((e) => e.finished)
      .sort((a, b) => b.id - a.id);

    const lastFinished = finishedEvents[0];
    if (!lastFinished) {
      return NextResponse.json({
        success: true,
        message: 'No finished gameweek found yet',
        sent: 0
      });
    }

    // Ensure bonus points are finalized (data_checked = true)
    if (!lastFinished.data_checked) {
      console.log(`⏳ GW${lastFinished.id} finished but data_checked is false — waiting for bonus points to finalize`);
      return NextResponse.json({
        success: true,
        message: `GW${lastFinished.id} data not yet confirmed (data_checked: false)`,
        sent: 0
      });
    }

    // Check if next GW deadline exists to estimate when last GW finished
    // A GW is considered "just finished" if the next GW deadline is more than 1 day away
    // and the current GW is finished
    const currentEvent = bootstrap.events.find((e) => e.is_current);
    const nextEvent = bootstrap.events.find((e) => e.is_next);

    // Use the next event's deadline to gauge timing:
    // If next deadline is far away, the current/last GW just finished
    const now = new Date();

    // Determine if we should send: check if the last finished GW completed within the last 36 hours
    // We approximate by checking: if current event is finished and next event deadline > 24h away
    let shouldSend = false;

    if (currentEvent && currentEvent.finished) {
      // Current GW just finished
      if (nextEvent) {
        const nextDeadline = new Date(nextEvent.deadline_time);
        const hoursUntilNext = (nextDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        // Send if next deadline is 1-6 days away (we're in the post-GW window)
        shouldSend = hoursUntilNext > 24 && hoursUntilNext < 144;
      } else {
        // No next event = season ended, send final summary
        shouldSend = true;
      }
    } else if (lastFinished.id === (currentEvent?.id ?? 0) - 1) {
      // The GW before current just finished, current is ongoing
      // Don't send - wait for current to finish
      shouldSend = false;
    }

    console.log(`📅 Last finished GW: ${lastFinished.id}, Should send: ${shouldSend}`);

    if (!shouldSend) {
      return NextResponse.json({
        success: true,
        message: `Not time to send summary. Last finished: GW${lastFinished.id}`,
        sent: 0
      });
    }

    // Check if we already sent a summary for this GW
    const sentKey = `cron:summary:sent:gw:${lastFinished.id}`;
    try {
      const alreadySent = await redis.get(sentKey);
      if (alreadySent) {
        return NextResponse.json({
          success: true,
          message: `Summary already sent for GW${lastFinished.id}`,
          sent: 0
        });
      }
    } catch {
      // Redis unavailable, continue
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

    console.log(`🏆 Processing ${leagueSubscriptions.size} unique leagues`);

    const emailService = EmailService.getInstance();
    let successCount = 0;
    let failureCount = 0;

    // Collect all emails, then batch send
    const allEmails: { to: string; subject: string; html: string }[] = [];
    const subIdsToUpdate: string[] = [];

    for (const [leagueId, leagueSubs] of leagueSubscriptions.entries()) {
      try {
        const leagueResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/leagues/${leagueId}`);
        const leagueData = await leagueResponse.json();
        const leagueName = leagueData.name || `League ${leagueId}`;

        console.log(`📨 Preparing GW${lastFinished.id} summary for ${leagueName} (${leagueSubs.length} subscribers)`);

        // Fetch league storytelling data for richer summaries
        let stories: any[] = [];
        try {
          const storiesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/leagues/${leagueId}/storytelling`);
          if (storiesRes.ok) {
            const storiesData = await storiesRes.json();
            stories = storiesData.stories || [];
          }
        } catch {
          stories = [
            { title: 'Weekly Performance Summary', description: 'Check out this week\'s top performers in your league', icon: '📊' },
            { title: 'League Standings Update', description: 'See the latest rankings for all teams', icon: '🏆' }
          ];
        }

        for (const sub of leagueSubs) {
          const subject = `📰 ${leagueName} - Gameweek ${lastFinished.id} Summary`;
          const html = (emailService as any).generateGameweekSummaryHTML(leagueName, stories, sub.email, lastFinished.id);
          allEmails.push({ to: sub.email, subject, html });
          subIdsToUpdate.push(sub.id);
        }
      } catch (leagueError) {
        console.error(`❌ Error processing league ${leagueId}:`, JSON.stringify(leagueError instanceof Error ? leagueError.message : leagueError));
        failureCount += leagueSubs.length;
      }
    }

    if (allEmails.length > 0) {
      console.log(`📤 Batch sending ${allEmails.length} summary emails...`);
      const batchResult = await emailService.sendBatch(allEmails);
      successCount = batchResult.successCount;
      failureCount += batchResult.failureCount;

      // Update lastSentAt for successful sends
      if (batchResult.successCount > 0) {
        try {
          await prisma.newsletterSubscription.updateMany({
            where: { id: { in: subIdsToUpdate } },
            data: { lastSentAt: new Date() }
          });
        } catch (dbError) {
          console.error('❌ Failed to update lastSentAt:', dbError instanceof Error ? dbError.message : String(dbError));
        }
      }
    }

    // Mark as sent to prevent duplicates
    try {
      await redis.setEx(sentKey, 604800, 'true'); // 7 day TTL
    } catch {
      // Redis unavailable, skip dedup
    }

    console.log(`✅ GW summary job completed. Success: ${successCount}, Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: `GW${lastFinished.id} summary emails processed`,
      sent: successCount,
      failed: failureCount,
      totalSubscriptions: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Gameweek summary cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process gameweek summary emails' },
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
