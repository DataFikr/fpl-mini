'use client';

import Link from 'next/link';
import { gaClientId, trackBeginCheckout } from '@/lib/analytics';
import { CURRENCY } from '@/lib/billing';

/**
 * The buy button on /premium.
 *
 * Split out of the (server-rendered) premium page so the checkout click can be
 * measured: `begin_checkout` was the last unmeasured step of the funnel, which
 * meant a visitor reaching the pricing table and leaving looked identical to one
 * who never arrived. See docs/marketing/ga4-key-events.md.
 */
export function PlanCta({ plan, href, loggedIn, variant, label, amount }: {
  plan: 'season' | 'annual';
  href: string | null;
  loggedIn: boolean;
  variant: 'red' | 'navy';
  label: string;
  amount: number;
}) {
  const cls = `s-btn s-btn--${variant} hex`;

  if (!loggedIn) {
    return <Link href="/auth/login?next=/premium" className="s-btn s-btn--navy hex">Sign in to buy</Link>;
  }
  if (!href) {
    return (
      <span className={cls} style={{ opacity: 0.5, cursor: 'not-allowed' }} aria-disabled="true">
        Checkout unavailable
      </span>
    );
  }

  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackBeginCheckout(plan, amount, CURRENCY);

    // Carry the GA4 client id into the hosted checkout so the (cookie-less)
    // billing webhook can later attribute the purchase back to this session's
    // acquisition channel. Navigation is never blocked on this: if gtag has not
    // set `_ga` yet, the checkout opens untagged.
    const cid = gaClientId();
    if (cid) {
      e.preventDefault();
      const url = new URL(href);
      url.searchParams.set('checkout[custom][ga_client_id]', cid);
      window.location.href = url.toString();
    }
  };

  return <a href={href} className={cls} onClick={open}>{label}</a>;
}
