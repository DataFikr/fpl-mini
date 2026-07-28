'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';

/**
 * Magic-link login (workstream A). Sportify-styled per mockup 04:
 * default / invalid-link error / sent / sending states.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const invalid = params?.get('error') === 'invalid';
  const next = params?.get('next') || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="sportify-page">
      <div className="login-stage">
        <main className="login-card">
          <Link href="/" className="logo"><span className="bolt" />FPL RANKER</Link>

          {status === 'sent' ? (
            <>
              <div className="sent" role="status">
                <span className="ic" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m4 12.5 5 5L20 6.5" /></svg>
                </span>
                <h2>Check your inbox</h2>
                <p>We&rsquo;ve sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes — open it on this device.</p>
              </div>
              <p className="resend">
                Wrong address? <a onClick={() => { setStatus('idle'); setEmail(''); }} role="button" tabIndex={0}>Use a different email</a>
              </p>
            </>
          ) : (
            <>
              <h1>Sign in</h1>
              <p className="sub">We&rsquo;ll email you a one-time sign-in link. No password needed.</p>

              {invalid && status === 'idle' && (
                <p className="err" role="alert">That sign-in link was invalid or expired. Request a new one below.</p>
              )}
              {status === 'error' && (
                <p className="err" role="alert">{message}</p>
              )}

              <form onSubmit={submit}>
                <label className="f-label" htmlFor="email">Email</label>
                <input
                  className="f-input"
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <button type="submit" className="s-btn s-btn--red hex" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
                </button>
              </form>
              <p className="fine">Link expires in 15 minutes</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
