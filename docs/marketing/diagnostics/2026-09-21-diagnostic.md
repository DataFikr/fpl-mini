# FPL Ranker Revenue Diagnostic — 1 Aug → 21 Sep 2026

**Verdict:** No. The paywall now opens on **27 Oct**, four days before the **31 Oct** revenue deadline — so the subscription product has a four-day window to produce £790 against a warm audience of seventeen people. The $1,000-by-Oct-31 target is arithmetically dead, and the three things that killed it are all repairable: the gameweek email cron has been silently down since 3 Sep, signup conversion has fallen to 0.40%, and roughly a fifth of this window's "users" is a scraper.

**Days to paywall:** 36 (27 Oct 2026, `PREMIUM_FREE_UNTIL`) · **Days to goal:** 40 · **Paywall live before goal: 4 days**
**Revenue to date:** £0 · **Gap to goal:** £790

> **Window caveat.** This run's GA4 export covers **52 days**; the baseline covers **7**. Every comparison below is stated per-day or as a rate. Only `Reports_snapshot` was re-exported, so this run has **no event-name breakdown and no retention cohorts** — both are listed as tasks in §9, not waved through.

---

## 1. Scoreboard

| Metric | This run (52d) | Per day | Baseline (7d) | Per day | Δ/day |
|---|---|---|---|---|---|
| Active users | 1,585 | 30.5 | 225 | 32.1 | −5% |
| New users | 1,573 | 30.3 | 207 | 29.6 | +2% |
| Sessions | 1,913 | 36.8 | 275 | 39.3 | −6% |
| Events | 9,924 | 190.8 | 1,578 | 225.4 | −15% |
| New-user share | **99.2%** | — | 92.0% | — | **worse** |
| Sessions / new user | 1.22 | — | 1.33 | — | −8% |
| Avg engagement / active user | **35.0s** | — | 50.7s | — | **−31%** |
| **Key events** | **16** | — | **0** | — | **first ever** |
| **Total revenue** | **£0** | — | £0 | — | flat |

The flat per-day averages hide the actual shape. **The last seven days are the live number:**

| Week (Mon) | New | Returning | New/day | Returning share |
|---|---|---|---|---|
| Aug 3 | 119 | 11 | 17.0 | 8.5% |
| Aug 10 | 208 | 25 | 29.7 | 10.7% |
| **Aug 17** | **353** | 52 | **50.4** | 12.8% |
| Aug 24 | 199 | 41 | 28.4 | 17.1% |
| Aug 31 | 270 | 41 | 38.6 | 13.2% |
| Sep 7 | 297 | 19 | 42.4 | 6.0% |
| **Sep 14** | **91** | 17 | **13.0** | 15.7% |
| Sep 21 (1d) | 7 | 3 | 7.0 | 30.0% |

**Traffic is down 64% against the baseline week** (10.7 new/day vs 29.6) and **79% off the Aug-17 peak** — and it did not recover when the international break ended and GW5 arrived. That is not seasonality.

### The 268-user asterisk

Sep 6 and Sep 7 contributed **268 new users** (84 + 184), the two largest days in the window. Commit `4db1fcb` (7 Sep) documents why, in its own message: *"A JS-rendering scraper walked ~122 of the sitemap's 200 player URLs over two days."* A JS-rendering scraper executes `gtag`, so it registers in GA4 as real users.

Three independent signals line up with it:

- **Singapore = 307 active users (19.4%)** — 3.4× London (91) on a Premier League fantasy site. Implausible as a market; entirely plausible as one datacenter.
- **pSEO player pages: 317 pages, 500 users, 1.07 views/user, 213 of 317 at exactly 100% bounce.** That is the fingerprint of a sitemap walk, not of readers.
- The spike sits on 6–7 Sep with **no corresponding blog post, video or deploy** that would explain organic demand.

**Bot-adjusted actives: ~1,200–1,320** (strip Singapore + 80 datacenter users, or strip the two spike days). Every denominator in this report is therefore an *upper bound on reach and a lower bound on every conversion rate*. Fixing this is §9 action 2 — it costs an hour and it is upstream of believing any other number.

---

## 2. Acquisition

### First-user channel (who they are)

