/**
 * 2025/26 demo-season provider (server-only).
 *
 * The live FPL API has rolled past 2025/26 and 2026/27 GW1 has not started, so
 * there is no populated season to record the product video against. When
 * `FPL_DEMO_SEASON=2025-26` is set, `FPLApiService.fetchWithCache` routes every
 * request here instead of the network:
 *   - bootstrap / fixtures / live  → real 2025/26 snapshots in the predictor cache
 *   - league / entry / history / picks → a full 12-manager league synthesized
 *     deterministically from those snapshots (real players, real per-GW points,
 *     so rank progression + ESPN headlines have authentic season shape).
 *
 * The snapshot files live in the gitignored predictor cache and are read from
 * disk at runtime — this is a LOCAL demo/recording mode, not a production path.
 * Flip `FPL_DEMO_SEASON` off (and the app returns to the live API) once the new
 * season's GW1 data is available.
 */
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'scripts', 'fpl-predictor', '.cache');

/** The mini-league + team the landing "try the demo" links point at. */
export const DEMO_LEAGUE_ID = 150789;
export const DEMO_TEAM_ID = 6454003;

export function isDemoMode(): boolean {
  return process.env.FPL_DEMO_SEASON === '2025-26';
}

/** The simulated "current" gameweek — the season is presented as live at this GW. */
export function demoGw(): number {
  const raw = parseInt(process.env.FPL_DEMO_GW || '20', 10);
  return Math.max(2, Math.min(38, Number.isFinite(raw) ? raw : 20));
}

// ---- snapshot loading (memoized) -------------------------------------------

const memo = new Map<string, unknown>();
function readJson<T>(file: string): T {
  if (memo.has(file)) return memo.get(file) as T;
  const data = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8')) as T;
  memo.set(file, data);
  return data;
}

interface BootEl { id: number; element_type: number; team: number; web_name: string; now_cost: number; total_points: number; selected_by_percent: string; }

/** Bootstrap with its `events` rewritten so the season reads as live at `demoGw()`. */
function loadBootstrap(): any {
  const key = 'bootstrap:rewritten';
  if (memo.has(key)) return memo.get(key);
  const boot = readJson<any>('bootstrap.json');
  const gw = demoGw();
  const events = (boot.events as any[]).map((e) => ({
    ...e,
    finished: e.id < gw,
    is_previous: e.id === gw - 1,
    is_current: e.id === gw,
    is_next: e.id === gw + 1,
    data_checked: e.id < gw,
  }));
  const out = { ...boot, events };
  memo.set(key, out);
  return out;
}

/** Fixtures with `finished`/`event` coherent with the demo "now". */
function loadFixtures(): any[] {
  const key = 'fixtures:rewritten';
  if (memo.has(key)) return memo.get(key) as any[];
  const gw = demoGw();
  const fx = readJson<any[]>('fixtures.json').map((f) => ({
    ...f,
    finished: f.event != null && f.event < gw,
    finished_provisional: f.event != null && f.event < gw,
    started: f.event != null && f.event <= gw,
  }));
  memo.set(key, fx);
  return fx;
}

/** Raw live payload for a GW (`{ elements: [...] }`) — as the predictor expects. */
function loadLiveRaw(gw: number): any {
  return readJson<any>(`live-${gw}.json`);
}

/** playerId → total_points for a GW, from the real live snapshot. */
function livePoints(gw: number): Map<number, number> {
  const key = `livepts:${gw}`;
  if (memo.has(key)) return memo.get(key) as Map<number, number>;
  const m = new Map<number, number>();
  try {
    for (const el of loadLiveRaw(gw).elements || []) m.set(el.id, el.stats?.total_points ?? 0);
  } catch { /* missing GW file → empty (players score 0 that week) */ }
  memo.set(key, m);
  return m;
}

// ---- deterministic RNG ------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- demo league roster -----------------------------------------------------

