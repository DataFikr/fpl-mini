// Model — TypeScript port of scripts/fpl-predictor/lib/model2.mjs (v2).
// Walk-forward ridge: re-fit closed-form on all accumulated (features, actual)
// pairs before each prediction, recency-weighted, one model per position with a
// global fallback. Validated production config: λ=3, gwDecay=0.90.

import { FEATURE_NAMES } from './features';
import type { Sample } from './types';

const D = FEATURE_NAMES.length;

// GW1 cold-start prior (no training data yet). Indices follow FEATURE_NAMES.
export const PRIOR_WEIGHTS = [
  0.3, 0.5, 2.0, 0.5, 0.3, 0.0, 0.2, 0.0, 0.0, 0.2, 0.1, 0.3, 0.1, 0.5, 0.4, 0.4, 0.3, 0.1,
];

/** Solve A x = b via Gaussian elimination with partial pivoting (small, dependency-free). */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
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

export interface RidgeOptions {
  lambda?: number;
  gwDecay?: number;
  perPosition?: boolean;
  minPosSamples?: number;
  learn?: boolean;
}

export interface RidgeSnapshot {
  global: Record<string, number>;
  byPos: Record<string, Record<string, number>>;
}

export class RidgeModel {
  lambda: number;
  gwDecay: number;
  perPosition: boolean;
  minPosSamples: number;
  learn: boolean;
  private samples: Array<{ gw: number } & Sample> = [];
  wGlobal: number[] = [...PRIOR_WEIGHTS];
  wByPos: Record<number, number[] | null> = { 1: null, 2: null, 3: null, 4: null };

  constructor({ lambda = 3, gwDecay = 0.9, perPosition = true, minPosSamples = 400, learn = true }: RidgeOptions = {}) {
    this.lambda = lambda;
    this.gwDecay = gwDecay;
    this.perPosition = perPosition;
    this.minPosSamples = minPosSamples;
    this.learn = learn;
  }

  /** Record a resolved gameweek's outcomes for future fits. */
  addSamples(gw: number, samples: Sample[]): void {
    if (!this.learn) return;
    for (const s of samples) this.samples.push({ gw, pos: s.pos, f: s.f, actual: s.actual });
  }

  /** Re-fit for predicting `targetGw` (only samples with gw < targetGw exist by construction). */
  fit(targetGw: number): void {
    if (!this.learn || this.samples.length === 0) return;
    for (const s of this.samples) {
      if (s.gw >= targetGw) throw new Error(`Leakage: training sample GW${s.gw} >= target GW${targetGw}`);
    }
    const weightOf = (gw: number) => Math.pow(this.gwDecay, targetGw - 1 - gw);

    const fitOn = (subset: Array<{ gw: number } & Sample>): number[] | null => {
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
        A[i][i] += i !== 0 ? this.lambda : 1e-6; // don't regularize bias
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

  predict(f: number[], pos: number): number {
    const w = (this.perPosition && this.wByPos[pos]) || this.wGlobal;
    let s = 0;
    for (let i = 0; i < D; i++) s += w[i] * f[i];
    return Math.max(0, s);
  }

  snapshot(): RidgeSnapshot {
    const fmt = (w: number[]) => Object.fromEntries(FEATURE_NAMES.map((nm, i) => [nm, +w[i].toFixed(3)]));
    return {
      global: fmt(this.wGlobal),
      byPos: Object.fromEntries(
        Object.entries(this.wByPos).filter(([, w]) => w).map(([p, w]) => [p, fmt(w as number[])]),
      ),
    };
  }

  /** Restore fitted weights from a snapshot (skips refitting — used when loading PredictorState). */
  loadSnapshot(snap: RidgeSnapshot): void {
    const toVec = (obj: Record<string, number>) => FEATURE_NAMES.map((nm) => obj[nm] ?? 0);
    if (snap.global) this.wGlobal = toVec(snap.global);
    for (const pos of [1, 2, 3, 4]) {
      const p = snap.byPos?.[String(pos)];
      this.wByPos[pos] = p ? toVec(p) : null;
    }
  }
}
