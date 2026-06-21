import type { AppManager } from './league-data';

export interface StandingRow extends AppManager {
  total: number;
  gw: number;
  rank: number;
  move: number;
}

/** League standings as they stood after gameweek `gw`, with movement vs gw-1. */
export function standingsAt(managers: AppManager[], gw: number): StandingRow[] {
  const totalAt = (m: AppManager, upto: number) =>
    m.totalPts[upto - 1] ?? m.gwPts.slice(0, upto).reduce((a, b) => a + b, 0);

  const rankMap = (upto: number) =>
    managers
      .map((m) => ({ id: m.id, t: totalAt(m, upto) }))
      .sort((a, b) => b.t - a.t)
      .reduce<Record<number, number>>((acc, r, i) => ((acc[r.id] = i + 1), acc), {});

  const rNow = rankMap(gw);
  const rPrev = gw > 1 ? rankMap(gw - 1) : rNow;

  return managers
    .map((m) => ({
      ...m,
      total: totalAt(m, gw),
      gw: m.gwPts[gw - 1] ?? 0,
      rank: rNow[m.id],
      move: (rPrev[m.id] ?? rNow[m.id]) - rNow[m.id],
    }))
    .sort((a, b) => a.rank - b.rank);
}

export interface ProgPoint {
  gw: number;
  rank: number;   // mini-league position after this GW (1 = top)
  gwPts: number;  // points scored this GW
  total: number;  // cumulative net total after this GW
}

/**
 * Mini-league rank for every manager, gameweek by gameweek.
 * Returns id -> rank[] where index 0 = GW1 (rank 1 = top of the table).
 */
export function rankMatrix(managers: AppManager[], upto: number): Map<number, number[]> {
  const map = new Map<number, number[]>();
  managers.forEach((m) => map.set(m.id, []));
  for (let g = 1; g <= upto; g++) {
    standingsAt(managers, g).forEach((row) => map.get(row.id)?.push(row.rank));
  }
  return map;
}

/** A manager's per-GW progression over [from, to], pairing mini-league rank with points. */
export function progressionFor(
  m: AppManager,
  rankRow: number[],
  from: number,
  to: number
): ProgPoint[] {
  const out: ProgPoint[] = [];
  for (let g = from; g <= to; g++) {
    const rank = rankRow[g - 1];
    if (rank == null) continue;
    const total = m.totalPts[g - 1] ?? m.gwPts.slice(0, g).reduce((a, b) => a + b, 0);
    out.push({ gw: g, rank, gwPts: m.gwPts[g - 1] ?? 0, total });
  }
  return out;
}

/** Manager of the Month — best points across the last (up to) 4 gameweeks. */
export function motm(managers: AppManager[], gw: number) {
  const from = Math.max(0, gw - 4);
  return managers
    .map((m) => ({ ...m, mpts: m.gwPts.slice(from, gw).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.mpts - a.mpts)[0];
}

export function formatRank(n: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Analytics for a focus manager up to gameweek `gw`. */
export function analyticsFor(m: AppManager | undefined, gw: number) {
  if (!m) return { rankLine: [], gwPoints: [], best: '—', rankDelta: '—', avg: 0, greens: 0 };
  const rankLine = m.overallRank.slice(0, gw).filter((r) => r > 0);
  const gwPoints = m.gwPts.slice(0, gw);
  const best = rankLine.length ? Math.min(...rankLine) : 0;
  const first = rankLine[0] || 0;
  const last = rankLine[rankLine.length - 1] || 0;
  const delta = first - last; // positive = improved (lower rank number)
  const rankDelta = !first || !last ? '—' : `${delta >= 0 ? '▲' : '▼'} ${formatRank(Math.abs(delta))}`;
  const avg = gwPoints.length ? Math.round(gwPoints.reduce((a, b) => a + b, 0) / gwPoints.length) : 0;
  const greens = gwPoints.filter((p, i) => i > 0 && p >= gwPoints[i - 1]).length;
  return { rankLine, gwPoints, best: formatRank(best), rankDelta, avg, greens };
}

export const NEWS_IMGS = [
  '/redesign/news/arteta.jpg', '/redesign/news/howe.jpg', '/redesign/news/maresca.webp',
  '/redesign/news/alonso.jpg', '/redesign/news/iraola.jpg', '/redesign/news/emery.jpg', '/redesign/news/carrick.jpg',
];

export interface Headlines {
  top: string;
  tag: string;
  heroImg: string;
  list: { tag: string; tone: string; t: string; img: string }[];
}

/** ESPN-style headlines derived from real standings movement for `gw`. */
export function headlinesFrom(managers: AppManager[], gw: number, leagueName: string): Headlines {
  const s = standingsAt(managers, gw);
  const leader = s[0];
  const topScorer = [...s].sort((a, b) => b.gw - a.gw)[0];
  const riser = [...s].filter((m) => m.move > 0).sort((a, b) => b.move - a.move)[0];
  const faller = [...s].filter((m) => m.move < 0).sort((a, b) => a.move - b.move)[0];

  const list: Headlines['list'] = [];
  if (riser) list.push({ tag: 'RISER', tone: '#009C54', t: `${riser.team} climbs ${riser.move} place${riser.move > 1 ? 's' : ''} to ${ordinal(riser.rank)}`, img: NEWS_IMGS[1] });
  if (faller) list.push({ tag: 'FALLER', tone: '#FF5050', t: `${faller.team} slips ${-faller.move} place${-faller.move > 1 ? 's' : ''} this gameweek`, img: NEWS_IMGS[2] });
  if (topScorer) list.push({ tag: 'TOP SCORE', tone: '#150000', t: `${topScorer.team} posts the GW${gw} high score — ${topScorer.gw} points`, img: NEWS_IMGS[3] });

  return {
    top: leader ? `${leader.team.toUpperCase()} LEADS ${leagueName.toUpperCase()} AFTER GW${gw}` : `GW${gw} IN THE BOOKS`,
    tag: `GW${gw} · TOP STORY`,
    heroImg: NEWS_IMGS[0],
    list: list.slice(0, 3),
  };
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
