import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fpl = new FPLApiService();
const MAX_MANAGERS = 30;

/**
 * Mini-league "rival watch" for a given gameweek: effective ownership, most-captained
 * players and chip usage across the league's members. Resolves the league from an
 * explicit ?leagueId, otherwise the manager's primary private mini-league.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const reqGw = parseInt(searchParams.get('gw') || '0');
    let leagueId = parseInt(searchParams.get('leagueId') || '0') || 0;

    const [bootstrap, currentGw] = await Promise.all([
      fpl.getBootstrapData(),
      fpl.getCurrentGameweek(),
    ]);
    const gw = reqGw > 0 ? reqGw : currentGw;

    // Resolve a sensible mini-league if none was passed: first private (type 'x') classic league.
    let leagueName = '';
    if (!leagueId) {
      try {
        const mgr = await fpl.getManagerLeagues(teamId);
        const classic = (mgr?.leagues?.classic || []) as any[];
        const chosen = classic.find((l) => l.league_type === 'x') || classic.find((l) => l.id);
        if (chosen) { leagueId = chosen.id; leagueName = chosen.name || ''; }
      } catch { /* ignore */ }
    }
    if (!leagueId) return NextResponse.json({ error: 'No mini-league found for this team' }, { status: 404 });

    const standings = await fpl.getLeagueStandings(leagueId);
    leagueName = leagueName || standings.league?.name || 'your league';
    const results = (standings.standings?.results || []).slice(0, MAX_MANAGERS);
    const N = results.length;
    if (N === 0) {
      return NextResponse.json({ leagueId, leagueName, gw, managers: 0, effectiveOwnership: [], captaincy: [], chips: [] });
    }

    const player: Record<number, { name: string; team: number; code: number }> = {};
    for (const el of bootstrap.elements as any[]) player[el.id] = { name: el.web_name, team: el.team, code: el.code };
    const teamShort: Record<number, string> = {};
    for (const t of bootstrap.teams as any[]) teamShort[t.id] = t.short_name;

    const picksRes = await Promise.allSettled(results.map((r) => fpl.getManagerPicks(r.entry, gw)));

    const eo: Record<number, number> = {};     // Σ multiplier in scoring team (captain ×2/3, bench-boost bench ×1)
    const owned: Record<number, number> = {};  // count of teams playing the player
    const cap: Record<number, number> = {};    // count of teams captaining the player
    const chipCount: Record<string, number> = { wildcard: 0, freehit: 0, bboost: 0, '3xc': 0, none: 0 };
    let counted = 0;

    for (const pr of picksRes) {
      if (pr.status !== 'fulfilled' || !pr.value?.picks) continue;
      counted++;
      const chip = pr.value.active_chip as string | null;
      if (chip && chip in chipCount) chipCount[chip]++; else chipCount.none++;
      for (const p of pr.value.picks) {
        if (p.multiplier > 0) {
          eo[p.element] = (eo[p.element] || 0) + p.multiplier;
          owned[p.element] = (owned[p.element] || 0) + 1;
        }
        if (p.is_captain) cap[p.element] = (cap[p.element] || 0) + 1;
      }
    }

    const denom = counted || N;
    const meta = (elId: number) => {
      const info = player[elId];
      return { id: elId, name: info?.name || 'Unknown', team: teamShort[info?.team ?? -1] || '', code: info?.code || 0 };
    };

    const effectiveOwnership = Object.entries(eo)
      .map(([elId, mult]) => ({ ...meta(+elId), eo: Math.round((mult / denom) * 100), owned: owned[+elId] || 0, ownedPct: Math.round(((owned[+elId] || 0) / denom) * 100) }))
      .sort((a, b) => b.eo - a.eo)
      .slice(0, 10);

    const captaincy = Object.entries(cap)
      .map(([elId, count]) => ({ ...meta(+elId), count, pct: Math.round((count / denom) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const chips = [
      { key: 'wildcard', label: 'Wildcard', count: chipCount.wildcard },
      { key: 'freehit', label: 'Free Hit', count: chipCount.freehit },
      { key: 'bboost', label: 'Bench Boost', count: chipCount.bboost },
      { key: '3xc', label: 'Triple Captain', count: chipCount['3xc'] },
      { key: 'none', label: 'No chip', count: chipCount.none },
    ].sort((a, b) => b.count - a.count);

    return NextResponse.json({ leagueId, leagueName, gw, managers: denom, effectiveOwnership, captaincy, chips });
  } catch (error) {
    console.error('Rival watch API error:', error);
    return NextResponse.json({ error: 'Failed to build rival watch' }, { status: 500 });
  }
}
