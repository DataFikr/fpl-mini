'use client';

import React from 'react';
import { withKitbagSubIds } from '@/utils/kitbag-urls';
import { trackAffiliateClick } from '@/lib/analytics';

interface AffiliateLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Kitbag/Impact affiliate URL (e.g. from getKitbagUrlByShort). */
  href: string;
  /** Where on the site the link lives — becomes GA4 `placement` + Impact subId1. */
  placement: string;
  /** Item/context, e.g. team short or player name — GA4 `item` + Impact subId2. */
  item?: string;
  children: React.ReactNode;
}

/**
 * Single wrapper for every monetised Kitbag affiliate anchor. It (1) fires the
 * GA4 `affiliate_click` event so clicks are measurable, (2) stamps Impact
 * subId1/subId2 onto the URL for dashboard-side attribution, and (3) enforces
 * `rel="sponsored noopener"` + `target="_blank"`. Use this instead of a raw <a>
 * for any Kitbag link.
 */
export function AffiliateLink({
  href,
  placement,
  item,
  children,
  onClick,
  ...rest
}: AffiliateLinkProps) {
  const finalHref = withKitbagSubIds(href, placement, item);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackAffiliateClick(placement, item, finalHref);
    onClick?.(e);
  };

  return (
    <a
      {...rest}
      href={finalHref}
      target="_blank"
      rel="sponsored noopener"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
