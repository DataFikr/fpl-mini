#!/usr/bin/env node
// FPL Predictor v2 — walk-forward ridge backtest over the 2025/26 season.
//
//   node scripts/fpl-predictor/backtest2.mjs --gws=1-38
//   node scripts/fpl-predictor/backtest2.mjs --gws=1-19 --lambda=3 --gwDecay=0.97
//
// Same recurrent loop as v1 (predict → optimize → compare → learn → advance),
// with the v2 feature set + ridge model, and extra product-facing metrics:
//   • played-MAE  — MAE over players who actually got minutes (harder, honest)
//   • captain     — actual points of our #1 xPts pick each GW
//   • spearman    — rank correlation between xPts and actual (played pool)

import { loadBootstrap, loadFixtures, loadLiveMap } from './lib/fetch-data.mjs';
import { buildFeaturesV2, indexFixturesV2 } from './lib/features2.mjs';
import { RidgeModel } from './lib/model2.mjs';
import { pickSquad, bestXI, squadCost, BUDGET } from './lib/optimizer.mjs';
import { mae, rmse } from './lib/report.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './lib/fetch-data.mjs';

function parseArgs() {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }));
  let [from, to] = (args.gws || '1-38').split('-').map(Number);
  to = to || from;
  return {
    from, to,
    refresh: !!args.refresh,
    lambda: args.lambda != null ? Number(args.lambda) : 3,
    gwDecay: args.gwDecay != null ? Number(args.gwDecay) : 0.97,
    perPosition: args.perPosition !== 'false',
    minPosSamples: args.minPosSamples != null ? Number(args.minPosSamples) : 400,
    playerDecay: args.playerDecay != null ? Number(args.playerDecay) : undefined,
    teamDecay: args.teamDecay != null ? Number(args.teamDecay) : undefined,
    quiet: !!args.quiet,
    out: args.out || 'convergence-v2',
  };
}

