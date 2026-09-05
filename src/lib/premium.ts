/**
 * Premium free-launch window (client-safe — no server-only imports).
 *
 * The predictor + transfer advisor is the paid product, but for the 2026/27
 * launch we HOLD monetization: premium features are unlocked for everyone until
 * the end of the gameweek named below. This lets real managers sign up and
 * stress-test the FPL API endpoints once points start flowing, and lets us
 * validate/retune the prediction model on live gameweek data before charging.
 * Pricing is turned off until this window closes.
 * See LAUNCH_PLAN_2026.md → "Revised premium roll-out".
 *
 * Extended GW5 → GW8 on 5 Sep 2026. The Sep 2026 revenue diagnostic had five of
 * seven monetization gates failing with 17 days on the clock: 16 registered
 * users against the ~400 needed, Week-1 retention at 2.4%, and a paywalled
 * bundle that scored 3/4 because rivals gave the same data away free. Dropping a
 * paywall on that produces refunds, not revenue. The extra three gameweeks are
 * for the mini-league painkillers (live table, Rival Watch differentials) to
 * accumulate a base worth selling to.
 *
 * Tune the cutoff with NEXT_PUBLIC_PREMIUM_FREE_UNTIL (ISO date); flip
 * monetization back on by letting the date pass or setting it to a past one.
 */

/** The last gameweek that is free. Change this and the label follows. */
export const FREE_WINDOW_GW = 8;

/**
 * Default cutoff: the night GW8 finishes.
 *
 * GW8's deadline is 23 Oct 2026 17:30Z and its fixtures run to ~26 Oct; GW9
 * opens 31 Oct. Ending at 27 Oct closes the window inside GW8's own week rather
 * than partway through GW9, so nobody loses access mid-gameweek.
 */
export const PREMIUM_FREE_UNTIL: Date = new Date(
  process.env.NEXT_PUBLIC_PREMIUM_FREE_UNTIL || '2026-10-27T23:59:59Z'
);

/** True while premium is free for everyone (launch validation window). */
export function isFreeLaunchWindow(now: Date = new Date()): boolean {
  return now.getTime() < PREMIUM_FREE_UNTIL.getTime();
}

/** Short label for badges/CTAs during the free window. */
export const FREE_WINDOW_LABEL = `Free until GW${FREE_WINDOW_GW}`;
