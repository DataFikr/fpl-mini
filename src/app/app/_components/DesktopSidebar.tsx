'use client';

import { useRouter } from 'next/navigation';
import { NAV, navHref } from './nav-items';

function initials(name: string): string {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'ME';
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[1][0]).toUpperCase();
}

/** Desktop-only left sidebar (hidden on mobile via CSS). */
export function DesktopSidebar({ active, teamId, youName }: { active?: string; teamId?: string | number; youName?: string }) {
  const router = useRouter();
  return (
    <aside className="sidebar">
      <div className="logo" onClick={() => router.push('/app')}><span className="bolt" />FPL RANKER</div>
      <nav className="side-nav">
        {NAV.map((n) => (
          <a key={n.id} className={active === n.id ? 'on' : ''} onClick={() => router.push(navHref(n, teamId))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
            <span>{n.label}</span>{n.live && <span className="live-dot" />}
          </a>
        ))}
      </nav>
      <div className="side-foot">
        {youName && (
          <div className="you">
            <div className="crest" style={{ background: 'var(--red)', color: '#fff' }}>{initials(youName)}</div>
            <div><div className="nm">{youName}</div><div className="mt">Your team</div></div>
          </div>
        )}
        <span className="back" onClick={() => router.push('/')}>← Back to site</span>
      </div>
    </aside>
  );
}
