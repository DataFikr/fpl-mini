'use client';

import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { AppMenu } from './AppMenu';

interface AppShellProps {
  navActive?: string;
  /** When provided, header shows a back button + title instead of the logo. */
  title?: string;
  backHref?: string;
  /** Manager context carried across the squad/leagues nav tabs. */
  teamId?: string | number;
  children: React.ReactNode;
}

export function AppShell({ navActive, title, backHref, teamId, children }: AppShellProps) {
  const router = useRouter();
  const pushed = title !== undefined;

  return (
    <>
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
        <AppMenu />
      </div>
      <div className="app-scroll">{children}</div>
      <BottomNav active={navActive} teamId={teamId} />
      <ToastHost />
    </>
  );
}
