# GA4 Key Events — setup and contract

Closes **Gate 6 (Measurement)** and action 1 of the [5 Sep 2026 diagnostic](diagnostics/2026-09-05-diagnostic.md), which found `Key events: 0` against £0 revenue: every funnel step after `page_view` was invisible, so no change could be shown to have worked or failed.

Two halves, and **both are required**:

1. **Code** — the events must fire. Done; see the call sites below.
2. **Console** — the events must be *marked* as key events. This cannot be done from code. Do it in the GA4 UI, once, per the steps below.

---

## The four events

| Event | Fires when | Params | Funnel step it makes visible |
|---|---|---|---|
| `sign_up` | Magic-link request succeeds | `method: 'magic_link'`, `placement` | Visitor → lead (was only reconstructable by hand from the Resend export) |
| `premium_gate_click` | Any click that routes to `/premium` | `placement`, `feature` | Paywall discovery — `/premium` at 0.7% of sessions |
| `affiliate_click` | Kitbag outbound anchor clicked | `affiliate`, `placement`, `item`, `link_url` | The only live revenue path today |
| `begin_checkout` | Hosted checkout opened | `currency`, `value`, `items[]` | Intent to pay |

### Naming

The diagnostic wrote "signup" and "checkout" in prose. The code uses GA4's **recommended** names `sign_up` and `begin_checkout` instead, because recommended names populate GA4's built-in funnel and monetisation reports. Custom spellings would only ever appear as unlabelled custom events, which is most of the problem this is meant to fix.

`premium_gate_click` and `affiliate_click` have no recommended equivalent and stay custom.

### Where they fire

