'use client';

import { useCallback, useEffect, useState } from 'react';
import { isFreeLaunchWindow } from '@/lib/premium';
import { TEAM_ID_COOKIE, TEAM_ID_MAX_AGE } from '@/lib/team-id';

/**
 * Client-side account + team helpers.
 *
 * Two team ids live side by side, and conflating them is what made a tap on a
 * rival manager silently steal the account's identity:
 *
 *   - the **linked** team — `User.fplTeamId`, the squad this email address owns.
 *     It is written only by an explicit link (or the one-time adoption of an
 *     anonymous id at first sign-in) and cleared only by an explicit unlink.
 *   - the **active** team — the squad currently being browsed. Kept in
 *     localStorage + a cookie so server-rendered screens can resolve it without
 *     a `?teamId=`, and free to change on every tap through the leagues.
 *
 * Browsing therefore moves the active id and never touches the linked one.
 */
export const TEAM_ID_KEY = 'fpl_user_team_id';

/** The team currently being browsed (may be a rival's), not the linked one. */
export function getActiveTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TEAM_ID_KEY);
}

/**
 * Point the browsing context at a team. Local only — this is the id the nav
 * tabs and server-rendered screens follow, and it says nothing about which team
 * the account owns.
 */
export function setActiveTeamId(id: string | number): void {
  if (typeof window === 'undefined') return;
  const v = String(id).trim();
  if (!/^\d{1,9}$/.test(v)) return;
  window.localStorage.setItem(TEAM_ID_KEY, v);
  // Mirrored into a cookie so server-rendered screens (squad, leagues) can load
  // the right manager without a ?teamId= in the URL — see src/lib/team-id.ts.
  document.cookie = `${TEAM_ID_COOKIE}=${v}; path=/; max-age=${TEAM_ID_MAX_AGE}; samesite=lax`;
}

/**
 * Tie a team to the signed-in account, permanently, and make it the active one.
 * `force` is what separates a deliberate re-link from the drive-by writes that
 * used to happen on every screen; the API refuses an unforced overwrite.
 */
export async function linkTeamId(id: string | number, force = true): Promise<boolean> {
  setActiveTeamId(id);
  try {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fplTeamId: Number(id), force }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Cut the account loose from its team. The active (browsing) id is untouched. */
export async function unlinkTeamId(): Promise<boolean> {
  try {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fplTeamId: null }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
 * Fetches the current account once on mount. Also adopts an anonymous
 * localStorage team id into an account that has never linked one — the only
 * implicit write to the linked id there is.
 */
export function useAccount(): {
  account: Account | null;
  loading: boolean;
  /** Apply a locally-known change (link/unlink) without a refetch. */
  patchAccount: (patch: Partial<Account>) => void;
} {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const patchAccount = useCallback((patch: Partial<Account>) => {
    setAccount((a) => (a ? { ...a, ...patch } : a));
  }, []);

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

        const active = getActiveTeamId();
        if (data.authenticated && !data.fplTeamId && active) {
          // First sign-in from an anonymous session: adopt the team they were
          // already using. Unforced, so it can never overwrite an existing link.
          data.fplTeamId = Number(active);
          fetch('/api/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fplTeamId: Number(active) }),
          }).catch(() => {});
        } else if (data.authenticated && data.fplTeamId && !active) {
          // Signed in on a fresh device with nothing selected yet — start them
          // on their own squad. Never overrides a team they are already viewing.
          setActiveTeamId(data.fplTeamId);
        }

        setAccount(data);
      } catch {
        if (!cancelled) setAccount({ authenticated: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { account, loading, patchAccount };
}
