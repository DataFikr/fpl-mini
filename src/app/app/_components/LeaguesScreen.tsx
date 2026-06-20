'use client';

import { useRouter } from 'next/navigation';
import type { LeaguesData } from '../_lib/leagues-data';
import { formatRank } from '../_lib/compute';
import { toast } from './Toast';

function MoveTag({ mv }: { mv: number }) {
  if (mv > 0) return <span className="mv up">▲ {formatRank(mv)}</span>;
  if (mv < 0) return <span className="mv down">▼ {formatRank(-mv)}</span>;
  return <span className="mv flat">— 0</span>;
}

export function LeaguesScreen({ data }: { data?: LeaguesData }) {
  const router = useRouter();
  const leagues = data?.leagues ?? [];
  const teamId = data?.manager.teamId;
  const mini = leagues.filter((l) => l.isCustom).length;

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="scr-title">MY LEAGUES</div>
          <div className="scr-sub">{data?.manager.team ? `${data.manager.team} · ` : ''}{mini} mini-league{mini === 1 ? '' : 's'} · tap to open</div>
        </div>
      </div>

      {leagues.length === 0 ? (
        <p className="kit-intro">No leagues found for this team ID. Enter a valid FPL team ID on the home screen.</p>
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
    </>
  );
}
