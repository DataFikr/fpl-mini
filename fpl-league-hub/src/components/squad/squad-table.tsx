'use client';

import { useState, useEffect } from 'react';
import { PlayerSquadData, TeamData } from '@/types/fpl';
import { Crown, Star, Shirt, Shield, Users, Activity } from 'lucide-react';

interface SquadTableProps {
  teamId: number;
  gameweek?: number;
}

interface SquadResponse {
  team: TeamData;
  gameweek: number;
  squad: PlayerSquadData[];
}

const POSITION_NAMES = {
  1: 'Goalkeeper',
  2: 'Defender', 
  3: 'Midfielder',
  4: 'Forward'
};

const POSITION_ICONS = {
  1: Shield,
  2: Shield,
  3: Activity,
  4: Users
};

const POSITION_COLORS = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-blue-100 text-blue-800', 
  3: 'bg-green-100 text-green-800',
  4: 'bg-red-100 text-red-800'
};

export function SquadTable({ teamId, gameweek }: SquadTableProps) {
  const [squadData, setSquadData] = useState<SquadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'position' | 'points' | 'name'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchSquadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = gameweek 
          ? `/api/teams/${teamId}/squad?gameweek=${gameweek}`
          : `/api/teams/${teamId}/squad`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch squad data');
        }
        
        const data = await response.json();
        setSquadData(data);
      } catch (err) {
        console.error('Error fetching squad data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquadData();
  }, [teamId, gameweek]);

  const handleSort = (column: 'position' | 'points' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedSquad = squadData?.squad ? [...squadData.squad].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'position':
        aValue = a.position;
        bValue = b.position;
        break;
      case 'points':
        aValue = a.points || 0;
        bValue = b.points || 0;
        break;
      case 'name':
        aValue = a.player?.web_name || '';
        bValue = b.player?.web_name || '';
        break;
      default:
        aValue = a.position;
        bValue = b.position;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  }) : [];

  const startingXI = sortedSquad.filter(p => p.position <= 11);
  const bench = sortedSquad.filter(p => p.position > 11);
  const totalPoints = sortedSquad.reduce((sum, p) => sum + (p.points || 0), 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !squadData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 mb-4">
          <Shirt className="h-16 w-16 mx-auto mb-4" />
          <div className="text-xl font-semibold mb-2">Squad Data Unavailable</div>
          <div className="text-gray-600">{error || 'Failed to load squad data'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Squad Analysis
            </h2>
            <p className="text-gray-600">
              {squadData.team.name} - Gameweek {squadData.gameweek}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalPoints}
              </div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleSort('position')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'position'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Position {sortBy === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('points')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'points'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Points {sortBy === 'points' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'name'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Shirt className="h-5 w-5 mr-2" />
              Starting XI
            </h3>
            <div className="overflow-x-auto">
              <PlayerTable players={startingXI} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Bench
            </h3>
            <div className="overflow-x-auto">
              <PlayerTable players={bench} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerTable({ players }: { players: PlayerSquadData[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Position</th>
          <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Player</th>
          <th className="text-center py-2 px-2 text-sm font-medium text-gray-600">Role</th>
          <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Points</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player, index) => {
          const PositionIcon = POSITION_ICONS[player.player?.element_type as keyof typeof POSITION_ICONS] || Shirt;
          const positionColor = POSITION_COLORS[player.player?.element_type as keyof typeof POSITION_COLORS] || 'bg-gray-100 text-gray-800';
          
          return (
            <tr key={player.element} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${positionColor}`}>
                    <PositionIcon className="h-4 w-4" />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {POSITION_NAMES[player.player?.element_type as keyof typeof POSITION_NAMES] || 'Unknown'}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2">
                <div>
                  <div className="font-semibold text-gray-900">
                    {player.player?.web_name || 'Unknown Player'}
                  </div>
                  <div className="text-sm text-gray-500">
                    £{(player.player?.now_cost || 0) / 10}m
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-center">
                <div className="flex justify-center space-x-1">
                  {player.is_captain && (
                    <Crown className="h-4 w-4 text-yellow-500" title="Captain" />
                  )}
                  {player.is_vice_captain && (
                    <Star className="h-4 w-4 text-gray-500" title="Vice Captain" />
                  )}
                  {player.multiplier > 1 && !player.is_captain && !player.is_vice_captain && (
                    <span className="text-sm font-bold text-green-600">{player.multiplier}x</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-right">
                <div className="font-bold text-lg text-gray-900">
                  {player.points || 0}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}