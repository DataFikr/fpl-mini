/**
 * FR-17 capture — the value-density snapshot.
 *
 * Runs from the repo root so it can import the app's own projector. Every xPts
 * on screen in FR-17 is `projectPlayer()` output, the same function behind the
 * Players tab (src/lib/players.ts -> getPlayersIndex), so the video and the
 * destination page can never disagree.
 *
 *   npm run capture:fr17   (from video/)
 *
 * Recapture before every render: price and ownership move nightly and xPts
 * moves with the fixture context.
 */
import { writeFileSync } from 'node:fs';
import { buildFixtureContext, projectPlayer } from '../../src/app/app/_lib/prediction';

const API = 'https://fantasy.premierleague.com/api';
const POS: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

/** Widely-owned and genuinely startable — the bar a comparator has to clear. */
const VALUE_MIN_XPTS = 3.0;
const VALUE_MIN_OWNED = 5.0;

interface Row {
  name: string;
  team: string;
  pos: string;
  price: number;
  xPts: number;
  owned: number;
  ppm: number;
  fixture: string;
}

const boot: any = await (await fetch(`${API}/bootstrap-static/`)).json();
const fixtures: any[] = await (await fetch(`${API}/fixtures/`)).json();

const next = boot.events.find((e: any) => e.is_next);
if (!next) throw new Error('No next gameweek — FPL API has no is_next event.');

const ctx = buildFixtureContext(fixtures, next.id);
const short = new Map<number, string>(boot.teams.map((t: any) => [t.id, t.short_name]));

/** "BOU (H)" / "HUL (A)" for the gameweek being projected. */
const fixtureFor = (teamId: number): string => {
  const f = fixtures.find(
    (x) => x.event === next.id && (x.team_h === teamId || x.team_a === teamId),
  );
  if (!f) return 'BLANK';
  const home = f.team_h === teamId;
  return `${short.get(home ? f.team_a : f.team_h)} (${home ? 'H' : 'A'})`;
};

const rows: Row[] = boot.elements
  // Anyone flagged is excluded outright. A brief that names an injured player is
  // the one error this channel cannot absorb — Saliba (status 'i', 0.0 xPts) sat
  // in the source outline for exactly this reason.
  .filter((e: any) => e.status === 'a')
  .map((e: any) => {
    const price = e.now_cost / 10;
    const xPts = Math.round(projectPlayer(e, ctx).perGw * 10) / 10;
    return {
      name: e.web_name,
      team: short.get(e.team)!,
      pos: POS[e.element_type],
      price,
      xPts,
      owned: parseFloat(e.selected_by_percent),
      ppm: Math.round((xPts / price) * 100) / 100,
      fixture: fixtureFor(e.team),
    };
  });

const byName = (n: string) => {
  const r = rows.find((x) => x.name === n);
  if (!r) throw new Error(`${n} not found or flagged — recheck before rendering.`);
  return r;
};

const hero = byName('Haaland');

const topXpts = [...rows].sort((a, b) => b.xPts - a.xPts).slice(0, 6);

// The hook only works if he really is top of the app's own projection. If a
// price rise or a knock changes that, the video is wrong and must not render.
if (topXpts[0].name !== hero.name) {
  throw new Error(
    `Hook broken: ${topXpts[0].name} (${topXpts[0].xPts}) now out-projects ${hero.name} (${hero.xPts}). Rewrite beat 1.`,
  );
}

const bestValue = rows
  .filter((r) => r.xPts >= VALUE_MIN_XPTS && r.owned >= VALUE_MIN_OWNED)
  .sort((a, b) => b.ppm - a.ppm)
  .slice(0, 3);

// The swap that replaces the source outline's £25.0m "Trifecta". Two players,
// and it has to actually clear Haaland's price.
const swapIn = [byName('Gabriel'), byName('Guéhi')];
const swapCost = +swapIn.reduce((s, p) => s + p.price, 0).toFixed(1);
const swapXpts = +swapIn.reduce((s, p) => s + p.xPts, 0).toFixed(1);
const change = +(hero.price - swapCost).toFixed(1);

if (change <= 0) throw new Error(`Swap no longer clears: £${swapCost}m vs £${hero.price}m.`);

const payload = {
  gw: next.id,
  deadline: next.deadline_time,
  captured: new Date().toISOString().slice(0, 10),
  filter: { minXpts: VALUE_MIN_XPTS, minOwned: VALUE_MIN_OWNED },
  poolSize: rows.length,
  hero,
  topXpts,
  bestValue,
  swap: { out: hero, in: swapIn, cost: swapCost, xPts: swapXpts, change, gain: +(swapXpts - hero.xPts).toFixed(1) },
  /** Best points-per-million in the whole fit pool, for the multiple in beat 3. */
  valueMultiple: +(bestValue[0].ppm / hero.ppm).toFixed(1),
};

writeFileSync(
  new URL('../src/data/fr17-valuedensity.json', import.meta.url),
  JSON.stringify(payload, null, 2) + '\n',
);

console.log(`GW${payload.gw} · deadline ${payload.deadline} · pool ${payload.poolSize}`);
console.log(`hero    ${hero.name} £${hero.price}m ${hero.xPts}xP ${hero.owned}% ppm=${hero.ppm} ${hero.fixture}`);
console.log(`value   ${bestValue.map((p) => `${p.name} ${p.ppm}`).join(' · ')}`);
console.log(`swap    ${swapIn.map((p) => p.name).join(' + ')} = £${swapCost}m ${swapXpts}xP (+${payload.swap.gain}, £${change}m change)`);
console.log(`multiple ${payload.valueMultiple}x`);
