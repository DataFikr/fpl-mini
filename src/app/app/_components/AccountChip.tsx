'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, getLocalTeamId } from '@/lib/use-account';

/**
 * Header account control (mockup 05). Anonymous → ghost "Sign in" button;
 * signed-in → an ink initial badge (notch-cut) that opens a small menu.
 * Premium adds a yellow frame + star. Sportify tokens (no hardcoded hex).
 */
export function AccountChip() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<{ id: number; name: string } | null>(null);

  // The linked FPL team, shown under the email so the profile says *which*
  // squad this account is tied to. Falls back to the anonymous localStorage id
  // for the window between signing in and the account row catching up.
  const linkedId = account?.fplTeamId ?? (account?.authenticated ? Number(getLocalTeamId()) || null : null);
  useEffect(() => {
    if (!linkedId) { setTeam(null); return; }
    let alive = true;
    fetch(`/api/teams/${linkedId}/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.name) setTeam({ id: linkedId, name: d.name }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [linkedId]);

  if (loading) return null;

  if (!account?.authenticated) {
    return (
      <button className="acct-signin" onClick={() => router.push('/auth/login')}>
        Sign in
      </button>
    );
  }

  const initial = (account.email?.[0] || 'U').toUpperCase();
  const premium = !!account.isPremium;

  return (
    <span className="acct-menu-anchor">
      <span className={`acct-wrap${premium ? ' premium' : ''}`}>
        <button
          className="acct-badge"
          aria-label="Account menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {initial}
        </button>
        {premium && <span className="acct-star" aria-hidden="true">★</span>}
      </span>

      {open && (
        <>
          <div className="acct-backdrop" onClick={() => setOpen(false)} />
          <div className="acct-menu" role="menu">
            <div className="who">
              <div className="em">{account.email}</div>
              {linkedId ? (
                <div className="acct-team">
                  <span className="tid">{linkedId}</span>
                  <span className="tnm">{team?.name ?? 'Linked FPL team'}</span>
                </div>
              ) : (
                <div className="acct-team acct-team--none">No FPL team linked yet</div>
              )}
              <span className={`plan${premium ? ' premium' : ''}`}>
                <span className="sq" />{premium ? '★ Premium' : 'Free plan'}
              </span>
            </div>
            {linkedId ? (
              <button className="acct-item" role="menuitem" onClick={() => { setOpen(false); router.push(`/app/home?teamId=${linkedId}`); }}>
                Open my hub
              </button>
            ) : (
              <button className="acct-item" role="menuitem" onClick={() => { setOpen(false); router.push('/app/home'); }}>
                Link my FPL team
              </button>
            )}
            {!premium && (
              <button className="acct-item go-prem" role="menuitem" onClick={() => { setOpen(false); router.push('/premium'); }}>
                Go premium
              </button>
            )}
            <a className="acct-item" role="menuitem" href="/api/auth/logout">Log out</a>
          </div>
        </>
      )}
    </span>
  );
}