| Channel | New users | Share | Baseline share | Verdict |
|---|---|---|---|---|
| Organic Search | 835 | 52.7% | 45.9% | **Scale** — the only channel that grew its share |
| Direct / none | 684 | 43.2% | 45.4% | **Fix** — attribution loss, not brand |
| AI assistant | 57 | 3.6% | 4.8% | **Fix** — see below |
| Referral | 8 | 0.5% | — | **Ignore** — n=8 |

Session sources: google 805 · direct 782 · bing 144 · chatgpt.com 54 · *header (internal) 42* · duckduckgo 26 · yahoo 13 · *banner (internal) 8* · ecosia 8 · copilot 7 · facebook 4 · reddit 2 · perplexity 2 · vercel 2.

**AI assistant is not compounding — it is shrinking.** 57 users / 52 days = **1.10/day**, against the baseline's 10 / 7 days = **1.43/day**: a **23% per-day decline**. The AEO work has not started paying, and this is the one channel the benchmark file says to report even at small n. ChatGPT is 95% of it (54 of 57 sessions); Perplexity is 2 and Copilot 7. Directional (n=57), but the direction is down.

**Direct at 43% with no brand spend is attribution loss, not brand.** Per `benchmarks.md`, do not celebrate it — it is untagged links, WhatsApp/Discord shares stripping the referrer, and iOS Mail. The share-loop UTM work (`withShareUtm`) shipped 5 Sep; it has not moved Direct's share (45.4% → 43.2%), which is consistent with the share loop having near-zero volume rather than with the tagging failing.

### Geo vs market fit

| Segment | Users | Share of 1,585 | Bot-adjusted share |
|---|---|---|---|
| **UK + IE** | **404** | **25.5%** | **~33.7%** |
| Singapore (suspect) | 307 | 19.4% | — |
| Datacenter (Dalles 42, Ashburn 8, San Jose 14, Moses Lake 6, …) | 80 | 5.0% | — |
| China region | 46 | 2.9% | 3.8% |

UK+IE improved from the baseline's 22.7% to 25.5% raw (~33.7% adjusted) — the content is drifting toward the buyer market, which is the right direction. It is still a minority: **two out of three users cannot buy an FPL season pass in a currency that means anything to them**, and GBP pricing (Gate 5) is correct for the money but wrong for most of the traffic.

---

## 3. Content conversion

### 3a. Search → page

| Cluster | Pages | Views | % of views | Users | Views/user | Bounce | Pages @100% |
|---|---|---|---|---|---|---|---|
| Landing `/` | 1 | 1,272 | 30.1% | 799 | 1.59 | **47.9%** | — |
| **Core app** (Squad, Leagues, Home, Players) | 8 | 1,239 | 29.3% | 414 | **2.99** | **8.0%** | 0 |
| **pSEO player pages** | 317 | 533 | 12.6% | 500 | **1.07** | **70.7%** | **213** |
| Blog / guides | 21 | 381 | 9.0% | 240 | 1.59 | **22.8%** | 1 |
| Tools (prices, predictions, kitbag) | 3 | 358 | 8.5% | 232 | 1.54 | 52.5% | 0 |
| League share pages | 89 | 183 | 4.3% | 111 | 1.65 | 9.9% | 3 |
| Premium | 1 | 54 | 1.3% | 31 | 1.74 | 10.8% | 0 |
| Legacy hubs (`FPL League Hub` / `FPL Dashboard`) | 21 | 25 | 0.6% | 21 | 1.19 | 20.0% | 7 |
| Static (contact, privacy, FAQ, about) | 4 | 9 | 0.2% | 9 | 1.00 | 44.4% | 0 |

**The blog fix worked and is the one unambiguous win in this report.** The baseline had individual blog posts at flat 100% bounce; the cluster now sits at **22.8%**, and the two posts measured in both windows moved from 100% → 50.0% (Top 5 FPL Tools) and 100% → 80.0% (GW2 Captain Picks). The `TeamEntryPrompt` internal CTA shipped 5 Sep and this is what it looks like when it lands.

**It did not land anywhere else.** The same CTA shipped to the prices page and to every pSEO player page:

- Player Prices: **67.5% → 65.2%** — 2.3pp on 280 views. Flat.
- pSEO cluster: **70.7%, with 213 of 317 pages at exactly 100%.** Unmoved.

