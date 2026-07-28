// Feature engineering v2 — richer, still strictly leakage-free.
//
// Everything for target GW n derives from: (a) live per-GW stats of GWs < n,
// (b) results of fixtures with event < n, (c) the known fixture schedule for
// GW n, (d) static preseason metadata (position, club, START price).
//
// Differences vs v1:
//   • Exponentially-decayed aggregates over ALL history (not a 5-GW cutoff).
//   • Underlying-quality rates: xGI/90, xGC/90, BPS/90, saves/90, defcon/90.
//   • Expected minutes (decayed mins/90) + starts rate — a real minutes model.
//   • Team form computed from actual past results (decayed GF/GA per match)
//     instead of bootstrap `strength_*` fields, which are end-of-season values
//     in a cached snapshot and would leak. GW1 falls back to a squad-price
//     prior (top-15 start prices per club) — fully preseason-known.
//   • Opponent-adjusted fixture ease from that same team form.

export const FEATURE_NAMES_V2 = [
  'bias',        // 1
  'form',        // decayed points per appearance (z)
  'xMins',       // decayed minutes/90 (0..1)
  'startRate',   // decayed share of GWs started (0..1)
  'xgi90',       // decayed expected goal involvements per 90 (z)
  'xgc90',       // decayed expected goals conceded per 90 (z, sign learned)
  'bps90',       // decayed BPS per 90 (z) — bonus magnetism
  'saves90',     // decayed saves per 90 (z) — GK signal
  'defcon90',    // decayed defensive contribution per 90 (z) — 25/26 scoring
  'fdr',         // official fixture difficulty ease (z)
  'oppEase',     // opponent weakness from actual results, position-weighted (z)
  'ownQuality',  // own team form, position-weighted (z)
  'home',        // share of this GW's fixtures at home
  'pricePrior',  // start price z-scored within position
  'hasFixture',  // 0 blank / 1 / 2 double
  // Interactions — points require BEING ON THE PITCH, so quality signals are
  // gated by expected minutes (a linear model can't learn the product itself).
  'formXmins',   // form z × xMins
  'xgi90Xmins',  // xgi90 z × xMins
  'fdrXmins',    // fdr z × xMins
];

const DEFAULT_PLAYER_DECAY = 0.85; // per-GW decay for player aggregates (~4.3 GW half-life)
const DEFAULT_TEAM_DECAY = 0.90;   // per-GW decay for team form
const POS_ATTACK_WEIGHT = { 1: 0.1, 2: 0.35, 3: 0.8, 4: 1.0 }; // GK, DEF, MID, FWD

/** Pre-index fixtures into Map<gw, Map<teamId, [{home, difficulty, opponent}]>>. */
export function indexFixturesV2(fixtures) {
  const byGw = new Map();
  for (const f of fixtures) {
    if (f.event == null) continue;
    if (!byGw.has(f.event)) byGw.set(f.event, new Map());
    const m = byGw.get(f.event);
    if (!m.has(f.team_h)) m.set(f.team_h, []);
    if (!m.has(f.team_a)) m.set(f.team_a, []);
    m.get(f.team_h).push({ home: true, difficulty: f.team_h_difficulty, opponent: f.team_a });
    m.get(f.team_a).push({ home: false, difficulty: f.team_a_difficulty, opponent: f.team_h });
  }
  return byGw;
}

function zscore(values) {
  const present = values.filter((v) => Number.isFinite(v));
  const mean = present.reduce((a, b) => a + b, 0) / (present.length || 1);
  const sd = Math.sqrt(present.reduce((a, b) => a + (b - mean) ** 2, 0) / (present.length || 1)) || 1;
  return (v) => (Number.isFinite(v) ? (v - mean) / sd : 0);
}

/**
 * Decayed team form from ACTUAL results of fixtures before targetGw.
 * Returns Map<teamId, {gf, ga, n}> — goals for/against per match, decayed.
 * Only uses fixtures with event < targetGw and finished (leakage-free).
 */
export function buildTeamForm(targetGw, fixtures, teamDecay = DEFAULT_TEAM_DECAY) {
  const acc = new Map(); // teamId -> {gfW, gaW, w}
  const bump = (team, gf, ga, w) => {
    const a = acc.get(team) || { gfW: 0, gaW: 0, w: 0 };
    a.gfW += w * gf; a.gaW += w * ga; a.w += w;
    acc.set(team, a);
  };
  for (const f of fixtures) {
    if (f.event == null || f.event >= targetGw) continue;
    if (!f.finished || f.team_h_score == null) continue;
    const w = Math.pow(teamDecay, targetGw - 1 - f.event);
    bump(f.team_h, f.team_h_score, f.team_a_score, w);
    bump(f.team_a, f.team_a_score, f.team_h_score, w);
  }
  const out = new Map();
  for (const [team, a] of acc) {
    out.set(team, { gf: a.gfW / (a.w || 1), ga: a.gaW / (a.w || 1), n: a.w });
  }
  return out;
}

/**
 * GW1 fallback team strength: mean of the club's top-15 START prices.
 * Preseason-known, zero leakage. Returned as Map<teamId, number>.
 */
function squadPriceStrength(players) {
  const byTeam = new Map();
  for (const p of players) {
    const startPrice = p.now_cost - p.cost_change_start;
    if (!byTeam.has(p.team)) byTeam.set(p.team, []);
    byTeam.get(p.team).push(startPrice);
  }
  const out = new Map();
  for (const [team, prices] of byTeam) {
    const top = prices.sort((a, b) => b - a).slice(0, 15);
    out.set(team, top.reduce((a, b) => a + b, 0) / (top.length || 1));
  }
  return out;
}

