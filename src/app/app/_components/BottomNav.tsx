'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NAV, navHref } from './nav-items';

export function BottomNav({ active, teamId }: { active?: string; teamId?: string | number }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = active || (pathname === '/app' ? 'home' : '');

  return (
    <nav className="botnav">
      {NAV.map((n) => (
        <a
          key={n.id}
          className={current === n.id ? 'on' : ''}
          onClick={() => router.push(navHref(n, teamId))}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
          {n.label}
          {n.live && <span className="ndot" />}
        </a>
      ))}
    </nav>
  );
}
