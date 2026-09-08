'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { markSelfEnteredTeamId, setActiveTeamId } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';

interface Props {
  leagueId: number;
  /** Everyone in this league — the recipient is almost certainly one of them. */
  managers: { id: number; team: string; mgr: string }[];
  /** The team the shared link was highlighting, so the copy can name it. */
  sharerTeam?: string;
}

/**
 * Onboarding for someone who arrived on a league through a shared link.
 *
 * The old path made a recipient work for it: the link marked the *sharer's* row
 * as "you", nothing on the page offered a way to correct that, and the only
 * route to their own view was to leave for /app and enter an FPL team ID — an id
 * most people do not know, which is why the app ships a guide page explaining
 * where to find it.
 *
 * None of that is necessary here. A shared league link already carries the whole
 * roster, so the recipient's own row is on screen: the question is not "what is
 * your team ID" but "which of these is you". One tap answers it, marks the id as
 * self-entered (so it is theirs, not an inherited identity — see
 * markSelfEnteredTeamId) and reloads the league focused on their row.
 */
export function ClaimRowBanner({ leagueId, managers, sharerTeam }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return managers
      .filter((m) => m.team.toLowerCase().includes(t) || m.mgr.toLowerCase().includes(t))
      .slice(0, 6);
  }, [q, managers]);

  const claim = (id: number) => {
    setBusy(true);
    trackEvent('shared_link_claim_row', { league_id: String(leagueId) });
    // Marks it as this visitor's own team before navigating, so the shell files
    // it as `self` rather than another browsed id.
    markSelfEnteredTeamId(id);
    setActiveTeamId(id, 'self');
    router.push(`/app/league/${leagueId}?teamId=${id}`);
  };

  return (
    <div
      style={{
        border: '1px solid var(--line)', borderLeft: '3px solid var(--red)',
        padding: '12px 14px', marginBottom: 12, background: 'rgba(255,80,80,.04)',
      }}
    >
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--red)' }}>
        Shared with you
      </div>
      <div style={{ fontFamily: 'var(--body)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', marginTop: 3 }}>
        {sharerTeam ? `You're viewing ${sharerTeam}'s link. Which one is you?` : 'Which one of these is you?'}
      </div>
      <div style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--t2)', marginTop: 2, lineHeight: 1.45 }}>
        Pick your team to follow your own rank, headlines and rivals — no team ID needed.
      </div>

      <input
        type="text"
        value={q}
        disabled={busy}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type your team or manager name…"
        aria-label="Find your team in this league"
        style={{
          width: '100%', marginTop: 9, padding: '9px 10px', fontFamily: 'var(--body)',
          fontSize: 14, color: 'var(--ink)', background: '#fff', border: '1px solid var(--line)',
        }}
      />

      {matches.length > 0 && (
        <div style={{ marginTop: 6, display: 'grid', gap: 4 }}>
          {matches.map((m) => (
            <button
              key={m.id}
              disabled={busy}
              onClick={() => claim(m.id)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10,
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '8px 10px', background: '#fff', border: '1px solid var(--line)',
                fontFamily: 'var(--body)', fontSize: 13.5, color: 'var(--ink)',
              }}
            >
              <span style={{ fontWeight: 700 }}>{m.team}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--t3)' }}>{m.mgr}</span>
            </button>
          ))}
        </div>
      )}

      {q.trim() && matches.length === 0 && (
        <div style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--t2)', marginTop: 6 }}>
          No match in this league.{' '}
          <a
            onClick={() => router.push('/app/home')}
            style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }}
          >
            Enter your team ID instead →
          </a>
        </div>
      )}
    </div>
  );
}
