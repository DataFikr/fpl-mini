import { AffiliateLink } from '@/components/ui/affiliate-link';
import { getKitbagUrlByShort, hasKitbagTeam } from '@/utils/kitbag-urls';
import { SITE_NAME } from '@/lib/seo';

/**
 * Affiliate placement for the high-traffic content pages.
 *
 * The Sep 2026 diagnostic found the placement was backwards: `/app/kits` carried
 * an affiliate block and drew 6 views, while `/players` drew 68 — the most-viewed
 * non-landing page on the site — and had none at all. `/predictions` had none
 * either. Affiliate is the only revenue path that converts on session-one intent,
 * so it needs no warm list and no retention, which is exactly the funnel shape
 * this site has today.
 *
 * Clubs are derived from the rows actually on the page rather than hardcoded, so
 * the strip always reflects what the reader is looking at. Anything without a
 * verified Kitbag store path is dropped — the codebase's standing rule is that a
 * "Shop XYZ" button must never land on the generic Kitbag homepage.
 */
export function KitbagStrip({
  teamShorts,
  placement,
  heading = 'Back your club — official 2026/27 kits',
  max = 4,
}: {
  /** Team short codes from the rows rendered on this page, in display order. */
  teamShorts: string[];
  /** GA4 `placement` + Impact subId1. */
  placement: string;
  heading?: string;
  max?: number;
}) {
  // Most-represented clubs first: on a table of top players that is the club the
  // reader has just spent the most time looking at.
  const counts = new Map<string, number>();
  for (const short of teamShorts) {
    if (!short || !hasKitbagTeam(short)) continue;
    counts.set(short, (counts.get(short) || 0) + 1);
  }
  const clubs = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([short]) => short);

  if (clubs.length === 0) return null;

  return (
    <aside className="kit-strip">
      <div className="ks-head">
        <span className="ks-shirt" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3h8l2 3 3 2-3 4v9H6v-9L3 8l3-2 2-3Z" />
          </svg>
        </span>
        <div>
          <b>{heading}</b>
          <small>Shirts, printing and training wear from our partner Kitbag.</small>
        </div>
      </div>
      <div className="ks-btns">
        {clubs.map((short) => (
          <AffiliateLink
            key={short}
            href={getKitbagUrlByShort(short)}
            placement={placement}
            item={short}
            className="s-btn s-btn--ghost hex"
          >
            Shop {short}
          </AffiliateLink>
        ))}
      </div>
      <span className="ks-fine">Affiliate links · a commission supports {SITE_NAME}</span>
    </aside>
  );
}
