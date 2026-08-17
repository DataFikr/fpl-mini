import raw from './data/fr02-rankrace.json';

/**
 * FR-02's data boundary — the real rank matrix for the demo league.
 *
 * Captured through the app's own `getLeagueAppData` + `rankMatrix`, so the race
 * and the league page agree by construction. Recapture:
 *   FPL_DEMO_SEASON=2025-26 FPL_DEMO_GW=20 npx tsx video/scripts/capture-fr02.mts
 */
export interface RaceTeam {
  id: number;
  team: string;
  /** Mini-league rank at each gameweek, index 0 = GW1. */
  ranks: number[];
  /** Cumulative points at each gameweek. */
  cumulative: number[];
  finalRank: number;
  finalTotal: number;
}

const payload = raw as unknown as {
  leagueName: string;
  gameweeks: number;
  teams: RaceTeam[];
};

export const leagueName = payload.leagueName;
export const gameweeks = payload.gameweeks;
export const teams = payload.teams;

export const finalTable = [...teams].sort((a, b) => a.finalRank - b.finalRank);

/** Cumulative points for a team at a fractional gameweek. */
const pointsAt = (t: RaceTeam, gwFloat: number) => {
  const i = Math.max(0, Math.min(gameweeks - 1, gwFloat));
  const lo = Math.floor(i);
  const hi = Math.min(gameweeks - 1, lo + 1);
  const f = i - lo;
  return t.cumulative[lo] + (t.cumulative[hi] - t.cumulative[lo]) * f;
};

/**
 * Positions for every team at a fractional gameweek — hold, then move.
 *
 * Two approaches were wrong before this one. Tweening each team's rank linearly
 * across the whole gameweek means several pairs are always mid-swap, so rows sit
 * on top of each other for most of the run. Deriving rank from interpolated
 * points with a soft step has the same problem for a different reason: this
 * league's totals are often 1–4 points apart, well inside any useful smoothing
 * width, so half the table clumps.
 *
 * Real bar-chart races hold a readable table for most of each step and move
 * quickly between them. `MOVE_FROM` is the fraction of each gameweek slot spent
 * static; the rest is the overtake. Ranks come from the app's own rankMatrix, so
 * every held frame is an exact permutation.
 */
const MOVE_FROM = 0.62;

const smoothstep = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

export const positionsAt = (gwFloat: number) => {
  const i = Math.max(0, Math.min(gameweeks - 1, gwFloat));
  const lo = Math.floor(i);
  const hi = Math.min(gameweeks - 1, lo + 1);
  const move = smoothstep((i - lo - MOVE_FROM) / (1 - MOVE_FROM));

  // Points must ride the same `move` easing as rank. Interpolating them on the
  // raw fraction while rank is held makes the table self-contradictory — a row
  // in 4th showing more points than the row in 2nd.
  return teams.map((t) => ({
    team: t,
    rank: t.ranks[lo] + (t.ranks[hi] - t.ranks[lo]) * move,
    points: Math.round(t.cumulative[lo] + (t.cumulative[hi] - t.cumulative[lo]) * move),
  }));
};

const delta = (t: RaceTeam) => t.ranks[0] - t.ranks[t.ranks.length - 1];

/** The comeback — biggest rank gain from GW1 to the end. */
export const biggestRiser = [...teams].sort((a, b) => delta(b) - delta(a))[0];

/** The collapse — biggest rank loss. This is the story the video is built on. */
export const biggestFaller = [...teams].sort((a, b) => delta(a) - delta(b))[0];

export const riseAmount = Math.abs(delta(biggestRiser));
export const fallAmount = Math.abs(delta(biggestFaller));

/** How long the faller led the league before it went wrong. */
export const fallerLedUntilGw = (() => {
  const r = biggestFaller.ranks;
  let g = 0;
  while (g < r.length && r[g] === 1) g++;
  return g; // number of gameweeks spent top
})();

/** Total rank changes across the league — the "nothing stood still" stat. */
export const totalRankChanges = teams.reduce((acc, t) => {
  let n = 0;
  for (let i = 1; i < t.ranks.length; i++) if (t.ranks[i] !== t.ranks[i - 1]) n++;
  return acc + n;
}, 0);
