import { FPLApiService } from '@/services/fpl-api';

const CREST_PALETTE = ['#FF5050', '#12233F', '#009C54', '#322D2D', '#CC4040', '#001B58', '#5B5757', '#6CABDD'];

export interface ManagerLeague {
  id: number;
  name: string;
  code: string;       // 2-letter badge
  type: string;       // 'Mini-league' | 'Head-to-head' | 'Global'
  size: number;       // entries in the league
  rank: number;       // manager's rank in the league
  move: number;       // entry_last_rank - entry_rank (positive = climbed)
  isCustom: boolean;  // private league the manager joined
  bg: string;
}

export interface LeaguesData {
  manager: { teamId: number; team: string; name: string };
  leagues: ManagerLeague[];
}

function codeOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '–';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function getManagerLeaguesData(teamId: number): Promise<LeaguesData> {
  const fpl = new FPLApiService();
  const res = await fpl.getManagerLeagues(teamId);
  const classic: any[] = res?.leagues?.classic || [];
  const h2h: any[] = res?.leagues?.h2h || [];

  const fromClassic = classic.map((l) => ({
    raw: l,
    isCustom: l.league_type === 'x',
    type: l.league_type === 'x' ? 'Mini-league' : 'Global',
  }));
  const fromH2h = h2h.map((l) => ({ raw: l, isCustom: true, type: 'Head-to-head' }));

  const merged = [...fromClassic, ...fromH2h]
    // Private mini-leagues / H2H first, then global; smaller leagues first within a group.
    .sort((a, b) => {
      if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1;
      return (a.raw.rank_count || 0) - (b.raw.rank_count || 0);
    });

  const leagues: ManagerLeague[] = merged.map(({ raw, isCustom, type }, i) => ({
    id: raw.id,
    name: raw.name,
    code: codeOf(raw.name),
    type,
    size: raw.rank_count || 0,
    rank: raw.entry_rank || 0,
    move: (raw.entry_last_rank || raw.entry_rank || 0) - (raw.entry_rank || 0),
    isCustom,
    bg: CREST_PALETTE[i % CREST_PALETTE.length],
  }));

  return {
    manager: {
      teamId,
      team: res?.name || `Team ${teamId}`,
      name: res ? `${res.player_first_name ?? ''} ${res.player_last_name ?? ''}`.trim() : '',
    },
    leagues,
  };
}
