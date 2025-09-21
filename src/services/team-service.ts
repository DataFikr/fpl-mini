import { FPLApiService } from './fpl-api';
import { prisma } from '@/lib/prisma';
import {
  TeamData,
  LeagueData,
  GameweekData,
  FPLManagerEntry,
  FPLLeagueStandings,
  FPLGameweekHistory,
  PlayerSquadData
} from '@/types/fpl';

export class TeamService {
  private fplApi: FPLApiService;

  constructor() {
    this.fplApi = new FPLApiService();
  }

  async searchTeams(teamName: string): Promise<FPLManagerEntry[]> {
    return this.fplApi.findTeamByName(teamName);
  }

  async getOrCreateTeam(fplTeamId: number): Promise<TeamData> {
    let team = await prisma.team.findUnique({
      where: { fplId: fplTeamId }
    });

    if (!team) {
      const managerEntry = await this.fplApi.getManagerEntry(fplTeamId);
      
      team = await prisma.team.create({
        data: {
          fplId: fplTeamId,
          name: managerEntry.name,
          managerName: `${managerEntry.player_first_name} ${managerEntry.player_last_name}`.trim(),
        }
      });
    }

    return {
      id: team.id,
      name: team.name,
      managerName: team.managerName,
      crestUrl: team.crestUrl,
      lastUpdated: team.lastUpdated
    };
  }

