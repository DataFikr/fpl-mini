'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/lib/use-account';
import { trackEvent, trackSignup } from '@/lib/analytics';
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
 * Three modes, kept deliberately separate so consent stays clean:
 *   save-team   → magic-link account, framed on the squad (transactional)
 *   save-league → magic-link account, framed on the mini-leagues (transactional)
 *   newsletter  → league newsletter (explicit marketing opt-in)
 * Never do both from one field. The two account modes differ only in copy and
 * in where the link returns you; both are the same transactional sign-in.
 *
 * Copy is loss-framed on purpose. The 21 Sep 2026 diagnostic put signup at 0.40%
 * over the preceding sixteen days, against copy that sold convenience ("one tap
 * away", "no password"). What is actually at stake is concrete: the team id
 * lives in this browser only, so clearing it loses the squad and every league
 * with it. Saying that outperforms selling tidiness.
 */

type Mode = 'save-team' | 'save-league' | 'newsletter';

/** Both account modes post the same magic-link request; only framing differs. */
const isAccountMode = (m: Mode) => m === 'save-team' || m === 'save-league';

const dismissKey = (mode: Mode, id: string | number) => `fplr:capture:${mode}:${id}`;

export function CaptureCard({
  mode, teamId, teamName, leagueId, leagueName, gameweek, leagueCount, placement,
}: {
  mode: Mode;
  teamId?: number;
  teamName?: string;
  leagueId?: number;
  leagueName?: string;
  gameweek?: number;
  /** save-league only: how many mini-leagues are on screen, for the copy. */
  leagueCount?: number;
  /**
   * GA4 `placement` on the emitted event. Defaults to the mode, so the funnel
   * can tell a squad-screen signup from a leagues-screen one — without it every
   * core-app signup collapses into one undifferentiated bucket and there is no
   * way to see which Engine surface actually converts.
   */
  placement?: string;
}) {
  const { account, loading } = useAccount();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until localStorage is read

  // The leagues index has no single league id, so account modes key off the team.
  const key = dismissKey(mode, (isAccountMode(mode) ? teamId ?? leagueId : leagueId) ?? 'x');
  const where = placement ?? mode;

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
      // Where the magic link should land: back on the screen the ask was made
      // from, so signing in continues the session instead of restarting it.
      const next = mode === 'save-league'
        ? (teamId ? `/app/leagues?teamId=${teamId}` : '/app/leagues')
        : (teamId ? `/app/squad?teamId=${teamId}` : '/app/home');

      const res = isAccountMode(mode)
        ? await fetch('/api/auth/request', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: v, next }),
          })
        : await fetch('/api/newsletter/subscribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: v, leagueId, leagueName, gameweek, subscriptionType: 'newsletter' }),
          });
      if (!res.ok) throw new Error();
      setDone(true);
      if (isAccountMode(mode)) {
        // `sign_up`, not a bespoke name. This posts to /api/auth/request and
        // sends a real magic link, so it is the same funnel step as the login
        // page — but it used to fire `save_team_request`, which is not in
        // KEY_EVENTS and was never marked in the GA4 console. Every signup from
        // the squad screen, the highest-intent surface in the app, was therefore
        // missing from the conversion count the 21 Sep diagnostic read as 0.76%.
        trackSignup(where);
      } else {
        trackEvent('subscribe_newsletter', {
          placement: where,
          ...(leagueId ? { league_id: String(leagueId) } : {}),
        });
      }
      try { localStorage.setItem(key, '1'); } catch { /* ignore */ }
    } catch {
      toast('Something went wrong — try again');
    } finally {
      setBusy(false);
    }
  };

  // Signed-in users already gave us an identity; don't ask again for the account.
  if (loading || dismissed) return null;
  if (isAccountMode(mode) && account?.authenticated) return null;

  if (done) {
    return (
      <div className="cap-card cap-done">
        <span className="cap-tick" aria-hidden="true">✓</span>
        <div>
          <b>{isAccountMode(mode) ? 'Check your inbox' : "You're subscribed"}</b>
          <p>
            {mode === 'save-team'
              ? 'We sent a sign-in link. Click it and your team stays saved on every device.'
              : mode === 'save-league'
                ? 'We sent a sign-in link. Click it and your leagues follow you onto every device.'
                : `You're in. ${leagueName || 'Your league'}'s deadline reminder and gameweek report land in your inbox from the next gameweek.`}
          </p>
        </div>
      </div>
    );
  }

  const copy = mode === 'save-team'
    ? {
        kicker: 'Save your team',
        title: teamName ? `Don't lose ${teamName}` : "Don't lose this team",
        body: 'Your team ID is remembered in this browser only — clear it, or pick up your phone instead, and you are back to typing it in. A sign-in link keeps it on every device.',
        cta: 'Save my team',
      }
    : mode === 'save-league'
      ? {
          kicker: 'Save your leagues',
          title: leagueCount ? `Don't lose these ${leagueCount} leagues` : "Don't lose your leagues",
          body: 'These leagues are remembered in this browser only — clear it, or open the site on another device, and you start from your team ID again. A sign-in link keeps them wherever you are.',
          cta: 'Save my leagues',
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
      <form id={`capture-${mode}`} name={`capture-${mode}`} onSubmit={submit} noValidate>
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
        {isAccountMode(mode) ? 'No password. No spam.' : 'Twice a gameweek. Unsubscribe in one click.'}
      </span>
    </div>
  );
}
