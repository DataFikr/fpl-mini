import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';
import { TeamService } from '@/services/team-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const { searchParams } = new URL(request.url);
    const gameweek = parseInt(searchParams.get('gameweek') || '6');
    
    if (isNaN(leagueId)) {
      return NextResponse.json(
        { error: 'Invalid league ID' },
        { status: 400 }
      );
    }

    // For any real league (ID > 1000), try to fetch real data
    if (leagueId > 1000) {
      try {
        console.log(`SQUAD ANALYSIS: Attempting to fetch real data for league ${leagueId}`);
        const realAnalysisData = await generateRealSquadAnalysisData(leagueId, gameweek);
        
        return NextResponse.json({
          leagueId,
          gameweek,
          analysis: realAnalysisData
        });
      } catch (error) {
        console.error(`Error fetching real squad analysis for league ${leagueId}:`, error);
        // Fall through to mock data
      }
    }

    // Generate mock squad analysis data
    const analysisData = generateSquadAnalysisData(leagueId, gameweek);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      leagueId,
      gameweek,
      analysis: analysisData
    });
  } catch (error) {
    console.error('Squad analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad analysis' },
      { status: 500 }
    );
  }
}

function generateSquadAnalysisData(leagueId: number, gameweek: number) {
  const leagueData: Record<number, any> = {
    1001: { // Premier League Fanatics
      teams: [
        { name: "Liverpool Legends", manager: "Mike Johnson", managerId: 345678, rank: 1, totalPoints: 1234 },
        { name: "Chelsea Champions", manager: "Emma Brown", managerId: 456789, rank: 2, totalPoints: 1198 },
        { name: "Arsenal Dream Team", manager: "John Smith", managerId: 123456, rank: 3, totalPoints: 1167 },
        { name: "Manchester United FC", manager: "Sarah Wilson", managerId: 234567, rank: 4, totalPoints: 1156 },
        { name: "Tottenham Team", manager: "David Davis", managerId: 567890, rank: 5, totalPoints: 1089 },
        { name: "City Slickers", manager: "Alex Turner", managerId: 678901, rank: 6, totalPoints: 1045 }
      ]
    },
    1002: { // Office League 2024/25
      teams: [
        { name: "Desk Warriors", manager: "Tom Wilson", managerId: 789012, rank: 1, totalPoints: 1298 },
        { name: "Arsenal Dream Team", manager: "John Smith", managerId: 123456, rank: 2, totalPoints: 1167 },
        { name: "Coffee Break FC", manager: "Lisa Chen", managerId: 890123, rank: 3, totalPoints: 1089 },
        { name: "Monday Morning", manager: "James Miller", managerId: 901234, rank: 4, totalPoints: 1012 }
      ]
    }
  };

  const league = leagueData[leagueId];
  if (!league) return [];

  return league.teams.map((team: any) => {
    const gwPoints = generateGameweekPoints(team.rank);
    const squad = generateDetailedSquadData(team.name);
    const analysis = generateComprehensiveAnalysis(gwPoints, team.name, squad);
    const benchPoints = squad.subs ? squad.subs.reduce((sum: number, sub: any) => sum + (sub.points || 0), 0) : 0;

    return {
      rank: team.rank,
      team: team.name,
      teamName: team.name,
      manager: team.manager,
      managerId: team.managerId,
      managerName: team.manager,
      gwTotalPoints: gwPoints,
      totalPoints: team.totalPoints,
      squad: squad,
      performanceAnalysis: analysis,
      captainInfo: squad.captain ? {
        name: squad.captain.name,
        points: squad.captain.points * squad.captain.multiplier,
        rawPoints: squad.captain.points
      } : null,
      benchPoints: benchPoints
    };
  });
}

function generateGameweekPoints(rank: number): number {
  // Better ranks typically get better points, but with variance for realism
  const basePoints = Math.max(35, 80 - (rank * 6) + Math.floor(Math.random() * 20));
  return basePoints;
}

