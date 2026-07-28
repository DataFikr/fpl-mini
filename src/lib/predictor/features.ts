// Feature engineering — TypeScript port of scripts/fpl-predictor/lib/features2.mjs
// (v2, validated: full-season 2025/26 MAE 1.002). Strictly leakage-free: for
// target GW n, everything derives from GWs < n plus the known schedule and
// static preseason metadata (position, club, START price). See the fpl-predictor
// skill for the design rationale and leakage discipline.

import type {
  BootstrapElement, Fixture, FixtureEntry, HistoryByGw, FeatureRow,
} from './types';

export const FEATURE_NAMES = [
  'bias', 'form', 'xMins', 'startRate', 'xgi90', 'xgc90', 'bps90', 'saves90',
  'defcon90', 'fdr', 'oppEase', 'ownQuality', 'home', 'pricePrior', 'hasFixture',
  'formXmins', 'xgi90Xmins', 'fdrXmins',
] as const;

export const DEFAULT_PLAYER_DECAY = 0.70;
export const DEFAULT_TEAM_DECAY = 0.90;
const POS_ATTACK_WEIGHT: Record<number, number> = { 1: 0.1, 2: 0.35, 3: 0.8, 4: 1.0 };

/** Pre-index fixtures into Map<gw, Map<teamId, FixtureEntry[]>>. */
export function indexFixtures(fixtures: Fixture[]): Map<number, Map<number, FixtureEntry[]>> {
  const byGw = new Map<number, Map<number, FixtureEntry[]>>();
  for (const f of fixtures) {
    if (f.event == null) continue;
    if (!byGw.has(f.event)) byGw.set(f.event, new Map());
    const m = byGw.get(f.event)!;
    if (!m.has(f.team_h)) m.set(f.team_h, []);
    if (!m.has(f.team_a)) m.set(f.team_a, []);
    m.get(f.team_h)!.push({ home: true, difficulty: f.team_h_difficulty, opponent: f.team_a });
    m.get(f.team_a)!.push({ home: false, difficulty: f.team_a_difficulty, opponent: f.team_h });
  }
  return byGw;
}

function zscore(values: number[]): (v: number) => number {
  const present = values.filter((v) => Number.isFinite(v));
  const mean = present.reduce((a, b) => a + b, 0) / (present.length || 1);
  const sd = Math.sqrt(present.reduce((a, b) => a + (b - mean) ** 2, 0) / (present.length || 1)) || 1;
  return (v: number) => (Number.isFinite(v) ? (v - mean) / sd : 0);
}

/**
 * Decayed team form from ACTUAL results of fixtures before targetGw.
 * Returns Map<teamId, {gf, ga, n}> — goals for/against per match, decayed.
 */
export function buildTeamForm(
  targetGw: number, fixtures: Fixture[], teamDecay = DEFAULT_TEAM_DECAY,
): Map<number, { gf: number; ga: number; n: number }> {
  const acc = new Map<number, { gfW: number; gaW: number; w: number }>();
  const bump = (team: number, gf: number, ga: number, w: number) => {
    const a = acc.get(team) || { gfW: 0, gaW: 0, w: 0 };
    a.gfW += w * gf; a.gaW += w * ga; a.w += w;
    acc.set(team, a);
  };
  for (const f of fixtures) {
    if (f.event == null || f.event >= targetGw) continue;
    if (!f.finished || f.team_h_score == null || f.team_a_score == null) continue;
    const w = Math.pow(teamDecay, targetGw - 1 - f.event);
    bump(f.team_h, f.team_h_score, f.team_a_score, w);
    bump(f.team_a, f.team_a_score, f.team_h_score, w);
  }
  const out = new Map<number, { gf: number; ga: number; n: number }>();
  for (const [team, a] of acc) out.set(team, { gf: a.gfW / (a.w || 1), ga: a.gaW / (a.w || 1), n: a.w });
  return out;
}

/** GW1 fallback team strength: mean of the club's top-15 START prices. */
function squadPriceStrength(players: BootstrapElement[]): Map<number, number> {
  const byTeam = new Map<number, number[]>();
  for (const p of players) {
    const startPrice = p.now_cost - p.cost_change_start;
    if (!byTeam.has(p.team)) byTeam.set(p.team, []);
    byTeam.get(p.team)!.push(startPrice);
  }
  const out = new Map<number, number>();
  for (const [team, prices] of byTeam) {
    const top = prices.sort((a, b) => b - a).slice(0, 15);
    out.set(team, top.reduce((a, b) => a + b, 0) / (top.length || 1));
  }
  return out;
}

export interface FeatureOpts { playerDecay?: number; teamDecay?: number }

/**
 * Build leakage-free feature rows for `targetGw`. `history` must only contain
 * gameweeks < targetGw (asserted).
 */
