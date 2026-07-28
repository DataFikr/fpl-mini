---
name: fpl-predictor
description: Self-recurrent learning engine that backtests the FPL 2025/26 season — predicts player points, builds an optimal £100m/15-man squad and best XI each gameweek, measures the predicted-vs-actual gap, and feeds it back so each gameweek's prediction sharpens. Use to run, extend, or reason about FPL point prediction, squad optimization, or the online-learning backtest.
use-when: The user wants to predict FPL points, pick an optimal squad/XI under budget, build or tune the gap-feedback learning loop, run the season backtest, or analyze prediction accuracy/convergence.
---

# FPL Predictor — Self-Recurrent Learning Engine

Engine lives in `scripts/fpl-predictor/` (standalone Node ESM, no build/deps, Node 22 `fetch`).
Each gameweek: **predict → optimize £100m squad → auto-pick XI → compare to actual → learn from the gap → advance.**

**v2 (walk-forward ridge, `backtest2.mjs`) is the production engine** — verified full-season
2025/26: MAE **1.002** vs v1's 1.414 (−29%); untouched validation GW20–38 **0.963** vs 1.268
(−24%); capture 83.3%; ρ 0.347; captain avg 5.66 (a floor — see availability caveat).
v1 (`backtest.mjs`, SGD linear) is kept only as the historical baseline.
⚠️ `.cache/` holds the complete 2025/26 season (live-1..38) captured before the API rolls to
2026/27 — the only remaining source. Never delete or `--refresh` over it.

## Run
```bash
node scripts/fpl-predictor/backtest2.mjs --gws=1-38    # v2 production engine (full season)
node scripts/fpl-predictor/make-report-v2.mjs          # render out/convergence-v2.md
node scripts/fpl-predictor/backtest.mjs --gws=1-38     # v1 baseline (comparison only)
```
Production config (tuned on GW1–19 only; GW20–38 held out):
`--lambda=3 --gwDecay=0.90 --playerDecay=0.70 --teamDecay=0.90` (perPosition on, minPosSamples 400).
Outputs `out/convergence-v2.{md,json}` (v1: `out/convergence.{md,csv,json}`, baseline copies in `out/baseline-v1.*`).

## File map
| File | Role |
| --- | --- |
| `lib/fetch-data.mjs` | Fetch + disk-cache bootstrap/fixtures/live; `loadLiveMap` returns rich stats (starts, xGI, xGC, BPS, saves, defcon) |
| `lib/features2.mjs` | **v2** 18-dim leakage-free features: decayed per-90 rates, xMins/startRate, team form from results, minutes-gated interactions |
| `lib/model2.mjs` | **v2** `RidgeModel` — closed-form ridge re-fit each GW, recency-weighted, per-position + global fallback, `PRIOR_WEIGHTS` cold start |
| `backtest2.mjs` | **v2** orchestrator + product metrics (played-MAE, ρ, captain) |
| `make-report-v2.mjs` | Renders convergence-v2.md incl. v1-vs-v2 comparison |
| `lib/features.mjs` / `lib/model.mjs` / `backtest.mjs` | v1 baseline (8-dim features + SGD) |
| `lib/optimizer.mjs` | Shared: `pickSquad` (knapsack) + `bestXI` (formation auto-pick) |
| `lib/report.mjs` | Shared metrics (`mae`/`rmse`) + v1 report writers |

## Data & leakage discipline (the most important rule)
Prediction for GW _n_ uses **only** GW _1..n-1_ data plus the known fixture schedule.
`buildFeatures` throws if any history GW ≥ target is supplied. Never feed season-aggregate
`bootstrap` fields (total_points, form, points_per_game) as features — they leak the future.
Static metadata only: `element_type`, `team`, and **start price** = `now_cost - cost_change_start`.
GW1 cold start uses the **price prior** (preseason expectation, no lookahead).

