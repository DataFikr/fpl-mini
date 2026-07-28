// Model v2 — walk-forward ridge regression with recency weighting.
//
// Instead of v1's single SGD step per gameweek, v2 re-fits a closed-form ridge
// on ALL accumulated (features, actual) pairs before each prediction, with
// older gameweeks down-weighted exponentially. This is far more
// sample-efficient early in the season and still adapts as form shifts.
// Optionally fits one model per position (GK/DEF/MID/FWD score points through
// different mechanisms), falling back to the global fit while a position has
// too few samples. Still leakage-free: the fit for GW n only ever sees
// samples from GWs < n.

import { FEATURE_NAMES_V2 } from './features2.mjs';

const D = FEATURE_NAMES_V2.length;

// GW1 cold-start prior (no training data exists yet): modest positive weights
// on availability, price and fixture — mirrors v1's hand prior in spirit.
// Indices follow FEATURE_NAMES_V2.
export const PRIOR_WEIGHTS = [
  0.3,  // bias
  0.5,  // form
  2.0,  // xMins
  0.5,  // startRate
  0.3,  // xgi90
  0.0,  // xgc90
  0.2,  // bps90
  0.0,  // saves90
  0.0,  // defcon90
  0.2,  // fdr
  0.1,  // oppEase
  0.3,  // ownQuality
  0.1,  // home
  0.5,  // pricePrior
  0.4,  // hasFixture
  0.4,  // formXmins
  0.3,  // xgi90Xmins
  0.1,  // fdrXmins
];

/** Solve A x = b (A symmetric positive-definite, small) via Gaussian elimination. */
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // partial pivot
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col] || 1e-9;
    for (let c = col; c <= n; c++) M[col][c] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (factor === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row) => row[n]);
}

export class RidgeModel {
  /**
   * @param lambda       L2 strength
   * @param gwDecay      per-GW sample down-weighting (1 = none)
   * @param perPosition  fit separate GK/DEF/MID/FWD models
   * @param minPosSamples fall back to global fit below this per-position count
   * @param learn        false = frozen at PRIOR_WEIGHTS (honest baseline)
   */
  constructor({ lambda = 3, gwDecay = 0.97, perPosition = true, minPosSamples = 400, learn = true } = {}) {
    this.lambda = lambda;
    this.gwDecay = gwDecay;
    this.perPosition = perPosition;
    this.minPosSamples = minPosSamples;
    this.learn = learn;
    this.samples = []; // {gw, pos, f, actual}
    this.wGlobal = [...PRIOR_WEIGHTS];
    this.wByPos = { 1: null, 2: null, 3: null, 4: null };
  }

  /** Record a resolved gameweek's outcomes for future fits. */
  addSamples(gw, samples) {
    if (!this.learn) return;
    for (const s of samples) this.samples.push({ gw, pos: s.pos, f: s.f, actual: s.actual });
  }

  /** Re-fit for predicting `targetGw`. Only samples with gw < targetGw exist by construction. */
  fit(targetGw) {
    if (!this.learn || this.samples.length === 0) return;
    for (const s of this.samples) {
      if (s.gw >= targetGw) throw new Error(`Leakage: training sample GW${s.gw} >= target GW${targetGw}`);
    }
    const weightOf = (gw) => Math.pow(this.gwDecay, targetGw - 1 - gw);

    const fitOn = (subset) => {
      if (subset.length < D * 3) return null;
      const A = Array.from({ length: D }, () => new Array(D).fill(0));
      const b = new Array(D).fill(0);
      for (const s of subset) {
        const w = weightOf(s.gw);
        for (let i = 0; i < D; i++) {
          const wfi = w * s.f[i];
          b[i] += wfi * s.actual;
          for (let j = i; j < D; j++) A[i][j] += wfi * s.f[j];
        }
      }
      for (let i = 0; i < D; i++) {
        for (let j = 0; j < i; j++) A[i][j] = A[j][i];
        if (i !== 0) A[i][i] += this.lambda; // don't regularize the bias
        else A[i][i] += 1e-6;
      }
      return solve(A, b);
    };

    this.wGlobal = fitOn(this.samples) || [...PRIOR_WEIGHTS];
    if (this.perPosition) {
      for (const pos of [1, 2, 3, 4]) {
        const sub = this.samples.filter((s) => s.pos === pos);
        this.wByPos[pos] = sub.length >= this.minPosSamples ? fitOn(sub) : null;
      }
    }
  }

  predict(f, pos) {
    const w = (this.perPosition && this.wByPos[pos]) || this.wGlobal;
    let s = 0;
    for (let i = 0; i < D; i++) s += w[i] * f[i];
    return Math.max(0, s);
  }

  snapshot() {
    const fmt = (w) => Object.fromEntries(FEATURE_NAMES_V2.map((nm, i) => [nm, +w[i].toFixed(3)]));
    return {
      global: fmt(this.wGlobal),
      byPos: Object.fromEntries(
        Object.entries(this.wByPos).filter(([, w]) => w).map(([p, w]) => [p, fmt(w)])
      ),
    };
  }
}
