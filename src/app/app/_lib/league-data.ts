import { FPLApiService } from '@/services/fpl-api';

const CREST_PALETTE = ['#FF5050', '#12233F', '#009C54', '#322D2D', '#CC4040', '#001B58', '#5B5757', '#6CABDD'];
const MAX_MANAGERS = 30; // cap per-manager history fetches for big leagues

export interface AppManager {
  id: number;
  team: string;
  mgr: string;
  init: string;
  crestBg: string;
  crestFg: string;
  gwPts: number[];      // points scored each GW (index 0 = GW1)
  totalPts: number[];   // cumulative net total after each GW
  overallRank: number[]; // FPL overall rank after each GW
}

export interface LeagueAppData {
  league: { id: number; name: string; type: string; size: number };
  currentGameweek: number;
  focusTeamId: number | null;
  managers: AppManager[];
  partial: boolean; // true when the league was larger than MAX_MANAGERS
}

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

export async function getLeagueAppData(
  leagueId: number,
  focusTeamId?: number
): Promise<LeagueAppData> {
  const fpl = new FPLApiService();
  const [standings, currentGameweek] = await Promise.all([
    fpl.getLeagueStandings(leagueId),
    fpl.getCurrentGameweek().catch(() => 1),
  ]);

  const results = standings.standings.results || [];
  const partial = results.length > MAX_MANAGERS;
  const slice = results.slice(0, MAX_MANAGERS);

  // Fetch each manager's gameweek history in parallel (cached server-side).
  const histories = await Promise.allSettled(
    slice.map((r) => withTimeout(fpl.getManagerHistory(r.entry), 7000))
  );

  const managers: AppManager[] = slice.map((r, i) => {
    const h = histories[i];
    const current = h.status === 'fulfilled' ? (h.value as any).current || [] : [];
    return {
      id: r.entry,
      team: r.entry_name,
      mgr: r.player_name,
      init: initialsOf(r.entry_name),
      crestBg: CREST_PALETTE[i % CREST_PALETTE.length],
      crestFg: CREST_PALETTE[i % CREST_PALETTE.length] === '#6CABDD' ? '#0a2240' : '#fff',
      gwPts: current.map((c: any) => c.points ?? 0),
      totalPts: current.map((c: any) => c.total_points ?? 0),
      overallRank: current.map((c: any) => c.overall_rank ?? 0),
      // Fallback when history failed: synthesize a flat line from league totals.
      ...(current.length === 0
        ? { gwPts: [r.event_total || 0], totalPts: [r.total || 0], overallRank: [r.rank_sort || r.rank || 0] }
        : {}),
    };
  });

  return {
    league: {
      id: leagueId,
      name: standings.league.name,
      type: 'Classic', // loaded via the classic-standings endpoint
      size: results.length,
    },
    currentGameweek,
    focusTeamId: focusTeamId ?? (results[0]?.entry ?? null),
    managers,
    partial,
  };
}