/**
 * @param targetGw     gameweek to predict
 * @param players      bootstrap elements (static metadata only)
 * @param liveByGw     Map<gw, Map<id, stats>> — stats from loadLiveMap (rich)
 * @param fixturesByGw output of indexFixturesV2
 * @param fixtures     raw fixtures array (for team form from results)
 * @param opts         { playerDecay, teamDecay } aggregate half-life knobs
 * @returns { rows: [{id, pos, team, price, f, hasFixture}], names }
 */
export function buildFeaturesV2(targetGw, players, liveByGw, fixturesByGw, fixtures, opts = {}) {
  const playerDecay = opts.playerDecay ?? DEFAULT_PLAYER_DECAY;
  const teamDecay = opts.teamDecay ?? DEFAULT_TEAM_DECAY;
  for (const gw of liveByGw.keys()) {
    if (gw >= targetGw) throw new Error(`Leakage: history GW${gw} >= target GW${targetGw}`);
  }

  const gwFix = fixturesByGw.get(targetGw) || new Map();
  const histGws = [...liveByGw.keys()].sort((a, b) => a - b);
  const teamForm = buildTeamForm(targetGw, fixtures, teamDecay);

  // Team form z-scores (or price-prior fallback when no results yet, i.e. GW1).
  let teamAtk, teamDef; // functions teamId -> z
  if (teamForm.size >= 10) {
    const ids = [...teamForm.keys()];
    const zGf = zscore(ids.map((t) => teamForm.get(t).gf));
    const zGa = zscore(ids.map((t) => teamForm.get(t).ga));
    teamAtk = (t) => (teamForm.has(t) ? zGf(teamForm.get(t).gf) : 0);
    teamDef = (t) => (teamForm.has(t) ? -zGa(teamForm.get(t).ga) : 0); // higher = tighter defence
  } else {
    const priceStr = squadPriceStrength(players);
    const ids = [...priceStr.keys()];
    const zP = zscore(ids.map((t) => priceStr.get(t)));
    teamAtk = (t) => (priceStr.has(t) ? zP(priceStr.get(t)) : 0);
    teamDef = teamAtk; // one prior for both sides preseason
  }

  const raw = players.map((p) => {
    const startPrice = p.now_cost - p.cost_change_start;

    // Decayed player aggregates over all history.
    let w = 0, minsW = 0, startsW = 0;
    let ptsAppW = 0, appW = 0; // points per appearance
    let xgiW = 0, xgcW = 0, bpsW = 0, savesW = 0, defconW = 0, minsPlayedW = 0;
    for (const gw of histGws) {
      const rec = liveByGw.get(gw)?.get(p.id);
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
    const xMins = w > 0 ? minsW / w / 90 : 0;         // 0..1 expected share
    const startRate = w > 0 ? startsW / w : 0;
    const form = appW > 0 ? ptsAppW / appW : NaN;
    const per90 = (acc) => (minsPlayedW > 0 ? (acc / minsPlayedW) * 90 : NaN);
    const xgi90 = per90(xgiW), xgc90 = per90(xgcW), bps90 = per90(bpsW);
    const saves90 = per90(savesW), defcon90 = per90(defconW);

    // Fixture block.
    const fx = gwFix.get(p.team) || [];
    const hasFixture = fx.length;
    const fdr = fx.reduce((a, f) => a + (6 - f.difficulty) / 5, 0);
    const home = hasFixture ? fx.filter((f) => f.home).length / hasFixture : 0;

    // Opponent ease + own quality, position-weighted (attackers care about the
    // opponent's leakiness & own attack; defenders the reverse).
    const posW = POS_ATTACK_WEIGHT[p.element_type] ?? 0.5;
    let oppEase = 0;
    for (const f of fx) {
      const oppLeaky = -teamDef(f.opponent); // opponent conceding a lot = good for attackers
      const oppBlunt = -teamAtk(f.opponent); // opponent not scoring = good for defenders
      oppEase += posW * oppLeaky + (1 - posW) * oppBlunt;
    }
    const ownQuality = posW * teamAtk(p.team) + (1 - posW) * teamDef(p.team);

    return {
      id: p.id, pos: p.element_type, team: p.team, price: startPrice, startPrice,
      form, xMins, startRate, xgi90, xgc90, bps90, saves90, defcon90,
      fdr, oppEase, ownQuality, home, hasFixture,
    };
  });

  // Standardization across the pool.
  const zForm = zscore(raw.map((r) => r.form));
  const zXgi = zscore(raw.map((r) => r.xgi90));
  const zXgc = zscore(raw.map((r) => r.xgc90));
  const zBps = zscore(raw.map((r) => r.bps90));
  const zSaves = zscore(raw.map((r) => r.saves90));
  const zDefcon = zscore(raw.map((r) => r.defcon90));
  const zFdr = zscore(raw.map((r) => r.fdr));
  const zOpp = zscore(raw.map((r) => r.oppEase));
  const zOwn = zscore(raw.map((r) => r.ownQuality));
  const priceByPos = { 1: [], 2: [], 3: [], 4: [] };
  raw.forEach((r) => priceByPos[r.pos].push(r.startPrice));
  const priceZ = {};
  for (const pos of [1, 2, 3, 4]) priceZ[pos] = zscore(priceByPos[pos]);

  const rows = raw.map((r) => {
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

  return { rows, names: FEATURE_NAMES_V2 };
}
