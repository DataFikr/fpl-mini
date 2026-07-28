import { NextRequest, NextResponse } from 'next/server';
import { runReminderJob } from '../thursday-reminder/route';
import { runSummaryJob } from '../weekly-summary/route';
import { refreshPredictions } from '@/services/predictor-service';

/**
 * Consolidated daily cron dispatcher (workstream C).
 *
 * Vercel Hobby allows only 2 crons and both slots were used by the reminder and
 * summary jobs — adding the prediction refresh would need a Pro upgrade. Instead
 * this single daily job runs all three, wrapping the existing handlers unchanged
 * (each still self-authorizes and self-gates on its own timing window). The old
 * routes remain callable directly for manual testing.
 *
 * vercel.json schedule: "0 8 * * *" (daily 08:00 UTC).
 */
export const maxDuration = 60;

async function runDaily(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    const res = await runReminderJob(request);
    results.reminder = await res.json();
  } catch (e) {
    results.reminder = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    const res = await runSummaryJob(request);
    results.summary = await res.json();
  } catch (e) {
    results.summary = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    results.predictions = (await refreshPredictions()) ?? { message: 'No upcoming gameweek' };
  } catch (e) {
    results.predictions = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ success: true, ranAt: new Date().toISOString(), results });
}

export async function GET(request: NextRequest) { return runDaily(request); }
export async function POST(request: NextRequest) { return runDaily(request); }
