#!/usr/bin/env node
// FPL Predictor — self-recurrent learning backtest over the 2025/26 season.
//
//   node scripts/fpl-predictor/backtest.mjs --gws=1-5     # smoke test
//   node scripts/fpl-predictor/backtest.mjs --gws=1-38    # full season
//   node scripts/fpl-predictor/backtest.mjs --gws=1-38 --refresh   # bypass cache
//
// Each gameweek: predict xPts → optimize a £100m/15-man squad → auto-pick best
// XI → compare to actual → feed the gap back into the model weights.

import { loadBootstrap, loadFixtures, loadLiveMap } from './lib/fetch-data.mjs';
import { buildFeatures, indexFixtures } from './lib/features.mjs';
import { XPtsModel } from './lib/model.mjs';
import { pickSquad, bestXI, squadCost, BUDGET } from './lib/optimizer.mjs';
import { mae, rmse, writeReports } from './lib/report.mjs';

function parseArgs() {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }));
  let [from, to] = (args.gws || '1-5').split('-').map(Number);
  to = to || from;
  return { from, to, refresh: !!args.refresh };
}

async function main() {
  const { from, to, refresh } = parseArgs();
  const gws = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  console.log(`\n⚽ FPL Predictor — GW${from}–${to}${refresh ? ' (refresh)' : ''}\n`);

  const [bootstrap, fixtures] = await Promise.all([loadBootstrap({ refresh }), loadFixtures({ refresh })]);
  const players = bootstrap.elements;
  const teams = bootstrap.teams;
  const fixturesByGw = indexFixtures(fixtures);
  const liveByGw = await loadLiveMap(gws, { refresh }); // actuals for the evaluated gws

  const learn = new XPtsModel({ learn: true });
  const frozen = new XPtsModel({ learn: false }); // baseline: never updates
  const history = new Map(); // GW < target used as features

  const rows = [];
  for (const gw of gws) {
    const { rows: feats } = buildFeatures(gw, players, history, fixturesByGw, teams);
    const actuals = liveByGw.get(gw);

    // Candidates = players with a fixture this GW; attach predictions + actuals.
    const cands = feats.filter((r) => r.hasFixture > 0).map((r) => {
      const act = actuals.get(r.id);
      return {
        id: r.id, pos: r.pos, team: r.team, price: r.price, f: r.f,
        xpts: learn.predict(r.f),
        xpts_frozen: frozen.predict(r.f),
        actual: act ? act.points : 0,
        minutes: act ? act.minutes : 0,
      };
    });

    // Optimize squad on predicted points, auto-pick best XI.
    const squad = pickSquad(cands);
    const predXI = bestXI(squad, 'xpts');
    const predXI_actual = predXI.xi.reduce((a, p) => a + p.actual, 0);
    const squadBest = bestXI(squad, 'actual'); // best XI from same squad in hindsight

    // League-wide ceiling: best £100m squad by ACTUAL points, best XI from it.
    const ceilSquad = pickSquad(cands.map((p) => ({ ...p, xpts: p.actual })));
    const ceilXI = bestXI(ceilSquad, 'actual');

    // Gaps (player-level) over the trained pool.
    const pairs = cands.map((p) => [p.xpts, p.actual]);
    const frozenPairs = cands.map((p) => [p.xpts_frozen, p.actual]);
    const capturePct = squadBest.total > 0 ? (predXI_actual / squadBest.total) * 100 : 0;

    rows.push({
      gw, nTrain: cands.length,
      mae: mae(pairs), rmse: rmse(pairs),
      frozen_mae: mae(frozenPairs),
      predXI_pred: predXI.total, predXI_actual,
      squadBestXI_actual: squadBest.total,
      capturePct,
      ceilingXI_actual: ceilXI.total,
      squadCost: squadCost(squad),
    });

    // Sanity assertions.
    console.assert(squadCost(squad) <= BUDGET, `GW${gw} squad over budget`);
    console.assert(predXI.xi.length === 11, `GW${gw} XI not 11`);

    console.log(
      `GW${String(gw).padStart(2)} | MAE ${rows.at(-1).mae.toFixed(2)} (frozen ${rows.at(-1).frozen_mae.toFixed(2)}) ` +
      `| XI ${predXI.total.toFixed(1)}→${predXI_actual} pts | capture ${capturePct.toFixed(0)}% ` +
      `| cost £${(squadCost(squad) / 10).toFixed(1)}m`
    );

    // Recurrent learning step on this GW's residuals, then advance.
    learn.update(cands.map((p) => ({ f: p.f, actual: p.actual })));
    history.set(gw, actuals);
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    gws: `${from}-${to}`,
    finalWeights: learn.snapshot(),
  };
  const { mdPath } = await writeReports(rows, meta);

  const half = Math.ceil(rows.length / 2);
  const a = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
  console.log(`\n📉 MAE first→second half: ${a(rows.slice(0, half).map(r => r.mae)).toFixed(3)} → ${a(rows.slice(half).map(r => r.mae)).toFixed(3)}`);
  console.log(`📈 Capture first→second half: ${a(rows.slice(0, half).map(r => r.capturePct)).toFixed(1)}% → ${a(rows.slice(half).map(r => r.capturePct)).toFixed(1)}%`);
  console.log(`🧠 Learning vs frozen MAE: ${a(rows.map(r => r.mae)).toFixed(3)} vs ${a(rows.map(r => r.frozen_mae)).toFixed(3)}`);
  console.log(`📝 Report: ${mdPath}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
