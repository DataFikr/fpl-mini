'use client';

import { useState, useEffect } from 'react';
import { FPLManagerEntry, TeamData } from '@/types/fpl';
import { Crown, Star, TrendingUp, Users, Mail, Bell } from 'lucide-react';
import { PitchView } from './pitch-view';

interface SquadAnalysisData {
  rank: number;
  team: string;
  manager: string;
  managerId?: number;
  gwTotalPoints: number;
  totalPoints: number;
  squad: string;
  performanceAnalysis: string;
}

interface EnhancedSquadTableProps {
  leagueId: number;
  gameweek?: number;
}

function formatSquadForDisplay(squad: any): string {
  // Handle string format (legacy data)
  if (typeof squad === 'string') {
    return squad;
  }
  
  // Handle object format (new structure)
  if (squad && typeof squad === 'object' && squad.starting) {
    const formation = [];
    
    // Format starting XI
    if (squad.starting.GKP && squad.starting.GKP.length > 0) {
      const gkp = squad.starting.GKP.map((p: any) => 
        `${p.name}${p.isCaptain ? ' (C)' : p.isViceCaptain ? ' (VC)' : ''} (${p.points * p.multiplier})`
      );
      formation.push(`GKP: ${gkp.join(', ')}`);
    }
    
    if (squad.starting.DEF && squad.starting.DEF.length > 0) {
      const def = squad.starting.DEF.map((p: any) => 
        `${p.name}${p.isCaptain ? ' (C)' : p.isViceCaptain ? ' (VC)' : ''} (${p.points * p.multiplier})`
      );
      formation.push(`DEF: ${def.join(', ')}`);
    }
    
    if (squad.starting.MID && squad.starting.MID.length > 0) {
      const mid = squad.starting.MID.map((p: any) => 
        `${p.name}${p.isCaptain ? ' (C)' : p.isViceCaptain ? ' (VC)' : ''} (${p.points * p.multiplier})`
      );
      formation.push(`MID: ${mid.join(', ')}`);
    }
    
    if (squad.starting.FWD && squad.starting.FWD.length > 0) {
      const fwd = squad.starting.FWD.map((p: any) => 
        `${p.name}${p.isCaptain ? ' (C)' : p.isViceCaptain ? ' (VC)' : ''} (${p.points * p.multiplier})`
      );
      formation.push(`FWD: ${fwd.join(', ')}`);
    }
    
    // Format subs
    if (squad.subs && squad.subs.length > 0) {
      const subs = squad.subs.map((p: any) => `${p.name} (${p.points})`);
      formation.push(`SUBS: ${subs.join(', ')}`);
    }
    
    return formation.join('\n');
  }
  
  // Fallback for unknown format
  return 'Squad data unavailable';
}

