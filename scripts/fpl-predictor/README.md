# FPL Predictor — Self-Recurrent Learning Backtest (2025/26)

A standalone Node engine that, gameweek by gameweek, predicts player points, builds an optimal
£100.0m / 15-man squad, auto-picks the best legal XI, measures the **gap between predicted and
actual** points, and **feeds that gap back into the model** so each gameweek sharpens the next.

**Two engines share the loop/optimizer:** `backtest.mjs` (v1, online-SGD linear — kept as the
historical baseline) and `backtest2.mjs` (**v2, walk-forward ridge — the production engine**).
v2 verified full-season 2025/26: **MAE 1.002 vs v1's 1.414 (−29%)**; untouched validation half
GW20–38 **0.963 vs 1.268 (−24%)**; capture 83.3%; Spearman ρ 0.347. See `out/convergence-v2.md`.

## Run

```bash
node scripts/fpl-predictor/backtest2.mjs --gws=1-38    # v2 production engine, full season
node scripts/fpl-predictor/backtest2.mjs --gws=1-19 --lambda=3 --gwDecay=0.90 \
  --playerDecay=0.70 --teamDecay=0.90                  # v2 with explicit knobs
node scripts/fpl-predictor/make-report-v2.mjs          # render out/convergence-v2.md
node scripts/fpl-predictor/backtest.mjs --gws=1-38     # v1 baseline (comparison only)
```

**Production config (locked after GW1–19 tuning; GW20–38 held out):**
`λ=3, gwDecay=0.90, playerDecay=0.70, teamDecay=0.90, perPosition=true, minPosSamples=400`.

⚠️ **`.cache/` holds the complete 2025/26 season** (bootstrap, fixtures, live-1..38), captured
before the API rolls over to 2026/27. It is the only remaining source — do not delete.

No build step or dependencies — uses Node 22 native `fetch`. First run fetches the public FPL API
and caches to `.cache/`; later runs are offline. Reports are written to `out/convergence.{md,csv,json}`.

## How it works

1. **Data** (`lib/fetch-data.mjs`) — `bootstrap-static` (player/team metadata, prices), `fixtures`
   (schedule + difficulty + results), `event/{gw}/live` (points, minutes, starts, xGI, xGC, BPS,
   saves, defensive contribution). Disk-cached.
2. **Features v2** (`lib/features2.mjs`, 18 dims) — leakage-free per-player vectors for GW _n_
   using only GW _1..n-1_: exponentially-decayed form / expected-minutes / starts-rate and
   per-90 quality rates (xGI, xGC, BPS, saves, defcon), fixture ease (official FDR + opponent
   form from actual past results), own-team form, home share, preseason price prior, and
   **minutes-gated interactions** (form×xMins, xGI×xMins, FDR×xMins). Team strength comes from
   past results, never from bootstrap `strength_*` (end-of-season snapshot = leakage); GW1 falls
   back to a squad-price prior. A runtime assertion blocks any read of GW ≥ _n_.
   (v1: `lib/features.mjs`, 8 dims — kept for the baseline.)
3. **Model v2** (`lib/model2.mjs`) — closed-form **ridge regression re-fit before every GW** on
   all accumulated (features, actual) pairs, recency-weighted (0.90/GW), one model per position
   (GK/DEF/MID/FWD) with a global fallback below 400 samples. A **frozen** instance (fixed prior
   weights) runs alongside as the honest baseline. (v1: `lib/model.mjs`, per-GW SGD step.)
4. **Optimizer** (`lib/optimizer.mjs`) — 15-man squad (2/5/5/3, ≤3/club, ≤£100m) via value-greedy +
   hill-climb; `bestXI` picks the top legal formation. Captain = top xPts among XI players with
   startRate ≥ 0.7 (availability before upside).
5. **Loop** (`backtest2.mjs`) — fit → predict → optimize → compare → record → advance.

## Reading the report
- **MAE / RMSE** — player-level prediction gap (should trend down).
- **Played-MAE** — MAE over players who actually got minutes (harder, honest; v2 only).
- **Spearman ρ** — rank correlation predicted-vs-actual on the played pool (ranking quality; v2 only).
- **Capture %** — predicted XI's actual points ÷ the squad's hindsight-best XI.
- **Captain actual pts** — what our (starter-gated) captain pick really scored (v2 only).
- **Ceiling XI** — best XI by actual points league-wide under £100m (weekly maximum, for context).
- **Learning vs frozen** — if learning MAE < frozen MAE, the recurrent feedback is adding value.

## Caveats
High single-GW variance (success = downward MAE + rising capture %, not a perfect match); price is
approximated from start price; transfers/chips/captain ×2 are out of scope (see the `fpl-predictor`
skill for extension points). The backtest cannot see `chance_of_playing`/injury status (bootstrap
is an end-of-season snapshot) — production MUST scale xMins by live `chance_of_playing_next_round`
and zero out status i/s/u players, so live captain quality should exceed the backtest figure.

## Productionizing (workstream C of LAUNCH_PLAN_2026.md)
Port `lib/features2.mjs` + `lib/model2.mjs` + `lib/optimizer.mjs` into `src/lib/predictor/`.
For the weekly cron, persist per-GW per-position sufficient statistics (XᵀX, Xᵀy) in
`PredictorState`; the decayed ridge fit is then exact for any target GW from a few KB of JSON.
GW1 2026/27 cold start = preseason price prior + squad-price team strength (validated here).
