/* Best-XI projection for the Squad → Prediction tab and Rank My Team.
 *
 * Applies the fpl-predictor methodology (see scripts/fpl-predictor + the
 * fpl-predictor skill): projected points = recent form × fixture difficulty ×
 * minutes certainty, then an optimal-pick search per position within budget.
 * Runs forward from the current gameweek over a 3-GW horizon; when the season
 * has no upcoming fixtures it degrades to a form-pace projection. */

const HORIZON = 3;
const TRANSFER_DELTA = 5;   // projected-pts gap (over the run) that flags a transfer
const MONITOR_DELTA = 3;     // ~+1 pt/GW edge before we even surface an alternative
export const POS_LABEL: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

export interface PredRow { pos: string; cur: string; tm: string; cxp: number; pick: string; pxp: number; act: 'keep' | 'monitor' | 'transfer'; why: string }
export interface PredictionData { live: boolean; horizon: string; cur: number; opt: number; rows: PredRow[] }

export interface Proj { perGw: number; xp: number; minsCert: number; games: number }
export interface FixtureCtx { fixByTeam: Map<number, { diff: number; home: boolean }[]>; seasonOver: boolean; upGws: number[] }

/** Index upcoming fixtures (next 3 GWs) per team; flags a finished season. */
export function buildFixtureContext(fixtures: any[], currentGameweek: number): FixtureCtx {
  const upGws = [currentGameweek + 1, currentGameweek + 2, currentGameweek + 3].filter((g) => g <= 38);
  const fixByTeam = new Map<number, { diff: number; home: boolean }[]>();
  const push = (team: number, v: { diff: number; home: boolean }) => {
    if (!fixByTeam.has(team)) fixByTeam.set(team, []);
    fixByTeam.get(team)!.push(v);
  };
  for (const f of fixtures || []) {
    if (!upGws.includes(f.event)) continue;
    push(f.team_h, { diff: f.team_h_difficulty, home: true });
    push(f.team_a, { diff: f.team_a_difficulty, home: false });
  }
  const seasonOver = fixByTeam.size === 0 || [...fixByTeam.values()].every((a) => a.length === 0);
  return { fixByTeam, seasonOver, upGws };
}

/** Project a single player's expected points over the horizon. */
export function projectPlayer(el: any, ctx: FixtureCtx): Proj {
  const ppg = parseFloat(el.points_per_game) || 0;
  const form = parseFloat(el.form) || 0;
  // Anchor on season points-per-game (stable); let form nudge it within ±18%
  // so an outlier "form" value can't balloon the projection.
  const formFactor = ppg > 0 ? Math.max(0.6, Math.min(1.6, form / ppg)) : 1;
  const base = ppg * (0.7 + 0.3 * formFactor);
  const cop = el.chance_of_playing_next_round;
  const minsCert = cop == null
    ? (el.minutes >= 900 ? 0.92 : el.minutes >= 300 ? 0.7 : 0.5)
    : Math.max(0, cop / 100);
  const fx = ctx.fixByTeam.get(el.team) || [];
  const games = ctx.seasonOver || fx.length === 0 ? HORIZON : fx.length;
  const avgDiff = fx.length ? fx.reduce((a, b) => a + b.diff, 0) / fx.length : 3;
  const fixMult = ctx.seasonOver || fx.length === 0 ? 1 : 1 + (3 - avgDiff) * 0.075; // diff1→1.15 … diff5→0.85
  const perGw = base * fixMult * minsCert;
  return { perGw, xp: Math.round(perGw * games), minsCert, games };
}

interface BuildArgs {
  picks: any;
  bootstrap: any;
  fixtures: any[];
  entry: any | null;
  currentGameweek: number;
}

