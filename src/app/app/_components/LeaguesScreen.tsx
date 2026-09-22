'use client';

import { useRouter } from 'next/navigation';
import type { LeaguesData } from '../_lib/leagues-data';
import { formatRank } from '../_lib/compute';
import { CaptureCard } from './CaptureCard';
import { toast } from './Toast';

function MoveTag({ mv }: { mv: number }) {
  if (mv > 0) return <span className="mv up">▲ {formatRank(mv)}</span>;
  if (mv < 0) return <span className="mv down">▼ {formatRank(-mv)}</span>;
  return <span className="mv flat">— 0</span>;
}

export function LeaguesScreen({ data, teamId: requestedId, notFound }: {
  data?: LeaguesData; teamId?: number; notFound?: boolean;
}) {
  const router = useRouter();
  const leagues = data?.leagues ?? [];
  const teamId = data?.manager.teamId;
  const mini = leagues.filter((l) => l.isCustom).length;

  // Three ways to have no leagues to show, and only one of them is the user's
  // to fix: a wrong ID, no ID at all, or a real team that has joined none.
  const emptyMessage = notFound
    ? `No FPL team has ID ${requestedId}. Team IDs are reissued each season — check the number and try again from the home screen.`
    : requestedId === undefined
      ? 'Enter your FPL team ID on the home screen to see the mini-leagues you are in.'
      : 'This team has not joined any mini-leagues yet.';

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="scr-title">MY LEAGUES</div>
          <div className="scr-sub">{data?.manager.team ? `${data.manager.team} · ` : ''}{mini} mini-league{mini === 1 ? '' : 's'} · tap to open</div>
        </div>
      </div>

      {leagues.length === 0 ? (
        <p className="kit-intro">{emptyMessage}</p>
      ) : leagues.map((l) => {
        const h2h = l.type === 'Head-to-head';
        return (
          <a
            className="lg-row"
            key={`${l.type}-${l.id}`}
            onClick={() => h2h
              ? toast('Head-to-head analysis — coming soon')
              : router.push(`/app/league/${l.id}${teamId ? `?teamId=${teamId}` : ''}`)}
          >
            <div className="badge" style={{ background: l.bg, ...(l.bg === '#FF5050' ? {} : { color: '#fff' }) }}>{l.code}</div>
            <div>
              <div className="nm">{l.name}</div>
              <div className="mt">{l.type} · {formatRank(l.size)} {h2h ? 'players' : 'managers'}</div>
            </div>
            <div className="rkbox"><div className="pos">{formatRank(l.rank)}<small>/{formatRank(l.size)}</small></div><MoveTag mv={l.move} /></div>
          </a>
        );
      })}

      <a className="lg-row" onClick={() => toast('Join a league — coming soon')} style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--t3)' }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 16, letterSpacing: '.03em' }}>+ JOIN OR CREATE A LEAGUE</span>
      </a>

      {/* The ask, placed on the Engine rather than on the pages people bounce off.
          My Leagues is the second-densest surface in the product — 279 views from
          79 users at 5.7% bounce in the 21 Sep diagnostic — and until now it was
          the only core-app screen carrying no signup ask at all, while the asks
          sat on the landing page (47.9% bounce) and the prices page (65.2%).
          Rendered only once a table has actually loaded: an empty screen has
          proved nothing yet, so there is nothing to lose and nothing to save. */}
      {leagues.length > 0 && teamId !== undefined && (
        <CaptureCard
          mode="save-league"
          teamId={teamId}
          leagueCount={mini || leagues.length}
          placement="leagues_screen"
        />
      )}
    </>
  );
}
