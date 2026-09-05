---
name: fpl-predictor
description: Self-recurrent learning engine that backtests an FPL season — predicts player points, builds three optimal £100m/15-man 'dream team' squads (balanced, stars & scrubs, value) with auto-picked formations each gameweek, measures the predicted-vs-actual gap, and feeds it back so each gameweek's prediction sharpens. Use to run, extend, or reason about FPL point prediction, squad optimization, or the online-learning backtest.
use-when: The user wants to predict FPL points, pick an optimal squad/XI under budget, build or tune the gap-feedback learning loop, run the season backtest, or analyze prediction accuracy/convergence.
---

# FPL Predictor — Self-Recurrent Learning Engine

Engine lives in `scripts/fpl-predictor/` (standalone Node ESM, no build/deps, Node 22 `fetch`).
Each gameweek: **predict → optimize £100m squad → auto-pick XI → compare to actual → learn from the gap → advance.**

**v2 (walk-forward ridge, `backtest2.mjs`) is the production engine** — verified full-season
2025/26: MAE **1.002** vs v1's 1.414 (−29%); untouched validation GW20–38 **0.963** vs 1.268
(−24%); capture 83.3%; ρ 0.347; captain avg 5.66 (a floor — see availability caveat).
v1 (`backtest.mjs`, SGD linear) is kept only as the historical baseline.
⚠️ `.cache/` holds the complete 2025/26 season (live-1..38) captured before the API rolled to
2026/27 — the only remaining source. Never delete or `--refresh` over it.
Set **`FPL_CACHE_DIR`** to give another season its own directory
(e.g. `FPL_CACHE_DIR=.cache-2026-27`); relative paths resolve under `scripts/fpl-predictor/`.

## Run
```bash
node scripts/fpl-predictor/backtest2.mjs --gws=1-38    # v2 production engine (full season)
node scripts/fpl-predictor/make-report-v2.mjs          # render out/convergence-v2.md
node scripts/fpl-predictor/backtest.mjs --gws=1-38     # v1 baseline (comparison only)

# A different (e.g. live) season — own cache dir, never over 2025/26:
FPL_CACHE_DIR=.cache-2026-27 node scripts/fpl-predictor/backtest2.mjs --gws=1-3
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

## Optimizer (`pickSquad` / `bestXI` / `dreamTeams`)
15-man squad: 2 GK / 5 DEF / 5 MID / 3 FWD, ≤3 per club, ≤ £100.0m (prices in tenths, `BUDGET=1000`).
Value-greedy seed (xpts/price) → hill-climb swaps. `bestXI(squad, field)` enumerates legal formations
(GK1, DEF3-5, MID2-5, FWD1-3) and returns the top total — call with `'xpts'` for the predicted XI or
`'actual'` for the squad's hindsight-best XI (capture-% denominator).

`pickSquad(players, opts)` takes `{ maxPlayerPrice, minPremiums, premiumPrice, budget }`; defaults
reproduce the original unconstrained behaviour.

### Three dream teams (`dreamTeams`, `SQUAD_STRATEGIES`)
One "optimal" 15 hides the actual decision — the same £100m buys very different risk, and pure xPts
maximisation reliably lands on stars-and-scrubs because the optimiser has no notion of rotation risk
in the £4.0m defenders funding it. `dreamTeams(players, {field})` returns three squads, each optimal
*subject to its own constraint*, with best legal XI, formation string, bench and captain:

| Key | Constraint | Character |
| --- | --- | --- |
| `balanced` | none | The unconstrained optimum |
| `stars` | ≥4 players ≥ £9.0m | High ceiling, thin bench |
| `value` | no player > £8.5m | Lower ceiling, far better bench |

Each result carries `formation` ("4-4-2"), `cost`, `xiTotal`, `xiTotalWithCaptain`, `bench` and
`captain` (gated on `startRate ≥ 0.7` when supplied). `backtest2.mjs` scores all three per gameweek
into `rows[].dreams` — predicted **and** actual — so the archetypes can be compared over a season
rather than argued about.

**Feasibility is fuzz-tested:** budget is reserved from the cheapest *not-yet-picked* player per
unfilled slot (a flat "£4.0m × slots" floor under-reserves and strands the last slots), and a repair
pass downgrades the dearest slot if a premium seed still over-commits. 1,500 squads across 500 random
pools: all 15-man, quotas exact, ≤3/club, ≤£100.0m.

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

## Live-season run — 2026/27 GW1–3 (5 Sep 2026)

`FPL_CACHE_DIR=.cache-2026-27 node scripts/fpl-predictor/backtest2.mjs --gws=1-3`

| GW | MAE | frozen | played-MAE | ρ | pred XI → actual | capture | captain |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.52 | 1.52 | 2.46 | 0.07 | 33.1 → 31 | 97% | 2 |
| 2 | 1.63 | 1.32 | 2.00 | 0.18 | 49.0 → 61 | 97% | 23 |
| 3* | 1.56 | 1.49 | 1.97 | 0.26 | 69.7 → 40 | 83% | 0 |

\* GW3 was still in play — partial actuals, not a settled result.

**Learning is behind frozen at this sample size** (1.568 vs 1.442). That is the expected shape, not a
regression: GW1 *is* the cold-start prior (identical MAE by construction), GW2 fits on one gameweek of
data, GW3 on two. The full-season 2025/26 result (learning 1.002 vs frozen 1.268) needed ~10 GWs
before the ridge fit stopped chasing noise. **Do not tune hyperparameters on 2–3 gameweeks.**

ρ rising 0.07 → 0.18 → 0.26 is the one encouraging signal: ranking quality is what captaincy and
transfer advice actually consume, and it improves as history accumulates.

### Archetype scorecard (XI incl. captain, predicted → actual)

| Strategy | GW1 | GW2 | GW3* | Total |
| --- | --- | --- | --- | --- |
| Balanced | 38 → 33 | 57 → **84** | 80 → 40 | 175 → **157** |
| Stars & Scrubs | 34 → **39** | 52 → 78 | 83 → 36 | 169 → 153 |
| Value / Template | 36 → 37 | 51 → 40 | 72 → 38 | 158 → 115 |

Balanced leads, but on three gameweeks with a captain swing of 0–23 points the gap is noise. The
readable part is the **shape**: predictions run high in GW3 for every archetype (80/83/72 → 36-40),
which is what an unsettled gameweek looks like, and Value/Template consistently predicts lowest —
it is buying floor, not ceiling, exactly as designed.
