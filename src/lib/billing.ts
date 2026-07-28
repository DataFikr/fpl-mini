// Billing (workstream B) — merchant-of-record via Lemon Squeezy.
//
// An MoR is the seller of record and handles UK/EU VAT/invoicing entirely, so a
// solo founder avoids VAT registration for ~30 sales. Integration = hosted
// checkout links + one signed webhook. Kept behind this thin module so swapping
// to Stripe (with Stripe Tax) later is a one-file change.
//
// Env:
//   LS_CHECKOUT_SEASON_URL  — Lemon Squeezy buy-link for the Season Pass variant
//   LS_CHECKOUT_ANNUAL_URL  — buy-link for the Annual subscription variant
//   LEMONSQUEEZY_WEBHOOK_SECRET — webhook signing secret

import { createHmac, timingSafeEqual } from 'crypto';

export type Plan = 'season' | 'annual';

/** Premium horizon for the one-off Season Pass (end of the 2026/27 season). */
export const SEASON_END = new Date('2027-06-30T23:59:59Z');

/** Launch offer: Season Pass rises from £15 to £20 on this date. */
export const LAUNCH_OFFER_ENDS = new Date('2026-09-01T00:00:00Z');

export const PRICING: Record<Plan, { name: string; price: string; cadence: string; blurb: string }> = {
  season: {
    name: 'Season Pass 2026/27',
    price: '£15',
    cadence: 'one-off · full season',
    blurb: 'Everything premium until the end of the 2026/27 season. No renewal.',
  },
  annual: {
    name: 'Annual',
    price: '£30',
    cadence: 'per year',
    blurb: 'Rolling annual access, renews automatically. Cancel anytime.',
  },
};

/** Build a Lemon Squeezy hosted-checkout URL carrying the user id + email through to the webhook. */
export function checkoutUrl(plan: Plan, opts: { userId?: string; email?: string }): string | null {
  const base = plan === 'season' ? process.env.LS_CHECKOUT_SEASON_URL : process.env.LS_CHECKOUT_ANNUAL_URL;
  if (!base) return null;
  try {
    const url = new URL(base);
    if (opts.email) url.searchParams.set('checkout[email]', opts.email);
    if (opts.userId) url.searchParams.set('checkout[custom][user_id]', opts.userId);
    return url.toString();
  } catch {
    return null;
  }
}

/** Verify the Lemon Squeezy `X-Signature` HMAC-SHA256 over the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface BillingEvent {
  type: 'grant' | 'revoke' | 'ignore';
  userId?: string;
  plan?: Plan;
  customerId?: string;
  premiumUntil?: Date | null;
}

/**
 * Normalize a Lemon Squeezy webhook into a grant/revoke decision.
 * - order_created            → one-off Season Pass grant (until season end)
 * - subscription_created/updated/resumed → grant while active (until renews_at)
 * - subscription_expired     → revoke (period ended). Plain cancel keeps access
 *   until expiry, so we don't revoke on cancelled — only when it actually ends.
 */
export function parseWebhook(payload: any): BillingEvent {
  const eventName: string = payload?.meta?.event_name ?? '';
  const custom = payload?.meta?.custom_data ?? {};
  const userId: string | undefined = custom.user_id ? String(custom.user_id) : undefined;
  const attrs = payload?.data?.attributes ?? {};
  const customerId = attrs.customer_id != null ? String(attrs.customer_id) : undefined;

  if (eventName === 'order_created') {
    return { type: 'grant', userId, plan: 'season', customerId, premiumUntil: SEASON_END };
  }

  // A refunded one-off Season Pass must revoke access (I6 requirement).
  if (eventName === 'order_refunded') {
    return { type: 'revoke', userId, customerId };
  }

  if (['subscription_created', 'subscription_updated', 'subscription_resumed', 'subscription_payment_success'].includes(eventName)) {
    const status: string = attrs.status ?? '';
    const ends = attrs.renews_at || attrs.ends_at || null;
    if (['active', 'on_trial', 'past_due'].includes(status)) {
      return { type: 'grant', userId, plan: 'annual', customerId, premiumUntil: ends ? new Date(ends) : null };
    }
    if (['expired', 'unpaid'].includes(status)) {
      return { type: 'revoke', userId, customerId };
    }
    return { type: 'ignore' };
  }

  if (eventName === 'subscription_expired') {
    return { type: 'revoke', userId, customerId };
  }

  return { type: 'ignore' };
}
