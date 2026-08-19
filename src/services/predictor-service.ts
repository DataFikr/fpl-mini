// Predictor service (workstream C) — bridges the ported engine to the live FPL
// API and Prisma. The weekly cron calls `refreshPredictions`; the predictions
// API reads the persisted rows.

import { FPLApiService } from './fpl-api';
import { prisma } from '@/lib/database';
import {
  RidgeModel, predictGameweek, PREDICTOR_CONFIG, SEED_SNAPSHOT,
  type HistoryByGw, type PlayerGwStats, type PredictionRow,
} from '@/lib/predictor';

/** Season key for stored rows. Bump when the FPL API rolls to a new season. */
export const CURRENT_SEASON = process.env.FPL_SEASON || '2026-27';

/** Map a raw FPL live element to the engine's stats shape (defensive parsing). */
function toStats(el: any): PlayerGwStats {
  const s = el.stats || {};
  return {
    points: s.total_points ?? 0,
    minutes: s.minutes ?? 0,
    starts: s.starts ?? (s.minutes >= 60 ? 1 : 0),
    xgi: parseFloat(s.expected_goal_involvements ?? '0') || 0,
    xgc: parseFloat(s.expected_goals_conceded ?? '0') || 0,
    bps: s.bps ?? 0,
    saves: s.saves ?? 0,
    defcon: s.defensive_contribution ?? 0,
  };
}

/** Build leakage-free history (all finished GWs strictly before targetGw). */
export async function buildHistory(
  fpl: FPLApiService, finishedGws: number[], targetGw: number,
): Promise<HistoryByGw> {
  const history: HistoryByGw = new Map();
  for (const gw of finishedGws) {
    if (gw >= targetGw) continue;
    const live = await fpl.getLiveGameweekData(gw);
    const m = new Map<number, PlayerGwStats>();
    for (const el of (live as any).elements || []) m.set(el.id, toStats(el));
    history.set(gw, m);
  }
  return history;
}

/**
 * Live availability 0..1 from bootstrap: injured/suspended/unavailable → 0,
 * otherwise chance_of_playing_next_round/100 (default 1). This is the safeguard
 * the backtest cannot apply — a big xPts player who won't start gets damped.
 */
export function buildAvailability(players: any[]): Map<number, number> {
  const avail = new Map<number, number>();
  for (const p of players) {
    if (p.status && ['i', 's', 'u'].includes(p.status)) { avail.set(p.id, 0); continue; }
    const chance = p.chance_of_playing_next_round;
    avail.set(p.id, chance == null ? 1 : Math.max(0, Math.min(1, chance / 100)));
  }
  return avail;
}

export interface RefreshResult {
  season: string;
  targetGw: number;
  count: number;
  seeded: boolean;
  /** Where xPts came from: the model, or FPL's own ep_next before GW1. */
  source: 'model' | 'ep_next';
}

/**
 * Pre-season xPts, for the window between the season being created and the first
 * gameweek being scored.
 *
 * With no finished gameweeks the model's rolling features (form, minutes, team
 * strength) are all zero, so it predicts ~0 for everyone — a board where the top
 * pick scores 2.0 and the rest sit under 1.0. Until real results exist, take
 * FPL's own expected points for the upcoming gameweek (`ep_next`, built from
 * last season's data and pre-season form) and scale it by live availability, and
 * report xMins as that availability. The model takes over from the first refresh
 * after GW1 is scored, when `history` is no longer empty.
 */
export function applyPreSeasonFallback(
  preds: PredictionRow[], players: any[], availability: Map<number, number>,
): PredictionRow[] {
  const epById = new Map<number, number>();
  for (const p of players) epById.set(p.id, parseFloat(p.ep_next ?? '0') || 0);

  return preds
    .map((row) => {
      const avail = availability.get(row.playerFplId) ?? 1;
      return {
        ...row,
        xPts: +((epById.get(row.playerFplId) ?? 0) * avail).toFixed(3),
        xMins: +avail.toFixed(3),
      };
    })
    // ep_next is coarse pre-season (whole/half points), so a plain xPts sort ties
    // dozens of players and orders them arbitrarily. Break ties on price — FPL's
    // own valuation — so the head of the board reads sensibly.
    .sort((a, b) => b.xPts - a.xPts || b.price - a.price || a.playerFplId - b.playerFplId);
}

