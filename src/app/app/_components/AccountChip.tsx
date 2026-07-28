'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/lib/use-account';

/**
 * Header account control (mockup 05). Anonymous → ghost "Sign in" button;
 * signed-in → an ink initial badge (notch-cut) that opens a small menu.
 * Premium adds a yellow frame + star. Sportify tokens (no hardcoded hex).
 */
export function AccountChip() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [open, setOpen] = useState(false);

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
              <span className={`plan${premium ? ' premium' : ''}`}>
                <span className="sq" />{premium ? '★ Premium' : 'Free plan'}
              </span>
            </div>
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