  async getTeamLeagues(fplTeamId: number): Promise<LeagueData[]> {
    const team = await this.getOrCreateTeam(fplTeamId);
    
    try {
      // Fetch real leagues from FPL API for ANY player
      console.log('Fetching real leagues for manager:', fplTeamId);
      const managerData = await this.fplApi.getManagerLeagues(fplTeamId);
      
      const realLeagues: LeagueData[] = [];
      const currentGameweek = await this.fplApi.getCurrentGameweek();
      
      // Process classic leagues
      if (managerData.leagues && managerData.leagues.classic) {
        for (const classicLeague of managerData.leagues.classic) {
          try {
            // Only process mini-leagues (not global leagues like Overall, etc.)
            if (classicLeague.id > 1000) { // Skip global leagues with IDs < 1000
              console.log(`Fetching league data for: ${classicLeague.name} (ID: ${classicLeague.id})`);
              
              const leagueStandings = await this.fplApi.getLeagueStandings(classicLeague.id);
              
              // Build teams list from standings
              const teams = leagueStandings.standings.results.map((entry: any) => ({
                id: entry.entry,
                name: entry.entry_name,
                managerName: entry.player_name,
                crestUrl: null,
                lastUpdated: new Date()
              }));
              
              // Fetch additional team data for manager info
              const teamsWithManagerData = await Promise.all(
                leagueStandings.standings.results.map(async (entry) => {
                  try {
                    const teamData = await this.fplApi.getManagerEntry(entry.entry);
                    return {
                      entry: entry.entry,
                      managerData: teamData
                    };
                  } catch (error) {
                    console.warn(`Could not fetch manager data for team ${entry.entry}:`, error);
                    return {
                      entry: entry.entry,
                      managerData: null
                    };
                  }
                })
              );

              // Build standings with manager information
              const standings = leagueStandings.standings.results.map((entry: any) => {
                const teamManagerData = teamsWithManagerData.find(t => t.entry === entry.entry);
                const managerData = teamManagerData?.managerData;
                
                return {
                  teamId: entry.entry,
                  rank: entry.rank_sort,
                  points: entry.total,
                  teamName: entry.entry_name,
                  managerName: entry.player_name,
                  lastWeekRank: entry.last_rank,
                  // Add manager information
                  favourite_team: managerData?.favourite_team || null,
                  player_region_name: managerData?.player_region_name || null,
                  player_region_iso_code_short: managerData?.player_region_iso_code_short || null,
                  player_region_iso_code_long: managerData?.player_region_iso_code_long || null,
                  id: managerData?.id || entry.entry,
                  name: managerData?.name || entry.entry_name
                };
              }).sort((a, b) => a.rank - b.rank);
              
              realLeagues.push({
                id: classicLeague.id,
                name: leagueStandings.league.name,
                currentGameweek,
                teams,
                standings
              });
            }
          } catch (error) {
            console.warn(`Could not fetch league ${classicLeague.id} (${classicLeague.name}):`, error);
          }
        }
      }
      
      // Process head-to-head leagues
      if (managerData.leagues && managerData.leagues.h2h) {
        for (const h2hLeague of managerData.leagues.h2h) {
          try {
            if (h2hLeague.id > 1000) { // Skip global leagues
              console.log(`Fetching H2H league data for: ${h2hLeague.name} (ID: ${h2hLeague.id})`);
              
              // For H2H leagues, we'll create a simplified structure
              realLeagues.push({
                id: h2hLeague.id,
                name: h2hLeague.name,
                currentGameweek,
                teams: [{ 
                  id: fplTeamId, 
                  name: team.name, 
                  managerName: team.managerName, 
                  crestUrl: team.crestUrl, 
                  lastUpdated: team.lastUpdated 
                }],
                standings: [{
                  teamId: fplTeamId,
                  rank: h2hLeague.rank || 1,
                  points: h2hLeague.wins * 3 + h2hLeague.draws, // H2H points calculation
                  teamName: team.name,
                  managerName: team.managerName,
                  favourite_team: null,
                  player_region_name: null,
                  player_region_iso_code_short: null,
                  player_region_iso_code_long: null,
                  id: fplTeamId,
                  name: team.name
                }]
              });
            }
          } catch (error) {
            console.warn(`Could not process H2H league ${h2hLeague.id} (${h2hLeague.name}):`, error);
          }
        }
      }
      
      console.log(`Found ${realLeagues.length} real leagues for manager ${fplTeamId}`);
      
      if (realLeagues.length > 0) {
        return realLeagues;
      }
    } catch (error) {
      console.error('Error fetching real leagues:', error);
    }
    
    // Fallback to generic mock data if real API fails
    console.log('Falling back to mock leagues for manager:', fplTeamId);
    const mockLeagues = [
      {
        id: 999001,
        name: "Sample League 1",
        currentGameweek: 3,
        teams: [
          { id: team.id, name: team.name, managerName: team.managerName, crestUrl: team.crestUrl, lastUpdated: team.lastUpdated },
        ],
        standings: [
          { 
            teamId: fplTeamId, 
            rank: Math.floor(Math.random() * 10) + 1, 
            points: 450 + Math.floor(Math.random() * 100), 
            teamName: team.name, 
            managerName: team.managerName, 
            lastWeekRank: Math.floor(Math.random() * 10) + 1,
            favourite_team: "Arsenal", // Sample favorite team
            player_region_name: "Malaysia", // Sample region
            player_region_iso_code_short: "MY",
            player_region_iso_code_long: "MYS", 
            id: fplTeamId,
            name: team.name
          },
        ]
      },
      {
        id: 999002,
        name: "Sample League 2",
        currentGameweek: 3,
        teams: [
          { id: team.id, name: team.name, managerName: team.managerName, crestUrl: team.crestUrl, lastUpdated: team.lastUpdated },
        ],
        standings: [
          { 
            teamId: fplTeamId, 
            rank: Math.floor(Math.random() * 15) + 1, 
            points: 400 + Math.floor(Math.random() * 150), 
            teamName: team.name, 
            managerName: team.managerName, 
            lastWeekRank: Math.floor(Math.random() * 15) + 1,
            favourite_team: "Liverpool", // Sample favorite team
            player_region_name: "Malaysia", // Sample region
            player_region_iso_code_short: "MY",
            player_region_iso_code_long: "MYS", 
            id: fplTeamId,
            name: team.name
          },
        ]
      }
    ];

    return mockLeagues;
  }

