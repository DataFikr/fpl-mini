'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal } from 'lucide-react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  managerName: string;
  entryId: number;
  totalPoints: number;
  eventTotal: number;
}

interface MonthlyLeaderboard {
  phaseId: number;
  phaseName: string;
  startEvent: number;
  stopEvent: number;
  top3: LeaderboardEntry[];
}

interface ManagerOfTheMonthProps {
  leagueId: number;
  leagueName: string;
  userTeamId?: number;
}

export function ManagerOfTheMonth({ leagueId, leagueName, userTeamId }: ManagerOfTheMonthProps) {
  const [months, setMonths] = useState<MonthlyLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/leagues/${leagueId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          // Sort descending by phase ID (latest month first)
          const sorted = (data.months || []).sort(
            (a: MonthlyLeaderboard, b: MonthlyLeaderboard) => b.phaseId - a.phaseId
          );
          setMonths(sorted);
        }
      } catch (error) {
        console.warn('Failed to fetch leaderboard:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [leagueId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading monthly leaderboards...</p>
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Medal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No monthly leaderboard data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
        <h2 className="text-2xl font-jakarta font-bold text-white mb-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          {leagueName}
        </h2>
        <p className="text-sm text-fpl-text-secondary font-inter">Monthly top 3 performers</p>
      </div>

      {/* Monthly Cards */}
      {months.map((month) => {
        const winner = month.top3[0];
        const runnersUp = month.top3.slice(1);

        return (
          <div
            key={month.phaseId}
            className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl border border-fpl-primary/20 overflow-hidden"
          >
            {/* Month Header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-fpl-primary/10 border-b border-fpl-primary/10">
              <Calendar className="w-4 h-4 text-fpl-accent" />
              <span className="font-jakarta font-bold text-white text-base">{month.phaseName}</span>
              <span className="text-xs text-fpl-text-secondary font-inter ml-auto">
                GW {month.startEvent}–{month.stopEvent}
              </span>
            </div>

            {/* Two-column layout: Winner + Trophy | Runners-up */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: 1st Place with Trophy */}
              {winner && (
                <div className={`flex items-center gap-4 p-5 md:p-6 border-b md:border-b-0 md:border-r border-fpl-primary/10 bg-gradient-to-br from-yellow-500/10 via-fpl-dark/10 to-fpl-dark/20 ${
                  winner.entryId === userTeamId ? 'ring-1 ring-fpl-accent/40' : ''
                }`}>
                  {/* Trophy Image */}
                  <div className="flex-shrink-0 w-28 h-36 sm:w-32 sm:h-40 relative">
                    <Image
                      src="/images/manager_of_the_month_trophy.png"
                      alt="Manager of the Month Trophy"
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="128px"
                    />
                  </div>

                  {/* Winner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🥇</span>
                    </div>
                    <div className="font-jakarta text-white text-lg font-bold truncate leading-tight">
                      {winner.teamName}
                    </div>
                    <div className="text-sm text-fpl-text-secondary font-inter truncate mt-1">
                      {winner.managerName}
                    </div>
                    <div className="mt-3">
                      <span className="font-jakarta font-black text-3xl text-yellow-400">{winner.totalPoints}</span>
                      <span className="text-base font-inter text-fpl-text-secondary ml-1.5">pts</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT: 2nd & 3rd Place */}
              <div className="flex flex-col justify-center divide-y divide-fpl-primary/10">
                {runnersUp.map((entry) => {
                  const isUser = entry.entryId === userTeamId;
                  return (
                    <div
                      key={entry.entryId}
                      className={`flex items-center gap-3 px-5 py-4 ${isUser ? 'bg-fpl-accent/5 border-l-2 border-l-fpl-accent' : ''}`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                        entry.rank === 2 ? 'bg-gray-300/15' : 'bg-amber-600/15'
                      }`}>
                        <span className="text-lg">
                          {entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-jakarta text-white text-sm font-bold truncate">
                          {entry.teamName}
                        </div>
                        <div className="text-xs text-fpl-text-secondary font-inter truncate">
                          {entry.managerName}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-jakarta font-black text-xl text-white">{entry.totalPoints}</div>
                        <div className="text-xs text-fpl-text-secondary font-inter">pts</div>
                      </div>
                    </div>
                  );
                })}
                {runnersUp.length === 0 && (
                  <div className="px-5 py-8 text-center text-fpl-text-secondary font-inter text-sm">
                    No runners-up data
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
