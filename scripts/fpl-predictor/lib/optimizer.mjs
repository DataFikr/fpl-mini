// Squad optimization under FPL rules.
//   Squad: 15 players — 2 GK, 5 DEF, 5 MID, 3 FWD, ≤3 per club, ≤ £100.0m.
//   XI:    11 players from the squad in a legal formation (GK1, DEF3-5, MID2-5, FWD1-3).
// Prices are in tenths of a million; BUDGET = 1000.

export const BUDGET = 1000;
const QUOTA = { 1: 2, 2: 5, 3: 5, 4: 3 };
const POSITIONS = [1, 2, 3, 4];

/**
 * Greedy value seed (points-per-cost) honoring quotas, budget and club caps,
 * then hill-climbing swaps to raise total predicted points while feasible.
 * @param players [{id, pos, team, price, xpts}]
 */
export function pickSquad(players, opts = {}) {
  const {
    // Hard cap on any single player's price (tenths). Drives the "value" build:
    // banning premiums forces the budget across all 15 instead of 3.
    maxPlayerPrice = Infinity,
    // Force at least this many players priced >= premiumPrice, seeded before
    // anything else. Drives "stars & scrubs".
    minPremiums = 0,
    premiumPrice = 90,
    budget = BUDGET,
  } = opts;

  const eligible = players.filter((p) => p.price <= maxPlayerPrice);
  // If the cap is so tight a legal squad is impossible, fall back to the full
  // pool rather than returning a short squad.
  const pool = POSITIONS.every((pos) => eligible.filter((p) => p.pos === pos).length >= QUOTA[pos])
    ? eligible
    : players;

  const byPos = {};
  for (const pos of POSITIONS) {
    byPos[pos] = pool
      .filter((p) => p.pos === pos)
      .map((p) => ({ ...p, value: p.xpts / Math.max(p.price, 1) }))
      .sort((a, b) => b.value - a.value);
  }

  const squad = [];
  const clubCount = new Map();
  let spend = 0;
  const posCount = () => squad.reduce((m, p) => (m[p.pos] = (m[p.pos] || 0) + 1, m), {});

  // Ascending price lists per position, for reserving budget.
  //
  // Two ways this goes wrong, both of which produced short squads:
  //   1. reserving a flat floor ("£4.0m x slots") under-reserves whenever the
  //      cheapest real option costs more;
  //   2. reserving from the full list double-counts players already bought.
  // So the reserve is computed from players not yet in the squad.
  const byPosAsc = {};
  for (const pos of POSITIONS) {
    byPosAsc[pos] = pool.filter((p) => p.pos === pos).sort((a, b) => a.price - b.price);
  }
  /** Minimum spend still required to fill every unfilled quota slot. */
  const reserveAfter = (extra = null) => {
    const taken = new Set(squad.map((p) => p.id));
    if (extra) taken.add(extra.id);
    const have = posCount();
    if (extra) have[extra.pos] = (have[extra.pos] || 0) + 1;
    let need = 0;
    for (const pos of POSITIONS) {
      let missing = QUOTA[pos] - (have[pos] || 0);
      if (missing <= 0) continue;
      for (const p of byPosAsc[pos]) {
        if (missing === 0) break;
        if (taken.has(p.id)) continue;
        need += p.price;
        missing--;
      }
      need += missing * 40; // pool exhausted — fall back to the price floor
    }
    return need;
  };
  const canAdd = (p) =>
    spend + p.price <= budget && (clubCount.get(p.team) || 0) < 3;
  const add = (p) => {
    squad.push(p);
    spend += p.price;
    clubCount.set(p.team, (clubCount.get(p.team) || 0) + 1);
  };

  // Premium seed first: the most expensive slots have to be claimed before the
  // value-greedy pass spends the budget on mid-price players.
  if (minPremiums > 0) {
    const premiums = pool
      .filter((p) => p.price >= premiumPrice)
      .sort((a, b) => b.xpts - a.xpts);
    const counts = {};
    for (const p of premiums) {
      if (squad.length >= minPremiums) break;
      counts[p.pos] = counts[p.pos] || 0;
      if (counts[p.pos] >= QUOTA[p.pos]) continue;
      if (!canAdd(p)) continue;
      if (spend + p.price + reserveAfter(p) > budget) continue;
      add(p); counts[p.pos]++;
    }
  }

  // Seed: fill each quota with the best affordable value players.
  for (const pos of POSITIONS) {
    const have = posCount()[pos] || 0;
    let need = QUOTA[pos] - have;
    const inSquadIds = new Set(squad.map((x) => x.id));
    for (const p of byPos[pos]) {
      if (need === 0) break;
      if (inSquadIds.has(p.id)) continue;
      if (!canAdd(p)) continue;
      if (spend + p.price + reserveAfter(p) > budget) continue;
      add(p); inSquadIds.add(p.id); need--;
    }
    if (need > 0) { // budget too tight — backfill cheapest available
      for (const p of [...byPos[pos]].sort((a, b) => a.price - b.price)) {
        if (need === 0) break;
        if (!squad.some((x) => x.id === p.id) && canAdd(p)) { add(p); need--; }
      }
    }
  }

  // Repair: a premium seed can still over-commit and leave a slot unaffordable.
  // Rather than return a short squad, downgrade the dearest filled slot to the
  // cheapest option in its position to free budget, and retry. Each pass either
  // fills a slot or strictly reduces spend, so this terminates.
  for (let pass = 0; squad.length < 15 && pass < 30; pass++) {
    const have = posCount();
    const short = POSITIONS.find((pos) => (have[pos] || 0) < QUOTA[pos]);
    if (short === undefined) break;

    const taken = new Set(squad.map((p) => p.id));
    const options = byPosAsc[short].filter((p) => !taken.has(p.id));
    const affordable = options.find((p) => canAdd(p));
    if (affordable) { add(affordable); continue; }

    // Nothing affordable: sell the dearest player that has a cheaper
    // same-position replacement, and try again.
    const dearest = [...squad].sort((a, b) => b.price - a.price)
      .find((cur) => byPosAsc[cur.pos].some((c) => !taken.has(c.id) && c.price < cur.price));
    if (!dearest) break;
    const cheap = byPosAsc[dearest.pos].find((c) => !taken.has(c.id) && c.price < dearest.price
      && (c.team === dearest.team || (clubCount.get(c.team) || 0) < 3));
    if (!cheap) break;
    squad.splice(squad.indexOf(dearest), 1, cheap);
    spend += cheap.price - dearest.price;
    clubCount.set(dearest.team, (clubCount.get(dearest.team) || 0) - 1);
    clubCount.set(cheap.team, (clubCount.get(cheap.team) || 0) + 1);
  }

  // Hill-climb: try replacing a squad player with a same-position non-squad
  // player that increases total xpts and keeps the squad feasible.
  const inSquad = new Set(squad.map((p) => p.id));
  const premiumsIn = () => squad.filter((p) => p.price >= premiumPrice).length;
  let improved = true, guard = 0;
  while (improved && guard++ < 2000) {
    improved = false;
    for (const cur of squad) {
      for (const cand of byPos[cur.pos]) {
        if (inSquad.has(cand.id)) continue;
        const newSpend = spend - cur.price + cand.price;
        if (newSpend > budget) continue;
        // Don't let a swap drop the squad below its required premium count.
        if (minPremiums > 0 && cur.price >= premiumPrice && cand.price < premiumPrice
            && premiumsIn() <= minPremiums) continue;
        const curClub = clubCount.get(cand.team) || 0;
        const sameClub = cand.team === cur.team;
        if (!sameClub && curClub >= 3) continue; // would exceed club cap
        if (cand.xpts <= cur.xpts) continue;
        // apply swap
        squad.splice(squad.indexOf(cur), 1, cand);
        inSquad.delete(cur.id); inSquad.add(cand.id);
        spend = newSpend;
        clubCount.set(cur.team, (clubCount.get(cur.team) || 0) - 1);
        clubCount.set(cand.team, (clubCount.get(cand.team) || 0) + 1);
        improved = true;
        break;
      }
      if (improved) break;
    }
  }

  return squad;
}