interface DemoMgr { entry: number; team: string; first: string; last: string; }
const ROSTER: DemoMgr[] = [
  { entry: DEMO_TEAM_ID, team: 'Meriam Pak Maon', first: 'Tyson', last: 'Aziz' },
  { entry: 5100818, team: 'kejoryobkejor', first: 'Azmil', last: 'Kadir' },
  { entry: 6463870, team: 'KakiBangkuFC', first: 'Razman', last: 'Affendi' },
  { entry: 6356669, team: "Kickin' FC", first: 'Nabeyl', last: 'Salleh' },
  { entry: 852361, team: 'Hot Days Ahead FC', first: 'Cruz', last: 'Reds' },
  { entry: 5010897, team: 'ARSENGAL', first: 'Asyrafvin', last: 'Rahim' },
  { entry: 5307771, team: 'RRbby', first: 'Encik', last: 'Bergkamp' },
  { entry: 7136303, team: 'Kipas Lipas', first: 'Ahmad', last: 'Rahman' },
  { entry: 5698298, team: 'Interval', first: 'Johan', last: 'Ismail' },
  { entry: 2611652, team: 'Tapirus Indicus', first: 'Redhu', last: 'Malek' },
  { entry: 4820013, team: 'Ganu Boys', first: 'Wan', last: 'Ariff' },
  { entry: 3901882, team: 'Cendol United', first: 'Faiz', last: 'Hakim' },
];
const ROSTER_BY_ID = new Map(ROSTER.map((m) => [m.entry, m]));

// ---- squad synthesis --------------------------------------------------------

/** Pools of the season's most-owned players per position, for realistic squads. */
function playerPools(): Record<number, BootEl[]> {
  const key = 'pools';
  if (memo.has(key)) return memo.get(key) as Record<number, BootEl[]>;
  const els = loadBootstrap().elements as BootEl[];
  const byPos: Record<number, BootEl[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const e of els) if (byPos[e.element_type]) byPos[e.element_type].push(e);
  for (const pos of [1, 2, 3, 4]) {
    byPos[pos].sort((a, b) => b.total_points - a.total_points);
    byPos[pos] = byPos[pos].slice(0, 45); // top pool keeps names recognizable
  }
  memo.set(key, byPos);
  return byPos;
}

export interface DemoPick { element: number; position: number; multiplier: number; is_captain: boolean; is_vice_captain: boolean; }

/**
 * A believable 15-man squad (2-5-5-3), starting XI in 3-4-3.
 *
 * Modelled on how real FPL mini-leagues actually look: everyone owns a shared
 * "template" core of the season's best players, and squads diverge only at the
 * margins (a handful of differentials) and — crucially — on the captain. That
 * keeps the league table tight and dramatic, keeps genuine stars in every XI,
 * and makes captaincy the main week-to-week swing (as it is in real FPL).
 */
function squadFor(entry: number): DemoPick[] {
  const key = `squad:${entry}`;
  if (memo.has(key)) return memo.get(key) as DemoPick[];
  const pools = playerPools();
  const mi = Math.max(0, ROSTER.findIndex((m) => m.entry === entry)); // 0..11, unique per manager

  // Every squad owns a shared premium core (1 GK, 2 DEF, 2 MID, 1 FWD) — the
  // template that keeps stars in every XI. The rest are per-manager differentials
  // drawn from a top-of-pool window shifted by manager index, so no two squads are
  // identical (unique totals, real rank movement) while all stay competitive.
  const pick = (pos: number, idxs: number[]) => idxs.map((i) => pools[pos][i]).filter(Boolean);
  const gks = [...pick(1, [0]), ...pick(1, [1 + mi])];                     // 2
  const defs = [...pick(2, [0, 1]), ...pick(2, [2 + mi, 3 + mi, 4 + mi])]; // 5
  const mids = [...pick(3, [0, 1]), ...pick(3, [2 + mi, 3 + mi, 4 + mi])]; // 5
  const fwds = [...pick(4, [0]), ...pick(4, [1 + mi, 2 + mi])];            // 3

  const byPts = (a: BootEl, b: BootEl) => b.total_points - a.total_points;
  gks.sort(byPts); defs.sort(byPts); mids.sort(byPts); fwds.sort(byPts);

  // Starting XI 3-4-3 = best of each; the rest fill the 4-man bench.
  const starters: BootEl[] = [gks[0], ...defs.slice(0, 3), ...mids.slice(0, 4), ...fwds.slice(0, 3)];
  const bench: BootEl[] = [gks[1], ...defs.slice(3), ...mids.slice(4)];

  // Captain = a genuine premium, rotated 3 ways across the league so captaincy is
  // the main week-to-week swing (Salah / Haaland / a top mid) — as in real FPL.
  const topAttackers = [...mids, ...fwds].sort(byPts).slice(0, 3);
  const captainId = (topAttackers[mi % topAttackers.length] || topAttackers[0])?.id;
  const viceId = topAttackers.find((a) => a.id !== captainId)?.id;

  const picks: DemoPick[] = [];
  let position = 1;
  for (const p of starters) picks.push({ element: p.id, position: position++, multiplier: p.id === captainId ? 2 : 1, is_captain: p.id === captainId, is_vice_captain: p.id === viceId });
  for (const p of bench) picks.push({ element: p.id, position: position++, multiplier: 0, is_captain: false, is_vice_captain: false });

  memo.set(key, picks);
  return picks;
}