  async syncLeagueData(leagueId: number): Promise<LeagueData> {
    // Try to fetch real league data for ANY league ID > 1000 (mini-leagues)
    if (leagueId > 1000) {
      try {
        console.log('Fetching real league data for ID:', leagueId, '- FORCING FRESH DATA');
        
        // First try to get league standings to determine if it's a valid classic league
        const leagueStandings = await this.fplApi.getLeagueStandings(leagueId, 1, true); // Force fresh data
        const currentGameweek = await this.fplApi.getCurrentGameweek();
        
        console.log('League standings fetched:', leagueStandings.league.name);
        console.log('Number of teams:', leagueStandings.standings.results.length);
        
        // Fetch additional team data for each entry
        const teamsWithData = await Promise.all(
          leagueStandings.standings.results.map(async (entry) => {
            try {
              const teamData = await this.fplApi.getManagerEntry(entry.entry);
              return {
                id: entry.entry,
                name: teamData.name,
                managerName: `${teamData.player_first_name} ${teamData.player_last_name}`.trim(),
                crestUrl: null,
                lastUpdated: new Date(),
                managerData: teamData // Store full manager data for later use
              };
            } catch (error) {
              console.warn(`Could not fetch data for team ${entry.entry}:`, error);
              return {
                id: entry.entry,
                name: entry.entry_name,
                managerName: entry.player_name,
                crestUrl: null,
                lastUpdated: new Date(),
                managerData: null
              };
            }
          })
        );
        
        // Debug the raw data first
        console.log('Raw FPL API data (first 5):', leagueStandings.standings.results.slice(0, 5).map(entry => 
          `${entry.rank_sort}. ${entry.entry_name} (rank: ${entry.rank}, rank_sort: ${entry.rank_sort})`
        ));
        
        const sortedStandings = leagueStandings.standings.results
          .map((entry) => {
            const teamData = teamsWithData.find(t => t.id === entry.entry);
            const managerData = teamData?.managerData;
            
            return {
              teamId: entry.entry,
              rank: entry.rank_sort, // Use rank_sort for accurate league position
              points: entry.total,
              teamName: entry.entry_name,
              managerName: entry.player_name,
              lastWeekRank: entry.last_rank,
              // Add manager information from FPL API
              favourite_team: managerData?.favourite_team || null,
              player_region_name: managerData?.player_region_name || null,
              player_region_iso_code_short: managerData?.player_region_iso_code_short || null,
              player_region_iso_code_long: managerData?.player_region_iso_code_long || null,
              id: managerData?.id || entry.entry,
              name: managerData?.name || entry.entry_name
            };
          })
          .sort((a, b) => a.rank - b.rank); // Ensure proper sorting by rank_sort
          
        console.log('Top 5 sorted standings:', sortedStandings.slice(0, 5).map(s => `${s.rank}. ${s.teamName}`));
        
        return {
          id: leagueId,
          name: leagueStandings.league.name,
          currentGameweek,
          teams: teamsWithData,
          standings: sortedStandings
        };
      } catch (error) {
        console.error('Error fetching real league data for ID', leagueId, ':', error);
        
        // For H2H leagues or leagues that fail classic league fetch, try to create a basic structure
        const currentGameweek = await this.fplApi.getCurrentGameweek();
        return {
          id: leagueId,
          name: `League ${leagueId}`,
          currentGameweek,
          teams: [],
          standings: []
        };
      }
    }

    // Mock league data for demo
    const mockLeaguesData: Record<number, LeagueData> = {
      150789: {
        id: 150789,
        name: "Your Real Mini-League",
        currentGameweek: 15,
        teams: [],
        standings: [
          { teamId: 5093819, rank: 1, points: 1500, teamName: "Your FPL Team", managerName: "Real Manager", lastWeekRank: 2 },
          // Add more mock standings if needed
        ]
      },
      1001: {
        id: 1001,
        name: "Premier League Fanatics",
        currentGameweek: 15,
        teams: [
          { id: 1, name: "Arsenal Dream Team", managerName: "John Smith", crestUrl: null, lastUpdated: new Date() },
          { id: 2, name: "Liverpool Legends", managerName: "Mike Johnson", crestUrl: null, lastUpdated: new Date() },
          { id: 3, name: "Chelsea Champions", managerName: "Emma Brown", crestUrl: null, lastUpdated: new Date() },
          { id: 4, name: "Manchester United FC", managerName: "Sarah Wilson", crestUrl: null, lastUpdated: new Date() },
          { id: 5, name: "Tottenham Team", managerName: "David Davis", crestUrl: null, lastUpdated: new Date() },
          { id: 6, name: "City Slickers", managerName: "Alex Turner", crestUrl: null, lastUpdated: new Date() }
        ],
        standings: [
          { teamId: 345678, rank: 1, points: 1234, teamName: "Liverpool Legends", managerName: "Mike Johnson", lastWeekRank: 2 },
          { teamId: 456789, rank: 2, points: 1198, teamName: "Chelsea Champions", managerName: "Emma Brown", lastWeekRank: 1 },
          { teamId: 123456, rank: 3, points: 1167, teamName: "Arsenal Dream Team", managerName: "John Smith", lastWeekRank: 4 },
          { teamId: 234567, rank: 4, points: 1156, teamName: "Manchester United FC", managerName: "Sarah Wilson", lastWeekRank: 3 },
          { teamId: 567890, rank: 5, points: 1089, teamName: "Tottenham Team", managerName: "David Davis", lastWeekRank: 5 },
          { teamId: 678901, rank: 6, points: 1045, teamName: "City Slickers", managerName: "Alex Turner", lastWeekRank: 6 }
        ]
      },
      1002: {
        id: 1002,
        name: "Office League 2024/25",
        currentGameweek: 15,
        teams: [
          { id: 1, name: "Arsenal Dream Team", managerName: "John Smith", crestUrl: null, lastUpdated: new Date() },
          { id: 7, name: "Desk Warriors", managerName: "Tom Wilson", crestUrl: null, lastUpdated: new Date() },
          { id: 8, name: "Coffee Break FC", managerName: "Lisa Chen", crestUrl: null, lastUpdated: new Date() },
          { id: 9, name: "Monday Morning", managerName: "James Miller", crestUrl: null, lastUpdated: new Date() }
        ],
        standings: [
          { teamId: 789012, rank: 1, points: 1298, teamName: "Desk Warriors", managerName: "Tom Wilson", lastWeekRank: 1 },
          { teamId: 123456, rank: 2, points: 1167, teamName: "Arsenal Dream Team", managerName: "John Smith", lastWeekRank: 2 },
          { teamId: 890123, rank: 3, points: 1089, teamName: "Coffee Break FC", managerName: "Lisa Chen", lastWeekRank: 4 },
          { teamId: 901234, rank: 4, points: 1012, teamName: "Monday Morning", managerName: "James Miller", lastWeekRank: 3 }
        ]
      }
    };

    const league = mockLeaguesData[leagueId];
    if (!league) {
      throw new Error(`League ${leagueId} not found`);
    }

    return league;
  }