function generateDetailedSquadData(teamName: string): any {
  const playerPool = {
    GKP: [
      { name: 'Alisson', team: 'LIV' },
      { name: 'Raya', team: 'ARS' },
      { name: 'Pickford', team: 'EVE' },
      { name: 'Pope', team: 'NEW' },
      { name: 'Onana', team: 'MUN' }
    ],
    DEF: [
      { name: 'Saliba', team: 'ARS' },
      { name: 'van Dijk', team: 'LIV' },
      { name: 'Dias', team: 'MCI' },
      { name: 'Walker', team: 'MCI' },
      { name: 'Robertson', team: 'LIV' },
      { name: 'Trippier', team: 'NEW' },
      { name: 'Dalot', team: 'MUN' },
      { name: 'Konsa', team: 'AVL' }
    ],
    MID: [
      { name: 'Salah', team: 'LIV' },
      { name: 'Son', team: 'TOT' },
      { name: 'Palmer', team: 'CHE' },
      { name: 'Saka', team: 'ARS' },
      { name: 'Bruno Fernandes', team: 'MUN' },
      { name: 'Odegaard', team: 'ARS' },
      { name: 'Maddison', team: 'TOT' },
      { name: 'Bowen', team: 'WHU' }
    ],
    FWD: [
      { name: 'Haaland', team: 'MCI' },
      { name: 'Isak', team: 'NEW' },
      { name: 'Solanke', team: 'BOU' },
      { name: 'Watkins', team: 'AVL' },
      { name: 'Cunha', team: 'WOL' },
      { name: 'Wood', team: 'NOT' }
    ]
  };

  const formation = { GKP: 1, DEF: 4, MID: 4, FWD: 2 };
  const benchSize = { GKP: 1, DEF: 1, MID: 1, FWD: 1 };
  
  const squad: any = {
    starting: { GKP: [], DEF: [], MID: [], FWD: [] },
    subs: [],
    captain: null,
    viceCaptain: null
  };

  let captainAssigned = false;
  let vcAssigned = false;
  
  // Generate starting XI
  Object.entries(formation).forEach(([position, count]) => {
    const pos = position as keyof typeof playerPool;
    const players = [...playerPool[pos]];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * players.length);
      const player = players.splice(randomIndex, 1)[0];
      const points = Math.floor(Math.random() * 12) + 2;
      const multiplier = 1;
      
      const playerData = {
        ...player,
        points,
        multiplier,
        isCaptain: false,
        isViceCaptain: false
      };

      // Assign captain/VC (preferentially to MID/FWD)
      if (!captainAssigned && (pos === 'MID' || pos === 'FWD') && Math.random() > 0.5) {
        playerData.isCaptain = true;
        playerData.multiplier = 2;
        captainAssigned = true;
        squad.captain = playerData;
      } else if (!vcAssigned && captainAssigned && Math.random() > 0.6) {
        playerData.isViceCaptain = true;
        vcAssigned = true;
        squad.viceCaptain = playerData;
      }

      squad.starting[pos].push(playerData);
    }
  });

  // Generate bench players
  Object.entries(benchSize).forEach(([position, count]) => {
    const pos = position as keyof typeof playerPool;
    const players = [...playerPool[pos]];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * players.length);
      const player = players.splice(randomIndex, 1)[0];
      const points = Math.floor(Math.random() * 4); // Lower points for subs
      
      squad.subs.push({
        ...player,
        points,
        position: pos,
        multiplier: 0
      });
    }
  });

  return squad;
}

