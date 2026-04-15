'use client';

import { X } from 'lucide-react';

interface FormEntry {
  gw: number;
  points: number;
  opponent: string;
  opponentCode: number;
  difficulty: number;
  wasHome: boolean;
}

interface FixtureEntry {
  event: number;
  opponent: string;
  opponentCode: number;
  isHome: boolean;
  difficulty: number;
}

interface ComparePlayer {
  id: number;
  name: string;
  position: string;
  price: string;
  teamShort: string;
  teamCode: number;
  form: FormEntry[];
  upcomingFixtures: FixtureEntry[];
  avgFormPoints?: number;
  totalPoints?: number;
  formTotal?: number;
}

interface ComparePlayersModalProps {
  player: ComparePlayer;
  alternative: ComparePlayer;
  formGwColumns: { id: number; name: string }[];
  upcomingGwColumns: { id: number; name: string }[];
  onClose: () => void;
}

const getFDRColor = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 'bg-[#257d5a] text-white';
    case 2: return 'bg-[#00ff87] text-gray-900';
    case 3: return 'bg-[#ebebe4] text-gray-900';
    case 4: return 'bg-[#ff1751] text-white';
    case 5: return 'bg-[#861d46] text-white';
    default: return 'bg-gray-600 text-white';
  }
};

function PlayerRow({
  player,
  label,
  labelColor,
  formGwColumns,
  upcomingGwColumns,
}: {
  player: ComparePlayer;
  label: string;
  labelColor: string;
  formGwColumns: { id: number; name: string }[];
  upcomingGwColumns: { id: number; name: string }[];
}) {
  const formTotal = player.formTotal ?? player.form.reduce((s, f) => s + f.points, 0);
  const avgPts = player.avgFormPoints ?? (player.form.length > 0 ? Math.round((formTotal / player.form.length) * 10) / 10 : 0);

  return (
    <div className="bg-fpl-dark/60 rounded-lg border border-fpl-primary/15 overflow-hidden">
      {/* Player info row */}
      <div className="flex items-center gap-3 p-3 border-b border-fpl-primary/10">
        {/* Photo */}
        <div className="w-12 h-14 flex-shrink-0 relative">
          <img
            src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.id}.png`}
            alt={player.name}
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`text-[9px] font-jakarta font-bold uppercase tracking-wider ${labelColor}`}>{label}</div>
          <div className="font-jakarta text-white text-sm font-bold truncate">{player.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <img
              src={`https://resources.premierleague.com/premierleague/badges/20/t${player.teamCode}.png`}
              alt={player.teamShort}
              className="w-4 h-4 object-contain"
            />
            <span className="text-[10px] text-fpl-text-secondary font-inter">{player.teamShort}</span>
            <span className="text-[10px] text-fpl-text-secondary font-inter">&pound;{player.price}</span>
            <span className="text-[10px] text-fpl-text-secondary font-inter">{avgPts} avg</span>
          </div>
        </div>
      </div>

      {/* Form + Fixtures grid */}
      <div className="grid grid-cols-2 divide-x divide-fpl-primary/10">
        {/* GW Form */}
        <div>
          <div className="text-center text-[9px] font-jakarta font-semibold text-yellow-400 uppercase tracking-wider py-1.5 border-b border-yellow-400/30 bg-yellow-400/5">
            GW Form
          </div>
          <div className="flex justify-center gap-1.5 p-2">
            {formGwColumns.map((gw) => {
              const gwEntries = player.form.filter((f) => f.gw === gw.id);
              return (
                <div key={gw.id} className="flex flex-col items-center gap-0.5 min-w-[48px]">
                  <div className="text-[8px] text-fpl-text-secondary font-inter">{gw.name}</div>
                  {gwEntries.length > 0 ? (
                    <div className="flex flex-col gap-0.5 w-full">
                      {gwEntries.map((entry, eIdx) => (
                        <div key={eIdx} className={`rounded w-full px-1 py-1 text-center text-[10px] font-inter font-bold ${getFDRColor(entry.difficulty)}`}>
                          <div className="flex items-center justify-center gap-0.5 mb-0.5">
                            {entry.opponentCode > 0 && (
                              <img
                                src={`https://resources.premierleague.com/premierleague/badges/20/t${entry.opponentCode}.png`}
                                alt={entry.opponent}
                                className="w-3 h-3 object-contain"
                              />
                            )}
                          </div>
                          <div>{entry.points}pts</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 rounded w-full px-1 py-1.5 text-center text-[10px] text-fpl-text-secondary font-inter">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixtures */}
        <div>
          <div className="text-center text-[9px] font-jakarta font-semibold text-cyan-400 uppercase tracking-wider py-1.5 border-b border-cyan-400/30 bg-cyan-400/5">
            Fixtures
          </div>
          <div className="flex justify-center gap-1.5 p-2">
            {upcomingGwColumns.map((gw) => {
              const gwFixtures = player.upcomingFixtures.filter((f) => f.event === gw.id);
              return (
                <div key={gw.id} className="flex flex-col items-center gap-0.5 min-w-[48px]">
                  <div className="text-[8px] text-fpl-text-secondary font-inter">{gw.name}</div>
                  {gwFixtures.length > 0 ? (
                    <div className="flex flex-col gap-0.5 w-full">
                      {gwFixtures.map((fix, fixIdx) => (
                        <div key={fixIdx} className={`rounded w-full px-1 py-1 text-center text-[10px] font-inter font-bold ${getFDRColor(fix.difficulty)}`}>
                          <div className="flex items-center justify-center gap-0.5 mb-0.5">
                            {fix.opponentCode > 0 && (
                              <img
                                src={`https://resources.premierleague.com/premierleague/badges/20/t${fix.opponentCode}.png`}
                                alt={fix.opponent}
                                className="w-3 h-3 object-contain"
                              />
                            )}
                          </div>
                          <div>{fix.opponent}</div>
                          <div className="text-[8px]">{fix.isHome ? 'H' : 'A'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 rounded w-full px-1 py-1.5 text-center text-[10px] text-fpl-text-secondary font-inter">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparePlayersModal({
  player,
  alternative,
  formGwColumns,
  upcomingGwColumns,
  onClose,
}: ComparePlayersModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0e1425] rounded-xl shadow-2xl border border-fpl-primary/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-fpl-primary/15">
          <h3 className="font-jakarta font-bold text-white text-sm">Player Comparison</h3>
          <button onClick={onClose} className="text-fpl-text-secondary hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Players */}
        <div className="p-4 space-y-3">
          <PlayerRow
            player={player}
            label="Current"
            labelColor="text-blue-400"
            formGwColumns={formGwColumns}
            upcomingGwColumns={upcomingGwColumns}
          />
          <div className="flex items-center gap-2 justify-center">
            <div className="h-px flex-1 bg-fpl-primary/15" />
            <span className="text-[10px] font-jakarta font-bold text-fpl-text-secondary uppercase">vs</span>
            <div className="h-px flex-1 bg-fpl-primary/15" />
          </div>
          <PlayerRow
            player={alternative}
            label="Alternative"
            labelColor="text-green-400"
            formGwColumns={formGwColumns}
            upcomingGwColumns={upcomingGwColumns}
          />
        </div>

        {/* FDR Key */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[9px] text-fpl-text-secondary font-inter mr-1">FDR:</span>
            {[1, 2, 3, 4, 5].map(d => (
              <div key={d} className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${getFDRColor(d)}`}>{d}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
