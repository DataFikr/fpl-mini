import { NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

/**
 * Current gameweek plus the next deadline.
 *
 * The deadline powers the landing-page countdown. It comes from the live
 * bootstrap rather than a constant so a rescheduled deadline is picked up
 * automatically — the client keeps a fallback for when this call fails.
 */
export async function GET() {
  try {
    const fplApi = new FPLApiService();
    const bootstrap = await fplApi.getBootstrapData();
    const events = bootstrap.events || [];

    const current = events.find((e: any) => e.is_current);
    const next = events.find((e: any) => e.is_next)
      // Pre-season: no event is flagged, so take the first unfinished one.
      || events.find((e: any) => !e.finished && e.deadline_time);

    return NextResponse.json({
      success: true,
      gameweek: current ? current.id : 1,
      seasonStarted: Boolean(current),
      nextGameweek: next ? next.id : null,
      nextDeadline: next ? next.deadline_time : null,
    });
  } catch (error) {
    console.error('Failed to fetch current gameweek:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch current gameweek',
        gameweek: 6, // Fallback
        seasonStarted: false,
        nextGameweek: null,
        nextDeadline: null,
      },
      { status: 500 }
    );
  }
}
