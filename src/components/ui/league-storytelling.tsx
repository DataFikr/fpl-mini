'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Crown, Target, AlertTriangle, Zap, Users } from 'lucide-react';

// Helper functions for story type mapping
const getIconForStoryType = (type: string) => {
  switch (type) {
    case 'breakthrough': return <Crown className="h-6 w-6" />;
    case 'masterstroke': return <Target className="h-6 w-6" />;
    case 'disaster': return <AlertTriangle className="h-6 w-6" />;
    case 'rivalry': return <Zap className="h-6 w-6" />;
    case 'underdog': return <TrendingUp className="h-6 w-6" />;
    default: return <Users className="h-6 w-6" />;
  }
};

const getColorForStoryType = (type: string) => {
  switch (type) {
    case 'breakthrough': return '#DC2626';
    case 'masterstroke': return '#059669';
    case 'disaster': return '#DC2626';
    case 'rivalry': return '#7C3AED';
    case 'underdog': return '#0891B2';
    default: return '#6B7280';
  }
};

const getBgColorForStoryType = (type: string) => {
  switch (type) {
    case 'breakthrough': return '#FEF2F2';
    case 'masterstroke': return '#ECFDF5';
    case 'disaster': return '#FEF2F2';
    case 'rivalry': return '#F3E8FF';
    case 'underdog': return '#ECFEFF';
    default: return '#F9FAFB';
  }
};

interface Story {
  id: string;
  type: 'breakthrough' | 'masterstroke' | 'disaster' | 'rivalry' | 'underdog';
  headline: string;
  subheadline: string;
  details: string;
  teamName: string;
  managerName: string;
  points?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface StorytellingProps {
  leagueId: number;
  gameweek?: number;
  teams?: any[];
  leagueName?: string;
}

export function LeagueStorytelling({ leagueId, gameweek = 2, teams = [], leagueName = '' }: StorytellingProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countryFlavor, setCountryFlavor] = useState<string>('ESPN');
  const [useLLM, setUseLLM] = useState(true);

