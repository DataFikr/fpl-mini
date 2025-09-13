'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameweekData } from '@/types/fpl';

interface RankProgressionChartProps {
  leagueId: number;
  userTeamId?: number;
}

interface TeamData {
  teamId: number;
  teamName: string;
  managerName: string;
  gameweekData: GameweekData[];
  crestUrl?: string;
  color: string;
}

interface BumpChartPoint {
  gameweek: number;
  rank: number;
  teamId: number;
  teamName: string;
  crestUrl?: string;
}

const TEAM_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#10b981', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#8b5a2b', '#7c3aed', '#dc2626', '#059669',
  '#2563eb', '#d97706', '#c2410c', '#7c2d12', '#991b1b'
];

export function RankProgressionChart({ leagueId, userTeamId }: RankProgressionChartProps) {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [gameweeks, setGameweeks] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxRank, setMaxRank] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    teamName: string;
    managerName: string;
    gameweek: number;
    rank: number;
    points: number;
    totalPoints: number;
    crestUrl?: string;
  } | null>(null);

  const handleTeamClick = useCallback((teamId: number) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);
  }, [selectedTeam]);

  const getTeamRankForGameweek = (team: TeamData, gameweek: number): number | null => {
    const gwData = team.gameweekData.find(gw => gw.gameweek === gameweek);
    return gwData ? gwData.rank : null;
  };

  useEffect(() => {
    const fetchProgressionData = async () => {
      try {
        console.log('CHART DEBUG: RankProgressionChart component starting data fetch for league:', leagueId);
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/leagues/${leagueId}?action=progression`);
        if (!response.ok) {
          throw new Error('Failed to fetch progression data');
        }
        
        const { progression } = await response.json();
        
        const teamNamesArray = Object.keys(progression);
        const processedTeams: TeamData[] = [];
        const gameweekSet = new Set<number>();
        let currentMaxRank = 0;
        
        // Batch generate crests for all teams first
        console.log('CREST DEBUG: Starting batch generation for teams:', teamNamesArray);
        let teamCrests: Record<string, string> = {};
        try {
          const requestBody = {
            teamNames: teamNamesArray
          };
          console.log('CREST DEBUG: Request body:', requestBody);
          
          const crestResponse = await fetch('/api/crests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });
          
          console.log('CREST DEBUG: Response status:', crestResponse.status);
          
          if (crestResponse.ok) {
            const crestData = await crestResponse.json();
            teamCrests = crestData.crests || {};
            console.log('CREST DEBUG: Successfully generated crests:', teamCrests);
            console.log(`CREST DEBUG: Generated ${Object.keys(teamCrests).length} team crests`);
          } else {
            console.error('CREST DEBUG: Batch crest generation failed:', crestResponse.status, crestResponse.statusText);
            const errorText = await crestResponse.text();
            console.error('CREST DEBUG: Error response:', errorText);
          }
        } catch (error) {
          console.error('CREST DEBUG: Error batch generating crests:', error);
        }

        // Process each team and assign crests
        for (let i = 0; i < teamNamesArray.length; i++) {
          const teamName = teamNamesArray[i];
          const teamData: GameweekData[] = progression[teamName];
          
          // Get team ID from first gameweek data (assuming it's available)
          const teamId = teamData[0]?.teamId || i + 1;
          
          // Get crest from batch generation result, or fallback to individual generation
          let crestUrl = teamCrests[teamName];
          
          // Fallback to individual crest generation if batch failed
          if (!crestUrl) {
            try {
              const individualCrestResponse = await fetch(`/api/crests?teamName=${encodeURIComponent(teamName)}&teamId=${teamId}`);
              if (individualCrestResponse.ok) {
                const individualCrestData = await individualCrestResponse.json();
                crestUrl = individualCrestData.crestUrl;
              }
            } catch (error) {
              console.error(`Error fetching individual crest for ${teamName}:`, error);
            }
          }
          
          teamData.forEach(gw => {
            gameweekSet.add(gw.gameweek);
            currentMaxRank = Math.max(currentMaxRank, gw.rank);
          });
          
          processedTeams.push({
            teamId,
            teamName,
            managerName: teamData[0]?.managerName || '',
            gameweekData: teamData,
            crestUrl,
            color: TEAM_COLORS[i % TEAM_COLORS.length]
          });
        }
        
        // Sort teams by current rank (last gameweek position) - show all teams
        const latestGameweek = Math.max(...Array.from(gameweekSet));
        const sortedTeams = processedTeams
          .sort((a, b) => {
            const aLatest = a.gameweekData.find(gw => gw.gameweek === latestGameweek)?.rank || 999;
            const bLatest = b.gameweekData.find(gw => gw.gameweek === latestGameweek)?.rank || 999;
            return aLatest - bLatest;
          });
        
        setTeams(sortedTeams);
        setGameweeks(Array.from(gameweekSet).sort((a, b) => a - b));
        setMaxRank(currentMaxRank);
        
        // Debug logging for line visibility issue
        const availableGameweeks = Array.from(gameweekSet).sort((a, b) => a - b);
        console.log('CHART DEBUG: Gameweeks available:', availableGameweeks);
        console.log('CHART DEBUG: Number of gameweeks:', availableGameweeks.length);
        console.log('CHART DEBUG: First team data points:', sortedTeams[0]?.gameweekData?.length || 0);
        if (sortedTeams[0]) {
          console.log('CHART DEBUG: First team gameweeks:', sortedTeams[0].gameweekData.map(gw => gw.gameweek));
        }
        
        // Set default selected team to user's team if provided
        if (userTeamId && sortedTeams.find(t => t.teamId === userTeamId)) {
          setSelectedTeam(userTeamId);
        } else if (sortedTeams.length > 0) {
          // Default to first team (current leader)
          setSelectedTeam(sortedTeams[0].teamId);
        }
        
      } catch (err) {
        console.error('Error fetching progression data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressionData();
  }, [leagueId, userTeamId]);

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#37003C',
        borderRadius: '1.25rem',
        padding: '2rem',
        color: '#FFFFFF',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ animation: 'pulse 2s infinite' }}>
          <div style={{ 
            height: '1.5rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '0.25rem', 
            marginBottom: '1rem', 
            width: '12rem' 
          }}></div>
          <div style={{ 
            height: '16rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '0.5rem' 
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#37003C',
        borderRadius: '1.25rem',
        padding: '2rem',
        color: '#FFFFFF',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{ color: '#E90052', marginBottom: '1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Chart Data Unavailable</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (teams.length === 0 || gameweeks.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#FFFFFF',
        borderRadius: '0.5rem',
        padding: '2rem',
        color: '#1f2937',
        border: '1px solid #E1E5E9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>No Progression Data</div>
          <div style={{ color: '#6b7280' }}>
            Gameweek progression data is not yet available for this league.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      gap: '2rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '0.5rem',
      padding: '2rem',
      border: '1px solid #E1E5E9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Main Chart Area */}
      <div style={{ flex: '1' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '0.5rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              League Table Progression
            </h2>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              margin: 0
            }}>
              Track position changes across gameweeks
            </p>
          </div>
          
          {/* Team Selector Dropdown - Top Right */}
          <div>
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value ? parseInt(e.target.value) : null)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#374151',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                minWidth: '180px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <option value="">All teams</option>
              {teams.map((team) => {
                const latestRank = team.gameweekData[team.gameweekData.length - 1]?.rank || 0;
                return (
                  <option key={team.teamId} value={team.teamId}>
                    #{latestRank} {team.teamName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      
        {/* SVG Chart Container */}
        <div style={{ 
          position: 'relative',
          height: `${Math.max(400, Math.min(600, maxRank * 10 + 100))}px`, // Dynamic height with reasonable limits
          backgroundColor: '#FFFFFF',
          borderRadius: '0.375rem',
          border: '1px solid #E5E7EB'
        }}>
          {/* Chart SVG */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 1000 ${Math.max(400, Math.min(600, maxRank * 10 + 100))}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F3F4F6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Horizontal rank lines */}
            {Array.from({ length: maxRank }, (_, i) => i + 1).map(rank => {
              const chartHeight = Math.max(400, Math.min(600, maxRank * 10 + 100));
              const availableHeight = chartHeight - 90; // 45px top + 45px bottom margins
              const yPos = ((rank - 1) / (maxRank - 1)) * availableHeight + 45;
              
              return (
                <line
                  key={rank}
                  x1="60"
                  y1={yPos}
                  x2="950"
                  y2={yPos}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  opacity="0.7"
                />
              );
            })}
            
            {/* Vertical gameweek lines */}
            {gameweeks.map((gw, gwIndex) => {
              const chartHeight = Math.max(400, Math.min(600, maxRank * 10 + 100));
              return (
                <line
                  key={gw}
                  x1={60 + (gwIndex / (gameweeks.length - 1)) * 890}
                  y1="45"
                  x2={60 + (gwIndex / (gameweeks.length - 1)) * 890}
                  y2={chartHeight - 45}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}
            
            {/* Gameweek labels */}
            {gameweeks.map((gw, gwIndex) => (
              <text
                key={`gw-${gw}`}
                x={60 + (gwIndex / (gameweeks.length - 1)) * 890}
                y="36"
                textAnchor="middle"
                fontSize="12"
                fill="#6B7280"
                fontWeight="500"
              >
                GW {gw}
              </text>
            ))}
            
            {/* Y-axis Title */}
            <text
              x="15"
              y={Math.max(400, Math.min(600, maxRank * 10 + 100)) / 2}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
              fontWeight="600"
              transform={`rotate(-90, 15, ${Math.max(400, Math.min(600, maxRank * 10 + 100)) / 2})`}
              dominantBaseline="middle"
            >
              Table Position
            </text>
            
            {/* Rank labels - Show ALL teams with smart spacing */}
            {Array.from({ length: maxRank }, (_, i) => i + 1)
              .filter((rank, index) => {
                // For large leagues, show every nth rank to avoid overcrowding
                if (maxRank <= 20) return true; // Show all for small leagues
                if (maxRank <= 50) return index % 2 === 0; // Show every 2nd for medium leagues  
                return index % 5 === 0 || rank === maxRank; // Show every 5th for large leagues, plus last
              })
              .map(rank => {
                const chartHeight = Math.max(400, Math.min(600, maxRank * 10 + 100));
                const availableHeight = chartHeight - 90;
                const yPos = ((rank - 1) / (maxRank - 1)) * availableHeight + 45;
                
                return (
                  <text
                    key={`rank-${rank}`}
                    x="45"
                    y={yPos}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6B7280"
                    dominantBaseline="middle"
                  >
                    {rank}
                  </text>
                );
              })}
            
            {/* Team progression lines - Show ALL teams */}
            {teams.map((team) => {
              const isSelected = selectedTeam === team.teamId;
              const isAnySelected = selectedTeam !== null;
              const opacity = !isAnySelected ? 1.0 : isSelected ? 1.0 : 0.8; // Full opacity for better visibility
              const strokeColor = isSelected ? '#3B82F6' : team.color;
              const strokeWidth = isSelected ? 5 : 4; // Even thicker lines
              
              const points: { x: number; y: number; gameweek: number; rank: number }[] = [];
              
              gameweeks.forEach((gw, gwIndex) => {
                const rank = getTeamRankForGameweek(team, gw);
                if (rank !== null) {
                  // Calculate absolute coordinates within viewBox
                  const chartHeight = Math.max(400, Math.min(600, maxRank * 10 + 100));
                  const availableHeight = chartHeight - 90;
                  const x = 60 + (gwIndex / (gameweeks.length - 1)) * 890;
                  const y = ((rank - 1) / (maxRank - 1)) * availableHeight + 45;
                  points.push({
                    x: x,
                    y: y,
                    gameweek: gw,
                    rank
                  });
                }
              });
              
              if (points.length < 1) return null;
              
              // Debug logging for line visibility
              console.log(`CHART DEBUG - ${team.teamName}: ${points.length} points available`);
              points.forEach((p, i) => console.log(`  Point ${i}: GW${p.gameweek} at (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`));
              
              return (
                <g key={team.teamId}>
                  {/* Render connecting lines ONLY for selected team */}
                  {isSelected && points.length > 1 && points.map((point, index) => {
                    if (index === 0) return null; // Skip first point as it has no previous point to connect to
                    
                    const prevPoint = points[index - 1];
                    const pathData = `M ${prevPoint.x} ${prevPoint.y} L ${point.x} ${point.y}`;
                    
                    console.log(`CHART DEBUG - ${team.teamName} line ${index}: ${pathData}`);
                    
                    return (
                      <path
                        key={`line-${team.teamId}-${index}`}
                        d={pathData}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        opacity={1.0}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ 
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleTeamClick(team.teamId)}
                      />
                    );
                  })}
                  
                  {/* Data points - Show for all teams */}
                  {points.map((point, pointIndex) => {
                    const gameweekData = team.gameweekData.find(gw => gw.gameweek === point.gameweek);
                    
                    return (
                      <circle
                        key={`${team.teamId}-${point.gameweek}`}
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? "6" : "4"}
                        fill={isSelected ? '#3B82F6' : team.color}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        opacity={opacity}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTeamClick(team.teamId)}
                        onMouseEnter={(e) => {
                          const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                          if (svgRect && gameweekData) {
                            const svgX = point.x / 1000 * svgRect.width;
                            const svgY = point.y / 600 * svgRect.height;
                            setHoveredPoint({
                              x: svgRect.left + svgX,
                              y: svgRect.top + svgY,
                              teamName: team.teamName,
                              managerName: gameweekData.playerName || team.managerName,
                              gameweek: point.gameweek,
                              rank: point.rank,
                              points: gameweekData.points || 0,
                              totalPoints: gameweekData.totalPoints || 0,
                              crestUrl: team.crestUrl
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Hover Tooltip Modal */}
      {hoveredPoint && (
        <div
          style={{
            position: 'fixed',
            left: hoveredPoint.x + 10,
            top: hoveredPoint.y - 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '220px',
            transform: 'translateY(-100%)',
            pointerEvents: 'none'
          }}
        >
          {/* Header with team name and crest */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            {hoveredPoint.crestUrl && (
              <img
                src={hoveredPoint.crestUrl}
                alt={hoveredPoint.teamName}
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  flexShrink: 0
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.125rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {hoveredPoint.teamName}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {hoveredPoint.managerName}
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6B7280' }}>Gameweek:</span>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>GW {hoveredPoint.gameweek}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6B7280' }}>Rank:</span>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>#{hoveredPoint.rank}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginBottom: '0.25rem'
            }}>
              <span style={{ color: '#6B7280' }}>GW Points:</span>
              <span style={{ fontWeight: '600', color: '#3B82F6' }}>{hoveredPoint.points}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: '#6B7280' }}>Total Points:</span>
              <span style={{ fontWeight: '600', color: '#059669' }}>{hoveredPoint.totalPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Right Sidebar - Current Standings Integrated */}
      <div style={{ width: '350px' }}>
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '0.375rem',
          border: '1px solid #E5E7EB',
          height: '100%',
          minHeight: `${Math.max(400, Math.min(600, maxRank * 10 + 100))}px` // Match main chart height
        }}>
          {/* Standings Header */}
          <div style={{ 
            padding: '1rem',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1F2937',
              margin: 0,
              marginBottom: '0.25rem'
            }}>League Table</h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              margin: 0
            }}>Current standings • GW {gameweeks[gameweeks.length - 1] || 2}</p>
          </div>
          
          {/* Scrollable Team List with Full Info */}
          <div style={{ 
            maxHeight: 'calc(100% - 85px)',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {teams
              .sort((a, b) => {
                const aRank = a.gameweekData[a.gameweekData.length - 1]?.rank || 999;
                const bRank = b.gameweekData[b.gameweekData.length - 1]?.rank || 999;
                return aRank - bRank;
              })
              .map((team, index) => {
              const isSelectedTeam = selectedTeam === team.teamId;
              const currentRank = team.gameweekData[team.gameweekData.length - 1]?.rank || index + 1;
              const totalPoints = team.gameweekData[team.gameweekData.length - 1]?.totalPoints || 0;
              
              // Get rank change from FPL API data (last_rank - rank_sort)
              const latestGameweekData = team.gameweekData[team.gameweekData.length - 1];
              const rankChange = latestGameweekData?.movementFromLastWeek || 0;
              
              return (
                <button
                  key={team.teamId}
                  onClick={() => handleTeamClick(team.teamId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.75rem',
                    margin: '0.125rem 0',
                    borderRadius: '0.375rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    backgroundColor: isSelectedTeam 
                      ? '#EBF8FF' 
                      : '#FFFFFF',
                    border: isSelectedTeam 
                      ? '2px solid #3B82F6' 
                      : '1px solid #E5E7EB',
                    cursor: 'pointer',
                    boxShadow: isSelectedTeam 
                      ? '0 2px 8px rgba(59, 130, 246, 0.15)' 
                      : '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelectedTeam) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelectedTeam) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Position with Medal */}
                  <div style={{
                    minWidth: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    background: currentRank <= 3 
                      ? currentRank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                      : currentRank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)'
                      : 'linear-gradient(135deg, #CD7F32, #A0522D)'
                      : '#6B7280',
                    color: '#FFFFFF',
                    marginRight: '0.75rem',
                    boxShadow: currentRank <= 3 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                  }}>
                    {currentRank <= 3 
                      ? currentRank === 1 ? '🥇' : currentRank === 2 ? '🥈' : '🥉'
                      : currentRank
                    }
                  </div>
                  
                  {/* Rank Change Arrow */}
                  <div style={{
                    minWidth: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem'
                  }}>
                    {rankChange > 0 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column'
                      }}>
                        <span>↗️</span>
                        <span style={{ fontSize: '0.625rem' }}>+{rankChange}</span>
                      </div>
                    )}
                    {rankChange < 0 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column'
                      }}>
                        <span>↘️</span>
                        <span style={{ fontSize: '0.625rem' }}>{rankChange}</span>
                      </div>
                    )}
                    {rankChange === 0 && (
                      <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>➖</span>
                    )}
                  </div>
                  
                  {/* Team Crest */}
                  {team.crestUrl && (
                    <img
                      src={team.crestUrl}
                      alt={team.teamName}
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        marginRight: '0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Team Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: isSelectedTeam ? '#3B82F6' : '#1F2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '0.125rem'
                    }}>
                      {team.teamName}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {/* Use player_name from gameweek data if available, fallback to managerName */}
                      {(() => {
                        const latestGameweekData = team.gameweekData[team.gameweekData.length - 1];
                        return latestGameweekData?.playerName || team.managerName;
                      })()}
                    </div>
                  </div>
                  
                  {/* Total Points */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    minWidth: '3rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#1F2937'
                    }}>
                      {totalPoints.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      PTS
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}