/**
 * Compute and persist predictions for the upcoming gameweek. Idempotent: re-runs
 * overwrite the same (season, gw, player) rows. Returns a summary.
 */
export async function refreshPredictions(explicitGw?: number): Promise<RefreshResult | null> {
  const fpl = new FPLApiService();
  const bootstrap = await fpl.getBootstrapData();
  const players = bootstrap.elements as any[];
  const teams = bootstrap.teams as Array<{ id: number; short_name: string }>;
  const events = bootstrap.events as any[];
  const fixtures = await fpl.getFixtures();

  // Target = the next upcoming GW (or explicit override); bail if season is over.
  const nextEvent = events.find((e) => e.is_next) || events.find((e) => !e.finished);
  const targetGw = explicitGw ?? nextEvent?.id;
  if (!targetGw) return null;

  const finishedGws = events.filter((e) => e.finished && e.id < targetGw).map((e) => e.id);
  const history = await buildHistory(fpl, finishedGws, targetGw);

  // Model: warm-start from the validated seed at GW1 (no history yet); otherwise
  // re-fit on real season data. Add every resolved GW's samples then fit.
  const model = new RidgeModel({
    lambda: PREDICTOR_CONFIG.lambda,
    gwDecay: PREDICTOR_CONFIG.gwDecay,
    perPosition: PREDICTOR_CONFIG.perPosition,
    minPosSamples: PREDICTOR_CONFIG.minPosSamples,
  });

  const seeded = history.size === 0;
  if (seeded) {
    model.loadSnapshot(SEED_SNAPSHOT);
    model.learn = false; // no data to fit; predict straight from the seed
  } else {
    const { buildFeatures, indexFixtures } = await import('@/lib/predictor');
    const fbg = indexFixtures(fixtures as any);
    const seen = new Map<number, Map<number, PlayerGwStats>>();
    for (const gw of [...history.keys()].sort((a, b) => a - b)) {
      const { rows } = buildFeatures(gw, players as any, seen, fbg, fixtures as any, {
        playerDecay: PREDICTOR_CONFIG.playerDecay, teamDecay: PREDICTOR_CONFIG.teamDecay,
      });
      const actuals = history.get(gw)!;
      model.addSamples(gw, rows.filter((r) => r.hasFixture > 0).map((r) => ({
        pos: r.pos, f: r.f, actual: actuals.get(r.id)?.points ?? 0,
      })));
      seen.set(gw, actuals);
    }
  }

  const availability = buildAvailability(players);
  let preds: PredictionRow[] = predictGameweek({
    targetGw, model, players: players as any, teams, fixtures: fixtures as any, history, availability,
  });

  // No gameweek scored yet → the model has nothing to go on; use FPL's ep_next.
  const source: 'model' | 'ep_next' = seeded ? 'ep_next' : 'model';
  if (seeded) preds = applyPreSeasonFallback(preds, players, availability);

  // Persist predictions (replace this GW's rows) and a state snapshot.
  await prisma.playerPrediction.deleteMany({ where: { season: CURRENT_SEASON, gameweek: targetGw } });
  await prisma.playerPrediction.createMany({
    data: preds.map((p) => ({
      season: CURRENT_SEASON,
      gameweek: targetGw,
      playerFplId: p.playerFplId,
      webName: p.webName,
      teamShort: p.teamShort,
      position: p.position,
      price: p.price,
      xPts: p.xPts,
      xMins: p.xMins,
    })),
  });

  await prisma.predictorState.upsert({
    where: { season_gameweek: { season: CURRENT_SEASON, gameweek: targetGw } },
    update: { weights: model.snapshot() as any, metrics: { seeded, nHistory: history.size, source } as any },
    create: {
      season: CURRENT_SEASON, gameweek: targetGw,
      weights: model.snapshot() as any, metrics: { seeded, nHistory: history.size, source } as any,
    },
  });

  return { season: CURRENT_SEASON, targetGw, count: preds.length, seeded, source };
}