  useEffect(() => {
    const generateEpicStories = async () => {
      try {
        setIsLoading(true);

        // Fetch detailed squad analysis with better error handling
        let squadData = null;
        try {
          const squadResponse = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          squadData = squadResponse.ok ? await squadResponse.json() : null;
        } catch (fetchError) {
          console.warn('Squad analysis API unavailable, using fallback stories:', fetchError);
          squadData = null;
        }

        // Try LLM-powered storytelling first
        if (useLLM && squadData?.analysis && teams.length > 0) {
          try {
            const topScorerRaw = squadData.analysis
              .filter((team: any) => team.gwTotalPoints >= 70)
              .sort((a: any, b: any) => b.gwTotalPoints - a.gwTotalPoints)[0] || null;
            

            const storyRequest = {
              leagueName: leagueName || 'Fantasy League',
              managerNames: teams.map(t => t.managerName || '').filter(Boolean),
              gameweekData: {
                gameweek,
                topScorer: topScorerRaw ? {
                  name: topScorerRaw.manager || topScorerRaw.managerName || 'Unknown Manager',
                  team: topScorerRaw.team || topScorerRaw.teamName || 'Unknown Team',
                  points: topScorerRaw.gwTotalPoints || 0
                } : null,
                worstPerformer: (() => {
                  const worstRaw = squadData.analysis
                    .filter((team: any) => team.gwTotalPoints <= 40)
                    .sort((a: any, b: any) => a.gwTotalPoints - b.gwTotalPoints)[0] || null;
                  return worstRaw ? {
                    name: worstRaw.manager || worstRaw.managerName || 'Unknown Manager',
                    team: worstRaw.team || worstRaw.teamName || 'Unknown Team',
                    points: worstRaw.gwTotalPoints || 0
                  } : null;
                })(),
                captainSuccess: (() => {
                  const capRaw = squadData.analysis
                    .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) >= 16)
                    .sort((a: any, b: any) => (b.squad.captain.points * b.squad.captain.multiplier) - (a.squad.captain.points * a.squad.captain.multiplier))[0] || null;
                  return capRaw && capRaw.squad?.captain ? {
                    name: capRaw.manager || capRaw.managerName || 'Unknown Manager',
                    player: capRaw.squad.captain.name || 'Unknown Player',
                    points: (capRaw.squad.captain.points * capRaw.squad.captain.multiplier) || 0,
                    team: capRaw.team || capRaw.teamName || 'Unknown Team'
                  } : null;
                })(),
                captainDisaster: (() => {
                  const disRaw = squadData.analysis
                    .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) <= 4)
                    .sort((a: any, b: any) => (a.squad.captain.points * a.squad.captain.multiplier) - (b.squad.captain.points * b.squad.captain.multiplier))[0] || null;
                  return disRaw && disRaw.squad?.captain ? {
                    name: disRaw.manager || disRaw.managerName || 'Unknown Manager',
                    player: disRaw.squad.captain.name || 'Unknown Player',
                    points: (disRaw.squad.captain.points * disRaw.squad.captain.multiplier) || 0,
                    team: disRaw.team || disRaw.teamName || 'Unknown Team'
                  } : null;
                })(),
                titleRace: teams.length >= 2 ? (() => {
                  const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
                  const gap = (sorted[0]?.points || 0) - (sorted[1]?.points || 0);
                  return gap <= 25 ? {
                    leader: sorted[0]?.managerName || '',
                    chaser: sorted[1]?.managerName || '',
                    gap
                  } : null;
                })() : null
              }
            };

            const llmResponse = await fetch(`/api/leagues/${leagueId}/storytelling`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(storyRequest)
            });

            if (llmResponse.ok) {
              const llmData = await llmResponse.json();
              if (llmData.success && llmData.stories?.length > 0) {
                // Map LLM stories to our Story interface
                const llmStories: Story[] = llmData.stories.map((story: any, index: number) => ({
                  id: story.id || `llm-${index}`,
                  type: story.type || 'rivalry',
                  headline: story.headline,
                  subheadline: story.subheadline,
                  details: story.details,
                  teamName: story.teamName || '',
                  managerName: story.managerName || '',
                  points: story.points,
                  icon: getIconForStoryType(story.type),
                  color: getColorForStoryType(story.type),
                  bgColor: getBgColorForStoryType(story.type)
                }));
                
                setStories(llmStories.slice(0, 5));
                setCountryFlavor('ESPN');
                setIsLoading(false);
                return;
              }
            }
          } catch (llmError) {
            console.warn('LLM storytelling failed, falling back to static stories:', llmError);
            setUseLLM(false);
          }
        }

        // Fallback to original static story generation
        const epicStories: Story[] = [];

        if (squadData?.analysis && teams.length > 0) {
          // 1. 🚨 BREAKING: GAMEWEEK HERO
          const gwTopScorer = squadData.analysis
            .filter((team: any) => team.gwTotalPoints >= 75)
            .sort((a: any, b: any) => b.gwTotalPoints - a.gwTotalPoints)[0];

          if (gwTopScorer && gwTopScorer.squad?.captain) {
            const captainPoints = gwTopScorer.squad.captain.points * gwTopScorer.squad.captain.multiplier;
            const isExceptional = gwTopScorer.gwTotalPoints >= 85;
            
            epicStories.push({
              id: 'breaking-hero',
              type: 'breakthrough',
              headline: `🚨 BREAKING: ${gwTopScorer.team} delivers MONSTER gameweek!`,
              subheadline: `${isExceptional ? 'EXPLOSIVE' : 'MASSIVE'} ${gwTopScorer.gwTotalPoints}-point haul rocks the league`,
              details: `${gwTopScorer.manager} has absolutely SMASHED gameweek ${gameweek}! Their captain ${gwTopScorer.squad.captain.name} was the cornerstone with ${captainPoints} points, while their tactical genius shone through every selection. This is the kind of week that wins leagues!`,
              teamName: gwTopScorer.team,
              managerName: gwTopScorer.manager,
              points: gwTopScorer.gwTotalPoints,
              icon: <Crown className="h-6 w-6" />,
              color: '#DC2626',
              bgColor: '#FEF2F2'
            });
          }

          // 2. ⚡ CAPTAINCY MASTERSTROKE OF THE WEEK
          const bestCaptain = squadData.analysis
            .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) >= 16)
            .sort((a: any, b: any) => (b.squad.captain.points * b.squad.captain.multiplier) - (a.squad.captain.points * a.squad.captain.multiplier))[0];

          if (bestCaptain && bestCaptain.squad?.captain) {
            const captainPoints = bestCaptain.squad.captain.points * bestCaptain.squad.captain.multiplier;
            const rawPoints = bestCaptain.squad.captain.points;
            const isDifferential = rawPoints >= 15; // Assume high-scoring captain is differential
            
            epicStories.push({
              id: 'captain-genius',
              type: 'masterstroke',
              headline: `⚡ ${bestCaptain.manager} pulls off CAPTAINCY MASTERCLASS!`,
              subheadline: `${bestCaptain.squad.captain.name} ${isDifferential ? 'HAULS' : 'delivers'} ${captainPoints} points with the armband`,
              details: `GENIUS MOVE! While the masses went with template picks, ${bestCaptain.manager} showed true FPL mastery by backing ${bestCaptain.squad.captain.name}. The ${bestCaptain.squad.captain.team} star rewarded that faith with ${rawPoints} points - doubled to ${captainPoints} with the captain's armband. This is how you separate yourself from the pack!`,
              teamName: bestCaptain.team,
              managerName: bestCaptain.manager,
              points: captainPoints,
              icon: <Target className="h-6 w-6" />,
              color: '#059669',
              bgColor: '#ECFDF5'
            });
          }

          // 3. 😱 NIGHTMARE BENCH BLUNDER
          const worstBench = squadData.analysis
            .filter((team: any) => team.squad?.subs && team.squad.subs.length > 0)
            .map((team: any) => ({
              ...team,
              benchPoints: team.squad.subs.reduce((sum: number, sub: any) => sum + (sub.points || 0), 0)
            }))
            .filter((team: any) => team.benchPoints >= 15)
            .sort((a: any, b: any) => b.benchPoints - a.benchPoints)[0];

          if (worstBench && worstBench.squad?.subs) {
            const topBenchPlayer = worstBench.squad.subs.reduce((best: any, current: any) => 
              (current.points > best.points) ? current : best, worstBench.squad.subs[0]
            );
            
            epicStories.push({
              id: 'bench-nightmare',
              type: 'disaster',
              headline: `😱 ${worstBench.manager} suffers BRUTAL bench heartbreak!`,
              subheadline: `DEVASTATING ${worstBench.benchPoints} points left rotting on the bench`,
              details: `OUCH! ${worstBench.manager} will need therapy after this one. ${topBenchPlayer.name} smashed ${topBenchPlayer.points} points from the bench while their starting XI struggled. That's ${worstBench.benchPoints} points that could have changed everything! Selection nightmares like this are what separate the champions from the also-rans.`,
              teamName: worstBench.team,
              managerName: worstBench.manager,
              points: worstBench.benchPoints,
              icon: <AlertTriangle className="h-6 w-6" />,
              color: '#DC2626',
              bgColor: '#FEF2F2'
            });
          }

          // 4. 🔥 TITLE RACE EXPLOSION
          if (teams.length >= 2) {
            const sortedTeams = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
            
            // Find the closest title rivals
            for (let i = 0; i < Math.min(3, sortedTeams.length - 1); i++) {
              const leader = sortedTeams[i];
              const chaser = sortedTeams[i + 1];
              const pointsDiff = (leader.points || 0) - (chaser.points || 0);
              
              if (pointsDiff <= 25 && pointsDiff > 0) {
                // Check gameweek performances to add drama
                const leaderGW = squadData.analysis.find((team: any) => team.team === leader.teamName);
                const chaserGW = squadData.analysis.find((team: any) => team.team === chaser.teamName);
                
                const isNeckAndNeck = pointsDiff <= 10;
                const chaserClosingGap = chaserGW && leaderGW && chaserGW.gwTotalPoints > leaderGW.gwTotalPoints;
                
                epicStories.push({
                  id: 'title-race',
                  type: 'rivalry',
                  headline: `🔥 ${isNeckAndNeck ? 'TITLE RACE REACHES FEVER PITCH!' : 'Championship battle INTENSIFIES!'}`,
                  subheadline: `${chaserClosingGap ? chaser.managerName + ' CLOSES THE GAP! ' : ''}Just ${pointsDiff} points separate the top contenders`,
                  details: `The tension is UNBEARABLE! ${leader.managerName} leads by a mere ${pointsDiff} points, but ${chaser.managerName} is breathing down their neck${chaserClosingGap ? ' after outscoring them this gameweek' : ''}. Every transfer becomes crucial, every captain pick could swing this epic title fight. This is what FPL dreams are made of!`,
                  teamName: leader.teamName,
                  managerName: leader.managerName,
                  icon: <Zap className="h-6 w-6" />,
                  color: '#7C3AED',
                  bgColor: '#F3E8FF'
                });
                break;
              }
            }
          }

          // 5. 🚀 SENSATIONAL SURGE
          const bigClimber = teams
            .filter(team => {
              const currentRank = team.rank || team.rank_sort || 99;
              const lastRank = team.lastWeekRank || team.last_rank || currentRank;
              return lastRank - currentRank >= 3;
            })
            .sort((a, b) => {
              const aImprovement = (a.lastWeekRank || a.last_rank || a.rank) - (a.rank || a.rank_sort);
              const bImprovement = (b.lastWeekRank || b.last_rank || b.rank) - (b.rank || b.rank_sort);
              return bImprovement - aImprovement;
            })[0];

          if (bigClimber) {
            const currentRank = bigClimber.rank || bigClimber.rank_sort;
            const lastRank = bigClimber.lastWeekRank || bigClimber.last_rank || currentRank;
            const improvement = lastRank - currentRank;
            const climberGW = squadData.analysis.find((team: any) => team.team === bigClimber.teamName);
            const wasItCaptain = climberGW?.squad?.captain ? ` Their captain ${climberGW.squad.captain.name} was instrumental with ${climberGW.squad.captain.points * climberGW.squad.captain.multiplier} points.` : '';
            
            epicStories.push({
              id: 'rocket-rise',
              type: 'underdog',
              headline: `🚀 ${bigClimber.managerName} launches SPECTACULAR comeback!`,
              subheadline: `ROCKETS UP ${improvement} places to shake up the table!`,
              details: `FROM NOWHERE! ${bigClimber.managerName} has pulled off one of the most dramatic surges we've seen this season, climbing ${improvement} positions in a single gameweek!${wasItCaptain} This is the kind of momentum that can carry you all the way to glory. Watch out leaders - there's a new force rising!`,
              teamName: bigClimber.teamName,
              managerName: bigClimber.managerName,
              icon: <TrendingUp className="h-6 w-6" />,
              color: '#0891B2',
              bgColor: '#ECFEFF'
            });
          }
        }

        // 6. 💔 CAPTAIN DISASTER OF THE WEEK
        const captainDisaster = squadData.analysis
          .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) <= 4)
          .sort((a: any, b: any) => (a.squad.captain.points * a.squad.captain.multiplier) - (b.squad.captain.points * b.squad.captain.multiplier))[0];

        if (captainDisaster && captainDisaster.squad?.captain) {
          const captainPoints = captainDisaster.squad.captain.points * captainDisaster.squad.captain.multiplier;
          const wouldHaveBeenBetter = captainDisaster.squad.subs?.find((sub: any) => sub.points > captainDisaster.squad.captain.points);
          
          epicStories.push({
            id: 'captain-disaster',
            type: 'disaster',
            headline: `💔 ${captainDisaster.manager} suffers CAPTAINCY CATASTROPHE!`,
            subheadline: `${captainDisaster.squad.captain.name} delivers crushing ${captainPoints}-point nightmare`,
            details: `HEARTBREAK! ${captainDisaster.manager} backed ${captainDisaster.squad.captain.name} with the armband but got just ${captainPoints} points for their troubles. ${wouldHaveBeenBetter ? `To make matters worse, ${wouldHaveBeenBetter.name} scored ${wouldHaveBeenBetter.points} points on their bench!` : 'Sometimes the beautiful game can be cruel.'} This is the kind of week that haunts managers for seasons.`,
            teamName: captainDisaster.team,
            managerName: captainDisaster.manager,
            points: captainPoints,
            icon: <AlertTriangle className="h-6 w-6" />,
            color: '#EF4444',
            bgColor: '#FEF2F2'
          });
        }

        // Add default stories if we don't have enough data
        if (epicStories.length === 0) {
          const fallbackStories = [
            {
              id: 'default-drama',
              type: 'rivalry' as const,
              headline: `⚽ Gameweek ${gameweek} DRAMA unfolds in ${leagueName || 'the league'}!`,
              subheadline: `Epic battles and tactical masterstrokes light up the weekend`,
              details: `Another week, another rollercoaster of emotions! Managers are celebrating brilliant moves and cursing missed opportunities. The beautiful game delivered its usual mix of joy and heartbreak across the league.`,
              teamName: 'League',
              managerName: 'All Managers',
              icon: <Users className="h-6 w-6" />,
              color: '#6B7280',
              bgColor: '#F9FAFB'
            },
            {
              id: 'default-excitement',
              type: 'breakthrough' as const,
              headline: `🚨 FPL Madness reaches fever pitch!`,
              subheadline: `Dreams made and broken in ${leagueName || 'this epic league'}`,
              details: `The pressure is mounting as managers chase glory! Every transfer decision, every captaincy choice, every bench selection could be the difference between triumph and disaster.`,
              teamName: 'League',
              managerName: 'Brave Managers',
              icon: <Crown className="h-6 w-6" />,
              color: '#DC2626',
              bgColor: '#FEF2F2'
            }
          ];
          epicStories.push(...fallbackStories);
        }

        // Prioritize the most dramatic stories and limit to 5 most exciting
        const prioritizedStories = epicStories.sort((a, b) => {
          const priorityOrder = ['breaking-hero', 'captain-genius', 'bench-nightmare', 'captain-disaster', 'rocket-rise', 'title-race'];
          const aPriority = priorityOrder.indexOf(a.id);
          const bPriority = priorityOrder.indexOf(b.id);
          return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
        });
        
        setStories(prioritizedStories.slice(0, 5));
      } catch (error) {
        console.error('Error generating stories:', error);
        // Always provide fallback stories even when everything fails
        const emergencyStories = [
          {
            id: 'emergency-story',
            type: 'rivalry' as const,
            headline: `⚽ The FPL journey continues!`,
            subheadline: `Every gameweek brings new adventures in ${leagueName || 'your league'}`,
            details: `The beautiful chaos of Fantasy Premier League never stops! While we gather the latest data, remember that every manager in this league is fighting for glory. The next gameweek could change everything!`,
            teamName: 'League',
            managerName: 'All Managers',
            points: gameweek,
            icon: <Users className="h-6 w-6" />,
            color: '#6B7280',
            bgColor: '#F9FAFB'
          }
        ];
        setStories(emergencyStories);
      } finally {
        setIsLoading(false);
      }
    };

    generateEpicStories();
  }, [leagueId, gameweek, teams]);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
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
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '0.5rem',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              height: '8rem',
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
    <>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '0.375rem',
            borderRadius: '0.375rem',
            fontSize: '1rem'
          }}>
            📺
          </div>
          <div>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1F2937',
              margin: 0,
              marginBottom: '0.125rem'
            }}>
              Top Headlines
            </h2>
            <p style={{
              fontSize: '0.75rem',
              color: '#6B7280',
              margin: 0
            }}>
