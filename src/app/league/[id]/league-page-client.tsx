'use client';

import { useState, useEffect } from 'react';
import { RankProgressionChart } from '@/components/charts/rank-progression-chart';
import { EnhancedSquadTable } from '@/components/squad/enhanced-squad-table';
import { PitchView } from '@/components/squad/pitch-view';
import { LeagueStorytelling } from '@/components/ui/league-storytelling';
import { BadgesAchievements } from '@/components/ui/badges-achievements';
import { VotingPoll } from '@/components/ui/voting-poll';
import { Users, Trophy, Calendar, TrendingUp, ArrowUp, ArrowDown, Minus, BarChart3, UserSearch, Award, MessageSquare, Star, Zap } from 'lucide-react';

interface LeaguePageClientProps {
  leagueId: number;
  league: any;
  topTeams: any[];
  averagePoints: number;
}

type TabType = 'league-progression' | 'squad-analysis' | 'badges-achievements' | 'community-poll';

export function LeaguePageClient({ leagueId, league, topTeams, averagePoints }: LeaguePageClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<{name: string; manager: string} | null>(null);
  const [teamCrests, setTeamCrests] = useState<{[teamName: string]: string}>({});
  const [activeTab, setActiveTab] = useState<TabType>('league-progression');

  const handleTeamClick = (teamName: string, managerName: string) => {
    setSelectedTeam({ name: teamName, manager: managerName });
  };

  useEffect(() => {
    const fetchCrests = async () => {
      console.log('LEAGUE PAGE: Starting crest generation for all teams');
      const teamNames = league.standings.map((team: any) => team.teamName);
      
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
          console.log('LEAGUE PAGE: Successfully batch generated crests:', data.crests);
          setTeamCrests(data.crests || {});
        } else {
          console.error('LEAGUE PAGE: Batch generation failed, falling back to individual requests');
          // Fallback to individual requests
          const crests: {[teamName: string]: string} = {};
          for (const team of league.standings) {
            try {
              const individualResponse = await fetch(`/api/crests?teamName=${encodeURIComponent(team.teamName)}&teamId=${team.teamId}`);
              if (individualResponse.ok) {
                const individualData = await individualResponse.json();
                if (individualData.crestUrl) {
                  crests[team.teamName] = individualData.crestUrl;
                }
              }
            } catch (error) {
              console.error(`Error fetching individual crest for ${team.teamName}:`, error);
            }
          }
          setTeamCrests(crests);
        }
      } catch (error) {
        console.error('LEAGUE PAGE: Error in crest generation:', error);
      }
    };

    fetchCrests();
  }, [league.standings]);

  const tabs = [
    {
      id: 'league-progression' as TabType,
      name: 'League Progression',
      icon: BarChart3,
      description: 'View league standings and rank progression over time'
    },
    {
      id: 'squad-analysis' as TabType,
      name: 'Squad Analysis',
      icon: UserSearch,
      description: 'Analyze team squads and player performance'
    },
    {
      id: 'badges-achievements' as TabType,
      name: 'Badges & Achievements',
      icon: Award,
      description: 'Track achievements and league milestones'
    },
    {
      id: 'community-poll' as TabType,
      name: 'Community Poll',
      icon: MessageSquare,
      description: 'Vote and participate in community discussions'
    }
  ];

  const getRankChangeIcon = (currentRank: number, lastWeekRank?: number) => {
    if (!lastWeekRank || currentRank === lastWeekRank) {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
    if (currentRank < lastWeekRank) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    }
    return <ArrowDown className="h-3 w-3 text-red-500" />;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'league-progression':
        return (
          <div>
            <RankProgressionChart leagueId={leagueId} />
          </div>
        );

      case 'squad-analysis':
        return (
          <div>
            <EnhancedSquadTable leagueId={leagueId} gameweek={4} />
          </div>
        );

      case 'badges-achievements':
        return (
          <div>
            <BadgesAchievements 
              leagueId={leagueId} 
              teams={league.standings} 
              gameweek={league.currentGameweek} 
            />
          </div>
        );

      case 'community-poll':
        return (
          <div>
            <VotingPoll 
              leagueId={leagueId} 
              teams={league.standings} 
              gameweek={league.currentGameweek + 1} 
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200 flex-none" style={{ height: '20vh' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5"></div>
        <div className="relative p-6">
        <div className="h-full flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-2xl mr-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{league.name}</span>
              </h1>
              <p className="text-gray-600 font-medium">Gameweek {league.currentGameweek} • {league.teams.length} Teams</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="h-6 w-6 text-blue-500" />}
              title="Teams"
              value={league.teams.length.toString()}
              subtitle="Participating teams"
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Calendar className="h-6 w-6 text-green-500" />}
              title="Gameweek"
              value={league.currentGameweek.toString()}
              subtitle="Current round"
              gradient="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={<Trophy className="h-6 w-6 text-yellow-500" />}
              title="Leader"
              value={topTeams[0]?.teamName || 'TBD'}
              subtitle={`${topTeams[0]?.points?.toLocaleString() || 0} points`}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
              title="Average"
              value={averagePoints.toLocaleString()}
              subtitle="Points per team"
              gradient="from-purple-500 to-pink-500"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Top Headlines Section - 20% of viewport height */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-6 py-4 flex-none overflow-hidden" style={{ height: '20vh' }}>
        <LeagueStorytelling 
          leagueId={leagueId} 
          teams={league.standings} 
          gameweek={league.currentGameweek}
          leagueName={league.name}
        />
      </div>

      {/* Main Content with Left Tabs - Dynamic height to prevent scrolling */}
      <div className="flex flex-1 min-h-0">
        {/* Left Tab Navigation */}
        <div className="w-20 bg-gradient-to-b from-green-50 to-blue-50 border-r border-gray-200 flex flex-col py-4">
          <div className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <div key={tab.id} className="group relative">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex flex-col items-center justify-center py-3 px-2 rounded-xl mx-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md'
                    }`}
                    title={tab.description}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {tab.name.split(' ').map((word, index) => (
                        <div key={index}>{word}</div>
                      ))}
                    </span>
                  </button>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {tab.description}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-hidden bg-white">
          <div className="h-full overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Pitch View Modal */}
      {selectedTeam && (
        <PitchView
          teamName={selectedTeam.name}
          managerName={selectedTeam.manager}
          gameweek={4}
          isOpen={true}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, gradient }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient?: string;
}) {
  return (
    <div className="group bg-white rounded-xl shadow-md p-3 h-full flex items-center hover:shadow-lg transition-all duration-300 border border-gray-100 min-w-0">
      <div className={`inline-flex p-1.5 rounded-lg bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-semibold text-gray-700 truncate mb-0.5">
          {title}
        </h3>
        <div className="text-sm font-bold text-gray-900 truncate mb-0.5">
          {value}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}