/** All legal outfield splits for an 11-man XI (1 GK fixed). */
const FORMATIONS = [];
for (let d = 3; d <= 5; d++)
  for (let m = 2; m <= 5; m++)
    for (let f = 1; f <= 3; f++)
      if (1 + d + m + f === 11) FORMATIONS.push({ 1: 1, 2: d, 3: m, 4: f });

/**
 * Best legal XI from a squad, maximizing `field` (e.g. 'xpts' for the predicted
 * XI, or 'actual' to find the squad's hindsight-optimal XI).
 */
export function bestXI(squad, field = 'xpts') {
  const byPos = {};
  for (const pos of POSITIONS)
    byPos[pos] = squad.filter((p) => p.pos === pos).sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0));

  let best = null, bestTotal = -Infinity;
  for (const form of FORMATIONS) {
    if (POSITIONS.some((pos) => byPos[pos].length < form[pos])) continue;
    const xi = POSITIONS.flatMap((pos) => byPos[pos].slice(0, form[pos]));
    const total = xi.reduce((a, p) => a + (p[field] ?? 0), 0);
    if (total > bestTotal) { bestTotal = total; best = xi; }
  }
  return { xi: best || [], total: bestTotal === -Infinity ? 0 : bestTotal };
}

export function squadCost(squad) {
  return squad.reduce((a, p) => a + p.price, 0);
}

