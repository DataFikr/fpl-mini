'use client';

import { useEffect, useState } from 'react';
import { isFreeLaunchWindow } from '@/lib/premium';

/**
 * Client-side account + saved-team helpers (workstream E1).
 *
 * Team id is persisted in two places: localStorage (works anonymously, offline,
 * across the stateless app) and — when the user is signed in — the account row
 * via /api/me. `fpl_user_team_id` is the pre-existing key used by the public
 * league page, so we standardize on it.
 */
export const TEAM_ID_KEY = 'fpl_user_team_id';

export function getLocalTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TEAM_ID_KEY);
}

export function setLocalTeamId(id: string | number): void {
  if (typeof window === 'undefined') return;
  const v = String(id).trim();
  if (/^\d{1,9}$/.test(v)) window.localStorage.setItem(TEAM_ID_KEY, v);
}

/**
 * Persist a team id: always to localStorage, and — best effort — to the account
 * if signed in. Safe to call from anonymous sessions (the PATCH just 401s).
 */
export function persistTeamId(id: string | number): void {
  setLocalTeamId(id);
  fetch('/api/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fplTeamId: Number(id) }),
  }).catch(() => {});
}

export interface Account {
  authenticated: boolean;
  email?: string;
  fplTeamId?: number | null;
  isPremium?: boolean;
  premiumUntil?: string | null;
  leagues?: number[];
}

/**
 * Fetches the current account once on mount. Also reconciles an anonymous
 * localStorage team id up to a freshly-signed-in account that has none yet.
 */
export function useAccount(): { account: Account | null; loading: boolean } {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me');
        const data: Account = res.ok ? await res.json() : { authenticated: false };
        if (cancelled) return;

        // Launch hold: unlock premium features for everyone (incl. anonymous)
        // through GW5 while monetization is on hold. See src/lib/premium.ts.
        if (isFreeLaunchWindow()) data.isPremium = true;

        // Migrate anonymous localStorage id → account on first login.
        const local = getLocalTeamId();
        if (data.authenticated && !data.fplTeamId && local) {
          data.fplTeamId = Number(local);
          fetch('/api/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fplTeamId: Number(local) }),
          }).catch(() => {});
        }
        // Mirror an account team id down into localStorage for the stateless pages.
        if (data.authenticated && data.fplTeamId) setLocalTeamId(data.fplTeamId);

        setAccount(data);
      } catch {
        if (!cancelled) setAccount({ authenticated: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { account, loading };
}