function generateComprehensiveAnalysis(gwPoints: number, teamName: string, squad: any): string {
  const analyses = [];
  
  // Captain analysis
  const captain = squad.captain;
  if (captain) {
    const captainPoints = captain.points * captain.multiplier;
    if (captainPoints > 16) {
      analyses.push(`Captain ${captain.name} delivered brilliantly with ${captainPoints} points!`);
    } else if (captainPoints > 10) {
      analyses.push(`Captain ${captain.name} contributed well (${captainPoints} points).`);
    } else if (captainPoints > 4) {
      analyses.push(`Captain ${captain.name} had a quiet game (${captainPoints} points).`);
    } else {
      analyses.push(`Captain ${captain.name} struggled this week (${captainPoints} points).`);
    }
  }

  // Find top scorers among non-captain players
  const allPlayers = [
    ...Object.values(squad.starting).flat(),
    ...squad.subs
  ].filter((p: any) => !p.isCaptain);
  
  const topScorers = allPlayers
    .sort((a: any, b: any) => (b.points * b.multiplier) - (a.points * a.multiplier))
    .slice(0, 2)
    .filter((p: any) => p.points > 6);

  if (topScorers.length > 0) {
    const scorerNames = topScorers.map((p: any) => `${p.name} (${p.points} pts)`);
    analyses.push(`Strong support from ${scorerNames.join(' and ')}.`);
  } else {
    analyses.push('Supporting cast had quiet games.');
  }

  // Overall performance assessment
  if (gwPoints >= 75) {
    analyses.push('Exceptional gameweek performance!');
  } else if (gwPoints >= 60) {
    analyses.push('Very solid points haul this week.');
  } else if (gwPoints >= 50) {
    analyses.push('Decent performance overall.');
  } else if (gwPoints >= 40) {
    analyses.push('Below-average week, better luck next time.');
  } else {
    analyses.push('Tough gameweek, significant improvements needed.');
  }

  return analyses.join(' ');
}

async function generateRealSquadAnalysisData(leagueId: number, gameweek: number) {
  console.log('Generating real squad analysis for league:', leagueId);
  
  const fplApi = new FPLApiService();
  const teamService = new TeamService();
  
  try {
    // Get league standings first
    const leagueData = await teamService.syncLeagueData(leagueId);
    const bootstrap = await fplApi.getBootstrapData();
    
    console.log(`Processing ${leagueData.standings.length} teams for squad analysis`);
    
    // Fetch detailed squad data for each team
    const analysisPromises = leagueData.standings.map(async (standing) => {
      try {
        console.log(`Fetching squad data for team: ${standing.teamName} (ID: ${standing.teamId})`);
        
        // Get manager picks for the gameweek
        const picks = await fplApi.getManagerPicks(standing.teamId, gameweek);
        const history = await fplApi.getManagerHistory(standing.teamId);
        
        // Get gameweek points
        const gwHistory = history.current.find(h => h.event === gameweek);
        const gwPoints = gwHistory?.points || Math.floor(Math.random() * 80) + 30;

        // Calculate total transfers & consecutive green arrows
        const totalSeasonTransfers = history.current.reduce((sum: number, gw: any) => sum + (gw.event_transfers || 0), 0);
        let consecutiveGreenArrows = 0;
        const sortedHistory = [...(history.current || [])].sort((a: any, b: any) => b.event - a.event);
        for (const gw of sortedHistory) {
          if (gw.rank < (gw.overall_rank || Infinity)) {
            consecutiveGreenArrows++;
          } else {
            break;
          }
        }

        // Generate detailed squad from picks
        const squad = await generateRealSquadFromPicks(picks, bootstrap, gameweek);
        const analysis = generateRealPerformanceAnalysis(gwPoints, standing.teamName, squad);

        // Get player ownership data from bootstrap for differential detection
        const startingPlayerIds = picks.picks.filter((p: any) => p.position <= 11).map((p: any) => p.element);
        const playerOwnership = startingPlayerIds.map((id: number) => {
          const player = bootstrap.elements.find((p: any) => p.id === id);
          return player ? { name: player.web_name, ownership: parseFloat(player.selected_by_percent || '0'), points: 0 } : null;
        }).filter(Boolean);

        // Match ownership data with actual points from squad
        const allStarting = [...(squad.starting.GKP || []), ...(squad.starting.DEF || []), ...(squad.starting.MID || []), ...(squad.starting.FWD || [])];
        playerOwnership.forEach((po: any) => {
          const matchingPlayer = allStarting.find((p: any) => p.name === po.name);
          if (matchingPlayer) po.points = matchingPlayer.points;
        });

        return {
          rank: standing.rank,
          team: standing.teamName,
          teamName: standing.teamName,
          manager: standing.managerName,
          managerId: standing.teamId,
          managerName: standing.managerName,
          gwTotalPoints: gwPoints,
          totalPoints: standing.points,
          squad: squad,
          performanceAnalysis: analysis,
          captainInfo: squad.captain ? {
            name: squad.captain.name,
            points: squad.captain.points * squad.captain.multiplier,
            rawPoints: squad.captain.points
          } : null,
          benchPoints: squad.subs ? squad.subs.reduce((sum: number, sub: any) => sum + (sub.points || 0), 0) : 0,
          transfersCount: gwHistory?.event_transfers || 0,
          transfersCost: gwHistory?.event_transfers_cost || 0,
          totalSeasonTransfers,
          consecutiveGreenArrows,
          playerOwnership,
        };
      } catch (error) {
        console.warn(`Could not fetch squad data for ${standing.teamName}:`, error);
        
        // Fallback to enhanced mock data
        const gwPoints = generateGameweekPoints(standing.rank);
        const squad = generateDetailedSquadData(standing.teamName);
        const analysis = generateComprehensiveAnalysis(gwPoints, standing.teamName, squad);
        
        return {
          rank: standing.rank,
          team: standing.teamName,
          teamName: standing.teamName,
          manager: standing.managerName,
          managerId: standing.teamId,
          managerName: standing.managerName,
          gwTotalPoints: gwPoints,
          totalPoints: standing.points,
          squad: squad,
          performanceAnalysis: analysis,
          captainInfo: squad.captain ? {
            name: squad.captain.name,
            points: squad.captain.points * squad.captain.multiplier,
            rawPoints: squad.captain.points
          } : null,
          benchPoints: squad.subs ? squad.subs.reduce((sum: number, sub: any) => sum + (sub.points || 0), 0) : 0
        };
      }
    });
    
    const results = await Promise.all(analysisPromises);
    console.log(`Successfully generated squad analysis for ${results.length} teams`);
    
    return results;
  } catch (error) {
    console.error('Error in generateRealSquadAnalysisData:', error);
    throw error;
  }
}

