'use client';

import { useState, useEffect } from 'react';
import { X, Star, Crown } from 'lucide-react';

interface PlayerData {
  name: string;
  team: string;
  teamCode?: number; // FPL team code for shirt images
  points: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  multiplier: number;
  status?: string; // FPL player status: 'a' = available, 'i' = injured, 's' = suspended, 'u' = unavailable
  minutes?: number; // Minutes played in the gameweek
}

interface SquadData {
  starting: {
    GKP: PlayerData[];
    DEF: PlayerData[];
    MID: PlayerData[];
    FWD: PlayerData[];
  };
  subs: (PlayerData & { position: string })[];
  captain: PlayerData | null;
  viceCaptain: PlayerData | null;
  totalPoints: number;
  activeChip?: string;
  entryHistory?: {
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
  };
}

interface PitchViewProps {
  teamName: string;
  managerName: string;
  gameweek: number;
  isOpen: boolean;
  onClose: () => void;
  squadData?: SquadData; // Accept pre-processed squad data
  activeChip?: string;
  entryHistory?: {
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
  };
}

export function PitchView({ 
  teamName, 
  managerName, 
  gameweek, 
  isOpen, 
  onClose, 
  squadData: preloadedSquadData, 
  activeChip: preloadedActiveChip,
  entryHistory: preloadedEntryHistory 
}: PitchViewProps) {
  const [squadData, setSquadData] = useState<SquadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // If we have preloaded squad data, use it directly
      if (preloadedSquadData && typeof preloadedSquadData === 'object' && preloadedSquadData.starting) {
        console.log('PITCH VIEW: Using preloaded squad data');
        // Add team codes to the preloaded squad data
        const enhancedSquadData = addTeamCodesToSquadData({
          ...preloadedSquadData,
          activeChip: preloadedActiveChip,
          entryHistory: preloadedEntryHistory
        });
        
        // If no active chip provided, try to fetch it from FPL API
        if (!preloadedActiveChip) {
          fetchChipAndRankData(enhancedSquadData);
        } else {
          setSquadData(enhancedSquadData);
          setIsLoading(false);
        }
      } else {
        console.log('PITCH VIEW: No valid preloaded squad data, fetching from API');
        fetchSquadData();
      }
    }
  }, [isOpen, teamName, gameweek, preloadedSquadData, preloadedActiveChip, preloadedEntryHistory]);

  const fetchChipAndRankData = async (baseSquadData: SquadData) => {
    try {
      // Try to get team data from current league context (not just 150789)
      const currentUrl = window.location.pathname;
      const leagueIdMatch = currentUrl.match(/\/league\/(\d+)/);
      const leagueId = leagueIdMatch ? leagueIdMatch[1] : '150789';
      
      const leagueResponse = await fetch(`/api/leagues/${leagueId}`);
      if (leagueResponse.ok) {
        const leagueData = await leagueResponse.json();
        const team = leagueData.standings?.find((t: any) => t.teamName === teamName);
        
        if (team?.teamId) {
          // Fetch chip data from FPL API
          const picksResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${team.teamId}/event/${gameweek}/picks/`);
          let activeChip = null;
          if (picksResponse.ok) {
            const picksData = await picksResponse.json();
            activeChip = picksData.active_chip;
          }
          
          console.log('PITCH VIEW: Active chip detected:', activeChip);
          setSquadData({
            ...baseSquadData,
            activeChip: activeChip,
            entryHistory: {
              ...baseSquadData.entryHistory,
              rank: team.rank, // Use mini league rank, not overall rank
              overall_rank: baseSquadData.entryHistory?.overall_rank || 0
            }
          });
        } else {
          setSquadData(baseSquadData);
        }
      }
    } catch (error) {
      console.warn('Could not fetch chip data:', error);
      setSquadData(baseSquadData);
    }
    setIsLoading(false);
  };

  const fetchSquadData = async () => {
    setIsLoading(true);
    
    try {
      // Get the current league ID from URL context
      const currentUrl = window.location.pathname;
      const leagueIdMatch = currentUrl.match(/\/league\/(\d+)/);
      const leagueId = leagueIdMatch ? leagueIdMatch[1] : '150789';
      
      // Use the squad-analysis API with current league context
      const response = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
      if (response.ok) {
        const data = await response.json();
        const teamData = data.analysis?.find((team: any) => team.team === teamName || team.teamName === teamName);
        
        if (teamData && teamData.squad && teamData.squad.starting) {
          console.log('PITCH VIEW: Found real squad data from server');
          
          // Also fetch league standings to get the actual rank
          const leagueResponse = await fetch(`/api/leagues/${leagueId}`);
          let actualRank = 0;
          if (leagueResponse.ok) {
            const leagueData = await leagueResponse.json();
            const teamInLeague = leagueData.standings?.find((t: any) => t.teamName === teamName);
            actualRank = teamInLeague?.rank || 0;
          }
          
          const enhancedSquadData = addTeamCodesToSquadData({
            ...teamData.squad,
            activeChip: teamData.squad.activeChip,
            entryHistory: {
              points: teamData.gwTotalPoints,
              total_points: teamData.totalPoints,
              rank: actualRank, // Use actual league rank
              overall_rank: teamData.overallRank || 0
            }
          });
          
          setSquadData(enhancedSquadData);
          setIsLoading(false);
          return;
        }
      }
      
      console.warn('Could not fetch real squad data, using mock data');
      const mockSquad = generateMockSquadData();
      setSquadData(mockSquad);
      setIsLoading(false);
      
    } catch (error) {
      console.warn('Error fetching squad data:', error);
      // Always provide fallback data
      const mockSquad = generateMockSquadData();
      setSquadData(mockSquad);
      setIsLoading(false);
    }
  };

  const parseRealFPLData = (picksData: any, bootstrap: any, liveData: any = null): SquadData => {
    const positionMap: { [key: number]: string } = {
      1: 'GKP',
      2: 'DEF', 
      3: 'MID',
      4: 'FWD'
    };
    
    const squad: SquadData = {
      starting: { GKP: [], DEF: [], MID: [], FWD: [] },
      subs: [],
      captain: null,
      viceCaptain: null,
      totalPoints: 0,
      activeChip: picksData.active_chip,
      entryHistory: picksData.entry_history
    };
    
    if (!picksData.picks || !bootstrap.elements) {
      return generateMockSquadData();
    }
    
    picksData.picks.forEach((pick: any) => {
      const player = bootstrap.elements.find((el: any) => el.id === pick.element);
      if (!player) return;
      
      const team = bootstrap.teams.find((t: any) => t.id === player.team);
      const position = positionMap[player.element_type];
      
      const playerData = {
        name: player.web_name,
        team: team?.short_name || 'UNK',
        teamCode: team?.code, // Store team code for shirt URL
        points: 0, // We'll calculate this below
        isCaptain: pick.is_captain,
        isViceCaptain: pick.is_vice_captain,
        multiplier: pick.multiplier,
        status: player.status, // Player availability status
        minutes: 0 // Minutes played, will be updated below
      };
      
      // Get real live points if available
      if (liveData && liveData.elements) {
        const livePlayer = liveData.elements.find((el: any) => el.id === pick.element);
        if (livePlayer && livePlayer.stats) {
          const stats = livePlayer.stats;
          // Calculate FPL points from live stats
          const minutes = stats.minutes || 0;
          const goals = stats.goals_scored || 0;
          const assists = stats.assists || 0;
          const cleanSheets = stats.clean_sheets || 0;
          const bonus = stats.bonus || 0;
          const saves = stats.saves || 0;
          const penaltyMisses = stats.penalties_missed || 0;
          const penaltySaves = stats.penalties_saved || 0;
          const yellowCards = stats.yellow_cards || 0;
          const redCards = stats.red_cards || 0;
          const ownGoals = stats.own_goals || 0;
          const goalsConceded = stats.goals_conceded || 0;
          
          // FPL scoring system
          let points = 0;
          // Store minutes played for injury detection
          playerData.minutes = minutes;
          
          // If player didn't play (0 minutes), they get 0 points
          if (minutes === 0) {
            points = 0;
          } else {
            if (minutes > 0) points += minutes >= 60 ? 2 : 1;
            if (player.element_type === 4) points += goals * 4; // FWD
            else if (player.element_type === 3) points += goals * 5; // MID
            else points += goals * 6; // DEF/GKP
            points += assists * 3;
            if (player.element_type <= 2) points += cleanSheets * 4; // GKP/DEF
            else if (player.element_type === 3) points += cleanSheets * 1; // MID
            points += Math.floor(saves / 3);
            points += bonus;
            points += penaltySaves * 5;
            points -= penaltyMisses * 2;
            points -= yellowCards * 1;
            points -= redCards * 3;
            points -= ownGoals * 2;
            if (player.element_type <= 2) points -= Math.floor(goalsConceded / 2);
          }
          
          let finalPoints = Math.max(0, points);
          
          // Automatic injury/unavailability detection
          const isInjuredOrUnavailable = player.status && ['i', 's', 'u', 'd', 'n'].includes(player.status);
          const didNotPlay = minutes === 0;
          
          if (isInjuredOrUnavailable || didNotPlay) {
            finalPoints = 0;
            playerData.status = isInjuredOrUnavailable ? player.status : 'n'; // 'n' for did not play
            playerData.minutes = 0;
            console.log(`PITCH VIEW AUTO-CORRECT ${player.web_name}: status=${player.status}, minutes=${minutes}, originalPoints=${points} → finalPoints=0`);
          }
          
          playerData.points = finalPoints;
        } else {
          // No live stats available - assume player didn't play, set to 0 points
          playerData.points = 0;
          playerData.minutes = 0;
          playerData.status = player.status || 'n'; // Default to 'n' for did not play
        }
      } else {
        // Automatic injury/unavailability detection for fallback section
        const isInjuredOrUnavailable = player.status && ['i', 's', 'u', 'd', 'n'].includes(player.status);
        let fallbackPoints = 0;
        
        if (isInjuredOrUnavailable) {
          // Player is injured/unavailable - set to 0 points
          fallbackPoints = 0;
          playerData.status = player.status;
          playerData.minutes = 0;
          console.log(`PITCH VIEW FALLBACK AUTO-CORRECT ${player.web_name}: status=${player.status} → points=0`);
        } else {
          // No live data available - use actual event points if available from player data
          if (player.event_points !== undefined) {
            fallbackPoints = player.event_points;
          } else {
            // Last resort: assume player didn't play
            fallbackPoints = 0;
          }
          playerData.status = player.status || 'n';
          playerData.minutes = 0;
        }
        
        playerData.points = fallbackPoints;
      }
      
      // Set captain/vice-captain references
      if (pick.is_captain) squad.captain = playerData;
      if (pick.is_vice_captain) squad.viceCaptain = playerData;
      
      // Assign to starting XI or subs based on position (1-11 = starting, 12-15 = subs)
      if (pick.position <= 11) {
        squad.starting[position as keyof typeof squad.starting].push(playerData);
      } else {
        squad.subs.push({ ...playerData, position });
      }
    });
    
    // Calculate total points
    squad.totalPoints = calculateTotalPointsFromSquad(squad);
    
    return squad;
  };

  // Add team codes to squad data for shirt URLs
  const addTeamCodesToSquadData = (squadData: SquadData): SquadData => {
    const teamCodeMap: { [key: string]: number } = {
      'ARS': 3, 'AVL': 7, 'BOU': 91, 'BRE': 94, 'BHA': 36, 
      'CHE': 8, 'CRY': 31, 'EVE': 11, 'FUL': 54, 'LIV': 14,
      'MCI': 43, 'MUN': 1, 'NEW': 4, 'NFO': 17, 'TOT': 6,
      'WHU': 21, 'WOL': 39, 'BUR': 90, 'LEE': 2, 'SUN': 56
    };

    const addTeamCodeToPlayers = (players: PlayerData[] = []) => 
      players.map(player => ({
        ...player,
        teamCode: teamCodeMap[player.team] || 1 // Default to MUN if not found
      }));

    // Ensure starting exists with all position arrays
    const starting = squadData.starting || {};
    
    return {
      ...squadData,
      starting: {
        GKP: addTeamCodeToPlayers(starting.GKP || []),
        DEF: addTeamCodeToPlayers(starting.DEF || []),
        MID: addTeamCodeToPlayers(starting.MID || []),
        FWD: addTeamCodeToPlayers(starting.FWD || [])
      },
      subs: (squadData.subs || []).map(sub => ({
        ...sub,
        teamCode: teamCodeMap[sub.team] || 1
      })),
      captain: squadData.captain ? {
        ...squadData.captain,
        teamCode: teamCodeMap[squadData.captain.team] || 1
      } : null,
      viceCaptain: squadData.viceCaptain ? {
        ...squadData.viceCaptain,
        teamCode: teamCodeMap[squadData.viceCaptain.team] || 1
      } : null
    };
  };

  const generateMockSquadData = (): SquadData => {
    // FPL team code mappings for mock data (correct shirt URL codes from API)
    const teamCodeMap: { [key: string]: number } = {
      'ARS': 3, 'AVL': 7, 'BOU': 91, 'BRE': 94, 'BHA': 36, 
      'CHE': 8, 'CRY': 31, 'EVE': 11, 'FUL': 54, 'LIV': 14,
      'MCI': 43, 'MUN': 1, 'NEW': 4, 'NFO': 17, 'TOT': 6,
      'WHU': 21, 'WOL': 39, 'BUR': 90, 'LEE': 2, 'SUN': 56
    };
    
    const mockSquad: SquadData = {
      starting: {
        GKP: [{ name: 'Alisson', team: 'LIV', teamCode: 14, points: 6, multiplier: 1 }],
        DEF: [
          { name: 'Alexander-Arnold', team: 'LIV', teamCode: 14, points: 8, multiplier: 1 },
          { name: 'van Dijk', team: 'LIV', teamCode: 14, points: 6, multiplier: 1 },
          { name: 'Saliba', team: 'ARS', teamCode: 3, points: 7, multiplier: 1 },
          { name: 'Dalot', team: 'MUN', teamCode: 1, points: 5, multiplier: 1 }
        ],
        MID: [
          { name: 'Salah', team: 'LIV', teamCode: 14, points: 12, isCaptain: true, multiplier: 2 },
          { name: 'Palmer', team: 'CHE', teamCode: 8, points: 9, multiplier: 1 },
          { name: 'Saka', team: 'ARS', teamCode: 3, points: 8, multiplier: 1 },
          { name: 'Bruno Fernandes', team: 'MUN', teamCode: 1, points: 6, isViceCaptain: true, multiplier: 1 }
        ],
        FWD: [
          { name: 'Haaland', team: 'MCI', teamCode: 43, points: 11, multiplier: 1 },
          { name: 'Isak', team: 'NEW', teamCode: 4, points: 7, multiplier: 1 }
        ]
      },
      subs: [
        { name: 'Raya', team: 'ARS', teamCode: 3, points: 2, position: 'GKP', multiplier: 0 },
        { name: 'Trippier', team: 'NEW', teamCode: 4, points: 5, position: 'DEF', multiplier: 0 },
        { name: 'Maddison', team: 'TOT', teamCode: 6, points: 3, position: 'MID', multiplier: 0 },
        { name: 'Ballard', team: 'BOU', teamCode: 91, points: 0, position: 'FWD', multiplier: 0, status: 'i', minutes: 0 } // Fixed: Ballard injured, 0 points
      ],
      captain: { name: 'Salah', team: 'LIV', teamCode: 14, points: 12, isCaptain: true, multiplier: 2 },
      viceCaptain: { name: 'Bruno Fernandes', team: 'MUN', teamCode: 1, points: 6, isViceCaptain: true, multiplier: 1 },
      totalPoints: 80,
      activeChip: 'bboost', // Example: Show Bench Boost chip for testing
      entryHistory: {
        points: 80,
        total_points: 220,
        rank: 3, // Mini league rank (3rd position in league)
        overall_rank: 1500000
      }
    };
    
    return mockSquad;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[96vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-3 sm:p-6 flex justify-between items-start flex-shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-xs sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight mb-0.5 sm:mb-1 break-words">{teamName}</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight break-words">Manager: {managerName} • GW {gameweek}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="p-2 sm:p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 text-sm">Loading squad...</span>
            </div>
          ) : squadData ? (
            <div className="space-y-3">
              {/* Compact Total Points Card - Mobile optimized */}
              <div className="bg-white border-2 border-green-600 rounded-lg text-center shadow-lg p-2 sm:p-4">
                <div className="text-sm sm:text-lg font-bold text-gray-900">
                  GW {gameweek}
                </div>
                <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                  {squadData.entryHistory?.points || squadData.totalPoints || calculateTotalPoints(squadData)} pts
                </div>

                {/* Chip Information - Compact design */}
                {console.log('PITCH VIEW RENDER: squadData.activeChip =', squadData.activeChip)}
                {squadData.activeChip && (
                  <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-1 mb-1">
                    <div className="text-xs font-bold text-yellow-900 uppercase">
                      {formatChipName(squadData.activeChip)}
                    </div>
                  </div>
                )}

                {/* Additional Stats - Hidden on small screens */}
                {squadData.entryHistory && (
                  <div className="hidden sm:grid grid-cols-3 gap-2 text-xs text-gray-600 border-t pt-2">
                    <div>
                      <div className="font-semibold">Total Points</div>
                      <div>{squadData.entryHistory.total_points?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold">GW Rank</div>
                      <div>{squadData.entryHistory.rank?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Overall</div>
                      <div>{squadData.entryHistory.overall_rank?.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Pitch with optimized spacing for smaller cards */}
              <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg mx-1 sm:mx-2 p-3 sm:p-4 h-[380px] sm:h-[600px] lg:h-[650px]">
                {/* Pitch Markings */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Outer boundary */}
                    <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.8" />
                    {/* Center circle */}
                    <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.6" />
                    {/* Center line */}
                    <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.4" />
                    {/* Center spot */}
                    <circle cx="50" cy="50" r="0.5" fill="white" />
                    {/* Penalty areas */}
                    <rect x="20" y="2" width="60" height="18" fill="none" stroke="white" strokeWidth="0.6" />
                    <rect x="20" y="80" width="60" height="18" fill="none" stroke="white" strokeWidth="0.6" />
                    {/* Goal areas */}
                    <rect x="35" y="2" width="30" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                    <rect x="35" y="90" width="30" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                    {/* Penalty spots */}
                    <circle cx="50" cy="12" r="0.5" fill="white" />
                    <circle cx="50" cy="88" r="0.5" fill="white" />
                    {/* Corner arcs */}
                    <path d="M 2 2 Q 7 2 7 7" fill="none" stroke="white" strokeWidth="0.4" />
                    <path d="M 98 2 Q 93 2 93 7" fill="none" stroke="white" strokeWidth="0.4" />
                    <path d="M 2 98 Q 7 98 7 93" fill="none" stroke="white" strokeWidth="0.4" />
                    <path d="M 98 98 Q 93 98 93 93" fill="none" stroke="white" strokeWidth="0.4" />
                  </svg>
                </div>

                {/* Formation with absolute positioning for optimal pitch utilization */}
                <div className="relative z-10 w-full h-full">
                  {/* Goalkeeper - positioned at 12% from top */}
                  <div
                    className="absolute w-full flex justify-center"
                    style={{ top: '12%', transform: 'translateY(-50%)' }}
                  >
                    <div className="flex gap-4">
                      {squadData.starting.GKP.map((player, index) => (
                        <EnhancedJerseyCard key={index} player={player} />
                      ))}
                    </div>
                  </div>

                  {/* Defenders - positioned at 33% from top with better horizontal spacing */}
                  <div
                    className="absolute w-full flex justify-center"
                    style={{ top: '33%', transform: 'translateY(-50%)' }}
                  >
                    <div className="flex gap-4 sm:gap-8 md:gap-10 justify-center" style={{ maxWidth: '98%' }}>
                      {squadData.starting.DEF.map((player, index) => (
                        <EnhancedJerseyCard key={index} player={player} />
                      ))}
                    </div>
                  </div>

                  {/* Midfielders - positioned at 57% from top with better spacing */}
                  <div
                    className="absolute w-full flex justify-center"
                    style={{ top: '57%', transform: 'translateY(-50%)' }}
                  >
                    <div className="flex gap-4 sm:gap-8 md:gap-10 justify-center" style={{ maxWidth: '98%', flexWrap: 'nowrap' }}>
                      {squadData.starting.MID.map((player, index) => (
                        <EnhancedJerseyCard key={index} player={player} />
                      ))}
                    </div>
                  </div>

                  {/* Forwards - positioned at 78% from top with good spacing */}
                  <div
                    className="absolute w-full flex justify-center"
                    style={{ top: '78%', transform: 'translateY(-50%)' }}
                  >
                    <div className="flex gap-8 sm:gap-12 md:gap-16 justify-center">
                      {squadData.starting.FWD.map((player, index) => (
                        <EnhancedJerseyCard key={index} player={player} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Substitutes Section - with better spacing and layout */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-4 mt-2 sm:mt-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">SUBSTITUTES</h3>
                <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
                  {squadData.subs.map((player, index) => (
                    <div key={index} className="flex-shrink-0">
                      <EnhancedJerseyCard player={player} isSubstitute={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No squad data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Get real FPL shirt image URL using team code
function getFPLShirtUrl(teamCode: number): string {
  return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png`;
}

// Enhanced FPL-style jersey card with consistent sizing for all players
function EnhancedJerseyCard({ player, isSubstitute = false }: { 
  player: PlayerData; 
  isSubstitute?: boolean;
}) {
  const shirtUrl = player.teamCode ? getFPLShirtUrl(player.teamCode) : null;
  
  return (
    <div className="text-center relative flex flex-col items-center w-12 sm:w-20 lg:w-[90px]">
      {/* Captain/Vice-Captain badge - consistent positioning */}
      {player.isCaptain && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs sm:text-sm font-bold z-30 shadow-lg border border-white">
          C
        </div>
      )}
      {player.isViceCaptain && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs sm:text-sm font-bold z-30 shadow-lg border border-white">
          V
        </div>
      )}
      
      {/* Injury/Unavailability Status Indicator - Red Alert for all unavailable players */}
      {(player.status === 'i' || player.status === 's' || player.status === 'u' || player.status === 'd' || player.status === 'n' || (player.minutes === 0 && player.points === 0)) && (
        <div className="absolute -top-1 -left-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs font-bold z-30 shadow-lg border border-white">
          !
        </div>
      )}
      
      {/* Consistent FPL Shirt Image size for all players */}
      <div className="relative mx-auto mb-1 transform hover:scale-105 transition-transform w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
        {shirtUrl ? (
          <img 
            src={shirtUrl}
            alt={`${player.team} shirt`}
            className="w-full h-full object-contain drop-shadow-md filter brightness-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0iIzgwODA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMjAgTDE2IDU1IEw1NCA1NSBMNTQgMjAgTDQ0IDE2IEw0NCAxMCBMMzggOCBMMzIgOCBMMjYgMTAgTDI2IDE2IFoiLz48L3N2Zz4=';  
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="text-sm font-bold text-white">{player.team}</div>
          </div>
        )}
      </div>
      
      {/* Consistent Player name styling for all players */}
      <div className="font-bold text-white bg-gradient-to-r from-purple-900 to-purple-800 rounded px-1 sm:px-2 py-0.5 mb-1 text-center w-full border border-purple-600 text-xs">
        <div className="leading-tight whitespace-nowrap" title={player.name}>
          {player.name}
        </div>
      </div>

      {/* Consistent Points display styling for all players */}
      <div className="font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 rounded px-1 sm:px-2 py-0.5 text-center w-full shadow-sm border border-cyan-400 text-xs">
        <div className="flex items-center justify-center">
          {isSubstitute ? player.points : player.points * player.multiplier}
          {player.multiplier > 1 && !isSubstitute && (
            <span className="text-yellow-200 ml-1 font-bold text-xs">
              (×{player.multiplier})
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
}

// Calculate total points for gameweek
function calculateTotalPoints(squadData: SquadData): number {
  const startingPoints = Object.values(squadData.starting)
    .flat()
    .reduce((sum, player) => sum + (player.points * player.multiplier), 0);
  
  return startingPoints;
}

// Calculate total points from squad (same logic, different name for internal use)
function calculateTotalPointsFromSquad(squadData: SquadData): number {
  return calculateTotalPoints(squadData);
}

// Format chip names to display properly
function formatChipName(chipCode: string): string {
  const chipMap: { [key: string]: string } = {
    'wildcard': 'Wildcard',
    'bboost': 'Bench Boost',
    'freehit': 'Free Hit',
    '3xc': 'Triple Captain'
  };
  
  return chipMap[chipCode] || chipCode.replace('_', ' ').toUpperCase();
}