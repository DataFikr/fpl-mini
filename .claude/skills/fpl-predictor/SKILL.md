---
name: fpl-predictor
description: Self-recurrent learning engine that backtests the FPL 2025/26 season — predicts player points, builds an optimal £100m/15-man squad and best XI each gameweek, measures the predicted-vs-actual gap, and feeds it back so each gameweek's prediction sharpens. Use to run, extend, or reason about FPL point prediction, squad optimization, or the online-learning backtest.
use-when: The user wants to predict FPL points, pick an optimal squad/XI under budget, build or tune the gap-feedback learning loop, run the season backtest, or analyze prediction accuracy/convergence.
---

# FPL Predictor — Self-Recurrent Learning Engine

Engine lives in `scripts/fpl-predictor/` (standalone Node ESM, no build/deps, Node 22 `fetch`).
Each gameweek: **predict → optimize £100m squad → auto-pick XI → compare to actual → learn from the gap → advance.**

## Run
```bash
node scripts/fpl-predictor/backtest.mjs --gws=1-5      # smoke test
node scripts/fpl-predictor/backtest.mjs --gws=1-38     # full season
node scripts/fpl-predictor/backtest.mjs --gws=1-38 --refresh
```
Outputs `scripts/fpl-predictor/out/convergence.{md,csv,json}`.

## File map
| File | Role |
| --- | --- |
| `lib/fetch-data.mjs` | Fetch + disk-cache `bootstrap-static`, `fixtures`, `event/{gw}/live` |
| `lib/features.mjs` | Leakage-free feature vectors (+ `indexFixtures`) |
| `lib/model.mjs` | `XPtsModel` — linear xPts + online SGD weight update |
| `lib/optimizer.mjs` | `pickSquad` (knapsack) + `bestXI` (formation auto-pick) |
| `lib/report.mjs` | Metrics (`mae`/`rmse`) + JSON/CSV/MD writers |
| `backtest.mjs` | Orchestrator: the recurrent loop + frozen baseline |

## Data & leakage discipline (the most important rule)
Prediction for GW _n_ uses **only** GW _1..n-1_ data plus the known fixture schedule.
`buildFeatures` throws if any history GW ≥ target is supplied. Never feed season-aggregate
`bootstrap` fields (total_points, form, points_per_game) as features — they leak the future.
Static metadata only: `element_type`, `team`, and **start price** = `now_cost - cost_change_start`.
GW1 cold start uses the **price prior** (preseason expectation, no lookahead).

## Feature set (`FEATURE_NAMES`, fixed order)
`bias, form, minsRate, fdr, home, attack, pricePrior, hasFixture`
- **form** — minutes-weighted mean points over last 5 GWs, z-scored across the pool.
- **minsRate** — share of recent GWs with ≥60 min (availability/rotation proxy).
- **fdr** — fixture ease from `team_h/a_difficulty`, summed over fixtures (handles blanks=0, doubles=2).
- **home** — share of this GW's fixtures at home.
- **attack** — position-appropriate team strength (GK/DEF → defence, MID/FWD → attack), z-scored.
- **pricePrior** — start price z-scored *within position*.
- **hasFixture** — fixture count (0 blank / 1 / 2 double).

## The recurrent learning core (`XPtsModel`)
`xPts_i = w·f_i` (clamped ≥0). After each GW's actuals: residual `e_i = actual_i − pred_i`,
SGD step `w ← w + η·mean(e_i·f_i) − η·λ·w`, with η decaying as `η0/(1+decay·step)` and L2 `λ`.
A **frozen** model (never updated) runs alongside as the honest baseline — if learning MAE < frozen
MAE, the gap-feedback is genuinely adding value.

## Optimizer (`pickSquad` / `bestXI`)
15-man squad: 2 GK / 5 DEF / 5 MID / 3 FWD, ≤3 per club, ≤ £100.0m (prices in tenths, `BUDGET=1000`).
Value-greedy seed (xpts/price) → hill-climb swaps. `bestXI(squad, field)` enumerates legal formations
(GK1, DEF3-5, MID2-5, FWD1-3) and returns the top total — call with `'xpts'` for the predicted XI or
`'actual'` for the squad's hindsight-best XI (capture-% denominator).

## Convergence metrics
- **MAE/RMSE** — player-level gap (target: trends down).
- **Pred XI (pred→actual)** — expected vs scored for the chosen XI (inherently optimistic — it's the argmax).
- **Capture %** — predicted XI actual points ÷ squad's hindsight-best XI (how good the auto-pick was).
- **Ceiling XI** — best XI by actual points league-wide under £100m (weekly maximum, context only).

### Verified smoke-test result (GW1–5, 2025/26, real data)
MAE **2.21 → 1.62** (first→second half **1.979 → 1.618**); learning MAE **1.835 < frozen 1.952**;
capture **87.9% → 92.4%**; squad always ≤ £100.0m with a legal XI. The loop measurably converges.

## Extension points
- **Transfers** — default re-optimizes freely each GW (isolates prediction quality); add a 1–2
  free-transfer + −4 hit constraint and carry squad state across GWs.
- **Captaincy / chips** — double the top-xpts XI player; model TC/BB/FH/WC windows.
- **Richer features** — xG/xA, set-piece/penalty roles, ICT, opponent-adjusted minutes models.
- **Model** — swap the linear core for ridge/GBM while keeping the leakage-safe feature pipeline.

## Caveats
Single-GW FPL points are high-variance — "match actual" means downward MAE + rising capture %, not a
perfect match. Price is approximated (start price, not exact GW-by-GW). The `event/live` pool includes
non-playing squad members (0-point predictions) which softens absolute MAE — the frozen-vs-learning
delta and the season trend are the trustworthy signals.

## Pipeline integration
Feeds **`fpl-newsletter`** (predicted XI / captain picks for pre-deadline reminders) and
**`fpl-retention-builder`** (Gameweek Predictor tool). Shares the FPL API layer with `src/services/fpl-api.ts`.