So the CTA works on long-form pages where a reader is already scrolling, and does nothing on a data table or a thin generated page. That is a placement finding, not a copy finding.

**317 pSEO pages produce 533 views — 1.7 views per page over 52 days, and 1.07 views per user.** They rank, they get one view, they end. They are also what the scraper walked. Stop expanding this surface (§7 cut list).

### 3b. Social → site

| Metric | This run | Baseline |
|---|---|---|
| TikTok videos | 15 | — |
| TikTok views | **3,328** | 568 |
| Likes / comments / shares | 84 / 25 / **1** | 15 / — / 0 |
| Like rate | 2.5% | — |
| Share rate | **0.03%** | 0% |
| **TikTok-referred sessions** | **0** | 0 |
| **Social CTR** | **0.00%** | 0.00% |

Non-TikTok social in GA4: facebook 4 sessions, reddit 2. From TikTok: **zero, against 3,328 views.**

Per the skill's rule, this is **not low conversion — the link is not clickable or not tagged**, and it is now the second consecutive window saying so. Two of the fifteen videos carry an explicit CTA and together account for 433 views:

- *"Let me know down in the comments if you want me to drop the app name"* (25 Aug, 244 views) — **the video deliberately withholds the domain.**
- *"Check the link in my bio"* (29 Aug, 189 views) — one indirection, no UTM, unverifiable.

The 2.5% like rate says the content works as content. It is entertainment, not acquisition, and it will stay that way until the domain is spoken on camera and the bio link is UTM-tagged. **Action 4 from the 5 Sep diagnostic is still open, and the cost of leaving it open was 2,760 additional wasted views.**

### 3c. Affiliate → revenue

Impact window (3–21 Sep), Kitbag:

