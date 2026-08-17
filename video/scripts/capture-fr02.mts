/**
 * Captures the rank matrix for FR-02 (the rank race).
 *
 * Runs the app's own `getLeagueAppData` rather than re-implementing standings —
 * the whole point of the pipeline is that video data and product data come from
 * one source. Requires FPL_DEMO_SEASON=2025-26 (already in .env.local) so it
 * reads the 2025/26 snapshots in scripts/fpl-predictor/.cache.
 *
 * Run from the repo root:
 *   npx tsx video/scripts/capture-fr02.mts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getLeagueAppData } from '../../src/app/app/_lib/league-data';
import { rankMatrix, standingsAt } from '../../src/app/app/_lib/compute';

const LEAGUE_ID = 150789;

const main = async () => {
  const data = await getLeagueAppData(LEAGUE_ID);
  const managers = data.managers;
  const gw = data.currentGameweek;

  const matrix = rankMatrix(managers, gw);
  const final = standingsAt(managers, gw);

  // One row per manager: identity plus rank and cumulative points at every GW.
  const teams = managers.map((m) => {
    const ranks = matrix.get(m.id) ?? [];
    // AppManager exposes cumulative totals directly as `totalPts` (index 0 = GW1);
    // fall back to summing gwPts if a manager's history came back short.
    const cum: number[] = [];
    for (let g = 1; g <= gw; g++) {
      cum.push(m.totalPts[g - 1] ?? m.gwPts.slice(0, g).reduce((a, b) => a + b, 0));
    }
    return {
      id: m.id,
      team: m.team,
      ranks,
      cumulative: cum,
      finalRank: final.find((f) => f.id === m.id)?.rank ?? 0,
      finalTotal: final.find((f) => f.id === m.id)?.total ?? 0,
    };
  });

  const out = {
    capturedAt: new Date().toISOString(),
    leagueId: LEAGUE_ID,
    leagueName: data.league.name,
    gameweeks: gw,
    teams,
  };

  const dest = resolve(process.cwd(), 'video/src/data/fr02-rankrace.json');
  writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');

  const moves = teams.reduce((acc, t) => {
    let n = 0;
    for (let i = 1; i < t.ranks.length; i++) if (t.ranks[i] !== t.ranks[i - 1]) n++;
    return acc + n;
  }, 0);

  console.log(`captured ${teams.length} teams x ${gw} gameweeks -> ${dest}`);
  console.log(`rank changes across the season: ${moves}`);
  console.log(`leaders by GW: ${Array.from({ length: gw }, (_, i) =>
    teams.find((t) => t.ranks[i] === 1)?.team ?? '?'
  ).filter((v, i, a) => i === 0 || v !== a[i - 1]).join(' -> ')}`);
};

main().catch((e) => {
  console.error('capture failed:', e);
  process.exit(1);
});
