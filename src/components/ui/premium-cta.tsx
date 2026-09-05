'use client';

import Link from 'next/link';
import { trackPremiumGateClick } from '@/lib/analytics';

/**
 * Every link into /premium, so paywall discovery is measurable.
 *
 * The Sep 2026 diagnostic found `premium_gate_click` had never fired once: the
 * only call site was the prediction gate, which cannot render while the
 * free-launch window unlocks premium for everyone. The teaser CTAs on
 * /players, /predictions and /gameweek/[gw]/captaincy are server-rendered plain
 * anchors and fired nothing either — so `/premium` showing 2 views from 275
 * sessions was indistinguishable from a tracking gap.
 *
 * `placement` is the surface the click came from; it is deliberately not named
 * `source`, which GA4 reserves and would silently rewrite session attribution
 * (see RESERVED_GA4_PARAMS in @/lib/analytics).
 */
export function PremiumCta({
  placement,
  feature,
  children,
  className = 's-btn s-btn--red hex',
  href = '/premium',
}: {
  placement: string;
  feature?: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackPremiumGateClick(placement, feature)}
    >
      {children}
    </Link>
  );
}