function spearman(pairs) {
  // pairs: [pred, actual]
  const n = pairs.length;
  if (n < 3) return 0;
  const rank = (vals) => {
    const idx = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(n);
    for (let i = 0; i < n; ) {
      let j = i;
      while (j + 1 < n && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
      i = j + 1;
    }
    return r;
  };
  const rp = rank(pairs.map((p) => p[0]));
  const ra = rank(pairs.map((p) => p[1]));
  const mean = (n + 1) / 2;
  let num = 0, dp = 0, da = 0;
  for (let i = 0; i < n; i++) {
    num += (rp[i] - mean) * (ra[i] - mean);
    dp += (rp[i] - mean) ** 2;
    da += (ra[i] - mean) ** 2;
  }
  return num / Math.sqrt(dp * da || 1);
}

async function main() {
  const cfg = parseArgs();
  const gws = Array.from({ length: cfg.to - cfg.from + 1 }, (_, i) => cfg.from + i);
  if (!cfg.quiet) console.log(`\n⚽ FPL Predictor v2 — GW${cfg.from}–${cfg.to} · λ=${cfg.lambda} decay=${cfg.gwDecay} perPos=${cfg.perPosition}\n`);

  const [bootstrap, fixtures] = await Promise.all([loadBootstrap(cfg), loadFixtures(cfg)]);
  const players = bootstrap.elements;
  const fixturesByGw = indexFixturesV2(fixtures);
  const liveByGw = await loadLiveMap(gws, cfg);

  const learn = new RidgeModel({ lambda: cfg.lambda, gwDecay: cfg.gwDecay, perPosition: cfg.perPosition, minPosSamples: cfg.minPosSamples, learn: true });
  const frozen = new RidgeModel({ learn: false }); // stays at PRIOR_WEIGHTS
  const history = new Map();

  const rows = [];
  for (const gw of gws) {
    const { rows: feats } = buildFeaturesV2(gw, players, history, fixturesByGw, fixtures,
      { playerDecay: cfg.playerDecay, teamDecay: cfg.teamDecay });
    const actuals = liveByGw.get(gw);

    learn.fit(gw); // re-fit on all samples from GWs < gw

    const cands = feats.filter((r) => r.hasFixture > 0).map((r) => {
      const act = actuals.get(r.id);
      return {
        id: r.id, pos: r.pos, team: r.team, price: r.price, f: r.f,
        startRate: r.startRate,
        xpts: learn.predict(r.f, r.pos),
        xpts_frozen: frozen.predict(r.f, r.pos),
        actual: act ? act.points : 0,
        minutes: act ? act.minutes : 0,
      };
    });

    const squad = pickSquad(cands);
    const predXI = bestXI(squad, 'xpts');
    const predXI_actual = predXI.xi.reduce((a, p) => a + p.actual, 0);
    const squadBest = bestXI(squad, 'actual');
    const ceilSquad = pickSquad(cands.map((p) => ({ ...p, xpts: p.actual })));
    const ceilXI = bestXI(ceilSquad, 'actual');

    // Captain = highest xPts in the predicted XI among reliable starters
    // (startRate ≥ 0.7). A captain who doesn't play scores 0×2 — availability
    // matters more than upside. Fallback: raw argmax if no one qualifies.
    const starters = predXI.xi.filter((p) => (p.startRate ?? 0) >= 0.7);
    const capPool = starters.length ? starters : predXI.xi;
    const captain = capPool.reduce((a, p) => (p.xpts > a.xpts ? p : a), capPool[0]);
    const bestCaptainSquad = squad.reduce((a, p) => (p.actual > a.actual ? p : a), squad[0]);

    const pairs = cands.map((p) => [p.xpts, p.actual]);
    const frozenPairs = cands.map((p) => [p.xpts_frozen, p.actual]);
    const playedPairs = cands.filter((p) => p.minutes > 0).map((p) => [p.xpts, p.actual]);
    const capturePct = squadBest.total > 0 ? (predXI_actual / squadBest.total) * 100 : 0;

    rows.push({
      gw, nTrain: cands.length,
      mae: mae(pairs), rmse: rmse(pairs),
      frozen_mae: mae(frozenPairs),
      played_mae: mae(playedPairs), nPlayed: playedPairs.length,
      spearman: spearman(playedPairs),
      predXI_pred: predXI.total, predXI_actual,
      squadBestXI_actual: squadBest.total,
      capturePct,
      ceilingXI_actual: ceilXI.total,
      captain_actual: captain?.actual ?? 0,
      captain_best_squad: bestCaptainSquad?.actual ?? 0,
      squadCost: squadCost(squad),
    });

    console.assert(squadCost(squad) <= BUDGET, `GW${gw} squad over budget`);
    console.assert(predXI.xi.length === 11, `GW${gw} XI not 11`);

    if (!cfg.quiet) console.log(
      `GW${String(gw).padStart(2)} | MAE ${rows.at(-1).mae.toFixed(2)} (frozen ${rows.at(-1).frozen_mae.toFixed(2)}, played ${rows.at(-1).played_mae.toFixed(2)}) ` +
      `| ρ ${rows.at(-1).spearman.toFixed(2)} | XI ${predXI.total.toFixed(1)}→${predXI_actual} | cap ${capturePct.toFixed(0)}% ` +
      `| C ${captain?.actual ?? 0}pts | £${(squadCost(squad) / 10).toFixed(1)}m`
    );

    learn.addSamples(gw, cands.map((p) => ({ pos: p.pos, f: p.f, actual: p.actual })));
    history.set(gw, actuals);
  }

  const avg = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
  const half = Math.ceil(rows.length / 2);
  const summary = {
    config: { lambda: cfg.lambda, gwDecay: cfg.gwDecay, perPosition: cfg.perPosition, minPosSamples: cfg.minPosSamples, playerDecay: cfg.playerDecay ?? 0.85, teamDecay: cfg.teamDecay ?? 0.9, gws: `${cfg.from}-${cfg.to}` },
    mae: +avg(rows.map((r) => r.mae)).toFixed(4),
    frozen_mae: +avg(rows.map((r) => r.frozen_mae)).toFixed(4),
    played_mae: +avg(rows.map((r) => r.played_mae)).toFixed(4),
    spearman: +avg(rows.map((r) => r.spearman)).toFixed(4),
    capture: +avg(rows.map((r) => r.capturePct)).toFixed(2),
    captain_avg: +avg(rows.map((r) => r.captain_actual)).toFixed(2),
    mae_h1: +avg(rows.slice(0, half).map((r) => r.mae)).toFixed(4),
    mae_h2: +avg(rows.slice(half).map((r) => r.mae)).toFixed(4),
    capture_h1: +avg(rows.slice(0, half).map((r) => r.capturePct)).toFixed(2),
    capture_h2: +avg(rows.slice(half).map((r) => r.capturePct)).toFixed(2),
  };

  const outDir = join(ROOT, 'out');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${cfg.out}.json`), JSON.stringify({
    meta: { generatedAt: new Date().toISOString(), engine: 'v2-ridge', summary, finalWeights: learn.snapshot() },
    rows,
  }, null, 2));

  console.log(`\nSUMMARY ${JSON.stringify(summary)}`);
  if (!cfg.quiet) {
    console.log(`\n📉 MAE h1→h2: ${summary.mae_h1} → ${summary.mae_h2}`);
    console.log(`🧠 learning ${summary.mae} vs frozen ${summary.frozen_mae} | played-MAE ${summary.played_mae} | ρ ${summary.spearman}`);
    console.log(`📈 capture ${summary.capture}% (h1 ${summary.capture_h1}% → h2 ${summary.capture_h2}%) | captain avg ${summary.captain_avg} pts`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
