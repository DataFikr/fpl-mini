'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface AlternativeCard {
  slug: string;
  webName: string;
  teamShort: string;
  positionShort: string;
  price: string;
}

/**
 * The "alternatives to X" grid on /players/[slug].
 *
 * Renders as a client island purely so the projected points stay out of the
 * page's static HTML. The player page is ISR-cached, so anything the server
 * renders is readable by any crawler; the xPts here arrive from the
 * session-gated /api/players/xpts instead, and unauthenticated visitors get a
 * sign-in prompt in the slot.
 *
 * Everything else about each alternative — name, club, position, price — is
 * public FPL data and stays server-rendered, so the internal links that make
 * this grid worth having for SEO are still in the HTML.
 */
export function AlternativesGrid({ alts, nextGw }: { alts: AlternativeCard[]; nextGw: number }) {
  const [xPts, setXPts] = useState<Record<string, number> | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!alts.length) return;
    let cancelled = false;

    const slugs = alts.map((a) => a.slug).join(',');
    fetch(`/api/players/xpts?slugs=${encodeURIComponent(slugs)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          setLocked(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setXPts(data.xPts || {});
      })
      // A failed lookup leaves the slot in its loading state rather than
      // claiming the data is locked — the page is still useful without it.
      .catch(() => {});

    return () => { cancelled = true; };
  }, [alts]);

  return (
    <div className="alts">
      {alts.map((a) => (
        <Link key={a.slug} href={`/players/${a.slug}`} className="alt-card">
          <span className="nm">{a.webName}</span>
          <span className="tm">{a.teamShort} · {a.positionShort}</span>
          <span className="row">
            <span className="pr">£{a.price}m</span>
            <XptsSlot value={xPts?.[a.slug]} locked={locked} nextGw={nextGw} />
          </span>
        </Link>
      ))}
    </div>
  );
}

function XptsSlot({ value, locked, nextGw }: { value?: number; locked: boolean; nextGw: number }) {
  if (typeof value === 'number') {
    return <span className="xp">{value.toFixed(1)}<small>xPts</small></span>;
  }

  if (locked) {
    return (
      <span
        className="xp xp--locked"
        title={`Sign in free to see projected GW${nextGw} points for every alternative`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="4" y="10" width="16" height="10" rx="1" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <small>Sign in</small>
      </span>
    );
  }

  return <span className="xp xp--loading" aria-hidden="true"><small>xPts</small></span>;
}
