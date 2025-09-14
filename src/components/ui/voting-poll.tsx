'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Vote } from 'lucide-react';

interface VoteOption {
  teamId: number;
  teamName: string;
  managerName: string;
  crestUrl?: string;
  votes: number;
}

interface VotingPollProps {
  leagueId: number;
  teams?: any[];
  gameweek?: number;
}

export function VotingPoll({ leagueId, teams = [], gameweek = 4 }: VotingPollProps) {
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize voting data
    const initializeVoting = () => {
      setIsLoading(true);
      
      // Take top 8 teams for voting
      const topTeams = teams
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 8)
        .map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          managerName: team.managerName,
          crestUrl: team.crestUrl,
          votes: Math.floor(Math.random() * 50) + 5 // Simulated votes
        }));

      setVoteOptions(topTeams);
      
      // Calculate total votes
      const total = topTeams.reduce((sum, option) => sum + option.votes, 0);
      setTotalVotes(total);
      
      // Check if user has voted (simulate with localStorage)
      const existingVote = localStorage.getItem(`poll_vote_${leagueId}_gw${gameweek}`);
      if (existingVote) {
        setUserVote(parseInt(existingVote));
        setHasVoted(true);
      }
      
      setIsLoading(false);
    };

    if (teams.length > 0) {
      initializeVoting();
    }
  }, [leagueId, teams, gameweek]);

  const handleVote = (teamId: number) => {
    if (hasVoted) return;

    // Update votes
    setVoteOptions(prev => 
      prev.map(option => 
        option.teamId === teamId 
          ? { ...option, votes: option.votes + 1 }
          : option
      )
    );
    
    setTotalVotes(prev => prev + 1);
    setUserVote(teamId);
    setHasVoted(true);
    
    // Save vote to localStorage
    localStorage.setItem(`poll_vote_${leagueId}_gw${gameweek}`, teamId.toString());
  };

  const getVotePercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 25) return '#10B981'; // Green for high
    if (percentage >= 15) return '#F59E0B'; // Amber for medium
    if (percentage >= 10) return '#6366F1'; // Indigo for low-medium
    return '#9CA3AF'; // Gray for low
  };

  if (isLoading || voteOptions.length === 0) {
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
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '0.75rem',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            width: '12rem',
            height: '1.5rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '0.25rem',
            animation: 'pulse 2s infinite'
          }} />
        </div>
        <div style={{ space: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '3rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
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
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          color: '#FFFFFF',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          <Vote className="h-6 w-6" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1F2937',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Community Poll
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            margin: 0
          }}>
            Who will score the most points in Gameweek {gameweek}?
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#F3F4F6',
          padding: '0.5rem 1rem',
          borderRadius: '0.75rem'
        }}>
          <Users className="h-4 w-4 text-gray-500" />
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            {totalVotes} votes
          </span>
        </div>
      </div>

      {/* Voting Options */}
      <div style={{ marginBottom: '1.5rem' }}>
        {voteOptions
          .sort((a, b) => b.votes - a.votes)
          .map((option, index) => {
          const percentage = getVotePercentage(option.votes);
          const barColor = getBarColor(percentage);
          const isUserVote = userVote === option.teamId;
          
          return (
            <button
              key={option.teamId}
              onClick={() => handleVote(option.teamId)}
              disabled={hasVoted}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                marginBottom: '0.75rem',
                borderRadius: '0.75rem',
                border: isUserVote ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                backgroundColor: isUserVote ? '#EBF8FF' : hasVoted ? '#F9FAFB' : '#FFFFFF',
                cursor: hasVoted ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, ${barColor}15 0%, ${barColor}15 ${percentage}%, transparent ${percentage}%)`,
                  borderRadius: '0.75rem'
                }} />
              )}

              {/* Rank Badge */}
              <div style={{
                minWidth: '2rem',
                height: '2rem',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                background: index < 3 
                  ? index === 0 ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                  : index === 1 ? 'linear-gradient(135deg, #6B7280, #4B5563)'
                  : 'linear-gradient(135deg, #CD7F32, #A0522D)'
                  : '#9CA3AF',
                color: '#FFFFFF',
                marginRight: '1rem',
                zIndex: 1,
                position: 'relative'
              }}>
                {index + 1}
              </div>

              {/* Team Crest */}
              {option.crestUrl && (
                <img
                  src={option.crestUrl}
                  alt={`${option.teamName} crest`}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    marginRight: '1rem',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E5E7EB',
                    zIndex: 1,
                    position: 'relative'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}

              {/* Team Info */}
              <div style={{ 
                flex: 1, 
                minWidth: 0,
                zIndex: 1,
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: isUserVote ? '#3B82F6' : '#1F2937',
                  marginBottom: '0.125rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {option.teamName}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {option.managerName}
                </div>
              </div>

              {/* Vote Count and Percentage */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                minWidth: '4rem',
                zIndex: 1,
                position: 'relative'
              }}>
                {hasVoted && (
                  <>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: barColor
                    }}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>
                      {option.votes} votes
                    </div>
                  </>
                )}
                {!hasVoted && (
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <TrendingUp className="h-3 w-3" />
                    Vote
                  </div>
                )}
                {isUserVote && (
                  <div style={{
                    fontSize: '0.625rem',
                    color: '#3B82F6',
                    fontWeight: '600',
                    marginTop: '0.125rem'
                  }}>
                    YOUR PICK
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Poll Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: hasVoted ? '#F0FDF4' : '#FFF7ED',
        borderRadius: '0.5rem',
        border: `1px solid ${hasVoted ? '#BBF7D0' : '#FED7AA'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <BarChart3 className="h-4 w-4" style={{ color: hasVoted ? '#10B981' : '#F59E0B' }} />
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: hasVoted ? '#065F46' : '#92400E'
          }}>
            {hasVoted ? 'Thanks for voting!' : 'Cast your vote above'}
          </span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#6B7280'
        }}>
          Poll closes at GW{gameweek} deadline
        </div>
      </div>
    </div>
  );
}