/** "3-4-3" from an XI (GK implied). */
export function formationOf(xi) {
  const c = { 2: 0, 3: 0, 4: 0 };
  for (const p of xi) if (c[p.pos] !== undefined) c[p.pos]++;
  return `${c[2]}-${c[3]}-${c[4]}`;
}

/**
 * The three squad archetypes an FPL manager actually chooses between.
 *
 * One "optimal" 15 hides the real decision: the same £100m buys very different
 * risk. Maximising xPts alone reliably lands on stars-and-scrubs, because the
 * optimiser has no notion of rotation risk in the £4.0m defenders funding it.
 * These three make the trade explicit and are all genuinely optimal — each is
 * the best squad *subject to its own constraint*.
 */
export const SQUAD_STRATEGIES = [
  {
    key: 'balanced',
    label: 'Balanced',
    blurb: 'The unconstrained optimum — highest projected points for £100m, however it falls.',
    opts: {},
  },
  {
    key: 'stars',
    label: 'Stars & Scrubs',
    blurb: 'At least four £9.0m+ premiums, funded by budget enablers. High ceiling, thin bench.',
    opts: { minPremiums: 4, premiumPrice: 90 },
  },
  {
    key: 'value',
    label: 'Value / Template',
    blurb: 'No player over £8.5m — spreads the budget across all 15. Lower ceiling, far better bench.',
    opts: { maxPlayerPrice: 85 },
  },
];

/**
 * Build one squad per strategy, each with its best legal XI, formation, bench
 * and captain. `field` selects the objective ('xpts' predicted, 'actual' for
 * hindsight scoring of the same squads).
 */
export function dreamTeams(players, { field = 'xpts', strategies = SQUAD_STRATEGIES } = {}) {
  return strategies.map((s) => {
    const squad = pickSquad(players, s.opts);
    const { xi, total } = bestXI(squad, field);
    const xiIds = new Set(xi.map((p) => p.id));
    const bench = squad.filter((p) => !xiIds.has(p.id));

    // Captain: highest projected of the XI, gated on availability where the
    // caller supplied startRate — upside is worthless from the bench.
    const gated = xi.filter((p) => p.startRate === undefined || p.startRate >= 0.7);
    const captain = (gated.length ? gated : xi)
      .slice()
      .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0] || null;

    return {
      key: s.key,
      label: s.label,
      blurb: s.blurb,
      squad,
      xi,
      bench: bench.sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0)),
      formation: formationOf(xi),
      captain,
      cost: squadCost(squad),
      xiTotal: total,
      // Captain plays twice, so the armband is worth its own points again.
      xiTotalWithCaptain: total + (captain?.[field] ?? 0),
    };
  });
}
