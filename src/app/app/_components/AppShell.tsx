'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { AppMenu } from './AppMenu';
import { AccountChip } from './AccountChip';
import { DesktopSidebar } from './DesktopSidebar';
import {
  getActiveTeamId,
  setActiveTeamId,
  getActiveTeamSource,
  getSelfClaimedTeamId,
  type TeamIdSource,
} from '@/lib/use-account';

interface AppShellProps {
  navActive?: string;
  /** When provided, the (mobile) header shows a back button + title instead of the logo. */
  title?: string;
  backHref?: string;
  /** Desktop topbar subtitle. */
  meta?: string;
  /** Manager context carried across the squad/leagues nav tabs + shown in the sidebar footer. */
  teamId?: string | number;
  /**
   * Remember `teamId` as the *active* (browsed) team — cookie + localStorage —
   * so it survives a hop through a screen that takes no team id, like Players.
   * This never touches the team linked to a signed-in account; that only moves
   * from the account menu. Pass false when the id turned out not to exist —
   * see the squad screen.
   */
  rememberTeamId?: boolean;
  youName?: string;
  /** Optional header/topbar action(s) (e.g. a Share button). */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const TITLE_BY_NAV: Record<string, string> = {
  home: 'Home', squad: 'My Squad', leagues: 'Leagues', players: 'Players', blog: 'Blog', kits: 'Kitbag',
};

/**
 * Is the id now being rendered this visitor's own team, or someone else's?
 *
 * Every route carries the manager in the same `?teamId=`, whether it came from
 * the entry form or from a shared link, so the URL alone cannot answer this —
 * and treating them alike is what let a share hand its recipient the sharer's
 * identity. Three cases, in order:
 *
 *   1. it matches the id this tab typed into the entry form  -> `self`
 *   2. it is the id already stored           -> keep whatever it was
 *   3. anything else (share link, rival tap) -> `shared`
 */
function resolveSource(teamId: string | number): TeamIdSource {
  const v = String(teamId);
  if (getSelfClaimedTeamId() === v) return 'self';
  if (getActiveTeamId() === v) return getActiveTeamSource();
  return 'shared';
}

export function AppShell({ navActive, title, backHref, meta, teamId, rememberTeamId = true, youName, actions, children }: AppShellProps) {
  const router = useRouter();
  const pushed = title !== undefined;
  const heading = title ?? TITLE_BY_NAV[navActive ?? ''] ?? 'FPL Ranker';

  // The id the nav tabs link to. Screens that take no team id (Players, Kitbag,
  // Home, Blog) pass none, so without this the manager context would be dropped
  // the moment you visited one — the nav would send you back to a blank squad.
  const [navTeamId, setNavTeamId] = useState<string | number | undefined>(teamId);
  useEffect(() => {
    if (teamId != null && teamId !== '') {
      // Local only: opening a rival's squad moves the browsing context, not the
      // account's linked team.
      if (rememberTeamId) setActiveTeamId(teamId, resolveSource(teamId));
      setNavTeamId(teamId);
      return;
    }
    const stored = getActiveTeamId();
    if (stored) setNavTeamId(stored);
  }, [teamId, rememberTeamId]);

  const right = (
    <div className="ah-right">
      {actions}
      <AccountChip />
      <AppMenu />
    </div>
  );

  return (
    <>
      <DesktopSidebar active={navActive} teamId={navTeamId} youName={youName} />

      <div className="app-main">
        {/* mobile header */}
        <div className="app-head">
          {pushed ? (
            <div className="ah-left">
              <button className="back" aria-label="Back" onClick={() => (backHref ? router.push(backHref) : router.back())}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#150000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="ah-title">{title}</div>
            </div>
          ) : (
            <div className="ah-left">
              <a className="logo" onClick={() => router.push('/app/home')}><span className="bolt" />FPL RANKER</a>
            </div>
          )}
          {right}
        </div>

        {/* desktop topbar */}
        <div className="topbar">
          <div className="tb-title">
            <h1>
              {backHref && <span className="ctx-back" onClick={() => router.push(backHref)}>← Back</span>}
              {heading}
            </h1>
            {meta && <div className="tb-meta">{meta}</div>}
          </div>
          <div className="tb-actions">{actions}<AccountChip /><AppMenu /></div>
        </div>

        <div className="app-scroll">{children}</div>
      </div>

      <BottomNav active={navActive} teamId={navTeamId} />
      <ToastHost />
    </>
  );
}
