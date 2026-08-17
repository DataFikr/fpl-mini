import { teams, gameweeks, leagueName, finalTable } from './rankrace';

/**
 * FR-03's data — Manager of the Month, derived from the same rank-race capture.
 *
 * No separate capture is needed: `fr02-rankrace.json` already carries cumulative
 * points and rank per gameweek for every manager, and the app's `motm()`
 * (src/app/app/_lib/compute.ts) is just "highest points over the last 4
 * gameweeks". Differencing the cumulative series reproduces per-gameweek points
 * exactly, so the video and the MOTM tab agree by construction.
 */

/** Window length in gameweeks — matches the app's `motm()` (last 4 GWs). */
export const WINDOW = 4;

const gwPointsFor = (cumulative: number[]) =>
  cumulative.map((c, i) => (i === 0 ? c : c - cumulative[i - 1]));

export interface MonthWinner {
  /** 1-based month index. */
  month: number;
  fromGw: number;
  toGw: number;
  team: string;
  points: number;
  /** Where that manager sat in the season table at the end of the window. */
  leagueRank: number;
}

export const months: MonthWinner[] = (() => {
  const out: MonthWinner[] = [];
  const enriched = teams.map((t) => ({ t, pts: gwPointsFor(t.cumulative) }));

  for (let gw = WINDOW; gw <= gameweeks; gw += WINDOW) {
    const from = Math.max(0, gw - WINDOW);
    const scored = enriched
      .map(({ t, pts }) => ({
        team: t.team,
        points: pts.slice(from, gw).reduce((a, b) => a + b, 0),
        leagueRank: t.ranks[gw - 1],
      }))
      .sort((a, b) => b.points - a.points);

    out.push({
      month: out.length + 1,
      fromGw: gw - WINDOW + 1,
      toGw: gw,
      ...scored[0],
    });
  }
  return out;
})();

export const distinctWinners = new Set(months.map((m) => m.team)).size;

/** The season leader — the name the monthly table keeps taking the spotlight from. */
export const seasonLeader = finalTable[0];

/** Months won by someone who was NOT top of the league at the time. */
export const upsetMonths = months.filter((m) => m.leagueRank > 1);

/** The best story in the set: the lowest-ranked manager to win a month. */
export const biggestUpset = [...months].sort((a, b) => b.leagueRank - a.leagueRank)[0];

/** Real top-to-bottom gap — the number that makes the season table feel over. */
export const seasonGap =
  finalTable[0].finalTotal - finalTable[finalTable.length - 1].finalTotal;

/** The gameweek from which the season leader never lost top spot. */
export const leaderSinceGw = (() => {
  const r = seasonLeaderRanks();
  for (let g = r.length - 1; g >= 0; g--) if (r[g] !== 1) return g + 2;
  return 1;
})();

function seasonLeaderRanks() {
  return finalTable[0].ranks;
}

export { leagueName, gameweeks };
