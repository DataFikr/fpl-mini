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

interface Highlight {
  type: string;
  icon: string;
  title: string;
  description: string;
  gameweek: number;
  points?: number;
}

interface ManagerOfTheMonthProps {
  leagueId: number;
  leagueName: string;
  userTeamId?: number;
}

export function ManagerOfTheMonth({ leagueId, leagueName, userTeamId }: ManagerOfTheMonthProps) {
  const [months, setMonths] = useState<MonthlyLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlights, setHighlights] = useState<Record<string, Highlight[]>>({});
  const [highlightsLoading, setHighlightsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/leagues/${leagueId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          const sorted = (data.months || []).sort(
            (a: MonthlyLeaderboard, b: MonthlyLeaderboard) => b.phaseId - a.phaseId
          );
          setMonths(sorted);

          // Auto-fetch highlights for winners
          for (const month of sorted) {
            const winner = month.top3[0];
            if (winner) {
              fetchHighlights(winner.entryId, month.startEvent, month.stopEvent, `phase-${month.phaseId}`);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch leaderboard:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [leagueId]);

  const fetchHighlights = async (entryId: number, startEvent: number, stopEvent: number, phaseKey: string) => {
    if (highlights[phaseKey] || highlightsLoading[phaseKey]) return;
    setHighlightsLoading(prev => ({ ...prev, [phaseKey]: true }));
    try {
      const res = await fetch(`/api/leagues/${leagueId}/highlights?entryId=${entryId}&startEvent=${startEvent}&stopEvent=${stopEvent}`);
      if (res.ok) {
        const data = await res.json();
        setHighlights(prev => ({ ...prev, [phaseKey]: data.highlights || [] }));
      }
    } catch (error) {
      console.warn('Failed to fetch highlights:', error);
    }
    setHighlightsLoading(prev => ({ ...prev, [phaseKey]: false }));
  };

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
        const phaseKey = `phase-${month.phaseId}`;
        const phaseHighlights = highlights[phaseKey] || [];
        const isHighlightsLoading = highlightsLoading[phaseKey];

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

            {/* Two-column layout: Winner + Trophy + Highlights | Runners-up */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: 1st Place — 3 columns: Trophy | Winner Info | Highlights */}
              {winner && (
                <div className={`p-5 md:p-6 border-b md:border-b-0 md:border-r border-fpl-primary/10 bg-gradient-to-br from-yellow-500/10 via-fpl-dark/10 to-fpl-dark/20 ${
                  winner.entryId === userTeamId ? 'ring-1 ring-fpl-accent/40' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    {/* Col 1: Trophy Image */}
                    <div className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 relative">
                      <Image
                        src="/images/manager_of_the_month_trophy.png"
                        alt="Manager of the Month Trophy"
                        fill
                        className="object-contain drop-shadow-lg"
                        sizes="96px"
                      />
                    </div>

                    {/* Col 2: Winner Info */}
                    <div className="flex-shrink-0 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-lg">🥇</span>
                      </div>
                      <div className="font-jakarta text-white text-sm font-bold truncate leading-tight max-w-[140px]">
                        {winner.teamName}
                      </div>
                      <div className="text-[11px] text-fpl-text-secondary font-inter truncate mt-0.5 max-w-[140px]">
                        {winner.managerName}
                      </div>
                      <div className="mt-2">
                        <span className="font-jakarta font-black text-2xl text-yellow-400">{winner.totalPoints}</span>
                        <span className="text-xs font-inter text-fpl-text-secondary ml-1">pts</span>
                      </div>
                    </div>

                    {/* Col 3: Key Highlights */}
                    <div className="flex-1 min-w-0 border-l border-fpl-primary/10 pl-3">
                      {isHighlightsLoading ? (
                        <div className="flex items-center gap-2 text-fpl-text-secondary py-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-fpl-accent" />
                          <span className="text-[10px] font-inter">Loading...</span>
                        </div>
                      ) : phaseHighlights.length > 0 ? (
                        <>
                          <div className="text-[9px] font-jakarta font-semibold text-yellow-400 uppercase tracking-wider mb-1.5">Key Highlights</div>
                          <div className="space-y-1">
                            {phaseHighlights.map((h, i) => (
                              <div key={i} className="flex items-start gap-1.5 p-1 rounded bg-fpl-dark/30">
                                <span className="text-xs flex-shrink-0 mt-0.5">{h.icon}</span>
                                <p className="text-[10px] font-inter text-fpl-text-secondary leading-snug">
                                  {h.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-fpl-text-secondary font-inter py-2">No highlights yet</div>
                      )}
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
