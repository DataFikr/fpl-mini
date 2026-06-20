# FPL Predictor — Self-Recurrent Learning Backtest (2025/26)

A standalone Node engine that, gameweek by gameweek, predicts player points, builds an optimal
£100.0m / 15-man squad, auto-picks the best legal XI, measures the **gap between predicted and
actual** points, and **feeds that gap back into the model** so each gameweek sharpens the next.

## Run

```bash
node scripts/fpl-predictor/backtest.mjs --gws=1-5      # smoke test (fast)
node scripts/fpl-predictor/backtest.mjs --gws=1-38     # full season
node scripts/fpl-predictor/backtest.mjs --gws=1-38 --refresh   # bypass disk cache
```

No build step or dependencies — uses Node 22 native `fetch`. First run fetches the public FPL API
and caches to `.cache/`; later runs are offline. Reports are written to `out/convergence.{md,csv,json}`.

## How it works

1. **Data** (`lib/fetch-data.mjs`) — `bootstrap-static` (player/team metadata, prices), `fixtures`
   (schedule + difficulty), `event/{gw}/live` (actual points + minutes). Disk-cached.
2. **Features** (`lib/features.mjs`) — leakage-free per-player vectors for GW _n_ using only
   GW _1..n-1_: minutes-weighted form, availability, fixture ease (FDR, home/away, blanks/doubles),
   position-appropriate team strength, and a preseason price prior (used as the GW1 cold start).
   A runtime assertion blocks any read of GW ≥ _n_.
3. **Model** (`lib/model.mjs`) — linear `xPts = w·f`; after each GW the residual gap drives an SGD
   weight update (decaying η, L2). A **frozen** instance (never updated) runs alongside as a baseline.
4. **Optimizer** (`lib/optimizer.mjs`) — 15-man squad (2/5/5/3, ≤3/club, ≤£100m) via value-greedy +
   hill-climb; `bestXI` picks the top legal formation.
5. **Loop** (`backtest.mjs`) — predict → optimize → compare → learn → advance, recording metrics.

## Reading the report
- **MAE / RMSE** — player-level prediction gap (should trend down).
- **Capture %** — predicted XI's actual points ÷ the squad's hindsight-best XI.
- **Ceiling XI** — best XI by actual points league-wide under £100m (weekly maximum, for context).
- **Learning vs frozen** — if learning MAE < frozen MAE, the recurrent feedback is adding value.

## Caveats
High single-GW variance (success = downward MAE + rising capture %, not a perfect match); price is
approximated from start price; transfers/chips/captain ×2 are out of scope (see the `fpl-predictor`
skill for extension points).
