'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaXTwitter, FaReddit, FaInstagram } from 'react-icons/fa6';

const PRIMARY = [
  { label: 'Master the League', href: '/master-the-league' },
  { label: 'Find Team ID', href: '/find-team-id' },
  { label: 'Blog', href: '/app/blog' },
  { label: 'FAQ', href: '/app/faq' },
];
const MORE = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
];

export function AppMenu({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <>
      <button className="menu-btn" aria-label="Open menu" onClick={() => setOpen(true)} style={light ? { background: 'rgba(255,255,255,.12)', color: '#fff' } : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>

      {open && (
        <div className="menu-overlay" role="dialog" aria-modal="true">
          <div className="mh">
            <div className="logo"><span className="bolt" />FPL RANKER</div>
            <button className="mclose" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="menu-sec">Explore</div>
          {PRIMARY.map((n) => (
            <a key={n.href} className="menu-link" onClick={() => go(n.href)}>{n.label}<span className="arr">→</span></a>
          ))}

          <div className="menu-sec">More</div>
          {MORE.map((n) => (
            <a key={n.href} className="menu-link sm" onClick={() => go(n.href)}>{n.label}<span className="arr">→</span></a>
          ))}

          <div className="menu-social">
            <a href="https://x.com/fplranker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on X"><FaXTwitter /></a>
            <a href="https://www.reddit.com/user/fplranker/" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Reddit"><FaReddit /></a>
            <a href="https://instagram.com/FPLRanker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Instagram"><FaInstagram /></a>
          </div>
        </div>
      )}
    </>
  );
}
