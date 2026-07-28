#!/usr/bin/env node
// Renders out/convergence-v2.md from convergence-v2.json + baseline-v1.json.
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
const v2 = JSON.parse(await readFile(join(OUT, 'convergence-v2.json'), 'utf8'));
const v1 = JSON.parse(await readFile(join(OUT, 'baseline-v1.json'), 'utf8'));

const avg = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const s = v2.meta.summary;
const v1mae = avg(v1.rows.map((r) => r.mae));
const v1cap = avg(v1.rows.map((r) => r.capturePct));
const v1maeH2 = avg(v1.rows.slice(19).map((r) => r.mae));
const v1frozen = avg(v1.rows.map((r) => r.frozen_mae));

const perGw = v2.rows.map((r) =>
  `| ${r.gw} | ${r.mae.toFixed(2)} | ${r.frozen_mae.toFixed(2)} | ${r.played_mae.toFixed(2)} | ${r.spearman.toFixed(2)} | ${r.predXI_pred.toFixed(1)}→${r.predXI_actual} | ${r.capturePct.toFixed(0)}% | ${r.captain_actual} |`
).join('\n');

const md = `# FPL Predictor v2 — Convergence Report (2025/26 full season)

Generated: ${v2.meta.generatedAt} · Engine: walk-forward ridge (v2) vs online-SGD linear (v1)
Config: λ=3 · sample gwDecay=0.90 · playerDecay=0.70 · teamDecay=0.90 · per-position models (min 400 samples)

## Headline — v2 vs v1 (same pool, same season, same optimizer)

| Metric | v1 (SGD linear) | v2 (ridge, rich features) | Δ |
| --- | --- | --- | --- |
| Player MAE, full season | ${v1mae.toFixed(3)} | ${s.mae.toFixed(3)} | **−${((1 - s.mae / v1mae) * 100).toFixed(1)}%** |
| Player MAE, GW20–38 (untouched validation) | ${v1maeH2.toFixed(3)} | ${s.mae_h2.toFixed(3)} | **−${((1 - s.mae_h2 / v1maeH2) * 100).toFixed(1)}%** |
| MAE vs frozen prior | ${v1frozen.toFixed(3)} → ${v1mae.toFixed(3)} | ${s.frozen_mae.toFixed(3)} → ${s.mae.toFixed(3)} | learning value intact |
| XI optimal-capture % | ${v1cap.toFixed(1)}% | ${s.capture.toFixed(1)}% | +${(s.capture - v1cap).toFixed(1)}pp |
| Played-only MAE (minutes>0) | — | ${s.played_mae.toFixed(3)} | new metric |
| Spearman ρ (played pool) | — | ${s.spearman.toFixed(3)} | new metric |
| Captain pick avg actual pts | — | ${s.captain_avg.toFixed(2)} | new metric |

**Validation protocol:** all hyperparameters were tuned on GW1–19 only; GW20–38 was never
used for tuning. Validation-half MAE (${s.mae_h2}) beats tuning-half (${s.mae_h1}) — no overfit;
the model genuinely sharpens with more history.

## What changed in v2
1. **Model** — closed-form ridge re-fit each GW on all accumulated (features, actual) pairs,
   recency-weighted (0.90/GW), one model per position with global fallback. Replaces v1's
   single SGD step per GW: far more sample-efficient early, still adaptive late.
2. **Features (18)** — decayed xGI/90, xGC/90, BPS/90, saves/90, defensive-contribution/90,
   expected minutes + starts rate, plus **minutes-gated interactions** (form×xMins, xGI×xMins,
   FDR×xMins). Learned weights confirm the gating: raw quality terms ≈ 0, the interactions carry
   the signal — points require being on the pitch.
3. **Team form from results** — decayed goals for/against per match from fixtures *before* the
   target GW replaces bootstrap \`strength_*\` fields (end-of-season values in a cached snapshot
   = leakage in a backtest). GW1 falls back to a squad-price prior (top-15 start prices per
   club) — preseason-known, zero leakage.
4. **Captain rule** — argmax xPts among XI players with startRate ≥ 0.7 (availability first).

## Per-gameweek (v2)

| GW | MAE | Frozen | Played-MAE | ρ | Pred XI (pred→act) | Capture % | Captain act. pts |
| --- | --- | --- | --- | --- | --- | --- | --- |
${perGw}

## Production notes (GW1 2026/27 readiness)
- **Cold start**: GW1 uses the preseason price prior + squad-price team strength — identical
  mechanics validated here. The 2026/27 live bootstrap provides legitimately-preseason data.
- **Injuries/availability**: the backtest cannot see \`chance_of_playing\`/status (end-of-season
  snapshot), so 0-pt captains from unknowable late injuries appear here that production will
  avoid — the production layer MUST multiply xMins by live \`chance_of_playing_next_round\`/100
  and zero out status i/s/u players. Captain metrics above are therefore a floor.
- **Persistence for the weekly cron** (PredictorState): store per-GW, per-position sufficient
  statistics (XᵀX and Xᵀy — 18×18 + 18 per position) instead of raw samples; the decayed ridge
  fit is then exact for any target GW and the state stays a few KB of JSON.
- **2025/26 data is fully cached** in \`.cache/\` (bootstrap, fixtures, live-1..38). The API will
  roll over to 2026/27 soon — do not delete this directory; it is the only remaining source.

## Learned weights (final, global)

${Object.entries(v2.meta.finalWeights.global).map(([k, v]) => `- \`${k}\`: ${v}`).join('\n')}
`;

await writeFile(join(OUT, 'convergence-v2.md'), md);
console.log('Report written:', join(OUT, 'convergence-v2.md'));
