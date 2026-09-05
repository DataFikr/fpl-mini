'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/**
 * Email capture for the public league page — the page a shared link lands on.
 *
 * The Sep 2026 diagnostic found this surface had no capture of any kind: no
 * CaptureCard, no SubscribeButton, nothing. These are the warmest arrivals on
 * the site — someone's mate sent them a link about a league they are actually
 * in — and the page asked for nothing at all. Meanwhile Gate 2 needs the warm
 * audience to go from 16 to ~400.
 *
 * Separate from the app's SubscribeButton because that component's styles
 * (`sub-banner`, `sub-sheet`) live in the app stylesheet bundle, which this
 * route does not load. This matches the dark Tailwind language of the page it
 * sits on instead.
 *
 * Subscribing is single opt-in as of the same review, so a submit here is a
 * live subscriber — no confirmation click stands between them and the list.
 */
export function LeagueCaptureCard({ leagueId, leagueName, gameweek }: {
  leagueId: number;
  leagueName: string;
  gameweek?: number;
}) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, leagueId, leagueName, gameweek, subscriptionType: 'newsletter' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Subscription failed');
      }
      setDone(true);
      trackEvent('subscribe_newsletter', { placement: 'league_share_page', league_id: String(leagueId) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-fpl border border-fpl-accent/40 bg-fpl-dark/40 backdrop-blur-fpl p-5 flex items-center gap-3">
        <span className="inline-flex p-2 rounded-lg bg-fpl-accent/20 text-fpl-accent flex-shrink-0">
          <Check className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-jakarta font-bold text-white text-sm">You&rsquo;re subscribed</h3>
          <p className="font-inter text-xs text-fpl-text-secondary mt-0.5">
            {leagueName} reports land in your inbox from the next gameweek — a pre-deadline nudge and a post-gameweek recap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-fpl border border-fpl-primary/30 bg-fpl-dark/40 backdrop-blur-fpl p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="inline-flex p-2 rounded-lg bg-gradient-to-r from-fpl-primary to-fpl-violet-600 text-white flex-shrink-0">
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-jakarta font-bold text-white text-base leading-tight">
            Never miss a {leagueName} deadline
          </h3>
          <p className="font-inter text-xs md:text-sm text-fpl-text-secondary mt-1">
            A pre-deadline reminder and a post-gameweek recap for this league, twice a gameweek. Free.
          </p>
        </div>
      </div>

      <form
        id="league-share-capture"
        name="league-share-capture"
        onSubmit={submit}
        noValidate
        className="flex flex-wrap gap-2"
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="Email address"
          aria-invalid={!!error}
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
          disabled={busy}
          className={`flex-1 min-w-0 basis-56 rounded-lg bg-white/10 px-3 py-2.5 font-inter text-sm text-white placeholder:text-fpl-text-secondary border ${
            error ? 'border-red-400' : 'border-white/15'
          } focus:outline-none focus:ring-2 focus:ring-fpl-primary`}
        />
        <button
          type="submit"
          disabled={busy}
          className="flex-shrink-0 rounded-lg bg-gradient-to-r from-fpl-primary to-fpl-violet-600 px-4 py-2.5 font-jakarta font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          {busy ? 'Subscribing…' : 'Send it to me'}
        </button>
      </form>

      {error && (
        <p role="alert" className="font-inter text-xs text-red-400 mt-2">{error}</p>
      )}
      <p className="font-inter text-[11px] text-fpl-text-secondary mt-2">
        Twice a gameweek. Unsubscribe in one click.
      </p>
    </div>
  );
}
