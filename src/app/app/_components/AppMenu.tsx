'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { XIcon, RedditIcon, InstagramIcon } from '@/components/ui/brand-icons';

export interface MenuLink { label: string; href: string }

const PRIMARY: MenuLink[] = [
  { label: 'Master the League', href: '/app/master-the-league' },
  { label: 'Find Team ID', href: '/app/find-team-id' },
  { label: 'Blog', href: '/app/blog' },
  { label: 'FAQ', href: '/app/faq' },
];
const MORE: MenuLink[] = [
  { label: 'About', href: '/app/about' },
  { label: 'Contact', href: '/app/contact' },
  { label: 'Privacy', href: '/app/privacy' },
];

/**
 * The hamburger + full-screen overlay. It is the only nav surface present on
 * every screen at every width, so it also carries the escape hatch back to the
 * marketing landing.
 *
 * `primary`/`more` are injectable so the landing page can reuse the same overlay
 * for the header links it hides below 900px, instead of shipping a second menu.
 * `backHref` renders the "back to site" row; pass null to omit it.
 * `wide` drops the 480px phone-frame width for full-bleed pages (the landing).
 *
 * The overlay is portalled to <body> on purpose: the landing's sticky header
 * carries a backdrop-filter, which makes it the containing block for any fixed
 * descendant — rendering in place pinned the overlay to the 68px header strip
 * and hid every link below the fold.
 */
export function AppMenu({
  light = false,
  primary = PRIMARY,
  more = MORE,
  backHref = '/app' as string | null,
  wide = false,
}: {
  light?: boolean;
  primary?: MenuLink[];
  more?: MenuLink[];
  backHref?: string | null;
  wide?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <>
      <button className="menu-btn" aria-label="Open menu" onClick={() => setOpen(true)} style={light ? { background: 'rgba(255,255,255,.12)', color: '#fff' } : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>

      {open && createPortal(
        <div className={`menu-overlay${wide ? ' wide' : ''}`} role="dialog" aria-modal="true">
          <div className="mh">
            <div className="logo"><span className="bolt" />FPL RANKER</div>
            <button className="mclose" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="menu-sec">Explore</div>
          {primary.map((n) => (
            <a key={n.href} className="menu-link" onClick={() => go(n.href)}>{n.label}<span className="arr">→</span></a>
          ))}

          {more.length > 0 && <div className="menu-sec">More</div>}
          {more.map((n) => (
            <a key={n.href} className="menu-link sm" onClick={() => go(n.href)}>{n.label}<span className="arr">→</span></a>
          ))}

          {/* Below 1024px the sidebar (and its "Back to site") is display:none,
              so without this there is no route back to the landing on mobile. */}
          {backHref && (
            <a className="menu-link sm" onClick={() => go(backHref)}>← Back to site<span className="arr">→</span></a>
          )}

          <div className="menu-social">
            <a href="https://x.com/fplranker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on X"><XIcon /></a>
            <a href="https://www.reddit.com/user/fplranker/" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Reddit"><RedditIcon /></a>
            <a href="https://instagram.com/FPLRanker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Instagram"><InstagramIcon /></a>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
