import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EmailService } from '@/services/email-service';
import { FPLApiService } from '@/services/fpl-api';
import redis from '@/lib/redis';
import { findPlayerPhotoInText, type BootstrapElementLike } from '@/lib/fpl-images';
import { classifySend, idle, stalled, type CronJobReport } from '@/lib/cron-health';

/**
 * Gameweek Summary Email Cron Job
 *
 * Runs daily and checks if a gameweek recently finished.
 * Sends summary emails once that gameweek's bonus points are confirmed.
 *
 * Invoked by the consolidated /api/cron/daily dispatcher
 * (vercel.json schedule: "0 8 * * *" — daily at 08:00 UTC).
 *
 * NOTE: Vercel Cron invokes this endpoint with a GET request and attaches
 * `Authorization: Bearer ${CRON_SECRET}` automatically when CRON_SECRET is set.
 * Both GET and POST run the same job so the cron actually fires in production.
 *
 * Every exit returns a {@link CronJobReport}, so "no gameweek has finished yet"
 * and "the window was open and we mailed nobody" stop looking the same to the
 * dispatcher. Pass `{ dryRun: true }` to walk every gate and report what would
 * be sent without handing anything to Resend.
 */

/**
 * Do not mail the same subscriber twice within this many hours.
 *
 * A DB-backed companion to the Redis dedup key below. Redis is optional here —
 * both `get` and `setEx` are wrapped in swallowing try/catch so an outage cannot
 * block the send — which means Redis alone would let an outage mail the whole
 * list again every morning. `lastSentAt` lives in Postgres and survives that.
 */
const RESEND_COOLDOWN_HOURS = 72;