export function buildFeatures(
  targetGw: number,
  players: BootstrapElement[],
  history: HistoryByGw,
  fixturesByGw: Map<number, Map<number, FixtureEntry[]>>,
  fixtures: Fixture[],
  opts: FeatureOpts = {},
): { rows: FeatureRow[]; names: readonly string[] } {
  const playerDecay = opts.playerDecay ?? DEFAULT_PLAYER_DECAY;
  const teamDecay = opts.teamDecay ?? DEFAULT_TEAM_DECAY;
  for (const gw of history.keys()) {
    if (gw >= targetGw) throw new Error(`Leakage: history GW${gw} >= target GW${targetGw}`);
  }

  const gwFix = fixturesByGw.get(targetGw) || new Map<number, FixtureEntry[]>();
  const histGws = [...history.keys()].sort((a, b) => a - b);
  const teamForm = buildTeamForm(targetGw, fixtures, teamDecay);

  let teamAtk: (t: number) => number;
  let teamDef: (t: number) => number;
  if (teamForm.size >= 10) {
    const ids = [...teamForm.keys()];
    const zGf = zscore(ids.map((t) => teamForm.get(t)!.gf));
    const zGa = zscore(ids.map((t) => teamForm.get(t)!.ga));
    teamAtk = (t) => (teamForm.has(t) ? zGf(teamForm.get(t)!.gf) : 0);
    teamDef = (t) => (teamForm.has(t) ? -zGa(teamForm.get(t)!.ga) : 0);
  } else {
    const priceStr = squadPriceStrength(players);
    const ids = [...priceStr.keys()];
    const zP = zscore(ids.map((t) => priceStr.get(t)!));
    teamAtk = (t) => (priceStr.has(t) ? zP(priceStr.get(t)!) : 0);
    teamDef = teamAtk;
  }

  const raw = players.map((p) => {
    const startPrice = p.now_cost - p.cost_change_start;

    let w = 0, minsW = 0, startsW = 0, appW = 0, ptsAppW = 0, minsPlayedW = 0;
    let xgiW = 0, xgcW = 0, bpsW = 0, savesW = 0, defconW = 0;
    for (const gw of histGws) {
      const rec = history.get(gw)?.get(p.id);
      const dw = Math.pow(playerDecay, targetGw - 1 - gw);
      w += dw;
      if (!rec) continue;
      minsW += dw * Math.min(rec.minutes, 90);
      startsW += dw * (rec.starts || 0);
      if (rec.minutes > 0) {
        appW += dw;
        ptsAppW += dw * rec.points;
        minsPlayedW += dw * rec.minutes;
        xgiW += dw * (rec.xgi || 0);
        xgcW += dw * (rec.xgc || 0);
        bpsW += dw * (rec.bps || 0);
        savesW += dw * (rec.saves || 0);
        defconW += dw * (rec.defcon || 0);
      }
    }
    const xMins = w > 0 ? minsW / w / 90 : 0;
    const startRate = w > 0 ? startsW / w : 0;
    const form = appW > 0 ? ptsAppW / appW : NaN;
    const per90 = (a: number) => (minsPlayedW > 0 ? (a / minsPlayedW) * 90 : NaN);
    const xgi90 = per90(xgiW), xgc90 = per90(xgcW), bps90 = per90(bpsW);
    const saves90 = per90(savesW), defcon90 = per90(defconW);

    const fx = gwFix.get(p.team) || [];
    const hasFixture = fx.length;
    const fdr = fx.reduce((a, f) => a + (6 - f.difficulty) / 5, 0);
    const home = hasFixture ? fx.filter((f) => f.home).length / hasFixture : 0;

    const posW = POS_ATTACK_WEIGHT[p.element_type] ?? 0.5;
    let oppEase = 0;
    for (const f of fx) {
      oppEase += posW * -teamDef(f.opponent) + (1 - posW) * -teamAtk(f.opponent);
    }
    const ownQuality = posW * teamAtk(p.team) + (1 - posW) * teamDef(p.team);

    return {
      id: p.id, pos: p.element_type, team: p.team, price: startPrice, startPrice,
      form, xMins, startRate, xgi90, xgc90, bps90, saves90, defcon90,
      fdr, oppEase, ownQuality, home, hasFixture,
    };
  });

  const zForm = zscore(raw.map((r) => r.form));
  const zXgi = zscore(raw.map((r) => r.xgi90));
  const zXgc = zscore(raw.map((r) => r.xgc90));
  const zBps = zscore(raw.map((r) => r.bps90));
  const zSaves = zscore(raw.map((r) => r.saves90));
  const zDefcon = zscore(raw.map((r) => r.defcon90));
  const zFdr = zscore(raw.map((r) => r.fdr));
  const zOpp = zscore(raw.map((r) => r.oppEase));
  const zOwn = zscore(raw.map((r) => r.ownQuality));
  const priceByPos: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
  raw.forEach((r) => priceByPos[r.pos].push(r.startPrice));
  const priceZ: Record<number, (v: number) => number> = {};
  for (const pos of [1, 2, 3, 4]) priceZ[pos] = zscore(priceByPos[pos]);

  const rows: FeatureRow[] = raw.map((r) => {
    const formZ = Number.isFinite(r.form) ? zForm(r.form) : 0;
    const xgiZ = Number.isFinite(r.xgi90) ? zXgi(r.xgi90) : 0;
    const fdrZ = zFdr(r.fdr);
    return {
      id: r.id, pos: r.pos, team: r.team, price: r.price,
      f: [
        1,
        formZ,
        r.xMins,
        r.startRate,
        xgiZ,
        Number.isFinite(r.xgc90) ? zXgc(r.xgc90) : 0,
        Number.isFinite(r.bps90) ? zBps(r.bps90) : 0,
        Number.isFinite(r.saves90) ? zSaves(r.saves90) : 0,
        Number.isFinite(r.defcon90) ? zDefcon(r.defcon90) : 0,
        fdrZ,
        zOpp(r.oppEase),
        zOwn(r.ownQuality),
        r.home,
        priceZ[r.pos](r.startPrice),
        Math.min(r.hasFixture, 2),
        formZ * r.xMins,
        xgiZ * r.xMins,
        fdrZ * r.xMins,
      ],
      hasFixture: r.hasFixture,
      startRate: r.startRate,
      xMins: r.xMins,
    };
  });

  return { rows, names: FEATURE_NAMES };
}