| Event | Call sites |
|---|---|
| `sign_up` | [auth/login/page.tsx:39](../../src/app/auth/login/page.tsx#L39) · [CaptureCard.tsx](../../src/app/app/_components/CaptureCard.tsx) — `placement: squad_screen` and `placement: leagues_screen` |
| `premium_gate_click` | [Landing.tsx:70](../../src/app/app/_components/Landing.tsx#L70) (5 CTAs) · [PredictionBlock.tsx:40](../../src/app/app/_components/PredictionBlock.tsx#L40) · [AccountChip.tsx:129](../../src/app/app/_components/AccountChip.tsx#L129) · [premium-cta.tsx](../../src/components/ui/premium-cta.tsx) (players, predictions, captaincy) |
| `affiliate_click` | [affiliate-link.tsx:36](../../src/components/ui/affiliate-link.tsx#L36) — every Kitbag anchor routes through it |
| `begin_checkout` | [premium/_components/PlanCta.tsx:37](../../src/app/premium/_components/PlanCta.tsx#L37) |

The canonical list is `KEY_EVENTS` in [src/lib/analytics.ts](../../src/lib/analytics.ts) — keep it in sync with the console.

---

## Console steps (do this once)

An event must have **fired at least once** before GA4 will list it. Trigger each one on production first (see smoke test below), then:

1. GA4 → **Admin** → *Data display* → **Events**
2. Find the event → toggle **Mark as key event**
3. Repeat for all four

If an event has not appeared yet, use **Admin → Events → Create event** to pre-register the name, then mark it. Newly marked key events are **not retroactive** — they only count from the moment they are marked. Mark them before the next gameweek so GW-over-GW comparison starts clean.

### Register the custom parameters

`placement`, `feature` and `item` will not appear in any report until registered:

**Admin → Data display → Custom definitions → Create custom dimension**

| Dimension name | Scope | Event parameter |
|---|---|---|
| Placement | Event | `placement` |
| Feature | Event | `feature` |
| Affiliate item | Event | `item` |
| Form ID | Event | `form_id` |

Without this, you will see *that* `premium_gate_click` fired but not *which* of the nine CTAs produced it — which is the whole question.

**`form_id` matters just as much.** GA4 fires `form_start` on every `<form>` on the site and reports one total; the site has twelve. Until `form_id` is registered, no per-form conversion rate can be computed — which is how the 5 Sep diagnostic came to divide newsletter completions by every form start on the site. All twelve forms carry an `id`/`name`:

`team-id-landing` · `team-id-home` · `team-id-squad` · `team-id-entry` · `team-name-search` · `capture-save-team` · `capture-save-league` · `capture-newsletter` · `newsletter-modal` · `newsletter-storytelling` · `auth-magic-link` · `contact-app` / `contact-site`

---

## Amendment, 21 Sep 2026 — `sign_up` was missing its biggest source

`CaptureCard` in `save-team` mode posts to `/api/auth/request` and sends a real magic link, so it is the same funnel step as the login page. It fired **`save_team_request`** — a name absent from `KEY_EVENTS`, never marked in the console, and invisible to every report. The squad screen is the highest-intent signup surface in the app (440 views from 147 users at 6.4% bounce), so the 0.76% visitor→signup rate in the 21 Sep diagnostic was measuring the login page and little else.

Both account-mode cards now call `trackSignup(placement)` and emit `sign_up`. `save_team_request` is retired; nothing depended on it because it was never registered.

Register `placement` as a custom dimension (it is already in the table above) or the two Engine surfaces cannot be told apart — which is the entire point of naming them.

---

## Smoke test

On production, with GA4 **DebugView** open (Admin → DebugView; add `?_dbg=1` or use the GA Debugger extension):

| # | Action | Expect |
|---|---|---|
| 1 | Landing → click "Get started free" | `premium_gate_click` · `placement: landing_header_cta` |
| 2 | `/auth/login` → submit a real address | `sign_up` · `method: magic_link` |
| 3 | `/app/kits` → click any Kitbag link | `affiliate_click` · `placement` set, `link_url` carries `subId1` |
| 4 | `/premium` (signed in, after the free window) → "Get Season Pass" | `begin_checkout` · `value: 15`, `currency: GBP` |

Step 4 cannot be tested while the free-launch window is open — the pricing table does not render. Either wait for `PREMIUM_FREE_UNTIL` (now **27 Oct 2026**, end of GW8 — [src/lib/premium.ts](../../src/lib/premium.ts)) or set `NEXT_PUBLIC_PREMIUM_FREE_UNTIL` to a past date in a preview deploy.

---

## Deliberately not done

**No manual `form_start`.** GA4 enhanced measurement already fires it automatically on any `<form>` interaction — that is where the window's 73 came from. Adding a manual one would double-count. The open question is *which* form those 73 belong to (login vs newsletter capture), which needs a `form_id` dimension and is action 3's territory, not this one.

**No `purchase` event.** GA4 revenue will stay £0 until a purchase event exists, and the Lemon Squeezy webhook is server-side with no cookies, so it cannot fire one from the browser. The groundwork is laid — `PlanCta` carries the GA4 client id into the checkout as `checkout[custom][ga_client_id]`, which arrives back on the webhook in `meta.custom_data` — but sending the event requires the **Measurement Protocol** and a new `GA4_API_SECRET`. That is a separate change; without it, revenue attribution by channel is impossible, so it should be the next measurement task after this one.

**Nothing about the gate rendering during the free window.** `premium_gate_click` now fires from nine reachable CTAs, so it will be non-zero regardless. Restoring the *locked state* inside the app is action 2 of the diagnostic and a product decision, not instrumentation.

---

## Share attribution (item 9)

Shared links now carry `utm_source=share`, `utm_medium=<method>`, `utm_campaign=<surface>` via [`withShareUtm`](../../src/lib/share-url.ts). Until this shipped every WhatsApp, X, email and copied link arrived as **Direct**, which is a large part of why Direct was 45% of new users.

Mediums: `native` · `copy` · `whatsapp` · `x` · `email` · `unknown`
Campaigns: `league_share` (share button) · `headline_share` (story share) · `page_share` (ShareAction)

Read the GA4 acquisition report against the `share_league` event's `method` param: the event says which app people *choose* to share to, the UTM says which one actually sends traffic back. A gap between the two is the real finding.

**Expect Direct to fall and Referral/`share` to rise** next period with no change in behaviour — that is reattribution, not growth. Judge share performance on share-tagged sessions, not on the Direct delta.

## Affiliate placements (item 10)

`affiliate_click` now fires from the two highest-traffic content pages, which previously had none:

| `placement` | Page | Views at review |
|---|---|---|
| `players_index` | `/players` | 68 |
| `predictions_table` | `/predictions` | 7 |
| `player_page_kitbag` | `/players/[slug]` | ~110 across ~60 pages |
| `app-blog-<slug>` | blog posts | ~30 |

Reconcile counts against the Impact dashboard by `subId1` (placement) and `subId2` (club).

## Related: retention and matchday events

Not key events, but the numbers that say whether items 16–18 worked:

| Event | Fires when | Reads |
|---|---|---|
| `subscribe_deadline_reminder` | Squad deadline opt-in submitted | Gate 2 — warm audience growth, independent of the league newsletter |
| `live_view` | Live mini-league table opened | Gate 3 — whether the matchday cohort has something to open |
| `live_cta_click` | "See this league live" clicked | Whether the live table is discoverable, vs merely built |

`live_view` against **matchday** active users is the read for item 18: the target is matchday users exceeding pre-deadline users within three gameweeks. Compare it to the phase table in §5 of the diagnostic, not to a weekly average — the whole point is the shape of the week.

## Related: `content_to_app`

Not a key event, but the metric that says whether the content→product fix worked. Fires from `TeamEntryPrompt` when a search visitor on a content page enters their team ID, with `placement`:

`players_prices` · `player_page` · `blog_<slug>`

Watch it against the bounce rate of those pages. If bounce falls but `content_to_app` stays at zero, the improvement came from somewhere else — see the note below.

### Bounce rate and key events are not independent

GA4 counts a session as **engaged** if it lasts >10s, **or** has 2+ pageviews, **or** fires a **key event**. With `Key events: 0`, that third path did not exist, so bounce was measured against only two.

This mattered most on exactly the pages the diagnostic flagged. `AffiliateLink` opens in `target="_blank"`, so a visitor who landed on a player page and clicked "Shop kit" produced no second pageview — and with `affiliate_click` unmarked, no key event either. A genuinely converting session was recorded as a bounce.

**So marking the four key events will reduce measured bounce on the player and Kitbag pages on its own, with no content change.** When judging the "prices bounce < 55%" target, expect part of the movement to come from that and attribute accordingly — `content_to_app` is the clean read.

## What to check next run

Re-run `fpl-diagnostic`. In the parser output, `derived.keyEvents` should no longer be 0, and these should have values:

- `sign_up` count vs `first_visit` → the real visitor-to-lead rate, measured rather than reconstructed
- `premium_gate_click` by `placement` → which of the nine CTAs actually works
- `affiliate_click` count, reconciled against the Impact dashboard by `subId1`/`subId2`
- `begin_checkout` → `purchase` drop-off, once the purchase event exists
