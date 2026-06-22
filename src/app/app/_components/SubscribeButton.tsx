'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { toast } from './Toast';

interface Story { tag: string; title: string }

interface Props {
  leagueId: number;
  leagueName: string;
  gameweek?: number;
  stories?: Story[];
  /** header = compact header action · banner = full-width CTA · inline = modal-footer button */
  variant?: 'header' | 'banner' | 'inline';
}

export function SubscribeButton({ leagueId, leagueName, gameweek, stories, variant = 'header' }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast('Enter a valid email'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, leagueId, leagueName, gameweek, stories, subscriptionType: 'newsletter' }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        trackEvent('subscribe_newsletter', { league_id: String(leagueId), source: variant });
        toast('Subscribed! Check your inbox 📬');
        setTimeout(() => { setOpen(false); setDone(false); setEmail(''); }, 1800);
      } else {
        toast(j?.error || 'Subscription failed — try again');
      }
    } catch {
      toast('Subscription failed — try again');
    } finally {
      setBusy(false);
    }
  };

  const trigger =
    variant === 'banner' ? (
      <button className="sub-banner" onClick={() => setOpen(true)}>
        <span className="sub-banner-ic"><Mail size={18} /></span>
        <span className="sub-banner-tx">
          <b>Get every gameweek in your inbox</b>
          <small>{leagueName} headlines, free — no app needed</small>
        </span>
        <span className="sub-banner-go">Subscribe ›</span>
      </button>
    ) : variant === 'inline' ? (
      <button className="story-copy sub-inline" onClick={() => setOpen(true)}>
        <Mail size={15} /> Get this every gameweek in your inbox
      </button>
    ) : (
      <button className="share-btn sub-hbtn" onClick={() => setOpen(true)} aria-label="Subscribe to newsletter">
        <Mail size={15} /><span>Subscribe</span>
      </button>
    );

  return (
    <>
      {trigger}
      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className="share-sheet sub-sheet" role="dialog" aria-modal="true">
            <div className="ss-head"><span>Get the {leagueName} newsletter</span><button className="ss-x" aria-label="Close" onClick={() => setOpen(false)}>✕</button></div>
            <div className="ss-sub">ESPN-style gameweek headlines from your mini-league — a pre-deadline nudge and a post-gameweek recap, straight to your inbox. Free.</div>
            {done ? (
              <div className="sub-done"><span className="ic"><Check size={20} /></span>You&rsquo;re in! Check your inbox for this week&rsquo;s headlines.</div>
            ) : (
              <form className="sub-form" onSubmit={submit} noValidate>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="sub-submit" disabled={busy}>{busy ? 'Subscribing…' : 'Subscribe free'}</button>
              </form>
            )}
            <div className="sub-fine">One email, twice a gameweek. Unsubscribe anytime.</div>
          </div>
        </>
      )}
    </>
  );
}
