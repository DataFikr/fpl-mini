// Metrics + report writers (JSON / CSV / Markdown).
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './fetch-data.mjs';

export const OUT_DIR = join(ROOT, 'out');

export function mae(pairs) {
  if (!pairs.length) return 0;
  return pairs.reduce((a, [p, act]) => a + Math.abs(p - act), 0) / pairs.length;
}
export function rmse(pairs) {
  if (!pairs.length) return 0;
  return Math.sqrt(pairs.reduce((a, [p, act]) => a + (p - act) ** 2, 0) / pairs.length);
}
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export async function writeReports(rows, meta) {
  await mkdir(OUT_DIR, { recursive: true });

  await writeFile(join(OUT_DIR, 'convergence.json'),
    JSON.stringify({ meta, rows }, null, 2));

  const cols = ['gw', 'nTrain', 'mae', 'rmse', 'predXI_pred', 'predXI_actual',
                'squadBestXI_actual', 'capturePct', 'ceilingXI_actual', 'frozen_mae'];
  const csv = [cols.join(',')]
    .concat(rows.map((r) => cols.map((c) => r[c]).join(',')))
    .join('\n');
  await writeFile(join(OUT_DIR, 'convergence.csv'), csv);

  const firstHalf = rows.slice(0, Math.ceil(rows.length / 2));
  const secondHalf = rows.slice(Math.ceil(rows.length / 2));
  const md = `# FPL Predictor — Convergence Report (2025/26)

Generated: ${meta.generatedAt}
Gameweeks: ${rows[0]?.gw}–${rows[rows.length - 1]?.gw} · Budget: £100.0m · Squad: 15 (2/5/5/3), best legal XI each GW.

## Headline

| Metric | Value |
| --- | --- |
| Mean player MAE (learning) | ${avg(rows.map((r) => r.mae)).toFixed(3)} |
| Mean player MAE (frozen baseline) | ${avg(rows.map((r) => r.frozen_mae)).toFixed(3)} |
| MAE: first half → second half | ${avg(firstHalf.map((r) => r.mae)).toFixed(3)} → ${avg(secondHalf.map((r) => r.mae)).toFixed(3)} |
| Mean XI optimal-capture % | ${avg(rows.map((r) => r.capturePct)).toFixed(1)}% |
| Capture %: first half → second half | ${avg(firstHalf.map((r) => r.capturePct)).toFixed(1)}% → ${avg(secondHalf.map((r) => r.capturePct)).toFixed(1)}% |

*Learning beats frozen when "MAE (learning)" < "MAE (frozen baseline)" — the recurrent gap-feedback is adding value.*

## Per-gameweek

| GW | Train n | MAE | RMSE | Frozen MAE | Pred XI (pred→actual) | Squad best XI (act) | Capture % | Ceiling XI (act) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((r) =>
  `| ${r.gw} | ${r.nTrain} | ${r.mae.toFixed(2)} | ${r.rmse.toFixed(2)} | ${r.frozen_mae.toFixed(2)} | ${r.predXI_pred.toFixed(1)}→${r.predXI_actual} | ${r.squadBestXI_actual} | ${r.capturePct.toFixed(0)}% | ${r.ceilingXI_actual} |`
).join('\n')}

## Learned weights (final)

${Object.entries(meta.finalWeights).map(([k, v]) => `- \`${k}\`: ${v}`).join('\n')}

## How to read this
- **MAE/RMSE** — player-level gap between predicted and actual points (lower = sharper). Should trend down as the loop learns.
- **Pred XI (pred→actual)** — points our model expected from its chosen XI vs what that XI actually scored.
- **Capture %** — actual points of our predicted XI ÷ the best XI achievable *from the same squad* in hindsight. How well the auto-pick did.
- **Ceiling XI** — best XI by actual points from the whole league under £100m: the theoretical weekly maximum, for context.
`;
  await writeFile(join(OUT_DIR, 'convergence.md'), md);

  return { mdPath: join(OUT_DIR, 'convergence.md') };
}