export async function runSummaryJob(request: NextRequest, opts: { dryRun?: boolean } = {}) {
  const { dryRun = false } = opts;
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
      return report(idle('No finished gameweek found yet', { finishedGameweeks: 0 }));
    }

    // Ensure bonus points are finalized (data_checked = true)
    if (!lastFinished.data_checked) {
      console.log(`⏳ GW${lastFinished.id} finished but data_checked is false — waiting for bonus points to finalize`);
      return report(idle(`GW${lastFinished.id} data not yet confirmed (data_checked: false)`, {
        lastFinishedGw: lastFinished.id,
        dataChecked: false,
      }));
    }

    const currentEvent = bootstrap.events.find((e) => e.is_current);
    const nextEvent = bootstrap.events.find((e) => e.is_next);
    const now = new Date();
    const hoursUntilNext = nextEvent
      ? (new Date(nextEvent.deadline_time).getTime() - now.getTime()) / (1000 * 60 * 60)
      : null;

    /*
     * Send once the last gameweek's points are confirmed, and keep sending
     * eligible right up to the next deadline.
     *
     * The previous rule also required `hoursUntilNext < 144`, which silently
     * excluded every international break: with the next deadline twelve days
     * out, the window did not open until the summary was already a week stale,
     * and any Redis hiccup in between lost it altogether. The upper bound was
     * never what made this send once — the per-gameweek dedup below is. The
     * lower bound stays, so a summary never lands on top of a deadline reminder.
     */
    const gwOver = !!currentEvent?.finished;
    const clearOfNextDeadline = hoursUntilNext === null || hoursUntilNext > 24;
    const shouldSend = gwOver && clearOfNextDeadline;

    const gates = {
      lastFinishedGw: lastFinished.id,
      currentGw: currentEvent?.id ?? null,
      currentGwFinished: gwOver,
      nextGw: nextEvent?.id ?? null,
      hoursUntilNextDeadline: hoursUntilNext === null ? null : +hoursUntilNext.toFixed(1),
      clearOfNextDeadline,
      shouldSend,
    };

    console.log(`📅 Last finished GW: ${lastFinished.id}, Should send: ${shouldSend}`);

    if (!shouldSend) {
      return report(idle(
        `Not time to send summary. Last finished: GW${lastFinished.id}`,
        gates,
      ));
    }

    // Check if we already sent a summary for this GW. The TTL outlives an
    // international break — a 7-day key could expire mid-break and re-send a
    // gameweek that had already gone out. Gameweek ids never recur, so a long
    // TTL costs nothing.
    const sentKey = `cron:summary:sent:gw:${lastFinished.id}`;
    try {
      const alreadySent = await redis.get(sentKey);
      if (alreadySent) {
        return report(idle(`Summary already sent for GW${lastFinished.id}`, { ...gates, dedup: 'redis' }));
      }
    } catch {
      // Redis unavailable — `lastSentAt` below is the durable guard.
    }

    /*
     * Recipients: active, verified subscribers who are not inside the cooldown.
     *
     * `verifiedAt` is stamped at submit time by the single opt-in flow
     * (`/api/newsletter/subscribe`), so for anything created since 5 Sep 2026 it
     * simply means "subscribed". Rows predating that carried a null until the
     * one-off backfill (`npm run backfill:newsletter`) stamped them; without it
     * they are unreachable, because the double opt-in confirm route no longer
     * has anything pointing at it. That null was excluding 29 of 32 subscribers.
     */
    const cooldownSince = new Date(now.getTime() - RESEND_COOLDOWN_HOURS * 60 * 60 * 1000);
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true,
        verifiedAt: { not: null },
        OR: [{ lastSentAt: null }, { lastSentAt: { lt: cooldownSince } }],
      }
    });

    console.log(`📧 Found ${subscriptions.length} eligible subscriptions`);

    if (subscriptions.length === 0) {
      // Nobody to mail from an open window. Two very different reasons, and
      // only one is a bug — so count the list before deciding which.
      const [active, verified] = await Promise.all([
        prisma.newsletterSubscription.count({ where: { isActive: true } }),
        prisma.newsletterSubscription.count({ where: { isActive: true, verifiedAt: { not: null } } }),
      ]);
      const counts = { ...gates, activeSubscriptions: active, verifiedSubscriptions: verified };

      if (verified > 0) {
        // There are recipients; they were all mailed inside the cooldown. That
        // is the dedup doing its job — the expected state on every day after a
        // summary goes out, and not something to page anyone about.
        return report(idle(
          `GW${lastFinished.id} summary already went to all ${verified} subscribers within the last ${RESEND_COOLDOWN_HOURS}h`,
          { ...counts, dedup: 'cooldown' },
        ));
      }

      // Zero verified against a non-empty active list is the exact failure this
      // job ran into: a filter eating the recipients while reporting success.
      return report(stalled(
        `GW${lastFinished.id} summary had no verified recipients (${active} active, 0 verified — run \`npm run backfill:newsletter\`)`,
        counts,
      ));
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

        // Attach official player action photos to stories that name a PL player.
        const elements = (bootstrap.elements || []) as BootstrapElementLike[];
        const storiesWithPhotos = stories.map((story: any) => {
          if (story.imageUrl) return story;
          const text = `${story.headline || ''} ${story.subheadline || ''} ${story.details || story.description || ''}`;
          const found = findPlayerPhotoInText(text, elements);
          return found ? { ...story, imageUrl: found.photoUrl, playerName: found.playerName } : story;
        });

        for (const sub of leagueSubs) {
          const subject = `📰 ${leagueName} - Gameweek ${lastFinished.id} Summary`;
          const html = (emailService as any).generateGameweekSummaryHTML(leagueName, storiesWithPhotos, sub.email, lastFinished.id, leagueId);
          allEmails.push({ to: sub.email, subject, html });
          subIdsToUpdate.push(sub.id);
        }
      } catch (leagueError) {
        console.error(`❌ Error processing league ${leagueId}:`, JSON.stringify(leagueError instanceof Error ? leagueError.message : leagueError));
        failureCount += leagueSubs.length;
      }
    }

    if (dryRun) {
      return report({
        outcome: 'idle',
        message: `Dry run: would send ${allEmails.length} GW${lastFinished.id} summary emails`,
        sent: 0,
        gates: { ...gates, wouldSend: allEmails.length, eligibleSubscriptions: subscriptions.length },
      });
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

    // Mark as sent to prevent duplicates. 30 days, not 7: a 7-day key can expire
    // inside an international break and re-send a gameweek that already went out.
    try {
      await redis.setEx(sentKey, 2592000, 'true');
    } catch {
      // Redis unavailable — the lastSentAt cooldown above is the durable guard.
    }

    console.log(`✅ GW summary job completed. Success: ${successCount}, Failed: ${failureCount}`);

    // Zero delivered from an open window is `stalled`, not success: an unset
    // RESEND_API_KEY makes sendBatch resolve with successCount 0 and no throw.
    const result = classifySend(successCount, failureCount, `GW${lastFinished.id} summary`);
    return report({
      ...result,
      gates: { ...gates, eligibleSubscriptions: subscriptions.length, queued: allEmails.length },
    });

  } catch (error) {
    console.error('❌ Gameweek summary cron job error:', error);
    return report({
      outcome: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Serialise a report, and make an unhealthy one answer 5xx.
 *
 * The status code is the alarm. Vercel's cron log shows a red run for a stalled
 * send instead of the green tick that hid this for nineteen days.
 */
function report(r: CronJobReport) {
  const status = r.outcome === 'error' ? 500 : r.outcome === 'stalled' ? 503 : 200;
  return NextResponse.json({ success: status === 200, job: 'summary', ...r }, { status });
}

// Vercel Cron uses GET — this is the primary production trigger.
export async function GET(request: NextRequest) {
  return runSummaryJob(request, { dryRun: request.nextUrl.searchParams.get('dryRun') === '1' });
}

// POST kept for manual triggers / local testing.
export async function POST(request: NextRequest) {
  return runSummaryJob(request, { dryRun: request.nextUrl.searchParams.get('dryRun') === '1' });
}
