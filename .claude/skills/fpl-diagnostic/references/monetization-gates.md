# Monetization Gates

Walk these in order in Pass 7. A gate is **PASS / FAIL / UNKNOWN**. `UNKNOWN` is a failure of instrumentation and must be converted to a task, never waved through.

You cannot skip a failed gate by working on a later one. The ordering is the plan.

---

## Gate 0 — Can money physically arrive?
- [ ] `LS_CHECKOUT_SEASON_URL` and `LS_CHECKOUT_ANNUAL_URL` set in the production environment
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` set and the webhook endpoint reachable from the MoR
- [ ] A real end-to-end test purchase completed, entitlement granted, receipt received
- [ ] Refund path decided and written on the pricing page

**If Gate 0 is UNKNOWN, nothing else in this document matters.** Verify with an actual test transaction, not by reading the code.

## Gate 1 — Is the paywall discoverable?
- [ ] `/premium` pageviews as a share of total sessions — target **>5%**
- [ ] `premium_gate_click` firing and non-zero
- [ ] An entry point to premium exists on the highest-traffic page, not only in the nav
- [ ] The free-tier experience visibly bumps into the limit (a gate the user *feels*), rather than premium being an unlinked marketing page

A premium page with sub-1% of sessions is not a pricing problem or a value problem. It is a routing problem, and it is the cheapest gate on this list to fix.

## Gate 2 — Is there an identified audience to sell to?
- [ ] Registered users (magic-link verified) — count them
- [ ] Newsletter subscribers who confirmed — count them
- [ ] League commissioners (users who connected a league and shared it) — count them
- [ ] Total warm audience ≥ **10× the buyers needed** at target price

Cold search traffic converts at ~0.1–0.5%. A warm, opted-in list converts at 2–10%. The gap between those two numbers is usually the entire difference between hitting the goal and missing it.

## Gate 3 — Does the product retain long enough to be worth a season price?
- [ ] Week-1 retention ≥ **15%** (see `benchmarks.md`)
- [ ] At least one feature with a **repeat-use** signal — the same user returning to the same route across two gameweeks
- [ ] A reason to return that is *pushed*, not *pulled* (email, notification), since a weekly-cadence product cannot rely on the user remembering

Selling a season pass on a product with sub-5% Week-1 retention produces refunds and no word of mouth. Retention is a prerequisite for a *season* price specifically; a one-off or per-gameweek price has a lower bar.

## Gate 4 — Is the paid thing a painkiller?
- [ ] The paywalled feature scores 4/4 on `painkiller-framework.md`
- [ ] Its free preview creates felt loss (shows what is being withheld, not just that something is withheld)
- [ ] It cannot be obtained free from the official FPL site or livefpl.net / fplgameweek.com
- [ ] The value is legible **before** payment, not only after

## Gate 5 — Is the price defensible?
- [ ] Price stated against a comparable the buyer already understands (a match ticket, a month of a streaming service, one FPL wildcard mistake)
- [ ] Season pass vs annual difference explained in one sentence a user does not have to think about
- [ ] Launch-offer deadline is real and enforced in code
- [ ] Currency matches the dominant market (GBP for a UK/IE-weighted audience)

## Gate 6 — Is conversion measurable?
- [ ] GA4 key events configured — if `Key events: 0`, **conversion tracking does not exist**
- [ ] `premium_gate_click` → checkout-open → purchase all instrumented as distinct events
- [ ] Revenue attribution back to first-touch channel
- [ ] The number to watch each week is named, with a threshold

Running a paid launch without Gate 6 means you will not learn anything from it, pass or fail. This is often the highest-leverage gate to clear first because it costs an afternoon.

---

## Verdict format

```
GO / NO-GO for <date>

Gate 0 Payment rails      [PASS|FAIL|UNKNOWN]  <one line>
Gate 1 Discoverability    [ ]  <one line>
Gate 2 Warm audience      [ ]  <one line>
Gate 3 Retention          [ ]  <one line>
Gate 4 Painkiller         [ ]  <one line>
Gate 5 Price              [ ]  <one line>
Gate 6 Measurement        [ ]  <one line>

Blocking: <ordered list of failed gates>
Shortest path to GO: <n> days — <the specific work>
```

## The fallback recommendation
When Gates 2 and 3 both fail — a common state for a young search-led site — the correct call is **not** to delay monetization indefinitely. It is to switch which asset gets monetized:

1. **Extend the free window** on the subscription product and say so publicly (turns a weakness into a launch narrative)
2. **Monetize the reachable audience now** — affiliate placement on the pages that already have traffic, since that converts on session-one intent and needs no retention
3. **Build the warm list in parallel** — every gameweek of email list growth compounds into the eventual paid launch
4. **Re-run this diagnostic when Gate 2's 10× threshold is met**, and launch paid then

State this as a decision with a date, not as a hedge.