export function buildPrediction({ picks, bootstrap, fixtures, entry, currentGameweek }: BuildArgs): PredictionData {
  const elements: any[] = bootstrap.elements || [];
  const teams = new Map<number, any>();
  for (const t of bootstrap.teams || []) teams.set(t.id, t);
  const elById = new Map<number, any>();
  for (const el of elements) elById.set(el.id, el);

  const ctx = buildFixtureContext(fixtures, currentGameweek);
  const proj = (el: any) => projectPlayer(el, ctx);

  // Pool projections indexed by position, for the optimal-pick search.
  const poolByPos: Record<number, { el: any; p: Proj }[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const el of elements) {
    if (!POS_LABEL[el.element_type]) continue;
    poolByPos[el.element_type].push({ el, p: proj(el) });
  }
  for (const k of [1, 2, 3, 4]) poolByPos[k].sort((a, b) => b.p.xp - a.p.xp);

  const squadIds = new Set<number>((picks.picks || []).map((p: any) => p.element));
  const bankTenths = entry?.last_deadline_bank ?? 0; // FPL bank in tenths of a million

  const starters = (picks.picks || [])
    .filter((p: any) => p.position <= 11)
    .map((pk: any) => ({ pk, el: elById.get(pk.element), cur: proj(elById.get(pk.element) || {}) }))
    .filter((s: any) => s.el);

  // Greedy, deduped upgrade search: weakest starters get first dibs on the best
  // affordable, nailed alternative (no alt assigned to two slots).
  const usedAlt = new Set<number>();
  type Slot = { el: any; cur: Proj; alt: any | null; altXp: number; delta: number };
  const slots: Slot[] = [...starters]
    .sort((a, b) => a.cur.xp - b.cur.xp)
    .map(({ el, cur }) => {
      const maxPrice = el.now_cost + bankTenths;
      const best = poolByPos[el.element_type].find((c) =>
        !squadIds.has(c.el.id) && !usedAlt.has(c.el.id) && c.el.now_cost <= maxPrice &&
        c.el.minutes >= 900 && parseFloat(c.el.points_per_game) >= 3 &&
        c.el.chance_of_playing_next_round !== 0 && c.p.xp > cur.xp
      );
      if (best) usedAlt.add(best.el.id);
      return { el, cur, alt: best?.el ?? null, altXp: best?.p.xp ?? cur.xp, delta: best ? best.p.xp - cur.xp : 0 };
    });

  // At most one transfer (a single free transfer): the biggest credible upgrade.
  const topDelta = Math.max(0, ...slots.map((s) => s.delta));
  const transferId = topDelta >= TRANSFER_DELTA ? slots.find((s) => s.delta === topDelta)!.el.id : -1;

  const byEl = new Map<number, Slot>(slots.map((s) => [s.el.id, s]));
  const rows: PredRow[] = [];
  let curTotal = 0, optTotal = 0;

  for (const { el } of starters) {
    const s = byEl.get(el.id)!;
    const team = teams.get(el.team) || {};
    const suggest = s.delta >= MONITOR_DELTA && s.alt; // only surface a pick when it's a real edge
    const pickEl = suggest ? s.alt : el;
    const pxp = suggest ? s.altXp : s.cur.xp;

    let act: PredRow['act'] = 'keep';
    let why = `${el.web_name} — strong projection (${s.cur.xp} xP) for the run; the optimal pick, hold.`;
    if (el.id === transferId && s.alt) {
      act = 'transfer';
      why = `${el.web_name} → ${s.alt.web_name}: +${s.delta} projected pts over the next ${s.cur.games} GWs.`;
    } else if (s.cur.minsCert < 0.75) {
      act = 'monitor';
      why = `${el.web_name} — availability uncertain (${Math.round(s.cur.minsCert * 100)}% projected to start); hold and watch.`;
    } else if (suggest) {
      act = 'monitor';
      why = `${el.web_name} — ${s.alt.web_name} projects +${s.delta}, but not worth a hit on its own; monitor.`;
    }

    curTotal += s.cur.xp; optTotal += pxp;
    rows.push({
      pos: POS_LABEL[el.element_type], cur: el.web_name, tm: team.short_name || '',
      cxp: s.cur.xp, pick: pickEl.web_name, pxp, act, why,
    });
  }

  return {
    live: true,
    horizon: ctx.seasonOver ? 'Next 3 GWs (form pace)' : `Next ${ctx.upGws.length} GWs`,
    cur: curTotal,
    opt: optTotal,
    rows,
  };
}