| Metric | Value |
|---|---|
| Total clicks | 196 |
| **"No referring domain"** | **190 (96.9%)** — all on 3 Sep, one day |
| `kitbag.evyy.net` (network's own redirect hop) | 5 |
| `www.facebook.com` | 1 |
| **Clicks referred by `fplranker.com`** | **0** |
| Actions / earnings | **0 / £0.00** |
| Click → action on the human denominator | **undefined — the denominator is zero** |

The 190-click spike on 3 Sep is the same crawl sweep the baseline already logged; it is not new demand and it is not new. Neither of the two remaining referrers is a page on the site.

This matters because affiliate surfaces **shipped** on 5 Sep (`KitbagStrip` on /players and /predictions, plus the /kits page). Those three pages drew **358 views from 232 users** in the 16 days since, and produced **zero** clicks that Impact can attribute to fplranker.com. Either the anchors are not being clicked, or `rel` is stripping the referrer — and `affiliate_click` in GA4 would tell you which, except this export has no event-name block (§9 action 2).

**Do not treat affiliate as a route to £790.** At 5–8% of an £80 basket, the goal needs ~150–200 completed sales ≈ **~10,000 human clicks** at a healthy 2%. Real human clicks to date: **6, none from the site.**

---

## 4. In-app leaks

|  | Low bounce | High bounce |
|---|---|---|
| **High traffic** | **ENGINE** — Core app: 1,239 views, 414 users, **2.99 views/user, 8.0% bounce**. My Squad 440/147 @6.4% · Home 424/144 @10.5% · My Leagues 279/79 @5.7%. This is where engaged humans are. Monetize and gate *here*. | **LEAK** — Landing `/`: 1,272 views, 799 users, **47.9%** (baseline 47.5% — did not move). Player Prices: 280 views, 198 users, **65.2%** (baseline 67.5% — did not move). pSEO: **70.7%**, 213 pages at 100%. |
| **Low traffic** | **POCKET** — **/premium: 54 views, 31 users, 10.8% bounce** — the lowest bounce of any acquisition-side page in the report, starved of traffic. Find Team ID: 143/111 @16.8%. League share pages: 183/111 @9.9%. Blog: 381/240 @22.8%. | **DEAD** — Legacy hubs (`… - FPL League Hub`, `… - FPL Dashboard`): 21 pages, 25 views, **7 at 100%**. Static pages: 9 views, 44.4%. |

### Bounce trend — both numbers, side by side

| Page | Baseline | Now | Verdict |
|---|---|---|---|
| Landing `/` | 47.5% | **47.9%** | **flat — nothing shipped for it** |
| Home `/app/home` | 23.6% | 10.5% | improved |
| My Squad | 12.5% | 6.4% | improved |
| My Leagues | 4.5% | 5.7% | flat |
| **Player Prices** | 67.5% | **65.2%** | **flat — the CTA did not work here** |
| Find Team ID | 21.4% | 16.8% | improved |
| Blog: Top 5 FPL Tools | **100%** | **50.0%** | **improved** |
| Blog: GW2 Captain Picks | **100%** | 80.0% | improved |
| Blog cluster (21 pages) | ~100% on posts | **22.8%** | **improved** |
| pSEO player pages | 60–100% | 70.7% (213/317 at 100%) | flat |
| Premium | 0% (n=1) | 10.8% (n=31) | now measurable |

**Measurement caveat, applied honestly.** `benchmarks.md` warns that marking key events lowers bounce with no content change. Key events went 0 → 16 in this window. But 16 key events across 1,913 sessions can move sitewide bounce by at most **0.8pp** — far too small to explain a 100% → 22.8% blog move. The blog improvement is real; the flat prices and pSEO numbers are real too.

### Micro-funnel

| Step | This run | Baseline | Band |
|---|---|---|---|
| New users → magic-link signup | **12 / 1,573 = 0.76%** | 2.9% | **crisis** (<1%) |
| — same, last 16 days (5–21 Sep) | **2 / 496 = 0.40%** | — | **crisis** |
| "Confirm your spot" → "You're in" | 1 / 5 = 20% | 20% | crisis — but denominator predates single opt-in |
| `/premium` views / sessions | **54 / 1,913 = 2.82%** | 0.7% | **4× better, still FAIL** (Gate 1 wants >5%) |
| Key events / sessions | 16 / 1,913 = 0.84% | 0 / 275 = 0% | first signal ever |
| `form_start` → `subscribe_newsletter` | **unattributable** | 2.7% (wrong denominator) | — |
| TikTok view → session | **0 / 3,328 = 0.00%** | 0 / 568 | crisis |
| Affiliate: site-referred clicks / affiliate-page views | **0 / 358 = 0.00%** | — | crisis |

**Signup conversion regressed 4× and is the binding constraint on everything downstream.** Two new registered users in sixteen days, against 496 new visitors. The product acquires readers at a reasonable clip and converts almost none of them into someone it can email.

### The dead cron — the finding that explains the traffic curve

The Resend export runs through **14 Sep** and contains magic-link emails on that date, so it is not truncated. Within it:

- Last **deadline reminder**: **2 Sep** (GW3).
- Last **gameweek summary**: **3 Sep** (GW2).
- Nothing since. **No GW4 reminder. No GW5 reminder. No GW3 or GW4 summary.**

`vercel.json` schedules exactly one job, `/api/cron/daily` at `0 8 * * *`, which matches the 08:07Z send times — so the cron was firing. It stopped producing email after 3 Sep. [`src/app/api/cron/daily/route.ts`](../../../src/app/api/cron/daily/route.ts) catches the summary job's exception into `results.summary = { error }` and then returns `{ success: true }` regardless. **A failing summary job reports success and sends no email, silently.**

This is the only *pushed* return mechanic in the product — the thing Gate 3 explicitly requires, because a weekly-cadence product cannot rely on the user remembering. It has been dead for **19 days**, and the traffic collapse in §1 starts in the same week.

---

## 5. The matchday rhythm

**Reduced pass — the data is not in this export.** `Reports_snapshot` carries only new/returning by day; the per-day engagement-time and engaged-sessions series live in `Understand_web_and_or_app_traffic_overview`, which was not re-exported, and the Day-1/Day-7 and weekly cohorts live in `View_user_engagement_&_retention_overview`, also not re-exported. The most recent copies of both cover 29 Aug – 4 Sep — the baseline window.

What can be said from the new/returning series:

| Phase | Days | New/day | Returning share |
|---|---|---|---|
| Pre-season build (1–16 Aug) | 16 | 21.9 | 9.3% |
| GW1–GW2 peak (17–28 Aug) | 12 | 42.0 | 14.4% |
| GW3 + scraper (29 Aug – 9 Sep) | 12 | 39.9 | 9.8% |
| **International break (10–13 Sep)** | 4 | **12.8** | 17.6% |
| **GW4/GW5 return (14–21 Sep)** | 8 | **12.3** | **18.3%** |

**The rhythm did not resume.** An international break is supposed to be a trough with a recovery on the far side; here the far side is flat at 12.3 new/day. Two readings are consistent with it, and they are not exclusive: the scraper stopped (deflating the previous weeks' baseline), and the email cadence that would have pulled people back for GW4 and GW5 was dead.

The one genuinely encouraging number: **returning share is at its highest of the whole window** in the last eight days (18.3%, and 30.0% on 21 Sep). A smaller, denser audience is exactly the cohort worth selling to — it is just very small.

**Retention verdict: UNKNOWN, converted to a task.** The baseline's Week-1 of 2.4% and Day-7 of 0% remain the last measured values, and they sit under the 5% line where `benchmarks.md` says to write the words: **the site is a search destination, not a product.** Nothing in this window contradicts that. Re-export the cohorts (§9 action 2) before claiming otherwise in either direction.

---

## 6. Painkillers vs vitamins

| Feature | Route | Recur | Deadline | Un-sub | Loss | Score | Verdict |
|---|---|---|---|---|---|---|---|
| **Rival Watch differentials** | `/app` league | ✅ | ✅ | ✅ | ✅ | **4/4** | **Paywall** (already is) |
| **Deadline reminder email** | cron → inbox | ✅ | ✅ | ✅ | ✅ | **4/4** | **Keep free — and it is BROKEN** |
| Predicted points / AI captain | `/predictions` | ✅ | ✅ | ❌ | ✅ | 3/4 | Keep free — commodity, cannot carry a paywall alone |
| Dream teams (3 squads/GW) | predictor | ✅ | ✅ | ❌ | ❌ | 2/4 | Keep free |
| Live mini-league table | `/app` live | ✅ | ❌ | ❌ | ✅ | 2/4 | Keep free |
| GW summary newsletter | cron → inbox | ✅ | ❌ | ✅ | ❌ | 2/4 | Keep free — it is the list-builder |
| Player prices / ownership | `/players` | ✅ | ✅ | ❌ | ❌ | 2/4 | Keep free — SEO surface, 280 views |
| League share cards | share loop | ✅ | ❌ | ✅ | ❌ | 2/4 | Keep free — the only viral mechanic |
| Find Team ID guide | `/blog/…` | ❌ | ❌ | ❌ | ❌ | 1/4 | **Keep free — best acquisition page** (143 views, 16.8%) |
| pSEO player pages | `/player/…` | ❌ | ❌ | ❌ | ❌ | 0/4 | Keep, **stop expanding** — 317 pages, 1.07 views/user |
| Kitbag kit drop | `/kits` | ❌ | ❌ | ❌ | ❌ | 0/4 | **Defer** — 35 views, 0 attributable clicks |
| Ambassador CSV export | `/app` | ❌ | ❌ | ❌ | ❌ | 1/4 | **Kill** — fold into share |
| Legacy hub pages | `… - FPL League Hub` | ❌ | ❌ | ❌ | ❌ | 0/4 | **Kill / 301** — 21 pages, 25 views, 7 at 100% |

**The paywall is pointed at the right feature.** Moving it to Rival Watch differentials (5 Sep, action 8) was correct: livefpl.net gates effective ownership behind FPL-ID auth and fplgameweek.com caps at the top 200 and cannot be shared, so mini-league-relative differentials genuinely clear test 3.

**But it may be undiscoverable, and this export cannot tell me.** `painkiller-framework.md` warns that zero usage on a 4/4 feature is a distribution bug, not a product verdict. There is no `view_league` / `compare_teams` / `premium_gate_click` breakdown in this export — only the aggregate 16 key events. **Do not re-grade Rival Watch until §9 action 2 lands.**

---

## 7. Build next

Ranked by (leak size × painkiller score) / effort.

| # | Feature | Route | Painkiller test | Leak it plugs | Effort | Event | Success metric |
|---|---|---|---|---|---|---|---|
| 1 | **Resurrect + alarm the gameweek cron** | `/api/cron/daily` | 4/4 (reminder) | Only pushed return mechanic, dead 19 days | **S** | `email_sent`, `deadline_reminder_click` | GW6 + GW7 reminders delivered on schedule; cron returns **non-200** when the summary job throws; a zero-send day alerts |
| 2 | **Bot exclusion + cohort re-export** | GA4 admin | — (unblocks all) | ~19–24% of users is a scraper; every rate has a polluted denominator | **XS** | — | New-user count on a no-deploy day within ±20% of the prior week; Week-1 cohort exists |
| 3 | **Say the domain, tag the bio link** | TikTok | — (distribution) | 3,328 views → 0 sessions | **XS** | `utm_source=tiktok` in session source | ≥1% CTR = **33 sessions per 3,328 views** |
| 4 | **Move the signup ask onto the Engine** | `/app/leagues`, `/app/squad` | 4/4 when loss-framed | Signup at **0.40%**; the ask is on the Leak pages, the users are on the Engine pages | **S/M** | `sign_up` + `placement` | Signups ≥3% of core-app users ≈ **12/week** |
| 5 | **Rival Overtake Alert** | league → email | **4/4** | Nothing pulls a user back mid-gameweek; Week-1 ~2.4% | **M** | `rival_alert_sent`, `rival_alert_click` | ≥25% send→click; ≥15% of alerted users return within 24h |

Items 1–4 are repair, not features. That is the honest state: **the product already contains a 4/4 painkiller and a 4/4 retention mechanic, and both are currently invisible or switched off.** Building a sixth feature before fixing those buys nothing.

Item 5 is the only new build, and it deliberately fires during the phase §5 shows is dead — mid-gameweek and post-deadline — rather than competing on the crowded pre-deadline peak.

### Not building, and why

- **More pSEO player pages** — 317 pages return 1.07 views/user and 213 sit at 100% bounce. The marginal page is worth roughly one bounced view and one more URL for a scraper to walk.
- **More blog posts** — the blog is the one cluster that works (22.8% bounce). It does not need volume; it needs the traffic that TikTok is currently throwing away. Revisit after item 3.
- **The What-If simulator** (suggested by the competitor gap file) — 2/4, and it competes head-on with livefpl's strongest feature.
- **Anything on the /kits or affiliate surface** — 0 attributable human clicks from 358 page views. Adding placements to a surface that converts at zero adds zero.
- **Pricing-page redesign** — /premium already converts at 10.8% bounce on 31 users. It does not have a persuasion problem; it has a **2.82%-of-sessions** problem.
- **Landing-page bounce work** — 47.9% is *inside* the 40–55% healthy band in `benchmarks.md`. It looks like the biggest leak because it has the most traffic. It is not a leak.

---

## 8. Monetization gates

```
NO-GO for 27 Oct 2026

Gate 0 Payment rails      [FAIL]     LS_* keys exist only in .env.example; no test transaction on record. Unchanged in 16 days.
Gate 1 Discoverability    [FAIL]     /premium at 2.82% of sessions vs >5% target — but 4x the baseline's 0.7%. Closest gate to passing.
Gate 2 Warm audience      [FAIL]     ~17 registered, 1 confirmed subscriber. Need >=530. At 3.2%. Two new signups in 16 days.
Gate 3 Retention          [FAIL]     Cohorts not exported (UNKNOWN -> task); last measured Week-1 2.4%. The pushed-return email has been dead since 3 Sep.
Gate 4 Painkiller         [PARTIAL]  Paywall correctly sits on Rival Watch (4/4). Its usage is unmeasured — do not re-grade until Gate 6 closes.
Gate 5 Price              [PARTIAL]  GBP 15 season / 30 annual is right for a UK/IE-weighted buyer. Defect: LAUNCH_OFFER_ENDS = 1 Sep 2026 has already
                                     passed, so the "rises to 20" deadline expired 20 days ago and the code still shows 15. The enforced deadline is dead.
Gate 6 Measurement        [PARTIAL]  Key events 0 -> 16: real progress. But no event-name export, so no step can be decomposed;
                                     no `purchase` via Measurement Protocol (GA4_API_SECRET unset).

Blocking, in order: 0, 2, 3, then 1.
Shortest path to GO: Gate 0 is one afternoon. Gate 2 is not reachable by 27 Oct at any rate this funnel has ever produced.
```

### The arithmetic that decides this

£790 at the £15 season pass = **53 buyers**.

| Path | Available | Conversion needed | Sane? |
|---|---|---|---|
| Warm list | 17 people | 312% | No |
| Cold traffic in the 4-day paywall window | ~43 new users | 123% | No |
| Cold traffic to 31 Oct at current run rate | ~428 new users | **12.4%** | No — 4× past the 3% "not sane" line |
| Cold traffic at a realistic 0.5% | — | — | needs **10,600** new users; run rate delivers 428 |

Even a flawless paywall cannot produce £790 in four days from this funnel. The free-window extension to 27 Oct (decided 5 Sep, and correct at the time) and the 31 Oct revenue goal are now **mutually exclusive**, and only one of them is a real constraint.

### The decision, with a date

**Declare the $1,000-by-31-Oct target missed now, and reset it to £790 by 31 Jan 2027 (GW20).** Do not pull the paywall forward to rescue the date — 17 warm users behind a paywall produces roughly £25 and burns the one-time launch narrative.

Three commitments that go with it:

1. **Run the £1 end-to-end test this week regardless.** Gate 0 sits above everything else and is an afternoon. It must be `PASS` long before it matters.
2. **Hold 27 Oct conditionally.** If Gate 2 reaches **150 warm** by 20 Oct, the paywall opens on schedule with a real audience. If it does not, extend to GW20 **publicly and on purpose** — an announced extension is a launch narrative, a silently-slipped date is drift.
3. **Do not switch to affiliate as the fallback.** `monetization-gates.md` recommends monetizing the reachable audience when Gates 2 and 3 fail, but this month's data closes that door: 0 human clicks from 358 affiliate-page views, and £790 would need ~10,000. There is no monetizable asset today. The work between now and January is funnel repair, and it is the same work whatever the revenue date is.

---

## 9. This week

| # | Action | Number to hit |
|---|---|---|
| 1 | **Fix and alarm `/api/cron/daily`.** Root-cause the summary failure, make the route return non-200 when `results.summary.error` is set, and alert on a zero-send day. | GW6 deadline reminder lands in every subscriber's inbox on schedule |
| 2 | **Export the two missing GA4 reports and add a bot filter.** `Understand_web…traffic_overview` + `View_user_engagement_&_retention_overview` for 1 Aug – 21 Sep; register the Singapore/scraper block as excluded traffic. | A Week-1 retention number exists; per-day engagement exists; the four key events are individually visible |
| 3 | **Run the £1 transaction.** Set `LS_CHECKOUT_*` and `LEMONSQUEEZY_WEBHOOK_SECRET` in production, buy the season pass, confirm entitlement flips and the receipt arrives. | **Gate 0: UNKNOWN → PASS** |
| 4 | **Fix TikTok attribution before filming anything else.** UTM the bio link, say `fplranker.com` out loud on camera, pin it as a comment. | ≥1% CTR on the next video — **33 sessions per 3,328 views** |
| 5 | **Move the signup ask onto My Leagues and My Squad**, loss-framed: *"save this league so we can tell you when a rival overtakes you."* | Signup ≥3% of core-app users ≈ **12/week**, vs 2 in the last 16 days |

Actions 1, 2 and 4 are all repairs of things the 5 Sep diagnostic already flagged or shipped. The pattern worth naming: **this product's failures are not build failures, they are silent-failure failures.** A cron that returns `success: true` while sending nothing, an affiliate surface that reports clicks from crawlers, a scraper that registers as 268 users, and 3,328 video views that reach a link nobody can click. Every one of them was invisible until someone divided two numbers.

---

*Generated by `fpl-diagnostic`. Sources: GA4 `Reports_snapshot (2).csv` (1 Aug – 21 Sep), TikTok `Content.csv` (15 videos), Resend `emails-sent-1790040166658.csv` (24 Aug – 14 Sep), Impact `985-Overview (2).csv` (3–21 Sep). Baseline: `.claude/skills/fpl-diagnostic/references/baseline-2026-09.md`.*