/** A manager's real points for a GW = Σ starting XI live points (captain doubled). */
function managerGwPoints(entry: number, gw: number): number {
  const pts = livePoints(gw);
  let total = 0;
  for (const p of squadFor(entry)) {
    if (p.multiplier === 0) continue;
    total += (pts.get(p.element) ?? 0) * p.multiplier;
  }
  return total;
}

// ---- league table progression (computed once) -------------------------------

interface LeagueState {
  gw: number;
  // per manager: gw points, cumulative totals[1..gw], and league rank at each gw
  gwPoints: Map<number, number[]>;    // entry → points indexed by gw (1-based, [0] unused)
  cumulative: Map<number, number[]>;  // entry → cumulative total indexed by gw
  rankAt: Map<number, number[]>;      // entry → league rank indexed by gw
}

function buildLeague(): LeagueState {
  const key = 'league';
  if (memo.has(key)) return memo.get(key) as LeagueState;
  const gw = demoGw();
  const gwPoints = new Map<number, number[]>();
  const cumulative = new Map<number, number[]>();
  const rankAt = new Map<number, number[]>();

  for (const m of ROSTER) {
    const pts = [0];
    const cum = [0];
    for (let g = 1; g <= gw; g++) {
      const p = managerGwPoints(m.entry, g);
      pts.push(p);
      cum.push(cum[g - 1] + p);
    }
    gwPoints.set(m.entry, pts);
    cumulative.set(m.entry, cum);
    rankAt.set(m.entry, new Array(gw + 1).fill(0));
  }
  // rank managers each GW by cumulative total
  for (let g = 1; g <= gw; g++) {
    const order = [...ROSTER].sort((a, b) => cumulative.get(b.entry)![g] - cumulative.get(a.entry)![g]);
    order.forEach((m, idx) => { rankAt.get(m.entry)![g] = idx + 1; });
  }
  const state: LeagueState = { gw, gwPoints, cumulative, rankAt };
  memo.set(key, state);
  return state;
}

/** Plausible global overall rank from a season total (monotone, chart-friendly). */
function overallRankFromTotal(total: number): number {
  return Math.max(1, Math.round(9_000_000 * Math.exp(-total / 380)));
}

// ---- synthesized endpoint payloads ------------------------------------------

function synthStandings(leagueId: number, page: number): any {
  const st = buildLeague();
  const gw = st.gw;
  const results = ROSTER.map((m) => {
    const rank = st.rankAt.get(m.entry)![gw];
    const lastRank = st.rankAt.get(m.entry)![gw - 1] || rank;
    return {
      id: m.entry,
      event_total: st.gwPoints.get(m.entry)![gw],
      player_name: `${m.first} ${m.last}`,
      rank,
      last_rank: lastRank,
      rank_sort: rank,
      total: st.cumulative.get(m.entry)![gw],
      entry: m.entry,
      entry_name: m.team,
    };
  }).sort((a, b) => a.rank - b.rank);

  return {
    league: {
      id: leagueId,
      name: leagueId === DEMO_LEAGUE_ID ? 'Best Man League' : `Demo League ${leagueId}`,
      created: '2025-08-01T00:00:00Z',
      closed: false,
      max_entries: 0,
      league_type: 'x',
      scoring: 'c',
      admin_entry: DEMO_TEAM_ID,
      start_event: 1,
    },
    standings: { has_next: false, page, results },
  };
}

function synthHistory(entry: number): any {
  const st = buildLeague();
  const gw = st.gw;
  const cum = st.cumulative.get(entry) || [0];
  const pts = st.gwPoints.get(entry) || [0];
  const rankArr = st.rankAt.get(entry) || [];
  const current = [];
  for (let g = 1; g <= gw; g++) {
    current.push({
      event: g,
      points: pts[g] ?? 0,
      total_points: cum[g] ?? 0,
      rank: rankArr[g] ?? 0,
      rank_sort: rankArr[g] ?? 0,
      overall_rank: overallRankFromTotal(cum[g] ?? 0),
      bank: 5,
      value: 1000,
      event_transfers: g === 1 ? 0 : 1,
      event_transfers_cost: 0,
      points_on_bench: 4,
    });
  }
  return { current, past: [], chips: [] };
}

