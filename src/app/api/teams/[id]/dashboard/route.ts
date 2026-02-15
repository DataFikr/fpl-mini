import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fplApi = new FPLApiService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Fetch all data in parallel
    const [managerEntry, managerHistory, bootstrap, transfers] = await Promise.all([
      fplApi.getManagerEntry(teamId),
      fplApi.getManagerHistory(teamId),
      fplApi.getBootstrapData(),
      fplApi.getManagerTransfers(teamId),
    ]);

    const currentGameweek = bootstrap.events.find((e: any) => e.is_current)?.id || 1;
    const currentEvent = bootstrap.events.find((e: any) => e.id === currentGameweek);
    const averageScore = currentEvent?.average_entry_score || 0;

    // Fetch picks and live data for current GW
    let picks = null;
    let liveData = null;
    try {
      [picks, liveData] = await Promise.all([
        fplApi.getManagerPicks(teamId, currentGameweek),
        fplApi.getLiveGameweekData(currentGameweek),
      ]);
    } catch (e) {
      console.warn('Failed to fetch picks/live data:', e);
    }

    // Current GW history
    const currentGWHistory = managerHistory.current?.find(
      (gw: any) => gw.event === currentGameweek
    );
    const prevGWHistory = managerHistory.current?.find(
      (gw: any) => gw.event === currentGameweek - 1
    );

    // Process picks into squad data
    let squad = null;
    let captainData = null;
    if (picks && bootstrap) {
      const positionMap: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
      const starting: Record<string, any[]> = { GKP: [], DEF: [], MID: [], FWD: [] };
      const subs: any[] = [];
      let captain = null;
      let viceCaptain = null;

      for (const pick of picks.picks || []) {
        const player = bootstrap.elements.find((el: any) => el.id === pick.element);
        if (!player) continue;

        const team = bootstrap.teams.find((t: any) => t.id === player.team);
        const position = positionMap[player.element_type] || 'MID';

        // Get live stats
        let points = 0;
        let liveStats: any = null;
        if (liveData) {
          const liveEl = liveData.elements?.find((el: any) => el.id === pick.element);
          if (liveEl?.stats) {
            liveStats = liveEl.stats;
            points = liveEl.stats.total_points ?? calculatePoints(liveEl.stats, player.element_type);
          }
        }

        const playerData = {
          id: player.id,
          name: player.web_name,
          team: team?.short_name || 'UNK',
          teamCode: team?.code || 1,
          points,
          isCaptain: pick.is_captain,
          isViceCaptain: pick.is_vice_captain,
          multiplier: pick.multiplier,
          status: player.status,
          minutes: liveStats?.minutes || 0,
          ownership: parseFloat(player.selected_by_percent || '0'),
          xG: liveStats?.expected_goals || '0',
          xA: liveStats?.expected_assists || '0',
          bonus: liveStats?.bonus || 0,
          bps: liveStats?.bps || 0,
          goals: liveStats?.goals_scored || 0,
          assists: liveStats?.assists || 0,
          cleanSheet: liveStats?.clean_sheets || 0,
          saves: liveStats?.saves || 0,
          yellowCards: liveStats?.yellow_cards || 0,
          redCards: liveStats?.red_cards || 0,
        };

        if (pick.is_captain) captain = playerData;
        if (pick.is_vice_captain) viceCaptain = playerData;

        if (pick.position <= 11) {
          starting[position].push(playerData);
        } else {
          subs.push({ ...playerData, position });
        }
      }

      // Calculate total starting points
      const totalPoints = Object.values(starting)
        .flat()
        .reduce((sum, p) => sum + p.points * p.multiplier, 0);

      squad = {
        starting,
        subs,
        captain,
        viceCaptain,
        totalPoints,
        activeChip: picks.active_chip,
        entryHistory: picks.entry_history,
      };

      captainData = captain;
    }

    // Process transfers for current GW
    const gwTransfers = (transfers || []).filter(
      (t: any) => t.event === currentGameweek
    );
    const processedTransfers = gwTransfers.map((t: any) => {
      const playerIn = bootstrap.elements.find((el: any) => el.id === t.element_in);
      const playerOut = bootstrap.elements.find((el: any) => el.id === t.element_out);
      const teamIn = playerIn ? bootstrap.teams.find((tm: any) => tm.id === playerIn.team) : null;
      const teamOut = playerOut ? bootstrap.teams.find((tm: any) => tm.id === playerOut.team) : null;

      // Get live points for transferred players
      let pointsIn = 0;
      let pointsOut = 0;
      if (liveData) {
        const liveIn = liveData.elements?.find((el: any) => el.id === t.element_in);
        const liveOut = liveData.elements?.find((el: any) => el.id === t.element_out);
        pointsIn = liveIn?.stats?.total_points ?? 0;
        pointsOut = liveOut?.stats?.total_points ?? 0;
      }

      return {
        playerIn: {
          id: t.element_in,
          name: playerIn?.web_name || 'Unknown',
          team: teamIn?.short_name || 'UNK',
          teamCode: teamIn?.code || 1,
          points: pointsIn,
          cost: t.element_in_cost / 10,
        },
        playerOut: {
          id: t.element_out,
          name: playerOut?.web_name || 'Unknown',
          team: teamOut?.short_name || 'UNK',
          teamCode: teamOut?.code || 1,
          points: pointsOut,
          cost: t.element_out_cost / 10,
        },
        time: t.time,
      };
    });

    // Get league data for rank context
    const leagues = managerEntry?.leagues?.classic
      ?.filter((l: any) => l && l.id > 1000)
      ?.map((l: any) => ({
        id: l.id,
        name: l.name,
        rank: l.entry_rank || 1,
        lastRank: l.entry_last_rank || l.entry_rank || 1,
      })) || [];

    // Find most captained player this GW from bootstrap
    const mostCaptainedId = bootstrap.elements
      .sort((a: any, b: any) => parseFloat(b.ep_next || '0') - parseFloat(a.ep_next || '0'))[0];

    // Get differentials (players owned < 10%)
    const differentials = squad
      ? [...Object.values(squad.starting).flat(), ...squad.subs]
          .filter((p: any) => p.ownership < 10 && p.points > 0)
          .sort((a: any, b: any) => b.points - a.points)
      : [];

    // Build response
    return NextResponse.json({
      teamId,
      teamName: managerEntry.name || `Team ${teamId}`,
      managerName: `${managerEntry.player_first_name || ''} ${managerEntry.player_last_name || ''}`.trim(),
      favouriteTeam: managerEntry.favourite_team,
      region: managerEntry.player_region_name,
      currentGameweek,
      averageScore,

      // Header data
      header: {
        gwPoints: picks?.entry_history?.points || currentGWHistory?.points || managerEntry.summary_event_points || 0,
        totalPoints: picks?.entry_history?.total_points || currentGWHistory?.total_points || managerEntry.summary_overall_points || 0,
        overallRank: picks?.entry_history?.overall_rank || currentGWHistory?.overall_rank || managerEntry.summary_overall_rank || 0,
        prevOverallRank: prevGWHistory?.overall_rank || 0,
        gwRank: picks?.entry_history?.rank || currentGWHistory?.rank || 0,
        captainPoints: captainData ? captainData.points * (captainData.multiplier || 2) : 0,
        captainName: captainData?.name || 'Unknown',
        averageScore,
        pointsAboveAvg: (picks?.entry_history?.points || currentGWHistory?.points || 0) - averageScore,
        transfersCost: picks?.entry_history?.event_transfers_cost || currentGWHistory?.event_transfers_cost || 0,
        transfersCount: picks?.entry_history?.event_transfers || currentGWHistory?.event_transfers || 0,
        benchPoints: picks?.entry_history?.points_on_bench || currentGWHistory?.points_on_bench || 0,
        leagues,
      },

      // Squad/Pitch data
      squad,

      // Transfer data
      transfers: {
        count: gwTransfers.length,
        cost: picks?.entry_history?.event_transfers_cost || currentGWHistory?.event_transfers_cost || 0,
        details: processedTransfers,
        totalPointsIn: processedTransfers.reduce((s: number, t: any) => s + t.playerIn.points, 0),
        totalPointsOut: processedTransfers.reduce((s: number, t: any) => s + t.playerOut.points, 0),
      },

      // Analysis data
      analysis: {
        captainName: captainData?.name || 'Unknown',
        captainPoints: captainData ? captainData.points * (captainData.multiplier || 2) : 0,
        captainBasePoints: captainData?.points || 0,
        benchPoints: picks?.entry_history?.points_on_bench || currentGWHistory?.points_on_bench || 0,
        differentials,
        activeChip: picks?.active_chip || null,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function calculatePoints(stats: any, elementType: number): number {
  if (!stats || stats.minutes === 0) return 0;
  let points = 0;
  const minutes = stats.minutes || 0;
  if (minutes > 0) points += minutes >= 60 ? 2 : 1;
  const goals = stats.goals_scored || 0;
  if (elementType === 4) points += goals * 4;
  else if (elementType === 3) points += goals * 5;
  else points += goals * 6;
  points += (stats.assists || 0) * 3;
  if (elementType <= 2) points += (stats.clean_sheets || 0) * 4;
  else if (elementType === 3) points += (stats.clean_sheets || 0) * 1;
  points += Math.floor((stats.saves || 0) / 3);
  points += (stats.bonus || 0);
  points += (stats.penalties_saved || 0) * 5;
  points -= (stats.penalties_missed || 0) * 2;
  points -= (stats.yellow_cards || 0) * 1;
  points -= (stats.red_cards || 0) * 3;
  points -= (stats.own_goals || 0) * 2;
  if (elementType <= 2) points -= Math.floor((stats.goals_conceded || 0) / 2);
  return Math.max(0, points);
}
