// Linear expected-points model with online (recurrent) weight updates.
// xPts_i = w · f_i. After each gameweek's actuals arrive, the residual gap
// (actual - predicted) is back-propagated into the weights via an SGD step —
// this is the self-recurrent learning core: each GW sharpens the next.

import { FEATURE_NAMES } from './features.mjs';

export class XPtsModel {
  constructor({ eta0 = 0.03, decay = 0.05, l2 = 0.002, learn = true } = {}) {
    // Sensible priors: small positive weights on form/fixture/price, bias ≈ league mean points.
    this.w = [1.8, 1.0, 0.6, 0.4, 0.1, 0.5, 0.4, 0.3]; // aligned to FEATURE_NAMES
    this.names = FEATURE_NAMES;
    this.eta0 = eta0;
    this.decay = decay;
    this.l2 = l2;
    this.learn = learn;
    this.step = 0;
  }

  predict(f) {
    let s = 0;
    for (let i = 0; i < this.w.length; i++) s += this.w[i] * f[i];
    return Math.max(0, s); // points can't be negative
  }

  /** Online gradient step on MSE over a batch of {f, actual}. No-op if frozen. */
  update(samples) {
    if (!this.learn || samples.length === 0) return;
    const eta = this.eta0 / (1 + this.decay * this.step);
    const grad = new Array(this.w.length).fill(0);
    for (const { f, actual } of samples) {
      const pred = this.predict(f);
      const err = actual - pred; // gap
      for (let i = 0; i < this.w.length; i++) grad[i] += err * f[i];
    }
    const n = samples.length;
    for (let i = 0; i < this.w.length; i++) {
      this.w[i] += eta * (grad[i] / n) - eta * this.l2 * this.w[i];
    }
    this.step++;
  }

  snapshot() {
    return Object.fromEntries(this.names.map((nm, i) => [nm, +this.w[i].toFixed(3)]));
  }
}