Latest updates from Gameweek {gameweek}
            </p>
          </div>
        </div>

        {/* Story Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
          width: '100%',
          flex: 1,
          alignContent: 'start'
        }}>
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              style={{
                backgroundColor: story.bgColor,
                border: `2px solid ${story.color}20`,
                borderRadius: '0.75rem',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                width: '100%',
                height: '100px',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = story.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = `${story.color}20`;
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <div style={{
                  color: story.color,
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  {story.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#1F2937',
                    margin: 0,
                    marginBottom: '0.25rem',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const
                  }}>
                    {story.headline}
                  </h3>
                  <p style={{
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    color: story.color,
                    margin: 0,
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const
                  }}>
                    {story.subheadline}
                  </p>
                  <p style={{
                    fontSize: '0.625rem',
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: '1.3'
                  }}>
                    Click to read more →
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedStory(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: selectedStory.color }}>
                {selectedStory.icon}
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1F2937',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  {selectedStory.headline}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: selectedStory.color,
                  margin: 0
                }}>
                  {selectedStory.subheadline}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: selectedStory.bgColor,
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontSize: '1rem',
                color: '#374151',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {selectedStory.details}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '0.5rem'
            }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1F2937'
                }}>
                  {selectedStory.teamName}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280'
                }}>
                  {selectedStory.managerName}
                </div>
              </div>
              {selectedStory.points && (
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: selectedStory.color
                }}>
                  {selectedStory.points} pts
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}