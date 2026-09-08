'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, getActiveTeamId, getActiveTeamSource, linkTeamId, unlinkTeamId } from '@/lib/use-account';
import { toast } from './Toast';
import { trackPremiumGateClick } from '@/lib/analytics';

/**
 * Header account control (mockup 05). Anonymous → ghost "Sign in" button;
 * signed-in → an ink initial badge (notch-cut) that opens a small menu.
 * Premium adds a yellow frame + star. Sportify tokens (no hardcoded hex).
 *
 * The menu is the only place the *linked* team moves: browsing a rival changes
 * the active team but leaves the account pointed at its own squad, so this menu
 * has to offer both the way back ("Open my hub") and the way out ("Unlink").
 */
export function AccountChip() {
  const router = useRouter();
  const { account, loading, patchAccount } = useAccount();
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<{ id: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // The FPL team this account owns — strictly the account row. It deliberately
  // ignores the localStorage id, which tracks whoever is being browsed.
  const linkedId = account?.authenticated ? account.fplTeamId ?? null : null;
  // The team on screen right now, offered for linking when the account has none.
  // Only offered when the visitor entered it themselves: one tap here makes it
  // the account's identity, and the id on screen is just as often a stranger's
  // (arrived via a shared link) or a rival's (tapped through the standings).
  const [activeId, setActiveId] = useState<number | null>(null);
  useEffect(() => {
    const id = Number(getActiveTeamId()) || null;
    setActiveId(id && getActiveTeamSource() === 'self' ? id : null);
  }, [open, linkedId]);

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

  const link = async (id: number) => {
    setBusy(true);
    const ok = await linkTeamId(id);
    setBusy(false);
    if (!ok) { toast('Could not link that team — try again'); return; }
    patchAccount({ fplTeamId: id });
    toast(`Team ${id} is now linked to ${account.email}`);
    setOpen(false);
    router.refresh();
  };

  const unlink = async () => {
    setBusy(true);
    const ok = await unlinkTeamId();
    setBusy(false);
    if (!ok) { toast('Could not unlink — try again'); return; }
    patchAccount({ fplTeamId: null });
    setTeam(null);
    setActiveId(null);
    toast('Team unlinked — pick a team to start again');
    setOpen(false);
    // unlinkTeamId() also clears the browsing context, so the screen behind this
    // menu is still rendering the team that was just unlinked. Send them to the
    // entry point rather than refreshing into a stale view — the old behaviour
    // left people on the unlinked team with no way back except typing /app.
    router.replace('/app/home');
    router.refresh();
  };

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
              <>
                <button className="acct-item" role="menuitem" onClick={() => { setOpen(false); router.push(`/app/home?teamId=${linkedId}`); }}>
                  Open my hub
                </button>
                <button className="acct-item acct-unlink" role="menuitem" disabled={busy} onClick={unlink}>
                  {busy ? 'Unlinking…' : `Unlink team ${linkedId}`}
                </button>
              </>
            ) : activeId ? (
              <button className="acct-item" role="menuitem" disabled={busy} onClick={() => link(activeId)}>
                {busy ? 'Linking…' : `Link team ${activeId} to this account`}
              </button>
            ) : (
              <button className="acct-item" role="menuitem" onClick={() => { setOpen(false); router.push('/app/home'); }}>
                Link my FPL team
              </button>
            )}
            {!premium && (
              <button className="acct-item go-prem" role="menuitem" onClick={() => { setOpen(false); trackPremiumGateClick('account_menu'); router.push('/premium'); }}>
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
