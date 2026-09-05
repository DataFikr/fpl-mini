'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Opt-in for squad deadline reminders, placed on the squad screen.
 *
 * The deadline reminder scores 3.5/4 on the painkiller rubric — the highest of
 * anything the product ships — and until now it only reached people who had
 * joined a mini-league newsletter. Anyone looking at their own squad has
 * demonstrated exactly the intent it serves, so the ask belongs here.
 *
 * One field, single opt-in: a submit is a live subscriber. Errors render inline
 * because this is the ask, and a silent failure here costs a subscriber.
 */
const dismissKey = (teamId: number) => `fplr:reminder:${teamId}`;

export function DeadlineReminderPrompt({ teamId, nextGw }: { teamId: number; nextGw?: number }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  // Assume hidden until localStorage is read, so it never flashes for someone
  // who has already subscribed or dismissed it.
  const [hidden, setHidden] = useState(true);

  const key = dismissKey(teamId);
  useEffect(() => {
    try { setHidden(localStorage.getItem(key) === '1'); } catch { setHidden(false); }
  }, [key]);

  const dismiss = () => {
    try { localStorage.setItem(key, '1'); } catch { /* private mode */ }
    setHidden(true);
    trackEvent('capture_dismiss', { mode: 'deadline_reminder' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError('Enter a valid email address.'); return; }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, teamId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Could not save that.');
      }
      setDone(true);
      trackEvent('subscribe_deadline_reminder', { placement: 'squad_screen' });
      try { localStorage.setItem(key, '1'); } catch { /* ignore */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  if (hidden) return null;

  if (done) {
    return (
      <div className="cap-card cap-done">
        <span className="cap-tick" aria-hidden="true">✓</span>
        <div>
          <b>Reminders on</b>
          <p>Before every deadline we&rsquo;ll email you which of your players are flagged, and who you have the armband on.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cap-card">
      <button className="cap-x" aria-label="Dismiss" onClick={dismiss}>✕</button>
      <div className="cap-kicker"><span className="dot" />{nextGw ? `Gameweek ${nextGw} deadline` : 'Deadline reminder'}</div>
      <h3>Don&rsquo;t start a flagged player</h3>
      <p>
        We&rsquo;ll email you before the deadline with any of <em>your</em> players who are injured,
        suspended or doubtful — and who you currently have as captain.
      </p>
      <form id="deadline-reminder" name="deadline-reminder" onSubmit={submit} noValidate>
        <label className="id-field cap-field" aria-label="Email address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" /><path d="m3 6 9 7 9-7" />
          </svg>
          <input
            type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            disabled={busy}
            aria-invalid={!!error}
          />
          <button className="s-btn s-btn--red hex" type="submit" disabled={busy}>
            {busy ? '…' : 'Remind me'}
          </button>
        </label>
      </form>
      {error && <span className="cap-fine" role="alert" style={{ color: 'var(--red)' }}>{error}</span>}
      <span className="cap-fine">Once a gameweek. Unsubscribe in one click.</span>
    </div>
  );
}
