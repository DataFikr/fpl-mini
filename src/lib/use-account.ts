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
export const TEAM_ID_SOURCE_KEY = 'fpl_user_team_id_source';

/**
 * Where the active team id came from.
 *
 *   - `self`   — this visitor entered it (team-entry form, account menu link).
 *                Only a `self` id may be adopted as the account's linked team.
 *   - `shared` — it arrived from someone else's link, or from tapping a rival.
 *                It is fine to *browse*, never to inherit.
 *
 * Without this distinction a shared league link handed the recipient the
 * sharer's identity: `?teamId=` was written straight to the active id, and the
 * first sign-in then adopted it as the new account's linked team. The recipient
 * ended up owning a stranger's squad, and unlinking left the id in place because
 * the cookie still pointed at it.
 */
export type TeamIdSource = 'self' | 'shared';

/** The team currently being browsed (may be a rival's), not the linked one. */
export function getActiveTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TEAM_ID_KEY);
}

/** Provenance of the active id. Defaults to `shared` — the safe assumption. */
export function getActiveTeamSource(): TeamIdSource {
  if (typeof window === 'undefined') return 'shared';
  return window.localStorage.getItem(TEAM_ID_SOURCE_KEY) === 'self' ? 'self' : 'shared';
}

/**
 * Point the browsing context at a team. Local only — this is the id the nav
 * tabs and server-rendered screens follow, and it says nothing about which team
 * the account owns.
 */
export function setActiveTeamId(id: string | number, source: TeamIdSource = 'self'): void {
  if (typeof window === 'undefined') return;
  const v = String(id).trim();
  if (!/^\d{1,9}$/.test(v)) return;
  window.localStorage.setItem(TEAM_ID_KEY, v);
  window.localStorage.setItem(TEAM_ID_SOURCE_KEY, source);
  // Mirrored into a cookie so server-rendered screens (squad, leagues) can load
  // the right manager without a ?teamId= in the URL — see src/lib/team-id.ts.
  document.cookie = `${TEAM_ID_COOKIE}=${v}; path=/; max-age=${TEAM_ID_MAX_AGE}; samesite=lax`;
}

/**
 * Per-tab record of an id the visitor just typed as their own.
 *
 * Team entry deliberately does not persist the id at the point of typing (it is
 * unverified — remembering a typo would follow someone around every screen), so
 * provenance cannot be written there. This marker carries the *claim* through
 * the navigation to Home; the shell reads it when it persists the resolved id
 * and marks that id `self`. Anything arriving without a matching claim — a
 * shared link, a tap on a rival's row — is `shared`.
 *
 * sessionStorage rather than localStorage: a claim is scoped to the tab that
 * made it, so a shared link opened in a new tab can never inherit one.
 */
export const TEAM_ID_CLAIM_KEY = 'fpl_team_id_claim';

/** Record that this visitor typed `id` as their own team. */
export function markSelfEnteredTeamId(id: string | number): void {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(TEAM_ID_CLAIM_KEY, String(id).trim()); } catch { /* private mode */ }
}

/** The id this tab claimed as its own, if any. */
export function getSelfClaimedTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage.getItem(TEAM_ID_CLAIM_KEY); } catch { return null; }
}

/**
 * Drop the browsing context entirely — localStorage, provenance and the cookie
 * the server reads.
 *
 * Clearing the cookie matters as much as the key: server components resolve the
 * team through `resolveTeamId()`, so leaving it behind kept every rendered
 * screen pointed at the old manager even after an unlink, which is what forced
 * people to /app to start over.
 */
export function clearActiveTeamId(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TEAM_ID_KEY);
  window.localStorage.removeItem(TEAM_ID_SOURCE_KEY);
  try { window.sessionStorage.removeItem(TEAM_ID_CLAIM_KEY); } catch { /* private mode */ }
  document.cookie = `${TEAM_ID_COOKIE}=; path=/; max-age=0; samesite=lax`;
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

/**
 * Cut the account loose from its team, and stop browsing as that team.
 *
 * The browsing context used to survive an unlink. Because it lives in a cookie
 * the server reads, every screen kept rendering the team that had just been
 * unlinked, and the account menu re-offered it as "Link team <id>" — so the only
 * way out was to navigate to /app and enter a different id by hand.
 */
export async function unlinkTeamId(): Promise<boolean> {
  try {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fplTeamId: null }),
    });
    if (res.ok) clearActiveTeamId();
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
        // through the free window (GW8) while monetization is on hold.
        // See src/lib/premium.ts.
        if (isFreeLaunchWindow()) data.isPremium = true;

        const active = getActiveTeamId();
        // Only a self-entered id may be adopted. An id that arrived from a
        // shared link is someone else's team: adopting it silently made the
        // recipient's brand-new account own the sharer's squad.
        const ownId = active && getActiveTeamSource() === 'self' ? active : null;

        if (data.authenticated && !data.fplTeamId && ownId) {
          // First sign-in from an anonymous session: adopt the team they were
          // already using. Unforced, so it can never overwrite an existing link.
          data.fplTeamId = Number(ownId);
          fetch('/api/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fplTeamId: Number(ownId) }),
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