## Feature set v2 (`FEATURE_NAMES_V2`, 18 dims, fixed order)
`bias, form, xMins, startRate, xgi90, xgc90, bps90, saves90, defcon90, fdr, oppEase, ownQuality, home, pricePrior, hasFixture, formXmins, xgi90Xmins, fdrXmins`
- Player aggregates are **exponentially decayed over ALL history** (playerDecay 0.70/GW), not a 5-GW window.
- **xMins** (decayed minutes/90) + **startRate** form the minutes model; per-90 rates (xGI, xGC, BPS, saves, defensive-contribution) capture underlying quality.
- **oppEase/ownQuality** — team form computed from ACTUAL past results (decayed GF/GA, teamDecay 0.90), position-weighted. Never use bootstrap `strength_*` (end-of-season snapshot = leakage); GW1 falls back to a squad-price prior (top-15 start prices per club).
- **Minutes-gated interactions** (`formXmins, xgi90Xmins, fdrXmins`) carry most of the signal — the learned raw quality weights are ≈0; points require being on the pitch.
- v1's 8-dim set (`lib/features.mjs`) remains for the baseline only.

## The learning core v2 (`RidgeModel`)
Before predicting GW _n_: closed-form ridge fit on all accumulated (f, actual) pairs from
GWs < _n_, sample-weighted `0.90^(n-1-gw)` (recency), λ=3, bias unregularized, solved by Gaussian
elimination (no deps). One model per position (GK/DEF/MID/FWD) once a position has ≥400 samples;
global fit otherwise; `PRIOR_WEIGHTS` at GW1. A **frozen** model (fixed priors) runs alongside as
the honest baseline. Leakage guard throws if any training sample gw ≥ target.
Captaincy rule: argmax xPts among XI players with startRate ≥ 0.7 (availability before upside).

## Optimizer (`pickSquad` / `bestXI`)
15-man squad: 2 GK / 5 DEF / 5 MID / 3 FWD, ≤3 per club, ≤ £100.0m (prices in tenths, `BUDGET=1000`).
Value-greedy seed (xpts/price) → hill-climb swaps. `bestXI(squad, field)` enumerates legal formations
(GK1, DEF3-5, MID2-5, FWD1-3) and returns the top total — call with `'xpts'` for the predicted XI or
`'actual'` for the squad's hindsight-best XI (capture-% denominator).

## Convergence metrics
- **MAE/RMSE** — player-level gap (target: trends down). **Played-MAE** — same over minutes>0 only.
- **Spearman ρ** — rank correlation on the played pool (ranking quality — what captain/transfer advice needs).
- **Pred XI (pred→actual)** — expected vs scored for the chosen XI (inherently optimistic — it's the argmax).
- **Capture %** — predicted XI actual points ÷ squad's hindsight-best XI (how good the auto-pick was).
- **Captain actual pts** — what the starter-gated captain pick really scored.
- **Ceiling XI** — best XI by actual points league-wide under £100m (weekly maximum, context only).

### Verified results (2025/26, real data)
- **v2 full season (GW1–38):** MAE **1.002** (frozen prior 1.268); h1→h2 **1.040 → 0.963**;
  capture **83.3%**; ρ **0.347**; captain avg **5.66 pts**. Hyperparams tuned on GW1–19 ONLY;
  GW20–38 untouched validation — v2 beats v1 there by **24%** (0.963 vs 1.268), so no overfit.
- **v1 full season:** MAE 1.414 (frozen 1.888); capture 81.8%.
- Full comparison + per-GW table: `out/convergence-v2.md`.

## Extension points
- **Transfers** — default re-optimizes freely each GW (isolates prediction quality); add a 1–2
  free-transfer + −4 hit constraint and carry squad state across GWs.
- **Chips** — model TC/BB/FH/WC windows (captaincy rule already implemented).
- **Availability** — production must scale xMins by live `chance_of_playing_next_round`/100 and
  zero status i/s/u players (unavailable in backtest; captain metric is therefore a floor).
- **Model** — GBM/interactions beyond the current 3 gated terms, keeping the leakage-safe pipeline.
- **Persistence** — for the weekly cron, store per-GW per-position sufficient statistics
  (XᵀX, Xᵀy) in `PredictorState`; the decayed fit is then exact from a few KB of JSON.

## Caveats
Single-GW FPL points are high-variance — "match actual" means downward MAE + rising capture %, not a
perfect match. Price is approximated (start price, not exact GW-by-GW). The `event/live` pool includes
non-playing squad members (0-point predictions) which softens absolute MAE — the frozen-vs-learning
delta and the season trend are the trustworthy signals.

## Pipeline integration
Feeds **`fpl-newsletter`** (predicted XI / captain picks for pre-deadline reminders) and
**`fpl-retention-builder`** (Gameweek Predictor tool). Shares the FPL API layer with `src/services/fpl-api.ts`.
