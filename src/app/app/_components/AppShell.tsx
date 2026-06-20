'use client';

import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { AppMenu } from './AppMenu';
import { DesktopSidebar } from './DesktopSidebar';

interface AppShellProps {
  navActive?: string;
  /** When provided, the (mobile) header shows a back button + title instead of the logo. */
  title?: string;
  backHref?: string;
  /** Desktop topbar subtitle. */
  meta?: string;
  /** Manager context carried across the squad/leagues nav tabs + shown in the sidebar footer. */
  teamId?: string | number;
  youName?: string;
  /** Optional header/topbar action(s) (e.g. a Share button). */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const TITLE_BY_NAV: Record<string, string> = {
  home: 'Home', squad: 'My Squad', leagues: 'Leagues', kits: 'Kit Hub', fatigue: 'WC Fatigue', blog: 'Blog',
};

export function AppShell({ navActive, title, backHref, meta, teamId, youName, actions, children }: AppShellProps) {
  const router = useRouter();
  const pushed = title !== undefined;
  const heading = title ?? TITLE_BY_NAV[navActive ?? ''] ?? 'FPL Ranker';

  const right = (
    <div className="ah-right">
      {actions}
      <AppMenu />
    </div>
  );

  return (
    <>
      <DesktopSidebar active={navActive} teamId={teamId} youName={youName} />

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
          <div className="tb-actions">{actions}<AppMenu /></div>
        </div>

        <div className="app-scroll">{children}</div>
      </div>

      <BottomNav active={navActive} teamId={teamId} />
      <ToastHost />
    </>
  );
}
