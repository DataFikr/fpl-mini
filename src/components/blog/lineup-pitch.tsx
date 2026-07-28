import { GenericJersey } from '@/components/ui/generic-jersey';
import type { BlogLineup, LineupPlayer } from '@/content/blog-posts';

/**
 * Renders a suggested XI on a football pitch using copyright-clean generic
 * jerseys (team colour + 3-letter code, no crests/kits). Server component —
 * no client JS. Used by blog posts that carry `lineups`.
 */
export function LineupPitch({ lineup }: { lineup: BlogLineup }) {
  const rows: { key: LineupPlayer['position']; players: LineupPlayer[] }[] = [
    { key: 'GK', players: lineup.players.filter((p) => p.position === 'GK') },
    { key: 'DEF', players: lineup.players.filter((p) => p.position === 'DEF') },
    { key: 'MID', players: lineup.players.filter((p) => p.position === 'MID') },
    { key: 'FWD', players: lineup.players.filter((p) => p.position === 'FWD') },
  ];

  return (
    <figure className="my-6">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <div>
          <a
            href={lineup.sourceUrl}
            target="_blank"
            rel="noopener nofollow"
            className="text-sm font-jakarta font-bold text-fpl-accent hover:underline"
          >
            {lineup.source} ↗
          </a>
          {lineup.formation && (
            <span className="ml-2 text-xs font-mono text-fpl-text-secondary">{lineup.formation}</span>
          )}
        </div>
      </div>

      {/* Pitch */}
      <div
        className="relative rounded-fpl overflow-hidden border border-white/10 py-4 px-2"
        style={{
          background:
            'repeating-linear-gradient(0deg, #146c3a 0px, #146c3a 44px, #12633534 44px, #12633534 88px)',
        }}
      >
        {/* Centre line + circle */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/25" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/25" />

        <div className="relative flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.key} className="flex justify-center gap-3 sm:gap-6 flex-wrap">
              {row.players.map((p, i) => (
                <div key={`${p.name}-${i}`} className="flex flex-col items-center w-[62px] sm:w-[72px]">
                  <div className="relative">
                    <GenericJersey shortName={p.team} size={42} className="drop-shadow-md" />
                    {p.isCaptain && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold border border-white">
                        C
                      </span>
                    )}
                  </div>
                  <span className="mt-1 w-full truncate text-center text-[10px] font-jakarta font-semibold text-white bg-black/45 rounded px-1 py-0.5" title={p.name}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {lineup.note && (
        <figcaption className="mt-2 text-xs text-fpl-text-secondary font-inter">{lineup.note}</figcaption>
      )}
    </figure>
  );
}