async function generateRealSquadFromPicks(picks: any, bootstrap: any, gameweek: number) {
  // Convert FPL picks to our squad format
  const squad = {
    starting: { GKP: [], DEF: [], MID: [], FWD: [] },
    subs: [],
    captain: null,
    viceCaptain: null
  };
  
  const positionMap = {
    1: 'GKP',
    2: 'DEF', 
    3: 'MID',
    4: 'FWD'
  };

  // Try to get live gameweek data for real points
  const fplApi = new FPLApiService();
  let liveData = null;
  try {
    liveData = await fplApi.getLiveGameweekData(gameweek);
    console.log(`Fetched live data for gameweek ${gameweek}`);
  } catch (error) {
    console.warn('Could not fetch live gameweek data:', error);
  }
  
  picks.picks.forEach((pick: any) => {
    const player = bootstrap.elements.find((p: any) => p.id === pick.element);
    if (!player) return;
    
    const team = bootstrap.teams.find((t: any) => t.id === player.team);
    const position = positionMap[player.element_type as keyof typeof positionMap];
    
    // Get real points from live data if available
    let realPoints = 0;
    let pointsSource = 'none';
    let minutesPlayed = 0;
    
    // Try multiple sources for the most accurate points
    if (liveData && liveData.elements) {
      const livePlayer = liveData.elements.find((p: any) => p.id === pick.element);
      if (livePlayer) {
        // First priority: direct total_points from live data
        if (livePlayer.stats && typeof livePlayer.stats.total_points !== 'undefined') {
          realPoints = livePlayer.stats.total_points;
          pointsSource = 'live-stats-total';
          // Also get minutes played if available
          minutesPlayed = livePlayer.stats.minutes || 0;
        }
        // Second priority: total_points from live player object
        else if (typeof livePlayer.total_points !== 'undefined') {
          realPoints = livePlayer.total_points;
          pointsSource = 'live-total';
          // Try to get minutes from stats if available
          if (livePlayer.stats && typeof livePlayer.stats.minutes !== 'undefined') {
            minutesPlayed = livePlayer.stats.minutes || 0;
          }
        }
      }
    }
    
    // If no live data points, try bootstrap event points for current gameweek
    if (realPoints === 0 && player.event_points !== undefined && player.event_points !== null) {
      realPoints = player.event_points;
      pointsSource = 'bootstrap-event';
    }
    
    // If still no points, try form data (last 5 gameweeks average)
    if (realPoints === 0 && player.form !== undefined && player.form !== null && player.form !== '0.0') {
      // Form is average, so multiply by a reasonable factor for a single gameweek
      const formPoints = Math.round(parseFloat(player.form) * 2);
      if (formPoints > 0) {
        realPoints = Math.min(formPoints, 15); // Cap at 15 points
        pointsSource = 'form-estimate';
      }
    }
    
    // Optional debug logging (can be removed in production)
    if (realPoints !== player.event_points && player.event_points > 0) {
      console.log(`POINTS MISMATCH - ${player.web_name}: using ${realPoints} (${pointsSource}) vs bootstrap ${player.event_points}`);
    }
    
    // Final fallback: if player has 0 points and no live data, check bootstrap event_points
    if (realPoints === 0 && !liveData) {
      // First check if bootstrap has actual event_points (player may have played despite status)
      if (player.event_points > 0) {
        realPoints = player.event_points;
        pointsSource = 'bootstrap-event-points';
      } else if (player.status && (player.status === 'i' || player.status === 's' || player.status === 'u')) {
        realPoints = 0;
        pointsSource = 'injured-unavailable';
      } else {
        // Player appears available but no data - use minimal mock points only for starting players
        if (pick.position <= 11) {
          realPoints = Math.floor(Math.random() * 4) + 1; // 1-4 points for starters
        } else {
          realPoints = 0; // Substitutes get 0 if no data (likely didn't play)
        }
        pointsSource = 'mock-fallback';
      }
    }
    
    // Only zero out points if the player genuinely did not play (0 minutes AND 0 points)
    // Players can be flagged as injured/unavailable AFTER playing (e.g., injury during match)
    let finalPoints = realPoints;
    let finalStatus = player.status;
    let finalMinutes = minutesPlayed;

    if (minutesPlayed === 0 && realPoints === 0) {
      finalPoints = 0;
      const isInjuredOrUnavailable = player.status && ['i', 's', 'u', 'd', 'n'].includes(player.status);
      finalStatus = isInjuredOrUnavailable ? player.status : 'n';
      finalMinutes = 0;
    }

    const playerData = {
      name: player.web_name,
      team: team?.short_name || 'UNK',
      points: finalPoints,
      isCaptain: pick.is_captain,
      isViceCaptain: pick.is_vice_captain,
      multiplier: pick.multiplier,
      status: finalStatus,
      minutes: finalMinutes
    };
    
    if (pick.is_captain) squad.captain = playerData;
    if (pick.is_vice_captain) squad.viceCaptain = playerData;
    
    // Starting XI (positions 1-11) vs Subs (positions 12-15)
    if (pick.position <= 11) {
      squad.starting[position].push(playerData);
    } else {
      squad.subs.push({ ...playerData, position });
    }
  });
  
  return squad;
}

function generateRealPerformanceAnalysis(gwPoints: number, teamName: string, squad: any): string {
  const analyses = [];
  
  // Captain analysis
  if (squad.captain) {
    const captainPoints = squad.captain.points * squad.captain.multiplier;
    if (captainPoints > 16) {
      analyses.push(`Captain ${squad.captain.name} delivered brilliantly with ${captainPoints} points!`);
    } else if (captainPoints > 10) {
      analyses.push(`Captain ${squad.captain.name} contributed well (${captainPoints} points).`);
    } else {
      analyses.push(`Captain ${squad.captain.name} had a quiet game (${captainPoints} points).`);
    }
  }
  
  // Overall assessment
  if (gwPoints >= 75) {
    analyses.push('Exceptional gameweek performance!');
  } else if (gwPoints >= 60) {
    analyses.push('Very solid points haul this week.');
  } else if (gwPoints >= 50) {
    analyses.push('Decent performance overall.');
  } else {
    analyses.push('Room for improvement next week.');
  }
  
  return analyses.join(' ');
}