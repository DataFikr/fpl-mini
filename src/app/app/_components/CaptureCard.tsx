'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';
import { toast } from './Toast';

/**
 * Inline email capture placed at the moment of value — right after a squad or a
 * league table has actually rendered.
 *
 * Why inline and not a modal: GA4 shows 20% of visitors start the team-ID form
 * but only 1.6% ever leave an email. That is a placement problem — the existing
 * asks sit in a header menu and on pages people never reach — so this sits in
 * the content flow at the point the product has just proved itself.
 *
 * Two modes, kept deliberately separate so consent stays clean:
 *   save-team  → magic-link account (transactional; no marketing consent implied)
 *   newsletter → double opt-in league newsletter (explicit marketing opt-in)
 * Never do both from one field.
 */

type Mode = 'save-team' | 'newsletter';

const dismissKey = (mode: Mode, id: string | number) => `fplr:capture:${mode}:${id}`;

export function CaptureCard({
  mode, teamId, teamName, leagueId, leagueName, gameweek,
}: {
  mode: Mode;
  teamId?: number;
  teamName?: string;
  leagueId?: number;
  leagueName?: string;
  gameweek?: number;
}) {
  const { account, loading } = useAccount();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until localStorage is read

  const key = dismissKey(mode, (mode === 'save-team' ? teamId : leagueId) ?? 'x');

  useEffect(() => {
    try { setDismissed(localStorage.getItem(key) === '1'); } catch { setDismissed(false); }
  }, [key]);

  const hide = () => {
    try { localStorage.setItem(key, '1'); } catch { /* private mode */ }
    setDismissed(true);
    trackEvent('capture_dismiss', { mode });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast('Enter a valid email'); return; }
    setBusy(true);
    try {
      const res = mode === 'save-team'
        ? await fetch('/api/auth/request', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: v, next: teamId ? `/app/squad?teamId=${teamId}` : '/app/home' }),
          })
        : await fetch('/api/newsletter/subscribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: v, leagueId, leagueName, gameweek, subscriptionType: 'newsletter' }),
          });
      if (!res.ok) throw new Error();
      setDone(true);
      trackEvent(mode === 'save-team' ? 'save_team_request' : 'subscribe_newsletter', {
        placement: 'capture_card',
        ...(leagueId ? { league_id: String(leagueId) } : {}),
      });
      try { localStorage.setItem(key, '1'); } catch { /* ignore */ }
    } catch {
      toast('Something went wrong — try again');
    } finally {
      setBusy(false);
    }
  };

  // Signed-in users already gave us an identity; don't ask again for the account.
  if (loading || dismissed) return null;
  if (mode === 'save-team' && account?.authenticated) return null;

  if (done) {
    return (
      <div className="cap-card cap-done">
        <span className="cap-tick" aria-hidden="true">✓</span>
        <div>
          <b>Check your inbox</b>
          <p>
            {mode === 'save-team'
              ? 'We sent a sign-in link. Click it and your team stays saved on every device.'
              : `We sent a confirmation link. Click it and ${leagueName || 'your league'}'s reports start arriving.`}
          </p>
        </div>
      </div>
    );
  }

  const copy = mode === 'save-team'
    ? {
        kicker: 'Save your team',
        title: teamName ? `Keep ${teamName} one tap away` : 'Keep your team one tap away',
        body: 'Get a sign-in link by email — no password. Your team ID is saved, so you land straight on your squad next time.',
        cta: 'Save my team',
      }
    : {
        kicker: `Gameweek ${gameweek ? gameweek + 1 : ''} deadline`.trim(),
        title: 'Never miss a deadline again',
        body: `Get ${leagueName || 'your league'}'s deadline reminder and gameweek report by email — twice a gameweek, free.`,
        cta: 'Send it to me',
      };

  return (
    <div className="cap-card">
      <button className="cap-x" aria-label="Dismiss" onClick={hide}>✕</button>
      <div className="cap-kicker"><span className="dot" />{copy.kicker}</div>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
      <form onSubmit={submit} noValidate>
        <label className="id-field cap-field" aria-label="Email address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" /><path d="m3 6 9 7 9-7" />
          </svg>
          <input
            type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy}
          />
          <button className="s-btn s-btn--red hex" type="submit" disabled={busy}>
            {busy ? '…' : copy.cta}
          </button>
        </label>
      </form>
      <span className="cap-fine">
        {mode === 'save-team' ? 'No password. No spam.' : 'Double opt-in — unsubscribe in one click.'}
      </span>
    </div>
  );
}
