import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fpl = new FPLApiService();

/** Bounded so one huge league cannot stall the route; the tail is not the story anyway. */
const MAX_MANAGERS = 50;

/**
 * Live mini-league table for a gameweek.
 *
 * The Sep 2026 diagnostic found the matchday audience is the deepest cohort the
 * site has — Sunday sessions ran 113s against a 26.7s pre-deadline peak — and
 * had nothing built for it. The official FPL app shows you your own points; it
 * does not show you passing your mate. That gap is the whole emotional payload
 * of a mini-league and the one thing rivals at 3M visits do not build, because
 * per-league work does not scale for them.
 *
 * Live total = (stored total − stored gameweek score) + live gameweek score,
 * so it stays correct whether or not the FPL API has settled the gameweek yet.
 * Bonus is provisional until fixtures are marked final, which `provisional`
 * reports so the UI can say so rather than quietly showing a number that moves.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leagueId = parseInt(id, 10);
    if (!Number.isFinite(leagueId)) {
      return NextResponse.json({ error: 'Invalid league id' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const reqGw = parseInt(searchParams.get('gw') || '0', 10);
    const teamId = parseInt(searchParams.get('teamId') || '0', 10) || 0;

    const [bootstrap, currentGw] = await Promise.all([
      fpl.getBootstrapData(),
      fpl.getCurrentGameweek(),
    ]);
    const gw = reqGw > 0 ? reqGw : currentGw;

    const [standings, live] = await Promise.all([
      fpl.getLeagueStandings(leagueId),
      fpl.getLiveGameweekData(gw),
    ]);

    const results = (standings.standings?.results || []).slice(0, MAX_MANAGERS);
    if (results.length === 0) {
      return NextResponse.json({ leagueId, leagueName: standings.league?.name || 'League', gw, managers: [], provisional: false });
    }

    // element id → points this gameweek (pre-multiplier)
    const pts = new Map<number, number>();
    for (const el of live.elements) pts.set(el.id, el.stats?.total_points ?? 0);

    // Players still to be counted: any element in a fixture that has not finished.
    const event = (bootstrap.events as any[]).find((e) => e.id === gw);
    const provisional = !!event && !event.finished;

    const picksRes = await Promise.allSettled(results.map((r) => fpl.getManagerPicks(r.entry, gw)));

    const rows = results.map((r, i) => {
      const pr = picksRes[i];
      const picks = pr.status === 'fulfilled' ? pr.value : null;

      let livePoints = 0;
      let played = 0;
      let remaining = 0;
      let captain = '';

      if (picks?.picks) {
        for (const p of picks.picks as any[]) {
          if (p.multiplier <= 0) continue;
          const base = pts.get(p.element) ?? 0;
          livePoints += base * p.multiplier;
          const el = live.elements.find((e) => e.id === p.element);
          if ((el?.stats?.minutes ?? 0) > 0) played++; else remaining++;
          if (p.is_captain) {
            const meta = (bootstrap.elements as any[]).find((e) => e.id === p.element);
            captain = meta?.web_name || '';
          }
        }
        // Hits are already deducted from the stored event_total, so subtract them
        // from the live score too or a manager on a -4 shows 4 points too many.
        livePoints -= picks.entry_history?.event_transfers_cost ?? 0;
      } else {
        // Picks unavailable (private team, API hiccup): fall back to the stored
        // score so the manager still appears rather than dropping to zero.
        livePoints = r.event_total ?? 0;
      }

      const storedTotal = r.total ?? 0;
      const storedEvent = r.event_total ?? 0;
      return {
        entry: r.entry,
        name: r.entry_name,
        manager: r.player_name,
        storedRank: r.rank ?? i + 1,
        livePoints,
        liveTotal: storedTotal - storedEvent + livePoints,
        played,
        remaining,
        captain,
        isYou: teamId > 0 && r.entry === teamId,
      };
    });

    rows.sort((a, b) => b.liveTotal - a.liveTotal || a.entry - b.entry);

    const managers = rows.map((row, i) => {
      const liveRank = i + 1;
      return {
        ...row,
        liveRank,
        // Positive = climbing. Rendering an arrow off this is the entire reason
        // someone opens the page mid-match.
        rankDelta: row.storedRank - liveRank,
        // Points behind the manager directly above — "2 points from overtaking".
        gapToAbove: i === 0 ? 0 : rows[i - 1].liveTotal - row.liveTotal,
      };
    });

    return NextResponse.json({
      leagueId,
      leagueName: standings.league?.name || 'League',
      gw,
      provisional,
      updated: new Date().toISOString(),
      managers,
    });
  } catch (error) {
    console.error('Live league API error:', error);
    return NextResponse.json({ error: 'Failed to build the live table' }, { status: 500 });
  }
}
