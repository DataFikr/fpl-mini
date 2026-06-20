// Feature engineering. Builds a leakage-free feature vector per player for a
// target gameweek using ONLY data from earlier gameweeks (+ the known fixture
// schedule). GW1 has no history, so it leans on a price-based preseason prior.

export const FEATURE_NAMES = ['bias', 'form', 'minsRate', 'fdr', 'home', 'attack', 'pricePrior', 'hasFixture'];
const FORM_WINDOW = 5;

const POS_ATTACK_WEIGHT = { 1: 0.15, 2: 0.45, 3: 0.85, 4: 1.0 }; // GK, DEF, MID, FWD

/** Pre-index fixtures into Map<gw, Map<teamId, [{home, difficulty}]>>. */
export function indexFixtures(fixtures) {
  const byGw = new Map();
  for (const f of fixtures) {
    if (f.event == null) continue;
    if (!byGw.has(f.event)) byGw.set(f.event, new Map());
    const m = byGw.get(f.event);
    if (!m.has(f.team_h)) m.set(f.team_h, []);
    if (!m.has(f.team_a)) m.set(f.team_a, []);
    m.get(f.team_h).push({ home: true, difficulty: f.team_h_difficulty });
    m.get(f.team_a).push({ home: false, difficulty: f.team_a_difficulty });
  }
  return byGw;
}

/** Normalize team strength fields to roughly [-1, 1] across the league. */
function teamStrengthIndex(teams) {
  const idx = new Map();
  const atk = teams.map((t) => t.strength_attack_home + t.strength_attack_away);
  const def = teams.map((t) => t.strength_defence_home + t.strength_defence_away);
  const stats = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length) || 1;
    return { mean, sd };
  };
  const sa = stats(atk), sd = stats(def);
  teams.forEach((t) => {
    idx.set(t.id, {
      attack: ((t.strength_attack_home + t.strength_attack_away) - sa.mean) / sa.sd,
      defence: ((t.strength_defence_home + t.strength_defence_away) - sd.mean) / sd.sd,
    });
  });
  return idx;
}

function zscore(values) {
  const present = values.filter((v) => Number.isFinite(v));
  const mean = present.reduce((a, b) => a + b, 0) / (present.length || 1);
  const sd = Math.sqrt(present.reduce((a, b) => a + (b - mean) ** 2, 0) / (present.length || 1)) || 1;
  return (v) => (Number.isFinite(v) ? (v - mean) / sd : 0);
}

/**
 * @param targetGw       gameweek to predict
 * @param players        bootstrap elements (static metadata only)
 * @param liveByGw       Map<gw, Map<id,{points,minutes}>> (history)
 * @param fixturesByGw   output of indexFixtures
 * @param teams          bootstrap teams
 * @returns { rows: [{id, pos, team, price, f:number[]}], names }
 */
export function buildFeatures(targetGw, players, liveByGw, fixturesByGw, teams) {
  // Leakage guard: never read history at or beyond the target gameweek.
  for (const gw of liveByGw.keys()) {
    if (gw >= targetGw) throw new Error(`Leakage: history GW${gw} >= target GW${targetGw}`);
  }

  const strength = teamStrengthIndex(teams);
  const gwFix = fixturesByGw.get(targetGw) || new Map();
  const histGws = [...liveByGw.keys()].sort((a, b) => a - b).slice(-FORM_WINDOW);

  // Raw pass.
  const raw = players.map((p) => {
    const startPrice = p.now_cost - p.cost_change_start; // tenths of a million
    // Minutes-weighted recent form.
    let wsum = 0, psum = 0, played60 = 0, appearances = 0;
    for (const gw of histGws) {
      const rec = liveByGw.get(gw)?.get(p.id);
      if (!rec) continue;
      appearances++;
      const w = 0.5 + Math.min(rec.minutes, 90) / 90; // 0.5..1.5
      wsum += w; psum += w * rec.points;
      if (rec.minutes >= 60) played60++;
    }
    const form = wsum > 0 ? psum / wsum : NaN;
    const minsRate = histGws.length > 0 ? played60 / histGws.length : 0.5;

    const fx = gwFix.get(p.team) || [];
    const hasFixture = fx.length;
    const fdr = fx.reduce((a, f) => a + (6 - f.difficulty) / 5, 0); // higher = easier
    const home = hasFixture ? fx.filter((f) => f.home).length / hasFixture : 0;

    const s = strength.get(p.team) || { attack: 0, defence: 0 };
    const posW = POS_ATTACK_WEIGHT[p.element_type] ?? 0.5;
    const attack = posW * s.attack + (1 - posW) * s.defence; // position-appropriate team quality

    return { id: p.id, pos: p.element_type, team: p.team, price: startPrice,
             form, minsRate, fdr, home, attack, startPrice, hasFixture };
  });

  // Price prior z-scored WITHIN position (preseason expectation, no leakage).
  const priceByPos = { 1: [], 2: [], 3: [], 4: [] };
  raw.forEach((r) => priceByPos[r.pos].push(r.startPrice));
  const priceZ = {};
  for (const pos of [1, 2, 3, 4]) priceZ[pos] = zscore(priceByPos[pos]);

  // Standardize magnitude features across the pool for stable SGD.
  const zForm = zscore(raw.map((r) => r.form));
  const zFdr = zscore(raw.map((r) => r.fdr));
  const zAttack = zscore(raw.map((r) => r.attack));

  const rows = raw.map((r) => ({
    id: r.id, pos: r.pos, team: r.team, price: r.price,
    f: [
      1,                              // bias
      Number.isFinite(r.form) ? zForm(r.form) : 0, // form (0 at GW1 cold start)
      r.minsRate,                     // minutes reliability
      zFdr(r.fdr),                    // fixture ease
      r.home,                         // home share
      zAttack(r.attack),              // team quality for position
      priceZ[r.pos](r.startPrice),    // preseason price prior
      Math.min(r.hasFixture, 2),      // fixtures this GW (0 blank / 1 / 2 double)
    ],
    hasFixture: r.hasFixture,
  }));

  return { rows, names: FEATURE_NAMES };
}
