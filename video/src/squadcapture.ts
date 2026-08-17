/**
 * FR-05 and FR-06's data — transcribed from the screen capture the two videos
 * are cut from, `fplranker_planner.mp4` (recorded 2026-07-12, GW38 of 2025/26).
 *
 * Unlike every other module here, this one is **not** imported from the app: the
 * capture is of a real signed-in account against live FPL data, which no build
 * step on this machine can reproduce. The figures are therefore read off the
 * recording itself and cross-checked against the frames the compositions show —
 * a native beat and its footage beat are always the same numbers, so any
 * transcription error is visible side by side in the render rather than hidden.
 *
 * Both briefs were marked BLOCKED in video-briefs.md on the grounds that the
 * demo generator produced degenerate data (FR-05: a 4/4/4 captaincy split and
 * six players at 100% ownership; FR-06: `entry/{id}/transfers` returning `[]`).
 * This capture is of a real league and has neither problem. What it still does
 * not have is chip variety — all nine managers played no chip in GW38 — so the
 * chips beat stays cut from FR-05.
 *
 * Privacy: the league's own name appears once, in the Rival Watch subtitle, and
 * is redacted in the composition (see `Redact`). No `detail.manager` value
 * appears anywhere in either video — the constraint in data/README.md.
 */

export const CAPTURE = {
  /** Managers in the league the capture is of. */
  managers: 9,
  gameweek: 38,
  season: '2025/26',
} as const;

/* ── FR-06 · Transfer Impact ────────────────────────────────────────────── */

export interface TransferWeek {
  gw: number;
  transfers: number;
  /** Points hit paid, as a positive number. 0 = free transfer. */
  hit: number;
  /** Points scored by the players brought in, that gameweek. */
  inPts: number;
  /** Points scored by the players sent out, that gameweek. */
  outPts: number;
  /** Verdict badge the app rendered. Thresholds: >= +10 genius, <= -8 costly. */
  verdict: 'Genius Move' | 'Neutral' | 'Costly';
}

/**
 * The three gameweeks visible in the capture. `net` is derived rather than
 * transcribed so the arithmetic on screen can never disagree with itself.
 */
export const weeks: TransferWeek[] = [
  { gw: 38, transfers: 1, hit: 0, inPts: 9, outPts: 0, verdict: 'Neutral' },
  { gw: 37, transfers: 2, hit: 4, inPts: 9, outPts: 6, verdict: 'Neutral' },
];

export const gross = (w: TransferWeek) => w.inPts - w.outPts;
export const net = (w: TransferWeek) => gross(w) - w.hit;

/** The payoff week: +3 of transfer gain, minus the -4 hit, is -1. */
export const hitWeek = weeks.find((w) => w.hit > 0)!;
export const freeWeek = weeks.find((w) => w.hit === 0)!;

/** What the tab grades, beyond the headline number. Straight off the GW37 card. */
export const outlook = {
  projectedIn: 46,
  projectedOut: 55,
  priceChange: '+£0.1m',
} as const;

/* ── FR-05 · Rival Watch ────────────────────────────────────────────────── */

export interface OwnedPlayer {
  name: string;
  team: string;
  /** Share of the league's squads holding the player. */
  owned: number;
  /** Effective ownership — owned plus captaincy weighting. */
  eo: number;
}

/** Effective ownership, top 6 of the top 10 the app lists. */
export const ownership: OwnedPlayer[] = [
  { name: 'B.Fernandes', team: 'MUN', owned: 100, eo: 167 },
  { name: 'Gabriel', team: 'ARS', owned: 89, eo: 89 },
  { name: 'Semenyo', team: 'MCI', owned: 56, eo: 67 },
  { name: 'Bowen', team: 'WHU', owned: 44, eo: 56 },
  { name: 'Senesi', team: 'BOU', owned: 33, eo: 33 },
  { name: 'Hill', team: 'BOU', owned: 33, eo: 33 },
];

export interface CaptainPick {
  name: string;
  team: string;
  /** Managers who captained him. */
  count: number;
}

/** Most captained. The counts sum to `CAPTURE.managers` — every manager picked. */
export const captains: CaptainPick[] = [
  { name: 'Haaland', team: 'MCI', count: 4 },
  { name: 'B.Fernandes', team: 'MUN', count: 3 },
  { name: 'Gibbs-White', team: 'NFO', count: 1 },
  { name: 'Bowen', team: 'WHU', count: 1 },
];

export const captainPct = (c: CaptainPick) => Math.round((c.count / CAPTURE.managers) * 100);

/** The most-owned player and the most-captained player are different people. */
export const mostOwned = ownership[0];
export const topCaptain = captains[0];

/** The floor of the top 10 — six players tie here, so it is the league's baseline. */
export const eoFloor = 33;
