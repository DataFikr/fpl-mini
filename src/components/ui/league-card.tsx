'use client';

import Link from 'next/link';
import { LeagueData } from '@/types/fpl';
import { Trophy, Users, TrendingUp } from 'lucide-react';

interface LeagueCardProps {
  league: LeagueData;
  teamId: number;
}

export function LeagueCard({ league, teamId }: LeagueCardProps) {
  const teamStanding = league.standings.find(s => s.teamId === teamId);
  const rank = teamStanding?.rank || 'N/A';
  const points = teamStanding?.points || 0;
  
  const managerInfo = {
    favouriteTeam: teamStanding?.favourite_team,
    region: teamStanding?.player_region_name,
    regionCodeShort: teamStanding?.player_region_iso_code_short,
    regionCodeLong: teamStanding?.player_region_iso_code_long,
    id: teamStanding?.id,
    name: teamStanding?.name
  };

  const getRankColor = (rank: number | string) => {
    if (rank === 'N/A') return 'text-gray-500';
    if (typeof rank === 'number') {
      if (rank <= 3) return 'text-yellow-600';
      if (rank <= 10) return 'text-green-600';
      return 'text-gray-600';
    }
    return 'text-gray-500';
  };

  return (
    <Link
      href={`/league/${league.id}?teamId=${teamId}`}
      className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-3 md:p-6"
    >
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2">
            {league.name}
          </h3>
          <div className="flex items-center text-gray-500 text-xs md:text-sm">
            <Users className="h-3 md:h-4 w-3 md:w-4 mr-1" />
            {league.teams?.length || league.standings?.length || 0} teams
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl md:text-2xl font-bold ${getRankColor(rank)}`}>
            #{rank}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            Current Position
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
        <div className="p-2 md:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
          <div className="text-xs md:text-sm font-semibold text-blue-700 mb-1">Teams</div>
          <div className="text-sm md:text-base font-bold text-blue-900">{league.teams?.length || league.standings?.length || 0}</div>
        </div>
        <div className="p-2 md:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="text-xs md:text-sm font-semibold text-green-700 mb-1">GW</div>
          <div className="text-sm md:text-base font-bold text-green-900">{league.currentGameweek || 5}</div>
        </div>
        <div className="p-2 md:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="text-xs md:text-sm font-semibold text-purple-700 mb-1">Points</div>
          <div className="text-sm md:text-base font-bold text-purple-900">{points}</div>
        </div>
      </div>
    </Link>
  );
}