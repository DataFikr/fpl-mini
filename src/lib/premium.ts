/**
 * Premium free-launch window (client-safe — no server-only imports).
 *
 * The predictor + transfer advisor is the paid product, but for the 2026/27
 * launch we HOLD monetization: premium features are unlocked for everyone until
 * the end of GW5. This lets real managers sign up and stress-test the FPL API
 * endpoints once GW1 points start flowing, and lets us validate/retune the
 * prediction model on live gameweek data before charging. Pricing is turned off
 * until this window closes. See LAUNCH_PLAN_2026.md → "Revised premium roll-out".
 *
 * Tune the cutoff with NEXT_PUBLIC_PREMIUM_FREE_UNTIL (ISO date). Default is the
 * night GW5 finishes (~22 Sep 2026); flip monetization back on by letting this
 * date pass or setting it to a past date.
 */
export const PREMIUM_FREE_UNTIL: Date = new Date(
  process.env.NEXT_PUBLIC_PREMIUM_FREE_UNTIL || '2026-09-22T23:59:59Z'
);

/** True while premium is free for everyone (launch validation window, through GW5). */
export function isFreeLaunchWindow(now: Date = new Date()): boolean {
  return now.getTime() < PREMIUM_FREE_UNTIL.getTime();
}

/** Short label for badges/CTAs during the free window. */
export const FREE_WINDOW_LABEL = 'Free until GW5';
