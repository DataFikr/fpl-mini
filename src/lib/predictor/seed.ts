// GW1 cold-start seed weights (workstream C).
//
// These are the final learned weights from the validated full-season 2025/26
// backtest (scripts/fpl-predictor/out/convergence-v2.json). A fresh season has
// no history at GW1, so instead of the cold hand-set PRIOR_WEIGHTS the service
// warm-starts the model with these — a season-informed prior. Once 2026/27
// gameweeks resolve, the model re-fits on real data and this is no longer used.
//
// To refresh after a future season: run the backtest and copy meta.finalWeights.

import type { RidgeSnapshot } from './model';

export const SEED_SNAPSHOT: RidgeSnapshot = {
  global: {
    bias: -0.931, form: -0.07, xMins: 5.422, startRate: -1.771, xgi90: 0.045,
    xgc90: -0.029, bps90: 0.017, saves90: -0.042, defcon90: 0.03, fdr: -0.059,
    oppEase: 0.046, ownQuality: 0.035, home: 0.045, pricePrior: 0.142,
    hasFixture: 1.041, formXmins: 0.234, xgi90Xmins: 0.679, fdrXmins: 0.699,
  },
  byPos: {
    '1': { bias: -0.483, form: -0.074, xMins: 1.362, startRate: 1.149, xgi90: 0.552, xgc90: -0.851, bps90: 0.052, saves90: -0.035, defcon90: -0.381, fdr: -0.018, oppEase: 0.015, ownQuality: 0.041, home: -0.01, pricePrior: 0.035, hasFixture: 0.517, formXmins: 0.208, xgi90Xmins: -1.043, fdrXmins: 0.654 },
    '2': { bias: -1.127, form: -0.071, xMins: 3.681, startRate: -0.389, xgi90: 0.031, xgc90: -0.037, bps90: 0.024, saves90: -0.9, defcon90: 0.04, fdr: -0.081, oppEase: 0.072, ownQuality: 0.07, home: 0.05, pricePrior: 0.1, hasFixture: 1.161, formXmins: 0.333, xgi90Xmins: 0.739, fdrXmins: 0.81 },
    '3': { bias: -1.091, form: 0.063, xMins: 5.031, startRate: -1.608, xgi90: 0.035, xgc90: -0.042, bps90: -0.014, saves90: -1.037, defcon90: 0.037, fdr: -0.068, oppEase: 0.078, ownQuality: 0.018, home: 0.047, pricePrior: 0.11, hasFixture: 1.112, formXmins: 0.074, xgi90Xmins: 0.721, fdrXmins: 0.524 },
    '4': { bias: -0.426, form: 0.208, xMins: 3.302, startRate: 0.032, xgi90: 0.036, xgc90: -0.028, bps90: 0.1, saves90: -1.298, defcon90: -0.128, fdr: 0.002, oppEase: -0.087, ownQuality: 0.026, home: 0.114, pricePrior: 0.263, hasFixture: 0.586, formXmins: -0.285, xgi90Xmins: 0.362, fdrXmins: 0.937 },
  },
};
