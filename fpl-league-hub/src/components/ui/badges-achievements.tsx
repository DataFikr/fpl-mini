'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Shield, Crown, Award, TrendingUp } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  teamName?: string;
  managerName?: string;
  points?: number;
  achieved: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  icon: React.ReactNode;
  color: string;
}

interface BadgesAchievementsProps {
  leagueId: number;
  gameweek?: number;
  teams?: any[];
}

export function BadgesAchievements({ leagueId, gameweek = 2, teams = [] }: BadgesAchievementsProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateBadgesAndMilestones = async () => {
      try {
        setIsLoading(true);
        
        // Fetch squad analysis data
        const squadResponse = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
        const squadData = squadResponse.ok ? await squadResponse.json() : null;

        const achievedBadges: Badge[] = [];
        const currentMilestones: Milestone[] = [];

        if (squadData?.analysis && teams.length > 0) {
          // Hat-Trick Hero - Player in team scores a hat-trick
          const hatTrickHero = squadData.analysis.find((team: any) => {
            // Check if any player scored 18+ points (likely hat-trick)
            const highScorer = team.players?.find((p: any) => p.points >= 18);
            return highScorer;
          });

          if (hatTrickHero) {
            achievedBadges.push({
              id: 'hat-trick-hero',
              name: 'Hat-Trick Hero',
              description: `A player in ${hatTrickHero.teamName} scored a magnificent hat-trick!`,
              icon: <Target className="h-6 w-6" />,
              color: '#F59E0B',
              bgColor: '#FFFBEB',
              borderColor: '#F59E0B',
              rarity: 'epic',
              teamName: hatTrickHero.teamName,
              managerName: hatTrickHero.managerName,
              achieved: true
            });
          }

          // 100 Club - Scores 100+ points in a GW
          const centurion = squadData.analysis.find((team: any) => team.totalPoints >= 100);
          if (centurion) {
            achievedBadges.push({
              id: '100-club',
              name: '100 Club',
              description: `${centurion.teamName} smashed the century barrier with ${centurion.totalPoints} points!`,
              icon: <Crown className="h-6 w-6" />,
              color: '#8B5CF6',
              bgColor: '#F3E8FF',
              borderColor: '#8B5CF6',
              rarity: 'legendary',
              teamName: centurion.teamName,
              managerName: centurion.managerName,
              points: centurion.totalPoints,
              achieved: true
            });
          }

          // Captain Fantastic - Captain scores 20+ points
          const captainFantastic = squadData.analysis.find((team: any) => 
            team.captainInfo?.points >= 20
          );
          if (captainFantastic) {
            achievedBadges.push({
              id: 'captain-fantastic',
              name: 'Captain Fantastic',
              description: `${captainFantastic.captainInfo.name} delivered ${captainFantastic.captainInfo.points} points for ${captainFantastic.teamName}!`,
              icon: <Star className="h-6 w-6" />,
              color: '#10B981',
              bgColor: '#ECFDF5',
              borderColor: '#10B981',
              rarity: 'rare',
              teamName: captainFantastic.teamName,
              managerName: captainFantastic.managerName,
              points: captainFantastic.captainInfo.points,
              achieved: true
            });
          }

          // Bench Warmer - 25+ points on bench
          const benchWarmer = squadData.analysis.find((team: any) => team.benchPoints >= 25);
          if (benchWarmer) {
            achievedBadges.push({
              id: 'bench-warmer',
              name: 'Bench Warmer',
              description: `${benchWarmer.teamName} left ${benchWarmer.benchPoints} points on the bench. Ouch!`,
              icon: <Shield className="h-6 w-6" />,
              color: '#EF4444',
              bgColor: '#FEF2F2',
              borderColor: '#EF4444',
              rarity: 'common',
              teamName: benchWarmer.teamName,
              managerName: benchWarmer.managerName,
              points: benchWarmer.benchPoints,
              achieved: true
            });
          }

          // Giant Killer - Lower ranked team beats higher ranked
          if (teams.length > 1) {
            const sortedByRank = [...teams].sort((a, b) => a.rank - b.rank);
            const sortedByPoints = [...teams].sort((a, b) => b.points - a.points);
            
            // Find a team that's ranked low but scored high this week
            const giantKiller = sortedByRank.slice(10).find(team => 
              sortedByPoints.indexOf(team) < 5
            );
            
            if (giantKiller) {
              achievedBadges.push({
                id: 'giant-killer',
                name: 'Giant Killer',
                description: `${giantKiller.teamName} defied the odds with a massive gameweek performance!`,
                icon: <Zap className="h-6 w-6" />,
                color: '#06B6D4',
                bgColor: '#ECFEFF',
                borderColor: '#06B6D4',
                rarity: 'epic',
                teamName: giantKiller.teamName,
                managerName: giantKiller.managerName,
                achieved: true
              });
            }
          }
        }

        // Add some default badges if we don't have enough
        const defaultBadges: Badge[] = [
          {
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Made transfers before the deadline',
            icon: <TrendingUp className="h-6 w-6" />,
            color: '#6B7280',
            bgColor: '#F9FAFB',
            borderColor: '#D1D5DB',
            rarity: 'common',
            achieved: false
          },
          {
            id: 'chip-gambler',
            name: 'Chip Gambler',
            description: 'Uses Bench Boost, Triple Captain, or Wildcard',
            icon: <Award className="h-6 w-6" />,
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#F59E0B',
            rarity: 'rare',
            achieved: false
          }
        ];

        setBadges([...achievedBadges, ...defaultBadges.slice(0, 6 - achievedBadges.length)]);

        // Generate milestones
        const leagueMilestones: Milestone[] = [
          {
            id: 'first-century',
            title: 'First Century',
            description: 'Score 100+ points in a single gameweek',
            progress: Math.max(...(squadData?.analysis?.map((t: any) => t.totalPoints) || [0])),
            maxProgress: 100,
            reward: 'Legendary Badge',
            icon: <Trophy className="h-6 w-6" />,
            color: '#F59E0B'
          },
          {
            id: 'consistency-king',
            title: 'Consistency King',
            description: 'Score 70+ points for 3 consecutive gameweeks',
            progress: 1, // Simulated progress
            maxProgress: 3,
            reward: 'Epic Badge',
            icon: <Crown className="h-6 w-6" />,
            color: '#8B5CF6'
          },
          {
            id: 'transfer-master',
            title: 'Transfer Master',
            description: 'Make 5 successful transfers (each gains 10+ points)',
            progress: 2, // Simulated progress
            maxProgress: 5,
            reward: 'Rare Badge',
            icon: <Star className="h-6 w-6" />,
            color: '#10B981'
          }
        ];

        setMilestones(leagueMilestones);
      } catch (error) {
        console.error('Error generating badges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateBadgesAndMilestones();
  }, [leagueId, gameweek, teams]);

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return { 
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        };
      case 'epic':
        return { 
          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        };
      case 'rare':
        return { 
          background: 'linear-gradient(135deg, #10B981, #059669)',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        };
      default:
        return { 
          background: 'linear-gradient(135deg, #6B7280, #4B5563)',
          boxShadow: '0 2px 8px rgba(107, 114, 128, 0.2)'
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '0.75rem',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            width: '12rem',
            height: '2rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '0.5rem',
            animation: 'pulse 2s infinite'
          }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '6rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.75rem',
              animation: 'pulse 2s infinite'
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#FFFFFF',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          🏆
        </div>
        <div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#1F2937',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Badges & Achievements
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            margin: 0
          }}>
            Gamified milestones and epic moments from GW {gameweek}
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Recent Achievements
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {badges.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              style={{
                backgroundColor: badge.achieved ? badge.bgColor : '#F9FAFB',
                border: `2px solid ${badge.achieved ? badge.borderColor : '#E5E7EB'}`,
                borderRadius: '0.75rem',
                padding: '1.25rem',
                position: 'relative',
                opacity: badge.achieved ? 1 : 0.6,
                transition: 'all 0.2s ease',
                cursor: badge.achieved ? 'pointer' : 'default'
              }}
              onMouseOver={(e) => {
                if (badge.achieved) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (badge.achieved) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Rarity Indicator */}
              {badge.achieved && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '1rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  ...getRarityStyle(badge.rarity)
                }}>
                  {badge.rarity}
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{
                  color: badge.color,
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  {badge.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#1F2937',
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>
                    {badge.name}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {badge.description}
                  </p>
                  {badge.teamName && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: badge.color
                    }}>
                      {badge.teamName} • {badge.managerName}
                      {badge.points && ` • ${badge.points} pts`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Active Milestones
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {milestones.map((milestone) => {
            const progressPercent = Math.min((milestone.progress / milestone.maxProgress) * 100, 100);
            
            return (
              <div
                key={milestone.id}
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  padding: '1.25rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ color: milestone.color }}>
                    {milestone.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1F2937',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {milestone.title}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      margin: 0
                    }}>
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  backgroundColor: '#E5E7EB',
                  borderRadius: '999px',
                  height: '0.5rem',
                  overflow: 'hidden',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    backgroundColor: milestone.color,
                    height: '100%',
                    width: `${progressPercent}%`,
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6B7280'
                  }}>
                    {milestone.progress} / {milestone.maxProgress}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: milestone.color
                  }}>
                    {milestone.reward}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}