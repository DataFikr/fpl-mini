// Prediction engine (workstream C) — public entrypoint.
// TypeScript port of the validated v2 standalone engine
// (scripts/fpl-predictor, full-season 2025/26 MAE 1.002). The weekly cron and
// the predictions API call `predictGameweek`; UI code uses `captainPick`.

export * from './types';
export { buildFeatures, indexFixtures, buildTeamForm, FEATURE_NAMES } from './features';
export { RidgeModel, PRIOR_WEIGHTS } from './model';
export type { RidgeOptions, RidgeSnapshot } from './model';
export { pickSquad, bestXI, squadCost, BUDGET } from './optimizer';
export type { OptPlayer } from './optimizer';
export { SEED_SNAPSHOT } from './seed';

import { buildFeatures, indexFixtures } from './features';
import { RidgeModel } from './model';
import type { BootstrapElement, Fixture, HistoryByGw } from './types';

/** Locked production config (tuned on GW1–19, validated on GW20–38). */
export const PREDICTOR_CONFIG = {
  lambda: 3,
  gwDecay: 0.9,
  perPosition: true,
  minPosSamples: 400,
  playerDecay: 0.7,
  teamDecay: 0.9,
} as const;

export interface PredictionRow {
  playerFplId: number;
  webName: string;
  teamShort: string;
  position: number;
  price: number; // tenths of a million
  xPts: number;
  xMins: number;
}

export interface PredictGameweekOpts {
  targetGw: number;
  /** A model already carrying history via addSamples (caller may pre-fit; we fit defensively). */
  model: RidgeModel;
  players: BootstrapElement[];
  teams: Array<{ id: number; short_name: string }>;
  fixtures: Fixture[];
  history: HistoryByGw;
  /** Optional live availability 0..1 (chance_of_playing/100); scales xPts and xMins. */
  availability?: Map<number, number>;
}

/**
 * Produce xPts for every player with a fixture in `targetGw`. The model should
 * already hold samples from GWs < targetGw (via addSamples); we call fit() here.
 * Availability (live injury/rotation risk) is applied multiplicatively when
 * provided — the backtest can't see it, so production MUST pass it in.
 */
export function predictGameweek(opts: PredictGameweekOpts): PredictionRow[] {
  const { targetGw, model, players, teams, fixtures, history, availability } = opts;

  const fixturesByGw = indexFixtures(fixtures);
  const { rows } = buildFeatures(targetGw, players, history, fixturesByGw, fixtures, {
    playerDecay: PREDICTOR_CONFIG.playerDecay,
    teamDecay: PREDICTOR_CONFIG.teamDecay,
  });

  model.fit(targetGw);

  const shortById = new Map(teams.map((t) => [t.id, t.short_name]));
  const metaById = new Map(players.map((p) => [p.id, p]));

  const out: PredictionRow[] = [];
  for (const r of rows) {
    if (r.hasFixture <= 0) continue;
    const avail = availability?.get(r.id) ?? 1;
    const meta = metaById.get(r.id);
    out.push({
      playerFplId: r.id,
      webName: meta?.web_name ?? String(r.id),
      teamShort: shortById.get(r.team) ?? '',
      position: r.pos,
      price: r.price,
      xPts: +(model.predict(r.f, r.pos) * avail).toFixed(3),
      xMins: +(r.xMins * avail).toFixed(3),
    });
  }
  out.sort((a, b) => b.xPts - a.xPts);
  return out;
}

/**
 * Captain pick for a set of the user's players: highest xPts among reliable
 * starters (xMins ≥ 0.7), falling back to raw argmax. Mirrors the validated
 * backtest rule (availability before upside).
 */
export function captainPick<T extends { xPts: number; xMins?: number }>(players: T[]): T | null {
  if (!players.length) return null;
  const starters = players.filter((p) => (p.xMins ?? 0) >= 0.7);
  const pool = starters.length ? starters : players;
  return pool.reduce((a, p) => (p.xPts > a.xPts ? p : a), pool[0]);
}