export function EnhancedSquadTable({ leagueId, gameweek = 6 }: EnhancedSquadTableProps) {
  const [squadData, setSquadData] = useState<SquadAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'gwPoints' | 'totalPoints'>('rank');
  const [teamCrests, setTeamCrests] = useState<{[teamName: string]: string}>({});
  const [selectedTeam, setSelectedTeam] = useState<{
    name: string;
    manager: string;
    squad?: any;
    gwTotalPoints?: number;
    totalPoints?: number;
    activeChip?: string;
  } | null>(null);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchSquadAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`SQUAD TABLE: Fetching squad analysis for league ${leagueId}, gameweek ${gameweek}`);
        
        // Try to fetch real squad analysis data first
        const response = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
        if (response.ok) {
          const data = await response.json();
          console.log('SQUAD TABLE: Received squad data:', data.analysis?.length, 'teams');
          console.log('SQUAD TABLE: First team sample:', data.analysis?.[0]);
          setSquadData(data.analysis);
          return;
        }
        
        // Fallback to mock data
        const mockData = generateSquadAnalysisData(leagueId, gameweek);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setSquadData(mockData);
      } catch (err) {
        console.error('Error fetching squad analysis:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquadAnalysis();
  }, [leagueId, gameweek]);

  // Fetch team crests
  useEffect(() => {
    const fetchCrests = async () => {
      if (squadData.length === 0) return;
      
      console.log('SQUAD TABLE: Starting crest generation for all teams');
      const teamNames = squadData.map(team => team.team);
      
      try {
        // Try batch generation first
        const response = await fetch('/api/crests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamNames: teamNames
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('SQUAD TABLE: Successfully batch generated crests:', data.crests);
          setTeamCrests(data.crests || {});
        } else {
          console.error('SQUAD TABLE: Batch generation failed, falling back to individual requests');
          // Fallback to individual requests
          const crests: {[teamName: string]: string} = {};
          for (const team of squadData) {
            try {
              const individualResponse = await fetch(`/api/crests?teamName=${encodeURIComponent(team.team)}`);
              if (individualResponse.ok) {
                const individualData = await individualResponse.json();
                if (individualData.crestUrl) {
                  crests[team.team] = individualData.crestUrl;
                }
              }
            } catch (error) {
              console.error(`Error fetching individual crest for ${team.team}:`, error);
            }
          }
          setTeamCrests(crests);
        }
      } catch (error) {
        console.error('SQUAD TABLE: Error in crest generation:', error);
      }
    };

    fetchCrests();
  }, [squadData]);

  const handleTeamClick = (teamName: string, managerName: string) => {
    // Find the team's data from squadData
    const teamData = squadData.find(team => team.team === teamName);
    console.log('SQUAD TABLE: Clicked team:', teamName);
    console.log('SQUAD TABLE: Found team data:', teamData);
    console.log('SQUAD TABLE: Squad structure:', teamData?.squad);
    
    setSelectedTeam({ 
      name: teamName, 
      manager: managerName,
      squad: teamData?.squad,
      gwTotalPoints: teamData?.gwTotalPoints,
      totalPoints: teamData?.totalPoints,
      activeChip: null // Will be fetched from FPL API if needed
    });
  };

  const handleEmailExport = () => {
    // Generate CSV data
    const csvHeaders = ['Rank', 'Team', 'Manager', 'Manager ID', 'GW Points', 'Total Points', 'Performance Analysis'];
    const csvData = sortedData.map(data => [
      data.rank,
      `"${data.team}"`,
      `"${data.manager}"`,
      data.managerId || '',
      data.gwTotalPoints,
      data.totalPoints,
      `"${data.performanceAnalysis.replace(/"/g, '""')}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvData.map(row => row.join(','))].join('\n');

    // Create email body
    const emailSubject = `League ${leagueId} - Gameweek ${gameweek} Analysis`;
    const emailBody = `Hi,

Please find attached the League Analysis for Gameweek ${gameweek}.

League Summary:
- Total Teams: ${squadData.length}
- Gameweek: ${gameweek}
- Generated: ${new Date().toLocaleDateString()}

The analysis includes team rankings, manager details, gameweek points, and performance breakdown.

Best regards,
FPL Ranker Team`;

    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Also download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `league-${leagueId}-gw${gameweek}-analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Open email client
    window.open(mailtoLink);
  };

  const handleNewsletterSubscription = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          leagueId: leagueId,
          gameweek: gameweek
        }),
      });

      if (response.ok) {
        alert('Successfully subscribed! You will receive weekly league analysis updates.');
        setShowNewsletterModal(false);
        setEmail('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const sortedData = [...squadData].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank;
      case 'gwPoints':
        return b.gwTotalPoints - a.gwTotalPoints;
      case 'totalPoints':
        return b.totalPoints - a.totalPoints;
      default:
        return a.rank - b.rank;
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-64"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 mb-4">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <div className="text-xl font-semibold mb-2">Squad Analysis Unavailable</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Squad Analysis - Gameweek {gameweek}
        </h2>
        <p className="text-gray-600">
          Comprehensive squad breakdown with performance analysis
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSortBy('rank')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'rank'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sort by Rank
          </button>
          <button
            onClick={() => setSortBy('gwPoints')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'gwPoints'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sort by GW Points
          </button>
          <button
            onClick={() => setSortBy('totalPoints')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'totalPoints'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sort by Total Points
          </button>
          <button
            onClick={handleEmailExport}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-800 hover:bg-green-200 ml-4 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Get League's GW Analysis
          </button>
          <button
            onClick={() => setShowNewsletterModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2 flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Subscribe to Updates
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Crest</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Team</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Manager</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Manager ID</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">GW Points</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Total Points</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 min-w-80">Squad</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 min-w-64">Performance Analysis</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((data, index) => (
              <tr key={`${data.team}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    data.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {data.rank}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {teamCrests[data.team] ? (
                      <img 
                        src={teamCrests[data.team]} 
                        alt={`${data.team} crest`}
                        className="w-8 h-8 object-contain rounded"
                        onError={(e) => {
                          console.error(`Failed to load crest for ${data.team}`);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">
                          {data.team.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <button
                    onClick={() => handleTeamClick(data.team, data.manager)}
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left max-w-32 truncate transition-colors"
                    title={`View ${data.team}'s squad in pitch view`}
                  >
                    {data.team}
                  </button>
                </td>
                <td className="py-4 px-2">
                  <div className="text-gray-700 max-w-32 truncate">
                    {data.manager}
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="text-gray-600 text-sm font-mono">
                    {data.managerId || '-'}
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-bold text-lg text-green-600">
                    {data.gwTotalPoints}
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-semibold text-gray-700">
                    {data.totalPoints.toLocaleString()}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="text-xs text-gray-800 font-mono leading-relaxed whitespace-pre-line max-w-80">
                    {formatSquadForDisplay(data.squad)}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="text-sm text-gray-700 leading-relaxed max-w-64">
                    {data.performanceAnalysis}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>📊 Analysis includes:</strong> Squad formation breakdown (GKP/DEF/MID/FWD/SUBS), 
          captain performance, top scorers, and overall gameweek assessment based on points thresholds.
          <br />
          <strong>💡 Tip:</strong> Click on any team name to view their squad in pitch view format!
        </p>
      </div>

      {/* Pitch View Modal */}
      {selectedTeam && (
        <PitchView
          teamName={selectedTeam.name}
          managerName={selectedTeam.manager}
          gameweek={gameweek}
          isOpen={true}
          onClose={() => setSelectedTeam(null)}
          squadData={selectedTeam.squad}
          activeChip={selectedTeam.activeChip}
          entryHistory={{
            points: selectedTeam.gwTotalPoints || 0,
            total_points: selectedTeam.totalPoints || 0,
            rank: 0,
            overall_rank: 0
          }}
        />
      )}

      {/* Newsletter Subscription Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Subscribe to League Updates
            </h3>
            <p className="text-gray-600 mb-4">
              Get weekly league analysis summaries sent to your email. Stay updated with team performances, rankings, and insights!
            </p>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewsletterModal(false);
                  setEmail('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubscribing}
              >
                Cancel
              </button>
              <button
                onClick={handleNewsletterSubscription}
                disabled={isSubscribing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateSquadAnalysisData(leagueId: number, gameweek: number): SquadAnalysisData[] {
  const leagueData: Record<number, any> = {
    1001: { // Premier League Fanatics
      teams: [
        { name: "Liverpool Legends", manager: "Mike Johnson", rank: 1, totalPoints: 1234 },
        { name: "Chelsea Champions", manager: "Emma Brown", rank: 2, totalPoints: 1198 },
        { name: "Arsenal Dream Team", manager: "John Smith", rank: 3, totalPoints: 1167 },
        { name: "Manchester United FC", manager: "Sarah Wilson", rank: 4, totalPoints: 1156 },
        { name: "Tottenham Team", manager: "David Davis", rank: 5, totalPoints: 1089 },
        { name: "City Slickers", manager: "Alex Turner", rank: 6, totalPoints: 1045 }
      ]
    },
    1002: { // Office League 2024/25
      teams: [
        { name: "Desk Warriors", manager: "Tom Wilson", rank: 1, totalPoints: 1298 },
        { name: "Arsenal Dream Team", manager: "John Smith", rank: 2, totalPoints: 1167 },
        { name: "Coffee Break FC", manager: "Lisa Chen", rank: 3, totalPoints: 1089 },
        { name: "Monday Morning", manager: "James Miller", rank: 4, totalPoints: 1012 }
      ]
    }
  };

  const league = leagueData[leagueId];
  if (!league) return [];

  return league.teams.map((team: any) => {
    const gwPoints = generateGameweekPoints(team.rank);
    const squad = generateSquadData(team.name);
    const analysis = generatePerformanceAnalysis(gwPoints, team.name);

    return {
      rank: team.rank,
      team: team.name,
      manager: team.manager,
      gwTotalPoints: gwPoints,
      totalPoints: team.totalPoints,
      squad: squad,
      performanceAnalysis: analysis
    };
  });
}

function generateGameweekPoints(rank: number): number {
  // Better ranks typically get better points, but with some variance
  const basePoints = Math.max(30, 85 - (rank * 8) + Math.floor(Math.random() * 25));
  return basePoints;
}

function generateSquadData(teamName: string): string {
  const players = [
    // Goalkeepers
    ['Alisson', 'Raya', 'Pickford', 'Pope', 'Onana'],
    // Defenders  
    ['Saliba', 'van Dijk', 'Dias', 'Walker', 'Robertson', 'Trippier', 'Dalot', 'Konsa'],
    // Midfielders
    ['Salah', 'Son', 'Palmer', 'Saka', 'Bruno Fernandes', 'Odegaard', 'Maddison', 'Bowen'],
    // Forwards
    ['Haaland', 'Isak', 'Solanke', 'Watkins', 'Cunha', 'Wood']
  ];

  const positions = ['GKP', 'DEF', 'MID', 'FWD'];
  const formation = [1, 4, 4, 2]; // 1 GKP, 4 DEF, 4 MID, 2 FWD starting
  const benchSizes = [1, 1, 1, 1]; // 1 of each position on bench

  let squad = [];
  let captainAssigned = false;
  let vcAssigned = false;

  // Generate starting XI
  positions.forEach((pos, posIndex) => {
    const positionPlayers = [];
    const playerPool = [...players[posIndex]];
    
    for (let i = 0; i < formation[posIndex]; i++) {
      const randomIndex = Math.floor(Math.random() * playerPool.length);
      const player = playerPool.splice(randomIndex, 1)[0];
      const points = Math.floor(Math.random() * 12) + 1;
      
      let designation = '';
      if (!captainAssigned && Math.random() > 0.7) {
        designation = ' (C)';
        captainAssigned = true;
      } else if (!vcAssigned && captainAssigned && Math.random() > 0.6) {
        designation = ' (VC)';
        vcAssigned = true;
      }
      
      positionPlayers.push(`${player}${designation} (${points})`);
    }
    
    if (positionPlayers.length > 0) {
      squad.push(`${pos}: ${positionPlayers.join(', ')}`);
    }
  });

  // Generate subs
  const subs = [];
  positions.forEach((pos, posIndex) => {
    const playerPool = [...players[posIndex]];
    for (let i = 0; i < benchSizes[posIndex]; i++) {
      const randomIndex = Math.floor(Math.random() * playerPool.length);
      const player = playerPool.splice(randomIndex, 1)[0];
      const points = Math.floor(Math.random() * 6); // Lower points for subs
      subs.push(`${player} (${points})`);
    }
  });

  if (subs.length > 0) {
    squad.push(`SUBS: ${subs.join(', ')}`);
  }

  return squad.join('\n');
}

function generatePerformanceAnalysis(gwPoints: number, teamName: string): string {
  const analyses = [];
  
  // Captain analysis
  const captainPoints = Math.floor(Math.random() * 16) + 4; // 4-20 points
  if (captainPoints > 12) {
    analyses.push(`Captain delivered excellently (${captainPoints} points)!`);
  } else if (captainPoints > 6) {
    analyses.push(`Captain contributed solidly (${captainPoints} points).`);
  } else {
    analyses.push(`Captain underperformed (${captainPoints} points).`);
  }

  // Supporting players
  const topScorer = Math.floor(Math.random() * 10) + 6;
  if (topScorer > 8) {
    const playerNames = ['Salah', 'Haaland', 'Palmer', 'Saka', 'Son'];
    const player = playerNames[Math.floor(Math.random() * playerNames.length)];
    analyses.push(`Supported by ${player} (${topScorer} points).`);
  } else {
    analyses.push('Other players had quiet performances.');
  }

  // Overall assessment
  if (gwPoints >= 70) {
    analyses.push('Outstanding gameweek overall!');
  } else if (gwPoints >= 55) {
    analyses.push('Solid points haul this week.');
  } else if (gwPoints >= 40) {
    analyses.push('Average performance, room for improvement.');
  } else {
    analyses.push('Difficult week, better luck next time.');
  }

  return analyses.join(' ');
}