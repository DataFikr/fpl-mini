import raw from './data/fr07-backtest.json';

/**
 * FR-07's data boundary — the predictor's real 2025/26 backtest.
 *
 * Copied verbatim from `scripts/fpl-predictor/out/convergence-v2.json`, the
 * report `backtest2.mjs` generates. Every figure the video shows is read from
 * here, so the composition cannot drift from the engine's actual results.
 *
 * Recapture after a re-run:
 *   node scripts/fpl-predictor/backtest2.mjs --gws=1-38
 *   node scripts/fpl-predictor/make-report-v2.mjs
 *   cp scripts/fpl-predictor/out/convergence-v2.json video/src/data/fr07-backtest.json
 *
 * NOTE: the earlier brief cited "MAE 1.84 vs 1.95". Those figures appear
 * nowhere in the generated report and are wrong — LAUNCH_PLAN_2026.md §2 still
 * carries them. The real v2 production numbers are below.
 */

export interface GwRow {
  gw: number;
  mae: number;
  frozen_mae: number;
  capturePct: number;
  captain_actual: number;
  spearman: number;
}

interface Summary {
  mae: number;
  frozen_mae: number;
  played_mae: number;
  spearman: number;
  capture: number;
  captain_avg: number;
  mae_h1: number;
  mae_h2: number;
  capture_h1: number;
  capture_h2: number;
}

const payload = raw as unknown as {
  meta: { engine: string; summary: Summary };
  rows: GwRow[];
};

export const rows: GwRow[] = payload.rows;
export const summary: Summary = payload.meta.summary;

/** Where the hyperparameters stopped being tuned and the honest test began. */
export const VALIDATION_FROM_GW = 20;

/** Rounded for display — one number, one decision about precision. */
export const fmt = (n: number, dp = 3) => n.toFixed(dp);

/** The premium free window, mirroring src/lib/premium.ts. */
export const FREE_UNTIL_LABEL = '22 SEPTEMBER';
export const FREE_UNTIL_GW = 5;
