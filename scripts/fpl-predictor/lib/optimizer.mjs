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
export function pickSquad(players) {
  const byPos = {};
  for (const pos of POSITIONS) {
    byPos[pos] = players
      .filter((p) => p.pos === pos)
      .map((p) => ({ ...p, value: p.xpts / Math.max(p.price, 1) }))
      .sort((a, b) => b.value - a.value);
  }

  const squad = [];
  const clubCount = new Map();
  let spend = 0;
  const canAdd = (p) =>
    spend + p.price <= BUDGET && (clubCount.get(p.team) || 0) < 3;
  const add = (p) => {
    squad.push(p);
    spend += p.price;
    clubCount.set(p.team, (clubCount.get(p.team) || 0) + 1);
  };

  // Seed: fill each quota with the best affordable value players.
  for (const pos of POSITIONS) {
    let need = QUOTA[pos];
    for (const p of byPos[pos]) {
      if (need === 0) break;
      if (canAdd(p)) { add(p); need--; }
    }
    if (need > 0) { // budget too tight — backfill cheapest available
      for (const p of [...byPos[pos]].sort((a, b) => a.price - b.price)) {
        if (need === 0) break;
        if (!squad.includes(p) && canAdd(p)) { add(p); need--; }
      }
    }
  }

  // Hill-climb: try replacing a squad player with a same-position non-squad
  // player that increases total xpts and keeps the squad feasible.
  const inSquad = new Set(squad.map((p) => p.id));
  let improved = true, guard = 0;
  while (improved && guard++ < 2000) {
    improved = false;
    for (const cur of squad) {
      for (const cand of byPos[cur.pos]) {
        if (inSquad.has(cand.id)) continue;
        const newSpend = spend - cur.price + cand.price;
        if (newSpend > BUDGET) continue;
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
