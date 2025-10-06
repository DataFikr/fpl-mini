'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';

interface Standing {
  rank: number;
  teamName: string;
  managerName: string;
  totalPoints: number;
  rankChange?: number;
  lastRank?: number;
}

export function EnhancedStandingsTable({ standings }: { standings: Standing[] }) {
  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-fpl-accent" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-fpl-text-secondary" />;
  };

  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl border border-fpl-primary/20 overflow-hidden">
      <table className="w-full">
        <thead className="bg-fpl-primary/30 border-b border-fpl-primary/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Team</th>
            <th className="px-4 py-3 text-right text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Points</th>
            <th className="px-4 py-3 text-center text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase">Change</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const rankChange = team.lastRank ? team.lastRank - team.rank : 0;
            const isRising = rankChange > 0;
            const isFalling = rankChange < 0;

            return (
              <motion.tr
                key={team.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`
                  border-b border-fpl-primary/10 transition-all hover:bg-fpl-primary/10
                  ${isRising ? 'bg-fpl-accent/5' : isFalling ? 'bg-red-500/5' : ''}
                `}
              >
                {/* Rank Badge with Glow for Top 3 */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`
                      rounded-full w-10 h-10 flex items-center justify-center font-jakarta font-bold text-sm
                      ${team.rank === 1 ? 'bg-gradient-to-br from-fpl-accent to-fpl-lime-600 text-fpl-dark shadow-fpl-glow animate-glow' :
                        team.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                        team.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                        'bg-fpl-primary/20 text-fpl-text-secondary'}
                    `}>
                      {team.rank}
                    </div>
                    {team.rank === 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Crown className="h-5 w-5 text-fpl-accent" />
                      </motion.div>
                    )}
                  </div>
                </td>

                {/* Team Info */}
                <td className="px-4 py-4">
                  <div className="font-jakarta font-semibold text-white">
                    {team.teamName}
                  </div>
                  <div className="font-inter text-sm text-fpl-text-secondary">
                    {team.managerName}
                  </div>
                </td>

                {/* Points */}
                <td className="px-4 py-4 text-right">
                  <div className="font-jakarta font-bold text-lg text-white">
                    {team.totalPoints.toLocaleString()}
                  </div>
                </td>

                {/* Rank Change */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {getRankChangeIcon(rankChange)}
                    {rankChange !== 0 && (
                      <span className={`
                        font-inter text-sm font-semibold
                        ${isRising ? 'text-fpl-accent' : isFalling ? 'text-red-400' : 'text-fpl-text-secondary'}
                      `}>
                        {Math.abs(rankChange)}
                      </span>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
