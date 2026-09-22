import { NextRequest, NextResponse } from 'next/server';
import { runReminderJob } from '../thursday-reminder/route';
import { runSummaryJob } from '../weekly-summary/route';
import { refreshPredictions } from '@/services/predictor-service';
import { EmailService } from '@/services/email-service';
import { isUnhealthy, type CronJobReport } from '@/lib/cron-health';

/**
 * Consolidated daily cron dispatcher (workstream C).
 *
 * Vercel Hobby allows only 2 crons and both slots were used by the reminder and
 * summary jobs — adding the prediction refresh would need a Pro upgrade. Instead
 * this single daily job runs all three, wrapping the existing handlers (each
 * still self-authorizes and self-gates on its own timing window). The old routes
 * remain callable directly for manual testing.
 *
 * vercel.json schedule: "0 8 * * *" (daily 08:00 UTC).
 *
 * This used to answer `{ success: true }` no matter what the three jobs did, so
 * the gameweek emails could stop on 3 Sep 2026 and stay stopped for nineteen
 * days with every run logged green. It now answers 5xx whenever a job threw or
 * *stalled* — reached its send window and delivered nothing. See
 * `src/lib/cron-health.ts` for the distinction between idle and stalled.
 *
 * Two query flags, both requiring the same CRON_SECRET as a real run:
 *   ?dryRun=1    walk every gate and report what would be sent, sending nothing
 *   ?diagnose=1  dryRun, and skip the prediction refresh for a fast answer
 *
 * `curl -H "Authorization: Bearer $CRON_SECRET" \
 *    https://fplranker.com/api/cron/daily?diagnose=1`
 * is the one request that answers "why did no email go out?".
 */
export const maxDuration = 60;

/** Normalise whatever a job route returned into a report the dispatcher can grade. */
async function collect(res: Response, job: string): Promise<CronJobReport> {
  const body = await res.json().catch(() => ({}));
  if (typeof body?.outcome === 'string') return body as CronJobReport;
  // A job that has not been converted to the report shape yet (or a 401): grade
  // it on the HTTP status rather than assuming it was fine.
  return {
    outcome: res.ok ? 'idle' : 'error',
    message: body?.message || body?.error || `${job} answered ${res.status}`,
  };
}

async function runDaily(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const diagnose = params.get('diagnose') === '1';
  const dryRun = diagnose || params.get('dryRun') === '1';

  const results: Record<string, CronJobReport> = {};

  try {
    results.reminder = await collect(await runReminderJob(request, { dryRun }), 'reminder');
  } catch (e) {
    results.reminder = { outcome: 'error', message: e instanceof Error ? e.message : String(e) };
  }

  try {
    results.summary = await collect(await runSummaryJob(request, { dryRun }), 'summary');
  } catch (e) {
    results.summary = { outcome: 'error', message: e instanceof Error ? e.message : String(e) };
  }

  // The prediction refresh is not an email job and has no send window, so it is
  // graded only on whether it threw. Skipped under ?diagnose=1 because it is the
  // slow step and answers none of the questions a diagnosis is asking.
  if (diagnose) {
    results.predictions = { outcome: 'idle', message: 'Skipped (diagnose)' };
  } else {
    try {
      const out = await refreshPredictions();
      results.predictions = {
        outcome: 'idle',
        message: out ? 'Predictions refreshed' : 'No upcoming gameweek',
        gates: out ? { refreshed: out } : undefined,
      };
    } catch (e) {
      results.predictions = { outcome: 'error', message: e instanceof Error ? e.message : String(e) };
    }
  }

  const unhealthy = Object.entries(results).filter(([, r]) => isUnhealthy(r));
  const status = unhealthy.some(([, r]) => r.outcome === 'error') ? 500 : unhealthy.length ? 503 : 200;

  if (unhealthy.length) {
    console.error(
      `❌ Daily cron unhealthy: ${unhealthy.map(([k, r]) => `${k}=${r.outcome} (${r.message})`).join(' · ')}`,
    );
    if (!dryRun) await alert(unhealthy);
  }

  return NextResponse.json(
    {
      success: status === 200,
      dryRun,
      ranAt: new Date().toISOString(),
      unhealthy: unhealthy.map(([job]) => job),
      results,
    },
    { status },
  );
}

/**
 * Mail the failure to support.
 *
 * A 5xx is only an alarm if somebody opens the cron log, and for nineteen days
 * nobody did. This is the push half. It runs at most once a day because the
 * cron does, and it never throws: an alert that can fail the run it is
 * reporting on would be worse than no alert.
 *
 * It does depend on Resend being up, which is the one failure it cannot report.
 * The 5xx in the platform's cron log is the backstop for that case.
 */
async function alert(unhealthy: [string, CronJobReport][]) {
  const lines = unhealthy
    .map(([job, r]) => `<li><b>${job}</b> — ${r.outcome}: ${escapeHtml(r.message)}</li>`)
    .join('');
  const gates = unhealthy
    .map(([job, r]) => `${job}: ${JSON.stringify(r.gates ?? {}, null, 2)}`)
    .join('\n\n');

  try {
    await EmailService.getInstance().sendEmail({
      to: 'support@fplranker.com',
      subject: `⚠️ Daily cron ${unhealthy.map(([j]) => j).join(' + ')} failed`,
      html: `
        <h2>The daily cron did not deliver</h2>
        <ul>${lines}</ul>
        <p>Diagnose without sending anything:</p>
        <pre>curl -H "Authorization: Bearer $CRON_SECRET" \\
  https://fplranker.com/api/cron/daily?diagnose=1</pre>
        <p>Gates as evaluated on this run:</p>
        <pre>${escapeHtml(gates)}</pre>
        <p style="color:#888">${new Date().toISOString()}</p>
      `,
    });
  } catch (e) {
    console.error('Cron alert email failed (the 5xx status is still the signal):', e);
  }
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

export async function GET(request: NextRequest) { return runDaily(request); }
export async function POST(request: NextRequest) { return runDaily(request); }
