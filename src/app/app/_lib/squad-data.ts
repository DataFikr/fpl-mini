import { FPLApiService } from '@/services/fpl-api';
import { getKitShirtUrl } from '@/lib/fpl-images';
import { buildPrediction, type PredictionData } from './prediction';
import { computeVerdict, type SquadVerdict } from './rmt-analyze';

export interface PitchPlayer {
  id: number;
  code: number;         // element code (for the official player photo)
  name: string;
  team: string;         // full club name
  pos: number;          // element_type: 1 GK, 2 DEF, 3 MID, 4 FWD
  teamCode: number;
  teamShort: string;
  shirt: string | null; // official FPL kit image
  points: number;       // live GW points for this element (raw, pre-multiplier)
  multiplier: number;
  isCaptain: boolean;
  isVice: boolean;
  // season stats for the player card
  price: number;        // £m
  totalPoints: number;
  ppg: number;
  form: number;
  ownership: number;    // selected-by %
}

export interface SquadData {
  team: { id: number; name: string; manager: string; gw: number; gwPoints: number; totalPoints: number; overallRank: number };
  currentGameweek: number;
  starters: { gk: PitchPlayer[]; def: PitchPlayer[]; mid: PitchPlayer[]; fwd: PitchPlayer[] };
  bench: PitchPlayer[];
  activeChip: string | null;
  prediction: PredictionData;
  verdict: SquadVerdict;
}

const POS_KEY: Record<number, 'gk' | 'def' | 'mid' | 'fwd'> = { 1: 'gk', 2: 'def', 3: 'mid', 4: 'fwd' };

export async function getSquadData(teamId: number, gw?: number): Promise<SquadData> {
  const fpl = new FPLApiService();
  const currentGameweek = await fpl.getCurrentGameweek().catch(() => 1);
  const targetGw = gw && gw >= 1 && gw <= currentGameweek ? gw : currentGameweek;

  const [picks, bootstrap, live, entry, fixtures] = await Promise.all([
    fpl.getManagerPicks(teamId, targetGw),
    fpl.getBootstrapData(),
    fpl.getLiveGameweekData(targetGw).catch(() => ({ elements: [] as any[] })),
    fpl.getManagerEntry(teamId).catch(() => null as any),
    fpl.getFixtures().catch(() => [] as any[]),
  ]);

  // Lookups from bootstrap (cast for fields absent from the local TS types).
  const elementById = new Map<number, any>();
  for (const el of bootstrap.elements as any[]) elementById.set(el.id, el);
  const teamById = new Map<number, any>();
  for (const t of bootstrap.teams as any[]) teamById.set(t.id, t);
  const livePoints = new Map<number, number>();
  for (const el of (live.elements || []) as any[]) livePoints.set(el.id, el.stats?.total_points ?? 0);

  const toPlayer = (pick: any): PitchPlayer => {
    const el = elementById.get(pick.element) || {};
    const team = teamById.get(el.team) || {};
    const pos = el.element_type ?? 4;
    return {
      id: pick.element,
      code: el.code ?? 0,
      name: el.web_name ?? 'Unknown',
      team: team.name ?? '',
      pos,
      teamCode: team.code ?? 0,
      teamShort: team.short_name ?? '',
      shirt: getKitShirtUrl(team.code, pos === 1),
      points: livePoints.get(pick.element) ?? 0,
      multiplier: pick.multiplier ?? 1,
      isCaptain: !!pick.is_captain,
      isVice: !!pick.is_vice_captain,
      price: (el.now_cost ?? 0) / 10,
      totalPoints: el.total_points ?? 0,
      ppg: parseFloat(el.points_per_game) || 0,
      form: parseFloat(el.form) || 0,
      ownership: parseFloat(el.selected_by_percent) || 0,
    };
  };

  const allPicks = (picks.picks || []).slice().sort((a: any, b: any) => a.position - b.position);
  const startersRaw = allPicks.filter((p: any) => p.position <= 11).map(toPlayer);
  const bench = allPicks.filter((p: any) => p.position >= 12).map(toPlayer);

  const starters = { gk: [] as PitchPlayer[], def: [] as PitchPlayer[], mid: [] as PitchPlayer[], fwd: [] as PitchPlayer[] };
  for (const p of startersRaw) starters[POS_KEY[p.pos] ?? 'fwd'].push(p);

  const eh = picks.entry_history || ({} as any);
  const managerName = entry ? (entry.name ? `${entry.player_first_name ?? ''} ${entry.player_last_name ?? ''}`.trim() : '') : '';

  // Token-free "Rank My Team" verdict from the resolved starting XI (full-season data).
  const prediction = buildPrediction({ picks, bootstrap, fixtures, entry, currentGameweek });
  const starterEls = allPicks.filter((p: any) => p.position <= 11).map((p: any) => elementById.get(p.element)).filter(Boolean);
  const verdict = computeVerdict(starterEls, prediction);

  return {
    team: {
      id: teamId,
      name: entry?.name || `Team ${teamId}`,
      manager: managerName,
      gw: targetGw,
      gwPoints: eh.points ?? 0,
      totalPoints: eh.total_points ?? entry?.summary_overall_points ?? 0,
      overallRank: eh.overall_rank ?? entry?.summary_overall_rank ?? 0,
    },
    currentGameweek,
    starters,
    bench,
    activeChip: picks.active_chip ?? null,
    prediction,
    verdict,
  };
}
