'use client';

import { useState, useEffect } from 'react';
import { RankProgressionChart } from '@/components/charts/rank-progression-chart';
import { EnhancedSquadTable } from '@/components/squad/enhanced-squad-table';
import { PitchView } from '@/components/squad/pitch-view';
import { EnhancedLeagueStorytelling } from '@/components/ui/enhanced-league-storytelling';
import { BadgesAchievements } from '@/components/ui/badges-achievements';
import { VotingPoll } from '@/components/ui/voting-poll';
import { Users, Trophy, Calendar, TrendingUp, ArrowUp, ArrowDown, Minus, BarChart3, UserSearch, Award, MessageSquare, Star, Zap, Home, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface LeaguePageClientProps {
  leagueId: number;
  league: any;
  topTeams: any[];
  averagePoints: number;
  userTeamId?: number;
}

type TabType = 'headlines' | 'league-progression' | 'team-analysis' | 'badges-achievements' | 'community-poll';

export function LeaguePageClient({ leagueId, league, topTeams, averagePoints, userTeamId }: LeaguePageClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<{name: string; manager: string} | null>(null);
  const [teamCrests, setTeamCrests] = useState<{[teamName: string]: string}>({});
  const [activeTab, setActiveTab] = useState<TabType>('headlines');
  const [currentUserTeamId, setCurrentUserTeamId] = useState<number | null>(null);

  // Store user team ID in localStorage and state
  useEffect(() => {
    if (userTeamId) {
      localStorage.setItem('fpl_user_team_id', userTeamId.toString());
      setCurrentUserTeamId(userTeamId);
    } else {
      // Try to get team ID from localStorage
      const storedTeamId = localStorage.getItem('fpl_user_team_id');
      if (storedTeamId) {
        setCurrentUserTeamId(parseInt(storedTeamId));
      } else {
        // Try to get from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlTeamId = urlParams.get('teamId');
        if (urlTeamId) {
          const teamId = parseInt(urlTeamId);
          localStorage.setItem('fpl_user_team_id', teamId.toString());
          setCurrentUserTeamId(teamId);
        } else {
          // Last resort fallback - no specific default
          setCurrentUserTeamId(null);
        }
      }
    }
  }, [userTeamId]);

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
      id: 'headlines' as TabType,
      name: 'Top Headlines',
      icon: Star,
      description: 'Latest updates from the current gameweek'
    },
    {
      id: 'league-progression' as TabType,
      name: 'League Progression',
      icon: BarChart3,
      description: 'View rank progression over time'
    },
    {
      id: 'team-analysis' as TabType,
      name: 'Team Analysis',
      icon: UserSearch,
      description: 'Analyze team squads and player performance'
    },
    {
      id: 'badges-achievements' as TabType,
      name: 'Badges',
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
      case 'headlines':
        return (
          <div className="space-y-4">
            <EnhancedLeagueStorytelling
              leagueId={leagueId}
              teams={league.standings}
              gameweek={league.currentGameweek}
              leagueName={league.name}
              showImages={true}
            />
          </div>
        );

      case 'league-progression':
        return (
          <div>
            <RankProgressionChart leagueId={leagueId} />
          </div>
        );

      case 'team-analysis':
        return (
          <div>
            <EnhancedSquadTable leagueId={leagueId} gameweek={league.currentGameweek} />
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
          <div className="space-y-6">
            <VotingPoll
              leagueId={leagueId}
              teams={league.standings}
              gameweek={league.currentGameweek}
              pollId="high-scorer"
              question="Who will score the most points in Gameweek"
            />
            <VotingPoll
              leagueId={leagueId}
              teams={league.standings}
              gameweek={league.currentGameweek}
              pollId="captain-pick"
              question="Who will be the most popular captain choice for Gameweek"
            />
            <VotingPoll
              leagueId={leagueId}
              teams={league.standings}
              gameweek={league.currentGameweek}
              pollId="biggest-riser"
              question="Who will climb the most positions in Gameweek"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1.5 rounded-xl mr-3">
            <Image
              src="/favicon.ico"
              alt="FPLRanker Logo"
              width={24}
              height={24}
              className="rounded"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwN0M2NiIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GUEw8L3RleHQ+Cjwvc3ZnPg==';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{league.name}</h1>
            <p className="text-sm text-gray-600">Gameweek {league.currentGameweek} • {league.teams.length} Teams</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link href="/" className="flex items-center px-2 md:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Home className="h-4 w-4 mr-1 md:mr-2" />
            <span className="font-medium text-sm md:text-base">Home</span>
          </Link>
          {currentUserTeamId ? (
            <Link
              href={`/team/${currentUserTeamId}`}
              className="flex items-center px-2 md:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="h-4 w-4 mr-1 md:mr-2" />
              <span className="font-medium text-sm md:text-base">My Leagues</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center px-2 md:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Search for your team ID on the home page"
            >
              <User className="h-4 w-4 mr-1 md:mr-2" />
              <span className="font-medium text-sm md:text-base">Search Team</span>
            </Link>
          )}
        </div>
      </div>

      {/* Compact League Stats - Hidden on Mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-4" style={{ minHeight: '8vh' }}>
        <div className={`grid gap-2 md:gap-4 ${userTeamId ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-500" />}
            title="Teams"
            value={league.teams.length.toString()}
            subtitle="Participating teams"
            gradient="from-blue-500 to-cyan-500"
            compact={true}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-green-500" />}
            title="Gameweek"
            value={league.currentGameweek.toString()}
            subtitle="Current round"
            gradient="from-green-500 to-emerald-500"
            compact={true}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            title="Leader"
            value={topTeams[0]?.teamName || 'TBD'}
            subtitle={`${topTeams[0]?.points?.toLocaleString() || 0} points`}
            gradient="from-yellow-500 to-orange-500"
            compact={true}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
            title="Average"
            value={averagePoints.toLocaleString()}
            subtitle="Points per team"
            gradient="from-purple-500 to-pink-500"
            compact={true}
          />
          {userTeamId && (() => {
            const userTeamStanding = league.standings.find((team: any) => team.teamId === userTeamId);
            const userRank = userTeamStanding?.rank || 'N/A';
            const userPoints = userTeamStanding?.points || 0;

            return (
              <StatCard
                icon={<User className="h-5 w-5 text-indigo-500" />}
                title="Your Rank"
                value={userRank === 'N/A' ? 'N/A' : `#${userRank}`}
                subtitle={`${userPoints.toLocaleString()} points`}
                gradient="from-indigo-500 to-purple-500"
                compact={true}
              />
            );
          })()}
        </div>
      </div>

      {/* Top Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 min-w-0 ${
                  isActive
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span className="truncate hidden md:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 md:p-6 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Pitch View Modal */}
      {selectedTeam && (
        <PitchView
          teamName={selectedTeam.name}
          managerName={selectedTeam.manager}
          gameweek={league.currentGameweek}
          isOpen={true}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, gradient, compact = false }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient?: string;
  compact?: boolean;
}) {
  return (
    <div className={`group bg-white rounded-xl shadow-md ${compact ? 'p-3' : 'p-4'} h-full flex items-center hover:shadow-lg transition-all duration-300 border border-gray-100 min-w-0`}>
      <div className={`inline-flex ${compact ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 truncate mb-0.5`}>
          {title}
        </h3>
        <div className={`${compact ? 'text-sm' : 'text-base'} font-bold text-gray-900 truncate mb-0.5`}>
          {value}
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}