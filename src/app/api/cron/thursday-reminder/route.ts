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
 * Invoked by the consolidated /api/cron/daily dispatcher
 * (vercel.json schedule: "0 8 * * *" — daily at 08:00 UTC).
 *
 * NOTE: Vercel Cron invokes this endpoint with a GET request and attaches
 * `Authorization: Bearer ${CRON_SECRET}` automatically when CRON_SECRET is set.
 * Both GET and POST run the same job so the cron actually fires in production.
 */
export async function runReminderJob(request: NextRequest) {
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

    // Only verified subscribers (double opt-in): a confirmed verifiedAt is the
    // gate for bulk sends, so unconfirmed addresses never receive email.
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: { isActive: true, verifiedAt: { not: null } }
    });

    console.log(`📧 Found ${subscriptions.length} active, verified subscriptions`);

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

    // Collect all emails, then batch send
    const allEmails: { to: string; subject: string; html: string }[] = [];

    for (const [leagueId, leagueSubs] of leagueSubscriptions.entries()) {
      try {
        const leagueResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/leagues/${leagueId}`);
        const leagueData = await leagueResponse.json();
        const leagueName = leagueData.name || `League ${leagueId}`;

        console.log(`📨 Preparing deadline reminders for ${leagueName} (${leagueSubs.length} subscribers)`);

        for (const sub of leagueSubs) {
          // Build the email payload without sending yet
          const subject = `⏰ FPL Deadline Reminder - Gameweek ${nextEvent.id} | ${leagueName}`;
          const html = (emailService as any).generateThursdayReminderHTML(sub.email, leagueName, leagueId, nextEvent.id, nextEvent.deadline_time);
          allEmails.push({ to: sub.email, subject, html });
        }
      } catch (leagueError) {
        console.error(`❌ Error processing league ${leagueId}:`, JSON.stringify(leagueError instanceof Error ? leagueError.message : leagueError));
        failureCount += leagueSubs.length;
      }
    }

    // Squad-scoped reminders. Independent of the league loop above: these
    // subscribers may be in no mini-league newsletter at all, which was the
    // whole point of opening the reminder up. Each email carries that manager's
    // own flagged players rather than league standings, so it is the painkiller
    // itself and not a nudge to come and look for one.
    let squadSent = 0;
    try {
      squadSent = await sendSquadReminders(nextEvent, fplApi, emailService);
    } catch (e) {
      console.error('Squad deadline reminders failed (league reminders unaffected):', e);
    }

    if (allEmails.length > 0) {
      console.log(`📤 Batch sending ${allEmails.length} reminder emails...`);
      const batchResult = await emailService.sendBatch(allEmails);
      successCount = batchResult.successCount;
      failureCount += batchResult.failureCount;
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
      sent: successCount + squadSent,
      leagueSent: successCount,
      squadSent,
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

// Vercel Cron uses GET — this is the primary production trigger.
export async function GET(request: NextRequest) {
  return runReminderJob(request);
}

// POST kept for manual triggers / local testing.
export async function POST(request: NextRequest) {
  return runReminderJob(request);
}

/**
 * Squad-scoped deadline reminders (diagnostic action 16 + 17).
 *
 * For each active DeadlineSubscription, works out which players in that
 * manager's own 15 are flagged for the upcoming gameweek and mails them that
 * list. Bootstrap is fetched once and shared; only the per-manager picks call
 * scales with subscriber count, and it is bounded by MAX_SQUAD_REMINDERS so a
 * surge cannot blow the cron's time budget.
 *
 * Picks for the *upcoming* gameweek do not exist until a manager saves them, so
 * this reads the last completed gameweek's squad — which is exactly the squad
 * they still have if they have not acted, i.e. the one the warning is about.
 */
const MAX_SQUAD_REMINDERS = 500;

async function sendSquadReminders(
  nextEvent: { id: number; deadline_time?: string },
  fplApi: FPLApiService,
  emailService: EmailService,
): Promise<number> {
  const subs = await prisma.deadlineSubscription.findMany({
    where: { isActive: true },
    take: MAX_SQUAD_REMINDERS,
  });
  if (subs.length === 0) return 0;

  console.log(`📧 Preparing ${subs.length} squad deadline reminder(s) for GW${nextEvent.id}`);

  const bootstrap = await fplApi.getBootstrapData();
  const elements = bootstrap.elements as any[];
  const teams = bootstrap.teams as any[];
  const byId = new Map<number, any>(elements.map((e) => [e.id, e]));
  const teamShort = new Map<number, string>(teams.map((t) => [t.id, t.short_name]));

  const deadlineLabel = nextEvent.deadline_time
    ? new Date(nextEvent.deadline_time).toUTCString().replace(/:\d{2} GMT$/, ' UTC')
    : 'before kick-off';

  // The squad they hold now is last GW's, since next GW's picks are not saved yet.
  const picksGw = Math.max(1, nextEvent.id - 1);
  const { signTeamToken } = await import('@/lib/newsletter-token');
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://fplranker.com').replace(/\/$/, '');

  let sent = 0;
  for (const sub of subs) {
    try {
      const picks = await fplApi.getManagerPicks(sub.fplTeamId, picksGw);
      if (!picks?.picks?.length) continue;

      const flagged: { name: string; team: string; note: string }[] = [];
      let captain: { name: string; team: string } | null = null;

      for (const p of picks.picks as any[]) {
        const el = byId.get(p.element);
        if (!el) continue;
        const short = teamShort.get(el.team) || '';
        if (p.is_captain) captain = { name: el.web_name, team: short };

        // `status` 'a' is available; anything else is a flag. chance_of_playing
        // is null when unflagged, so only trust it when it is a real number.
        const chance = typeof el.chance_of_playing_next_round === 'number'
          ? el.chance_of_playing_next_round
          : null;
        const unavailable = el.status && el.status !== 'a';
        if (!unavailable && chance === null) continue;
        if (chance !== null && chance >= 100) continue;

        const note =
          el.status === 'i' ? 'Injured'
          : el.status === 's' ? 'Suspended'
          : el.status === 'u' ? 'Unavailable'
          : chance !== null ? `${chance}% chance`
          : 'Doubtful';
        flagged.push({ name: el.web_name, team: short, note });
      }

      const res = await emailService.sendSquadDeadlineReminder({
        to: sub.email,
        fplTeamId: sub.fplTeamId,
        gameweek: nextEvent.id,
        deadlineLabel,
        flagged,
        captain,
        unsubscribeUrl: `${base}/api/reminders?token=${signTeamToken(sub.email, sub.fplTeamId)}`,
      });
      if (res.success) {
        sent++;
        await prisma.deadlineSubscription.update({
          where: { id: sub.id },
          data: { lastSentAt: new Date() },
        });
      }
    } catch (e) {
      // One bad team id must not stop the rest of the run.
      console.warn(`Squad reminder skipped for team ${sub.fplTeamId}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`✅ Squad deadline reminders sent: ${sent}/${subs.length}`);
  return sent;
}
