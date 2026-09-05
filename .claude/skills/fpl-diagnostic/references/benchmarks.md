# Benchmarks — what "good" looks like for a fantasy-sports web app

Use these as the pass/fail line in Passes 1–4. They are calibrated for a pre-revenue FPL tool with search-led acquisition, not for a mature SaaS.

## Retention

| Metric | Crisis | Weak | OK | Good | Note |
|---|---|---|---|---|---|
| Day-1 | <5% | 5–10% | 10–20% | >20% | FPL's natural day-1 is low; the deadline cadence is weekly, not daily |
| **Week-1** | **<5%** | 5–15% | 15–30% | >30% | **The metric that matters.** Weekly matches the gameweek cycle |
| Week-4 | <2% | 2–5% | 5–15% | >15% | Survives an international break = real product |
| DAU/MAU | <5% | 5–10% | 10–20% | >20% | Expect a sawtooth, not a flat line |
| WAU/MAU | <25% | 25–40% | 40–60% | >60% | The honest engagement number for a weekly-cadence product |

**Week-1 under 5% is the site-is-a-destination-not-a-product line.** Every other optimization is downstream of fixing it.

## Bounce rate by page type

| Page type | Expected | Alarm |
|---|---|---|
| Landing / homepage | 40–55% | >60% |
| Core app (squad, leagues) | 10–25% | >35% |
| Tool pages (predictions, prices) | 30–45% | >55% |
| Blog post | 55–70% | >85% |
| pSEO player page | 60–75% | >90% |
| League share page | 30–50% | >65% |

A **100% bounce** on a page with >3 users is never content quality — it is a missing next-click. Treat it as a structural bug.

## Engagement time

| Page type | Floor | Healthy |
|---|---|---|
| Blog post | 45s | 90s+ |
| Tool page | 30s | 60s+ |
| Core app | 60s | 120s+ |
| pSEO player page | 15s | 40s+ |

Site-wide average under 60s on a data product means users are not reaching the data.

## Funnel conversion

| Step | Crisis | Workable | Good |
|---|---|---|---|
| Visitor → signup (magic link sent) | <1% | 2–5% | >5% |
| Signup → verified (link clicked) | <50% | 60–80% | >85% |
| `form_start` → form submitted | <20% | 40–60% | >70% |
| Double opt-in confirm ("Confirm your spot" → "You're in") | <40% | 50–70% | >75% |
| Free user → paid | <0.5% | 1–3% | >3% |
| Social video view → site session | <0.5% | 1–3% | >3% |

**Form-start-to-submit below 20% is a form bug, not a persuasion problem.** Check field count, validation errors, mobile keyboard behaviour, and whether the submit handler actually fires the event before assuming copy is the issue.

**Double opt-in below 40%** usually means the confirm email lands in Promotions/spam or the subject line does not match what the user just did. Consider single opt-in for a list this small — the deliverability protection is not worth the 60% loss at n<100.

## Channel health

- **AI-assistant referrals** (chatgpt.com, copilot.com, perplexity.ai) growing >20% period-over-period = AEO work is compounding. This is the cheapest channel available to a small site and deserves its own line in every report.
- **Direct ≈ Organic** on a site with no brand spend usually means attribution loss (untagged links, app-to-app referrals stripping the referrer, iOS Mail, Discord/WhatsApp shares), not genuine brand traffic. Do not celebrate direct.
- **Datacenter geo** (The Dalles, Ashburn, Council Bluffs, Boardman) is crawler/preview traffic. Strip before computing market mix.

## Revenue math (for Pass 7)

At **£15 season pass**, $1,000 ≈ £790 ≈ **53 buyers**.
At **£30 annual**, ≈ **27 buyers**.
A realistic blend lands around **35–45 buyers**.

Implied requirement at various traffic levels:

| Monthly visitors | Buyers needed | Required conversion | Verdict |
|---|---|---|---|
| 900 | 40 | 4.4% | Not achievable on cold traffic |
| 3,000 | 40 | 1.3% | Hard but possible with a warm list |
| 10,000 | 40 | 0.4% | Comfortable |

If required conversion exceeds ~3% of raw traffic, the correct recommendation is **grow the warm audience (email list, league commissioners) or change the price/product**, not "improve the checkout page".

## Gotcha: `form_start` is not per-form

GA4 enhanced measurement fires `form_start` on **every** `<form>` on the site, and reports one undifferentiated total. Dividing a single form's completions by that total understates conversion by however many other forms exist — the Sep 2026 run made exactly this error, reporting newsletter conversion as 2.7% (73 → 2) when most of the 73 were team-ID entry forms on the landing page.

Before quoting any form conversion rate:

1. Count the forms — `grep -rn "<form" src/ --include=*.tsx`
2. Check each has an `id`/`name`; GA4 reports these as `form_id` / `form_name`
3. Confirm `form_id` is registered as a custom dimension in the GA4 console
4. If any form lacks an id, report the funnel as **unattributable** rather than computing a rate

The same trap applies to `scroll` (fires on any 90% scroll) and `click` (outbound only). Only divide two events when you have established they describe the same surface.

## Gotcha: bounce rate depends on your key events

GA4 counts a session as **engaged** if it lasts >10s, **or** has 2+ pageviews, **or** fires a **key event**. Bounce rate is the inverse. So bounce is not a pure content metric — it moves when key-event configuration changes.

Two consequences when reading a run:

- **A property with `Key events: 0` reports inflated bounce**, because one of the three engagement paths is switched off. Any page whose main action is an outbound click in a new tab (affiliate links, `target="_blank"`) is hit hardest: no second pageview, no key event, so a converting session is logged as a bounce.
- **Marking key events lowers bounce with no content change.** If a fix ships in the same window as new key events, the bounce delta cannot be attributed to the fix. Track a dedicated event for the fix itself and read that instead.

Before recommending work off a high bounce rate, check the key-event count first. If it is zero, say that the bounce figures are upper bounds and fix the measurement before the page.

## Affiliate (Impact) benchmarks

| Metric | Crisis | Workable | Good |
|---|---|---|---|
| Click → action | <0.5% | 1–3% | >3% |
| Site clicks / sessions | <1% | 2–5% | >5% |
| Unattributed ("No referring domain") share | >50% | 10–30% | <10% |

**Earnings maths.** Kit commission runs roughly 5–8% of basket. An £80 shirt returns about £4–6, so **£790 needs ~150–200 completed sales**. At a healthy 2% click→action that is **~10,000 human clicks**. Compare that to real site clicks — not total clicks — before treating affiliate as a route to a revenue target.

## Gotcha: Impact "No referring domain" is not your traffic

Affiliate anchors that use `rel="sponsored noopener"` (not `noreferrer`) preserve the referrer, so a genuine click from a page on your site appears in Impact under your own domain. Anything under **"No referring domain"** reached the tracking URL without a referring page: crawlers following links in your HTML, email/link scanners, security preview fetchers, or someone pasting the raw URL.

This matters because the two numbers lead to opposite conclusions:

- *"532 clicks, 0 sales"* → the offer or the audience is wrong; stop investing.
- *"4 human clicks, 0 sales"* → nobody has clicked yet; **n is too small to conclude anything.**

Always split before judging. Two corroborating checks:

1. **GA4 `affiliate_click`** only fires in a real browser. Impact total ≫ GA4 count = bot volume.
2. **Deploy correlation.** Plot daily clicks against `git log`. A spike 1–2 days after a release that changed affiliate URLs, on a day with ordinary site traffic, is a re-crawl of every link in your HTML — count your affiliate link surfaces and see if the number matches a sweep.