function synthEntry(entry: number): any {
  const st = buildLeague();
  const gw = st.gw;
  const m = ROSTER_BY_ID.get(entry);
  const total = st.cumulative.get(entry)?.[gw] ?? 0;
  const name = m?.team ?? `Team ${entry}`;
  const first = m?.first ?? 'FPL';
  const last = m?.last ?? 'Manager';
  return {
    id: entry,
    joined_time: '2025-08-01T00:00:00Z',
    started_event: 1,
    player_first_name: first,
    player_last_name: last,
    player_region_name: 'Malaysia',
    player_region_iso_code_short: 'MY',
    player_region_iso_code_long: 'MYS',
    summary_overall_points: total,
    summary_overall_rank: overallRankFromTotal(total),
    name,
    kit: 'home',
    last_deadline_bank: 5,
    last_deadline_value: 1000,
    last_deadline_total_transfers: gw - 1,
    favourite_team: null,
    leagues: {
      classic: [{
        id: DEMO_LEAGUE_ID, name: 'Best Man League', short_name: null, created: '2025-08-01T00:00:00Z',
        closed: false, rank: st.rankAt.get(entry)?.[gw] ?? null, max_entries: null, league_type: 'x',
        scoring: 'c', admin_entry: DEMO_TEAM_ID, start_event: 1,
        entry_rank: st.rankAt.get(entry)?.[gw] ?? null, entry_last_rank: st.rankAt.get(entry)?.[gw - 1] ?? null,
      }],
      h2h: [], cup: { matches: [], status: {}, cup_league: null }, cup_matches: [],
    },
  };
}

function synthPicks(entry: number, gw: number): any {
  const st = buildLeague();
  const pts = st.gwPoints.get(entry)?.[gw] ?? managerGwPoints(entry, gw);
  const cum = st.cumulative.get(entry)?.[Math.min(gw, st.gw)] ?? 0;
  return {
    active_chip: null,
    automatic_subs: [],
    entry_history: {
      event: gw,
      points: pts,
      total_points: cum,
      rank: st.rankAt.get(entry)?.[Math.min(gw, st.gw)] ?? 0,
      rank_sort: st.rankAt.get(entry)?.[Math.min(gw, st.gw)] ?? 0,
      overall_rank: overallRankFromTotal(cum),
      bank: 5,
      value: 1000,
      event_transfers: gw === 1 ? 0 : 1,
      event_transfers_cost: 0,
      points_on_bench: 4,
    },
    picks: squadFor(entry),
  };
}

// ---- dispatch ---------------------------------------------------------------

/**
 * Resolve a demo response for an FPL API URL, or `undefined` to fall through to
 * the network. Called from `fetchWithCache` when `isDemoMode()`.
 */
export function resolveDemo(url: string): unknown | undefined {
  let pathname: string;
  let params: URLSearchParams;
  try {
    const u = new URL(url);
    pathname = u.pathname.replace(/\/api(?=\/)/, ''); // drop the /api prefix
    params = u.searchParams;
  } catch {
    return undefined;
  }

  if (pathname.startsWith('/bootstrap-static')) return loadBootstrap();
  if (pathname.startsWith('/fixtures')) return loadFixtures();

  let m: RegExpMatchArray | null;
  if ((m = pathname.match(/^\/event\/(\d+)\/live/))) return loadLiveRaw(parseInt(m[1], 10));
  if ((m = pathname.match(/^\/leagues-classic\/(\d+)\/standings/))) {
    return synthStandings(parseInt(m[1], 10), parseInt(params.get('page_standings') || '1', 10));
  }
  if ((m = pathname.match(/^\/entry\/(\d+)\/history/))) return synthHistory(parseInt(m[1], 10));
  if ((m = pathname.match(/^\/entry\/(\d+)\/event\/(\d+)\/picks/))) return synthPicks(parseInt(m[1], 10), parseInt(m[2], 10));
  if ((m = pathname.match(/^\/entry\/(\d+)\/transfers/))) return [];
  if ((m = pathname.match(/^\/entry\/(\d+)\/?$/))) return synthEntry(parseInt(m[1], 10));
  if ((m = pathname.match(/^\/element-summary\/(\d+)/))) return { fixtures: [], history: [], history_past: [] };

  return undefined;
}