  async getGameweekRankProgression(leagueId: number): Promise<Record<string, GameweekData[]>> {
    // Handle any real league ID > 1000 (mini-leagues)
    if (leagueId > 1000) {
      try {
        console.log('Fetching real rank progression for league:', leagueId);
        const leagueData = await this.syncLeagueData(leagueId);
        const currentGameweek = await this.fplApi.getCurrentGameweek();
        
        const realProgression: Record<string, GameweekData[]> = {};
        
        // First, collect all history data to calculate GW1 rankings
        const allHistoryData: Array<{standing: any, history: any}> = [];
        
        for (const standing of leagueData.standings) {
          try {
            const history = await this.fplApi.getManagerHistory(standing.teamId);
            allHistoryData.push({ standing, history });
          } catch (error) {
            console.warn(`Could not fetch history for ${standing.teamName}:`, error);
          }
        }
        
        // Calculate GW1 rankings based on GW1 individual gameweek points (not total points)
        const gw1Rankings = allHistoryData
          .map(({ standing, history }) => ({
            teamName: standing.teamName,
            teamId: standing.teamId,
            gw1Points: history.current.find((gw: any) => gw.event === 1)?.points || 0
          }))
          .sort((a, b) => b.gw1Points - a.gw1Points) // Sort by individual GW1 points descending
          .reduce((acc, team, index) => {
            acc[team.teamId] = index + 1; // Assign rank (1st place = rank 1)
            return acc;
          }, {} as Record<number, number>);
        
        // Now process each team's progression
        allHistoryData.forEach(({ standing, history }) => {
          const currentRank = standing.rank; // Current rank_sort
          const lastWeekRank = standing.lastWeekRank; // last_rank from FPL API
          
          const progression = history.current.map((gw: any) => {
            let gwRank;
            let movementFromLastWeek = 0;

            if (gw.event === currentGameweek) {
              // Current gameweek (6): Use rank_sort (current rank)
              gwRank = currentRank;
              movementFromLastWeek = (lastWeekRank || 0) - currentRank;
            } else if (gw.event === currentGameweek - 1) {
              // Previous gameweek (5): Use last_rank field from FPL API (previous rank)
              gwRank = lastWeekRank || currentRank;
            } else if (gw.event <= currentGameweek - 2) {
              // Earlier gameweeks: Calculate rank based on total points at that gameweek
              const gwTotalPoints = gw.total_points;
              // Create a ranking based on total points at this gameweek
              const gwRanking = Object.values(allHistoryData)
                .map(({ standing: s, history: h }) => {
                  const gwData = h.current.find((g: any) => g.event === gw.event);
                  return {
                    teamId: s.teamId,
                    totalPoints: gwData?.total_points || 0
                  };
                })
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .findIndex(team => team.teamId === standing.teamId) + 1;

              gwRank = gwRanking;
            } else if (gw.event === 1) {
              // Gameweek 1: Use calculated ranking based on GW1 points
              gwRank = gw1Rankings[standing.teamId] || currentRank;
            } else {
              // Future gameweeks: use current rank
              gwRank = currentRank;
            }

            return {
              teamId: standing.teamId,
              gameweek: gw.event,
              points: gw.points,
              rank: gwRank,
              totalPoints: gw.total_points,
              squad: [],
              movementFromLastWeek,
              managerName: standing.teamName,
              playerName: standing.managerName
            };
          });
          
          realProgression[standing.teamName] = progression;
          console.log(`Fetched progression for ${standing.teamName}`);
        });
        
        // Handle any teams that couldn't fetch history data
        const processedTeamIds = new Set(allHistoryData.map(({ standing }) => standing.teamId));
        for (const standing of leagueData.standings) {
          if (!processedTeamIds.has(standing.teamId)) {
            // Generate fallback data
            const ranks = Array.from({length: currentGameweek}, () => Math.floor(Math.random() * 6) + 1);
            realProgression[standing.teamName] = generateRankProgression(standing.teamName, standing.teamId, ranks);
          }
        }
        
        return realProgression;
      } catch (error) {
        console.error('Error fetching real progression data:', error);
        // Return empty progression data instead of falling through to mock data
        throw new Error(`Failed to fetch progression data for league ${leagueId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Generate mock rank progression data for demo charts
    const mockProgressions: Record<number, Record<string, GameweekData[]>> = {
      150789: { // Your real league
        "Your FPL Team": generateRankProgression("Your FPL Team", 5093819, [3, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1])
      },
      1001: { // Premier League Fanatics
        "Arsenal Dream Team": generateRankProgression("Arsenal Dream Team", 123456, [6, 5, 4, 3, 2, 3, 4, 3, 2, 3, 3, 2, 3, 4, 3]),
        "Liverpool Legends": generateRankProgression("Liverpool Legends", 345678, [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1]),
        "Chelsea Champions": generateRankProgression("Chelsea Champions", 456789, [3, 1, 3, 2, 3, 2, 1, 2, 3, 1, 2, 3, 2, 2, 2]),
        "Manchester United FC": generateRankProgression("Manchester United FC", 234567, [2, 3, 2, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4]),
        "Tottenham Team": generateRankProgression("Tottenham Team", 567890, [4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]),
        "City Slickers": generateRankProgression("City Slickers", 678901, [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6])
      },
      1002: { // Office League 2024/25
        "Arsenal Dream Team": generateRankProgression("Arsenal Dream Team", 123456, [4, 3, 3, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2]),
        "Desk Warriors": generateRankProgression("Desk Warriors", 789012, [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1]),
        "Coffee Break FC": generateRankProgression("Coffee Break FC", 890123, [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]),
        "Monday Morning": generateRankProgression("Monday Morning", 901234, [3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4])
      }
    };

    function generateRankProgression(teamName: string, teamId: number, ranks: number[]): GameweekData[] {
      return ranks.map((rank, index) => {
        const gameweek = index + 1;
        const basePoints = 50 + Math.floor(Math.random() * 30); // 50-80 points per GW
        const totalPoints = basePoints * gameweek + Math.floor(Math.random() * 100);
        
        return {
          teamId,
          gameweek,
          points: basePoints,
          rank,
          totalPoints,
          squad: []
        };
      });
    }

    const progression = mockProgressions[leagueId];
    if (!progression) {
      throw new Error(`No progression data for league ${leagueId}`);
    }

    return progression;
  }

  async syncGameweekData(fplTeamId: number, gameweek: number): Promise<void> {
    const team = await this.getOrCreateTeam(fplTeamId);
    const history = await this.fplApi.getManagerHistory(fplTeamId);
    
    const gameweekHistory = history.current.find(gw => gw.event === gameweek);
    if (!gameweekHistory) return;

    const picks = await this.fplApi.getManagerPicks(fplTeamId, gameweek);
    const bootstrap = await this.fplApi.getBootstrapData();

    await prisma.gameweekData.upsert({
      where: {
        teamId_gameweek: {
          teamId: team.id,
          gameweek: gameweek
        }
      },
      update: {
        points: gameweekHistory.points,
        totalPoints: gameweekHistory.total_points,
        rank: gameweekHistory.overall_rank,
        squad: JSON.stringify(picks.picks.map(pick => {
          const player = bootstrap.elements.find(p => p.id === pick.element);
          return {
            ...pick,
            player: player || null
          };
        }))
      },
      create: {
        teamId: team.id,
        gameweek: gameweek,
        points: gameweekHistory.points,
        totalPoints: gameweekHistory.total_points,
        rank: gameweekHistory.overall_rank,
        squad: JSON.stringify(picks.picks.map(pick => {
          const player = bootstrap.elements.find(p => p.id === pick.element);
          return {
            ...pick,
            player: player || null
          };
        }))
      }
    });
  }

  async getSquadAnalysis(fplTeamId: number, gameweek: number): Promise<PlayerSquadData[]> {
    const team = await this.getOrCreateTeam(fplTeamId);
    
    const gameweekData = await prisma.gameweekData.findUnique({
      where: {
        teamId_gameweek: {
          teamId: team.id,
          gameweek: gameweek
        }
      }
    });

    if (!gameweekData || !gameweekData.squad) {
      return [];
    }

    const squadData = JSON.parse(gameweekData.squad as string) as PlayerSquadData[];
    const bootstrap = await this.fplApi.getBootstrapData();
    const liveData = await this.fplApi.getLiveGameweekData(gameweek);

    // Enrich squad data with live points and player information
    return squadData.map(pick => {
      const player = bootstrap.elements.find(p => p.id === pick.element);
      const livePlayer = liveData.elements.find(p => p.id === pick.element);
      
      let points = 0;
      if (livePlayer) {
        // Calculate points based on FPL scoring system
        const stats = livePlayer.stats;
        points = stats.goals_scored * 6 + // Goals
                 stats.assists * 3 +       // Assists
                 stats.clean_sheets * 4 +  // Clean sheets (depends on position)
                 stats.saves / 3 +         // Saves (rounded down)
                 stats.bonus +             // Bonus points
                 (stats.minutes > 0 ? (stats.minutes >= 60 ? 2 : 1) : 0) - // Appearance points
                 stats.goals_conceded * (player?.element_type === 1 || player?.element_type === 2 ? 0.5 : 0) - // Goals conceded for GK/DEF
                 stats.yellow_cards * 1 -  // Yellow cards
                 stats.red_cards * 3 -     // Red cards
                 stats.own_goals * 2 -     // Own goals
                 stats.penalties_missed * 2; // Missed penalties
        
        points = Math.max(0, Math.round(points));
      }

      return {
        ...pick,
        player: player || null,
        points: points * pick.multiplier // Apply captain/vice-captain multiplier
      };
    });
  }
}