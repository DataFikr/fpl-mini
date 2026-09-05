# FPL Ranker Revenue Diagnostic — 29 Aug → 4 Sep 2026

**Verdict:** The front door is fixed and the product converts once inside, but there is no measurable path from traffic to money — conversion tracking does not exist, the paywall is structurally unreachable, and the warm audience is 4% of the size the revenue goal requires. **NO-GO on the 22 Sep paywall.**

**Days to paywall:** 17 · **Revenue to date:** £0 · **Gap to goal:** £790 (~53 season passes at £15)

---

## 1. Scoreboard

| Metric | This window | August baseline | Delta |
|---|---|---|---|
| Active users | 225 | 884 (full month) | ~900/mo run-rate — flat |
| New users | 207 (92% of actives) | — | returning users are 8% |
| Sessions | 275 | — | 1.33 per new user |
| Avg engagement | 50.7s | — | below the 60s floor for a data product |
| Landing bounce | **47.5%** | **51.3%** | **−3.8pp ✅** |
| Visitor → account | **2.9%** (6/207) | **1.24%** (11/884) | **2.3× ✅** |
| **Key events** | **0** | 0 | **flat ❌** |
| **Revenue** | **£0** | £0 | **flat ❌** |

Two things genuinely improved and both trace to `e89b81a` (shipped 29 Aug 18:35, i.e. inside this window): landing bounce fell below the 55% alarm line into the healthy band, and account conversion more than doubled. **The August fix worked.** The entry problem is no longer the binding constraint — which means the next fix must be aimed somewhere else.

---

## 2. Acquisition

| Channel | New users | Share | Verdict |
|---|---|---|---|
| Organic Search | 95 | 45.9% | **Scale** — google 103 + bing 22 + ddg 4 sessions; the only working channel |
| Direct | 94 | 45.4% | **Fix** — this is attribution loss, not brand |
| AI Assistant | 10 | 4.8% | **Scale** — chatgpt.com 12 sessions; small but the cheapest compounding channel you have |
| Cross-network | 6 | 2.9% | Ignore |
| Unassigned | 2 | 1.0% | Ignore |

**Direct at 45% is not brand traffic.** A site with ~900 monthly users and no ad spend has no brand. That 94 is untagged links: TikTok bio, WhatsApp/Discord league shares, and the app-to-app referrer stripping that kills attribution on mobile. You are flying blind on nearly half your acquisition.

**Geo says the content ranks for the wrong queries.** UK+IE is 51 of 225 = **22.7%**. After stripping 18 datacenter users (The Dalles 12 = Google crawler, Ashburn 2 = AWS, Mankato/Mayville 4), the US is still ~34 — larger than the UK's 35. FPL money is UK/IE-weighted. The pSEO player pages are pulling generic global football searches, not managers who will pay £15.

**AI Assistant deserves protection.** 10 new users and 12 sessions is small-n `directional`, but it is arriving with zero effort and it is the channel where the AEO work compounds. Track it every run.

---

## 3. Content conversion

### 3a. Search → page: which keywords convert to views, and do views convert to a second click?

| Cluster | Views | Users | Bounce | Verdict |
|---|---|---|---|---|
| Core app (Home, Squad, Leagues) | 249 | ~91 | 4.5–23.6% | **Engine** — this is the product working |
| Player prices / ownership | 68 | 36 | **67.5%** | **Leak** — biggest single leak on the site |
| League share pages | ~50 | ~35 | 33–40% | **Pocket** — under-promoted growth loop |
| Find Team ID guide | 15 | 14 | 21.4% | **Pocket** — best-converting content page |
| pSEO player pages (~60 pages) | ~110 | ~70 | 60–100% | **Dead** as product, alive as SEO surface |
| Blog posts | ~30 | ~28 | 83–100% | **Dead** — three posts at exactly 100% |

The keyword research is working. `FPL Player Prices, Ownership & Predicted Points` pulled 68 views — the most-viewed non-landing content on the site. **And 67.5% of them left immediately.** The keyword converts to a view; the view converts to nothing. That is a missing next-click, not a content-quality problem.

Three blog posts sit at **exactly 100% bounce** (Top 5 FPL Tools, GW2 Captain Picks, Szoboszlai/Lacroix/Isidor player pages). A 100% bounce on a page with real users is never "the writing was weak" — it is a page with no internal CTA. These are structural bugs, and each one is a few lines of work.

**Caveat added 5 Sep, on implementing the fix.** Part of this 100% is a measurement artifact. GA4 counts a session as *engaged* if it runs >10s, has 2+ pageviews, **or fires a key event** — and with `Key events: 0`, that third path did not exist. `AffiliateLink` opens in `target="_blank"`, so a visitor who landed on a player page and clicked "Shop kit" generated no second pageview and no key event: a converting session logged as a bounce. Marking the four key events (action 1) will therefore lower measured bounce on these pages **with no content change at all**. `content_to_app` is the clean read of whether the CTA itself works.

The player pages were also not CTA-less — they already carried a teaser to `/app/squad`, an alternatives strip and three footnote links. The real defect was subtler: every one of those asked for the team ID *one click later*, on a different page. The blog template was the genuine gap, with no route into the product at all.

### 3b. Social → site: does the content convert?

| Signal | Value |
|---|---|
| TikTok video views (7d) | **568** (Aug 30: 201 · Sep 3: 323) |
| Profile views | 6 (1.1% of views) |
| Likes / comments / shares | 15 / 4 / **0** |
| **Attributable sessions in GA4** | **0** |
| **Social CTR** | **0.00%** |

Two spikes, 568 views, and **not one attributable session**. Cross-checked by day: the Aug 30 spike (201 views) sits on the *lowest*-traffic day of the window (26 users), and the Sep 3 spike (323 views) coincides with traffic *falling* from 48 to 27. There is no lag correlation at N or N+1.

**This is not a conversion problem — it is an attribution and mechanics problem.** The finding is that the link is not being followed, and possibly not being tagged at all. Before shooting another video, verify in this order:

1. Is there a bio link, and is it UTM-tagged (`?utm_source=tiktok&utm_medium=social`)? If it is untagged, some of those 94 "direct" users *are* your TikTok traffic and the 0% is partly a measurement artifact.
2. Does the video **say the domain out loud**? Silent on-screen URLs do not convert on TikTok.
3. Is the URL on screen for ≥3 seconds, at the point of peak retention, not in the last frame?
4. 0 shares across 568 views is the harder signal: the content is being watched, not passed on.

Until a tagged link exists, `fpl-content` is producing entertainment, not acquisition. **Fixing the tag is worth more than the next ten videos.**

### 3c. Affiliate — Kitbag / Impact

| Signal | Value |
|---|---|
| Total clicks (6 Aug – 4 Sep) | **532** |
| Actions | **0** |
| Earnings | **£0.00** |
| Clicks referred by `fplranker.com` | **4** |
| Clicks from `localhost` (dev testing) | 4 |
| Clicks with **"No referring domain"** | **524 — 98.5%** |

**The 532 is not 532.** Affiliate anchors use `rel="sponsored noopener"` — not `noreferrer` — so a real browser click from a page on the site arrives at Impact carrying `fplranker.com` as its referrer. Exactly **4** did. Another 4 are local dev testing, almost certainly from this week's work.

Everything else — 524 clicks — reached the tracking URL with no referring page. That is crawlers following the affiliate links embedded in the HTML, link scanners, and preview fetchers. GA4 corroborates it: `affiliate_click` fires only in a real browser, and it **never appeared in the event list at all** for the same window.

So the honest read is not "532 clicks and nobody buys". It is **"four humans have ever clicked, and n=4 supports no conclusion whatsoever."**

#### Where the two spikes came from

| Date | Impact clicks | Site users that day | TikTok views that day |
|---|---|---|---|
| Sat 29 Aug | 1 | 18 | 18 |
| Sun 30 Aug | — | 26 | **201** |
| **Mon 31 Aug** | **309** | 41 | 15 |
| Tue 1 Sep | — | 52 | 6 |
| Wed 2 Sep | — | 48 | 0 |
| **Thu 3 Sep** | **190** | 27 | **323** |
| Fri 4 Sep | 0 | 29 | — |

Neither spike correlates with anything human:

- **31 Aug — 309 clicks from 41 site users.** That is 7.5 affiliate clicks per user, on a day the Kitbag page drew ~6 views all week. TikTok that day was 15 views. It is arithmetically impossible for this to be people.
- **3 Sep — 190 clicks on the day site traffic *fell* from 48 to 27.** The TikTok spike (323 views) is the same day, but GA4 recorded **zero** social sessions in the entire window, so those viewers never reached the site, let alone an affiliate link.

The explanation that does fit: **a crawl sweep after a deploy.** `1f63cb6 "Kitbag: link every club to its own store, not last season's"` shipped **27 Aug 22:47** and rewrote every club's affiliate URL; `e89b81a` followed on **29 Aug 18:35**. The site carries **~43 club entries** plus a Kitbag aside on ~40 pSEO player pages, the kit-drop page and blog CTAs — comfortably 100+ distinct affiliate URLs. Two sweeps of newly-changed links, landing 2 and 6 days after the deploys, produce 309 and 190 without a single person being involved.

The remaining days support this: every other day in a month is 0 or 1 click. Real demand does not arrive as two isolated three-figure spikes separated by silence.

**Verdict: affiliate is not underperforming — it is untested.** With `affiliate_click` now instrumented and marked as a key event, and the `KitbagStrip` newly placed on `/players` and `/predictions`, next period gives the first honest denominator.

---

---

## 4. In-app leaks

### The 2×2

|  | Low bounce | High bounce |
|---|---|---|
| **High traffic** | **ENGINE**: My Leagues (4.5%), My Squad (12.5%), Home (23.6%), Landing (47.5%) | **LEAK**: Player Prices (67.5%, 68 views) |
| **Low traffic** | **POCKET**: Players index (0%), Kitbag (0%), Coughlan league (0%), Find Team ID (21.4%) | **DEAD**: 3 blog posts + ~40 pSEO pages at 83–100% |

The engine is genuinely good. **My Leagues bounces at 4.5% and My Squad at 12.5%** — those are excellent numbers that confirm the August commit's own conclusion: *the product converts, the front door does not*. The front door is now fixed too. The leak has moved to the layer in between.

### Bounce trend since the last fix

| Page | August | Now | Trend |
|---|---|---|---|
| Landing | 51.3% | **47.5%** | **improved −3.8pp** — now inside the healthy 40–55% band |
| Visitor → account | 1.24% | **2.9%** | **improved 2.3×** |
| Player prices | not isolated | 67.5% | **new top leak** |

`e89b81a` (find-team-by-name, entry fields accepting a pasted FPL URL, attribution fixes) did what it was built to do. Do not re-fix the landing page.

### Micro-funnel leaks — where the money actually goes

| Step | Rate | Verdict |
|---|---|---|
| `form_start` → `subscribe_newsletter` | 2.7% (73 → 2) | **Denominator was wrong — see correction below** |
| new users → magic-link sent | 2.9% (207 → 6) | Workable, improving |
| "Confirm your spot" → "You're in" | **20%** (5 → 1) | **Crisis.** Double opt-in is eating 80% of a tiny list |
| `share_league` / session | 3.3% (9/275) | The growth loop is alive but quiet |
| landing users → `/premium` view | **2.0%** (101 → 2) | **Crisis** |
| `/premium` views / sessions | **0.7%** | **Crisis** (target >5%) |
| `premium_gate_click` | **0 — never fired** | **Structural** (see below) |

**Correction (5 Sep, on implementing the fix).** The 2.7% divides two different things. GA4 enhanced measurement fires `form_start` on *any* `<form>`, and the site has **eleven** of them — team-ID entry on the landing page, team-name search, squad and home re-entry, contact, login, and only three newsletter forms. None carried an `id` or `name`, so all eleven collapsed into one undifferentiated count of 73. Most of that 73 is almost certainly the team-ID entry on the landing page (101 users), not the newsletter ask.

So "71 people started the newsletter form and vanished" is not supported by this data. The honest statement is weaker and more actionable: **the form funnel is unattributable, and no per-form conversion rate can be computed until each form is identifiable.** That is now fixed — all eleven forms carry `id`/`name`, so GA4 splits `form_start` by `form_id` from the next gameweek. Re-derive the real rate then.

A separate genuine defect surfaced while checking: the newsletter modal inside the league storytelling component posted to the same endpoint as the other two forms but fired **no** `subscribe_newsletter` event, so its subscribes were invisible — the count of 2 was an undercount of unknown size.

**Double opt-in is indefensible at this list size.** Losing 80% of 5 confirmations to protect deliverability on a list of 16 is the wrong trade. Switch to single opt-in until the list clears ~500.

### The structural finding: the paywall cannot be reached

`premium_gate_click` never fired once — and it *cannot*. The chain:

- [`src/lib/use-account.ts:115`](src/lib/use-account.ts#L115) — during the free window, `data.isPremium = true`
- [`src/lib/auth.ts:127`](src/lib/auth.ts#L127) — `isFreeLaunchWindow()` returns true, everyone is premium
- [`PredictionBlock.tsx:25`](src/app/app/_components/PredictionBlock.tsx#L25) — `const premium = !!account?.isPremium` → the `.gate` element never renders → `goPremium()` is unreachable

`/premium` is linked from five places on the landing page plus `/players`, `/predictions` and `/gameweek/[gw]/captaincy`. It is not unlinked. It got **2 views from 275 sessions** because nobody has any reason to look: everything is already free, and no user has ever seen a locked state.

**This is the most expensive finding in the report.** For 17 more days you are training every new user that the product is free, with zero exposure to what premium even withholds. On 22 Sep a wall appears in front of an audience that has never seen one. That is how you get churn instead of conversion.

---

## 5. The matchday rhythm

Your read is confirmed by the data, and the important part is the *inversion* underneath it.

| Day | Phase | Active | New | Engagement | Engaged sess/user |
|---|---|---|---|---|---|
| Sat 29 Aug | MATCHDAY | 18 | 15 | **85.7s** | 0.61 |
| Sun 30 Aug | MATCHDAY | 26 | 23 | **113.0s** | **0.81** |
| Mon 31 Aug | POST-GW | 41 | 36 | 35.5s | 0.51 |
| Tue 1 Sep | DEADLINE-2 | **52** | 44 | 41.0s | 0.56 |
| Wed 2 Sep | DEADLINE-1 | 48 | **45** | 26.7s | 0.40 |
| Thu 3 Sep | DEADLINE | 27 | 22 | 55.3s | 0.48 |
| Fri 4 Sep | MATCHDAY-eve | 29 | 22 | 19.3s | 0.00 |

**Traffic peaks Tue/Wed. Depth peaks Sat/Sun.** Sunday users stayed **113 seconds** — 4.2× the Wednesday peak's 26.7s — and produced the highest engaged-sessions-per-user of the week (0.81 vs 0.40).

The strategic reading: the pre-deadline crowd is a **shallow, transactional, high-churn** audience checking a price or a captain and leaving. The matchday crowd is a **deep, emotionally invested** audience watching their rank move. **Deep users are the ones who pay.** You currently have almost nothing built for them, which is exactly why matchday looks "slow" — it is not that the audience is absent, it is that they have no reason to be on your site rather than the official app.

Every competitor is fighting over the crowded Tue/Wed peak. **The matchday trough is uncontested and it is where your most valuable cohort already behaves best.** Owning it is cheaper than winning the peak.

### Retention

| Cohort | Week 0 | Week 1 | % |
|---|---|---|---|
| Jul 26 – Aug 1 | 68 | 2 | 2.9% |
| Aug 2 – 8 | 111 | 1 | 0.9% |
| Aug 9 – 15 | 186 | 3 | 1.6% |
| Aug 16 – 22 | 372 | 9 | **2.4%** |

Day-1 runs 0–8.7%. **Day-7 is 0% in every single cohort.** WAU/MAU 22–26%.

Week-1 at 2.4% against a 5% crisis line means, plainly: **the site is a search destination, not a product.** Traffic tripled from July to late August and Week-1 retention did not move. Acquisition is not the problem and has not been for two months.

---

## 6. Painkillers vs vitamins

| Feature | Route | Recurring | Deadline | Un-sub | Loss | Score | Verdict |
|---|---|---|---|---|---|---|---|
| Deadline reminder email | (email) | ✅ | ✅ | ~ | ✅ | **3.5** | **Paywall-adjacent** — closest thing you have |
| Mini-league standings | `/app/leagues` | ✅ | ❌ | ❌ | ❌ | 1 | Keep free — it is the engine (4.5% bounce) |
| My Squad / Rank My Team | `/app/squad` | ✅ | ~ | ❌ | ~ | 2 | Keep free — the activation surface |
| Player prices / ownership | `/players` | ✅ | ✅ | ❌ | ✅ | 3 | **Vitamin** — livefpl & fplstatistics do it free and better. The 67.5% bounce is users bouncing back to them |
| Predicted points / captaincy | `/predictions` | ✅ | ✅ | ~ | ✅ | 3 | Vitamin as built — generic. See conversion below |
| WC Fatigue | `/app/fatigue` | ✅ | ✅ | ✅ | ✅ | **4** | **Painkiller with a distribution bug** — 0 views, absent from nav |
| pSEO player pages | `/players/[slug]` | ❌ | ❌ | ❌ | ❌ | 0 | Keep free — pure SEO surface, never paywall |
| Blog | `/app/blog` | ❌ | ❌ | ❌ | ❌ | 0 | Keep free — SEO surface |
| Kitbag / kits | `/app/kits` | ❌ | ❌ | ❌ | ❌ | 0 | Keep — the only live revenue path today |
| Find Team ID | `/app/find-team-id` | ❌ | ❌ | ✅ | ❌ | 1 | Keep free — best acquisition page on the site |
| League share / ambassador | — | ✅ | ❌ | ✅ | ❌ | 2 | Keep free — growth loop, promote harder |

**You are currently planning to paywall a 3/4 vitamin.** The premium bundle is captain picks + transfer suggestions + the full prediction table — all of which livefpl.net (3.2M visits) and fplgameweek.com (1.1M) provide free. Test 3 (un-substitutable) fails, and that is the test that decides whether anyone reaches for a card.

**`/app/fatigue` scores 4/4 and has zero views.** Before grading it a vitamin: it is not in the nav (`grep` of nav hrefs returns find-team-id, blog, squad, players, privacy, master-the-league, kits, faq, contact, about — no fatigue). This is *nobody can find it*, not *nobody wants it*. Opposite fixes.

**How to convert your vitamins into painkillers** — all three moves use data you already have:
- Generic predicted-points table (vitamin) → **"3 of your starting XI are predicted to blank. Deadline 11:30."** (add a clock, bind to their squad, invert the frame) = painkiller, no new data.
- Generic ownership table (vitamin) → **"4 of your 9 rivals own Haaland. You don't."** = painkiller.

---

## 7. Build next

Ranked by `(leak size × painkiller score) / effort`.

**1. Live mini-league matchday tracker** — `/app/league/[id]/live` · **S–M**
Passes all four tests. Plugs the biggest strategic gap: your deepest cohort (113s Sunday sessions) currently has nothing to open. Live points, live mini-league position, "you are 2 points from overtaking X". The official FPL app shows your points; it does not show you *beating your mate*, and that is the entire emotional payload of a mini-league.
→ Instrument `live_view` · Success: matchday active users > pre-deadline active users within 3 gameweeks.

**2. Rival Watch differential alert** — `/app/league/[id]` + email · **M**
4/4. Plugs Week-1 retention (2.4%) and gives the deadline reminder something un-substitutable to carry. "2 of your 9 rivals captained Palmer. You captained Haaland." Nobody with 3M visits builds mini-league-specific tooling — it does not scale for them. It is your whole moat.
→ Instrument `rival_alert_open` · Success: Week-1 retention > 10%.

**3. Squad-bound prediction verdict** — `/app/squad` · **S**
Converts the existing 3/4 predictions vitamin into a 4/4 painkiller with no new data — bind the table to their XI, add the deadline clock, frame as loss. This is also the thing that should be paywalled instead of the generic table.
→ Instrument `verdict_view`, `premium_gate_click` · Success: `/premium` views > 5% of sessions.

**4. Fix the 71-person form leak + single opt-in** — **S**
Not a feature; the highest ROI line-item in the report. 73 form starts → 2 completions, and 80% confirm-loss on top. Debug the form, drop double opt-in, and this alone could 10× the warm list inside two gameweeks.
→ Success: `form_start` → submit > 40%.

**5. Surface WC Fatigue in nav** — **XS**
A 4/4 painkiller with zero views. Add the nav link and measure before deciding anything else about it.

### Not building — and why
- ❌ **More pSEO player pages.** 60 pages, ~110 views, 60–100% bounce, zero retention contribution. The cluster ranks and leaks. Adding pages 61–200 scales the leak.
- ❌ **More TikTok videos.** 568 views → 0 sessions. Fix the tagged link first; the content is not the constraint.
- ❌ **More blog posts.** Three of the existing ones bounce at 100%. Fix the internal CTAs on what exists.
- ❌ **Anything on the landing page.** It was just fixed (51.3% → 47.5%) and is now in band.
- ❌ **Competing on generic price/ownership tables.** livefpl and fplgameweek own it. That 67.5% bounce is the market telling you so.

---

## 8. Monetization gates

```
NO-GO for 22 Sep 2026

Gate 0  Payment rails     [UNKNOWN] Lemon Squeezy code is clean, but no verified
                                    live test purchase. Verify before anything else.
Gate 1  Discoverability   [FAIL]    /premium = 0.7% of sessions (target >5%).
                                    premium_gate_click structurally cannot fire.
Gate 2  Warm audience     [FAIL]    16 registered + 1 confirmed subscriber.
                                    Need ~400 (10x the ~40 buyers). At 4%.
Gate 3  Retention         [FAIL]    Week-1 2.4% (need 15%). Day-7 0%.
                                    Cannot sell a SEASON pass on this.
Gate 4  Painkiller        [FAIL]    Paywalled bundle scores 3/4 — fails
                                    un-substitutable vs livefpl/fplgameweek.
Gate 5  Price             [PASS]    £15/£30 GBP, launch deadline enforced in code.
Gate 6  Measurement       [FAIL]    Key events: 0. Conversion tracking does not
                                    exist. Cheapest gate to clear — one afternoon.

Blocking (in order): 6 → 1 → 0 → 4 → 2 → 3
Shortest path to GO: ~6 weeks, gated on Gate 2 list growth
```

### The revenue math, plainly

£790 needed ÷ £15 season pass = **53 buyers**. Blended with £30 annual, call it **~40 buyers**.

| Monthly visitors | Buyers needed | Required conversion | Verdict |
|---|---|---|---|
| **~900 (today)** | 40 | **4.4%** | **Not achievable on cold traffic** |
| 3,000 | 40 | 1.3% | Hard, possible with a warm list |
| 10,000 | 40 | 0.4% | Comfortable |

Cold search traffic converts at 0.1–0.5%. **Asking 4.4% of raw traffic to buy is not a conversion-optimization problem — it is an arithmetic impossibility.** No checkout page fixes this.

### The recommendation: monetize the audience you can reach, not the traffic you have

1. **Extend the free window past GW5** and say so publicly — a launch narrative, not a retreat. **Done 5 Sep: extended to GW8 (27 Oct).** See §10 item 7 for the Oct 31 consequence.
2. **But render the gate during the free window.** Show what premium *would* withhold, unlocked, badged "Free until GW8". This restores `premium_gate_click`, teaches every user what they will lose, and builds 6 weeks of purchase intent before the wall arrives. Right now you are burning that runway.
3. **Turn on Kitbag/affiliate properly now.** `affiliate_click` has never fired. Affiliate converts on session-one intent and needs no retention — it is the only revenue path that works with your current funnel shape. **Revised after the Impact export (§3c):** 532 recorded clicks are 4 humans and 524 crawlers, and £790 of kit commission needs ~152 sales / ~7,600 human clicks. Affiliate is worth *instrumenting* now, but it is not a route to the Oct 31 target.
4. **Grow the warm list every gameweek** — fix the form, drop double opt-in, push the league-share loop (9 shares/275 sessions is a loop that works and is under-promoted).
5. **Re-run this diagnostic when Gate 2 clears 400**, and launch paid then.

---

## 9. This week — measurement and plumbing

| # | Action | Number to hit | Status |
|---|---|---|---|
| 1 | Configure GA4 key events (signup, premium_gate_click, affiliate_click, checkout) | Key events > 0 | **Code done** — all four fire; see [ga4-key-events.md](../ga4-key-events.md). Console marking still pending (cannot be done from code) |
| 2 | Render the premium gate during the free window, badged "Free until GWx" | `premium_gate_click` > 0 | **Done** — same work as §11; three states in `PredictionBlock`, now also on Rival Watch |
| 3 | Debug the newsletter form; drop double opt-in to single | `form_start` → submit > 40% | **Done** — single opt-in live; 11 forms given `form_id`; third newsletter form now tracked. Metric is re-baselining (old denominator was wrong) |
| 4 | UTM-tag the TikTok bio link and say the domain out loud on camera | social sessions > 0 | Open |
| 5 | Add internal CTAs to the 4 pages at 100% bounce + the prices page (67.5%) | prices bounce < 55% | **Done** — `TeamEntryPrompt` on prices, all pSEO player pages and every blog post. Judge on `content_to_app`, not bounce alone (see caveat) |

None of these is a feature. All five are measurement and plumbing — which is the honest state of the funnel: **you cannot optimize what you have never measured, and right now the answer to "did it work?" is unavailable for every step after the pageview.**

---

## 10. Next five — the shortest path to first revenue

Actions 1–5 made the funnel *visible*. These make it *earn*. Ordered by the gate they unblock, not by effort — gate order is `0 → 6 → 4 → 2`, and a later item cannot rescue an earlier failure.

| # | Action | Gate | Effort | Number to hit |
|---|---|---|---|---|
| 6 | Prove £1 can arrive **and** that GA4 sees it | 0 + 6 | S | A real transaction completes, entitlement grants, `purchase` shows in GA4 with a channel |
| 7 | Decide the free window before the calendar decides for you | 1 | XS | **Done (code)** — `PREMIUM_FREE_UNTIL` → 27 Oct 2026 (end of GW8). Public announcement still owed |
| 8 | Repackage what sits behind the paywall | 4 | M | **Done** — paywall moved to Rival Watch differentials; live table + tables now explicitly free |
| 9 | Tag the share loop — it is the only viral mechanic that works | 2 | S | **Done** — `withShareUtm` on all three share surfaces, tagged per method |
| 10 | Put affiliate on the pages that actually have traffic | — | S | **Done** — `KitbagStrip` on /players and /predictions, clubs derived from the rows on the page |

---

**6. Prove £1 can arrive, and that GA4 sees it** — *Gate 0 `UNKNOWN` → `PASS`, Gate 6 completed*

Gate 0 is still unverified, and it sits above everything else in this document. The Lemon Squeezy code reads correctly, but reading code is not evidence that money moves. Run one real transaction end to end: checkout opens, webhook fires with a valid signature, `isPremium` flips, receipt arrives, refund path works.

Then close the other half. GA4 revenue is **permanently £0** until a `purchase` event exists, and the billing webhook is server-side with no cookies, so it cannot fire one from the browser. The groundwork already shipped in action 1 — `PlanCta` carries the GA4 client id into checkout as `checkout[custom][ga_client_id]`, which arrives back on the webhook in `meta.custom_data`. What remains is sending the event via the **Measurement Protocol** with a new `GA4_API_SECRET`.

Without this you will eventually have buyers and **no idea which channel produced them** — which makes the first sale unrepeatable. Organic Search and Direct are 45% each today; knowing which one converts decides where the next two months go.

**7. Decide the free window before the calendar decides for you** — *date-forced · **decided 5 Sep: extended to GW8***

`PREMIUM_FREE_UNTIL` is 22 Sep. That is **17 days away with five of seven gates failing.** Letting it lapse by default drops a paywall in front of an audience that has never seen a locked state, on a product with 2.4% Week-1 retention. That produces refunds and bad word of mouth, not £790.

Extend it and say so publicly — "free through GW8 while we tune the predictor on live data" is a launch narrative, not a retreat.

**Shipped 5 Sep:** `PREMIUM_FREE_UNTIL` now defaults to **27 Oct 2026**, the night GW8 finishes (GW8 deadline 23 Oct, GW9 opens 31 Oct). The window is driven off a single `FREE_WINDOW_GW` constant, so every badge and CTA follows it rather than repeating a hardcoded number. **The announcement is still owed** — the code change alone turns a promise into a silent extension.

**The consequence, stated plainly:** a window closing 27 Oct leaves **four days** before the 31 Oct revenue checkpoint. That checkpoint was already unreachable through subscription — § 8's own arithmetic puts the required conversion at 4.4% of raw traffic against a 0.1–0.5% norm. **The right move is to re-base the date, not shorten the window.** Judge 31 Oct on Gate 2 progress (warm audience toward ~400) and move the revenue target to end-of-season.

**8. Repackage what sits behind the paywall** — *Gate 4 `FAIL` → `PASS`*

The current bundle is captain picks, transfer suggestions and the full prediction table. All three are given away free by livefpl.net (3.2M visits) and fplgameweek.com (1.1M). It scores **3/4** — failing *un-substitutable*, the one test that decides whether anyone reaches for a card. You cannot charge for a commodity while the market leader gives it away.

Move the paywall to the mini-league layer, which nobody at that scale builds because it does not scale for them: Rival Watch differentials, the live mini-league tracker, rival transfer alerts. Keep the generic tables free — they are SEO surface and they feed `TeamEntryPrompt`.

This is the largest item here and it depends on Build-next items 1 and 2 existing. Start it now precisely because it is the long pole.

**9. Tag the share loop** — *Gate 2, and half the Direct mystery*

`ShareLeagueButton` builds `shareUrl` as `${origin}/app/league/${id}?teamId=…` with **no UTM parameters at all**. Every WhatsApp, X, email and copied link therefore lands as **Direct**. That is a concrete, verified explanation for a real share of the 94 "direct" new users, and it means the one viral mechanic that demonstrably works — 9 shares per 275 sessions, 3.3% — is completely invisible.

Tag the share URLs (`utm_source=share&utm_medium=<method>&utm_campaign=league`), which also lets you see *which* channel spreads: `native`, `copy`, `whatsapp`, `x`, `email` are all already passed to `share_league` as `method`.

While here, run [`scripts/backfill-newsletter-optin.mjs --apply`](../../scripts/backfill-newsletter-optin.mjs) against production. Subscribers stranded by the old double opt-in asked for the newsletter and are receiving nothing; they are the cheapest warm-audience growth available, and Gate 2 needs 16 → ~400.

**10. Put affiliate on the pages that actually have traffic** — *revenue that works with today's funnel*

Affiliate is the only revenue path that does not require retention: it converts on session-one intent, which is exactly the traffic shape this site has. It needs no warm list, no Week-1 retention, and no paywall.

The placement is backwards right now. `/app/kits` has an affiliate block and got **6 views**. `/players` got **68 views** — the most-viewed non-landing page on the site — and has **no affiliate placement at all**. `/predictions` has none either. Both are verified by grep, not inferred.

Adding a contextual Kitbag block to those two pages is a small change against the highest-traffic content on the site, and it is the fastest route to a non-zero revenue line while Gates 2 and 3 are still years of work away.

### What is deliberately still not on this list
- ❌ **More traffic.** At 4.4% required conversion, traffic is not the constraint — the report's own arithmetic says so. Growing to 3,000 visitors without fixing Gates 0/4/2 just makes a bigger leak.
- ❌ **Price changes.** Gate 5 already passes. Repricing a bundle nobody can reach is theatre.

*(An earlier draft also cut Gate 3 from this list as "too slow to matter before Oct 31". That was wrong to leave out: slow gates are exactly the ones that have to start early. Gate 3 items are now in §11.)*

---

## 10b. Should TikTok promote Kitbag?

Asked directly, and the answer is **not yet — and the reason is not that kit content is bad.**

### The arithmetic

Kit commission runs ~5–8% of basket. An £80 shirt returns about **£5.20**, so £790 needs **~152 completed sales**:

| Click → sale | Human clicks required |
|---|---|
| 1% | **15,200** |
| 2% | **7,600** |
| 3% | 5,067 |

You currently have **4** human affiliate clicks, and 568 TikTok views produced **0** site sessions. Both funnels would need to move by three orders of magnitude for kit affiliate to reach the Oct 31 target. It is not the path to £790.

### Three reasons it is the wrong thing to shoot next

1. **You would be multiplying two zeroes.** TikTok converts 0% to the site, and affiliate has a human sample of 4. Kit videos would compound an attribution failure with an untested offer — and when it produced nothing you still would not know which half failed.
2. **The binding constraint is upstream.** 568 views → 0 sessions is a *link* problem, not a *content* problem (§3b). Until a tagged bio link exists, every video is entertainment. Fix that with the videos you already make before adding a commercial angle.
3. **Kit intent is seasonal; FPL content is weekly.** Shirt buying spikes at kit drops and signings, a handful of moments a season. A weekly FPL audience is the wrong cadence to monetise on kit, which is exactly why Kitbag scores **0/4** on the painkiller rubric.

### What would make it worth doing later

Kit content on TikTok genuinely performs — unboxings and "rate this kit" are a native format, and affiliate is still the only revenue path that needs no retention (§10). The gate is evidence, not enthusiasm:

1. **Fix the bio link** (action 4) so any social traffic is attributable at all.
2. **Get a real human click count** for one full gameweek from the new `/players` and `/predictions` placements, with `affiliate_click` marked as a key event.
3. **If click → action clears ~1% on a real sample**, then test kit content — with a dedicated UTM and a `subId1` per video so the test is readable.
4. **If it is 0% on 200+ human clicks**, the offer is wrong for this audience and no amount of TikTok fixes it.

### The better use of the same effort

Point the videos at the thing that already converts. The site's engine retains well (My Leagues 4.5% bounce, My Squad 12.5%), and the live mini-league table now exists for exactly the matchday moment TikTok is watched. **"Watch your mini-league move live"** is a stronger hook than a kit link, it feeds Gate 2 and Gate 3 rather than a £5.20 commission, and it is the same shooting effort.

Revisit kit content when the funnel it depends on is measurable.

---

## 11. Gate by gate — what actually clears 1, 4, 2 and 3

Items 6–10 unblock the money pipe. These clear the four gates still marked `FAIL`. Each one below was checked against the code, and four of the eight are defects rather than features — things that are missing, not things that need inventing.

| # | Action | Gate | Effort | Number to hit |
|---|---|---|---|---|
| 11 | Render the premium preview during the free window | 1 | S | **Done** — three states in `PredictionBlock`; preview keyed off the date, not the account |
| 12 | Put Premium in the **in-app** nav | 1 | XS | **Done** — desktop sidebar + hamburger (bottom bar caps at five) |
| 13 | Ship WC Fatigue into the nav | 4 | XS | A 4/4 painkiller with non-zero views |
| 14 | Make the free preview withhold something **visible** | 4 | S | **Done** — locked gate now names each withheld item and shows its xP value |
| 15 | Capture on the public league share page | 2 | S | **Done** — `LeagueCaptureCard` below every tab; single opt-in, so a submit is a live subscriber |
| 16 | Open the deadline reminder to anyone with a team ID | 2 | M | **Done** — `DeadlineSubscription` + `/api/reminders`, opt-in on the squad screen. Needs `npm run db:push` |
| 17 | Make email the retention engine | 3 | S | **Done** — the reminder now carries the painkiller: your flagged players + your captain, not league standings |
| 18 | Ship the two matchday painkillers | 3 | M–L | **Done** — live table at `/app/league/[id]/live` (`live_view`), and Rival Watch now reads you-vs-them |

---

### Gate 1 — Discoverability · `/premium` at 0.7% of sessions

**11. Render the premium preview during the free window.** Still the highest-value open item in the whole document (it is action 2, unchanged). The chain at [`use-account.ts:115`](../../src/lib/use-account.ts#L115) and [`auth.ts:127`](../../src/lib/auth.ts#L127) sets `isPremium = true` for everyone, so the gate in `PredictionBlock` never renders. Show the premium content **unlocked but framed** — badged "Free until GW8 · £15 after" — rather than indistinguishable from the free tier. Every day this stays as-is is a day of runway spent teaching users that the product is free.

**12. Put Premium in the in-app nav.** Verified absent: [`nav-items.tsx`](../../src/app/app/_components/nav-items.tsx) defines `home · squad · leagues · players · kits · blog`, and **no premium entry**. Inside the app — where people actually spend their time — premium is reachable only from a dropdown in `AccountChip`. The five landing-page CTAs sit on a page users pass through once; the nav is on every screen they use. This is an XS change against the biggest structural cause of 0.7%.

### Gate 4 — Painkiller · bundle scores 3/4

**13. Ship WC Fatigue into the nav.** `/app/fatigue` scores **4/4 on the painkiller rubric and is in no navigation at all** — confirmed against `nav-items.tsx`. You already own a painkiller and no one can reach it. Before any argument about what to build, add the nav entry and let it produce a number. This is the cheapest possible evidence for Gate 4.

**14. Make the free preview withhold something visible.** Gate 4 asks whether the paid thing prevents a loss. A preview that shows nothing withheld creates no loss to prevent. Pair with §11: show the rival's captain as a blurred cell, the transfer as a locked row — the specific thing, not a generic "upgrade" panel. Combined with item 8's repackaging, this is what moves the bundle from 3/4 to 4/4: the mini-league differential is both un-substitutable *and* legible as a loss.

### Gate 2 — Warm audience · 16 of ~400

**15. Capture on the public league share page.** `/league/[id]` — the page a shared link actually lands on — has **zero capture**: no `CaptureCard`, no `SubscribeButton` (grep returns 0). These are the warmest arrivals on the site: someone's mate sent them a link about a league they are in, and the page asks for nothing. League share pages already draw ~50 views at 33–40% bounce. This is the single most wasted surface in the funnel.

**16. Open the deadline reminder to anyone with a team ID.** [`thursday-reminder`](../../src/app/api/cron/thursday-reminder/route.ts) sends only to verified *newsletter* subscribers. The deadline reminder is your **3.5/4 asset** — the closest thing to a painkiller you ship — and it is gated behind the narrowest possible audience. Anyone who has entered a team ID has demonstrated exactly the intent it serves. Offer it as a one-field opt-in at the moment their squad renders.

### Gate 3 — Retention · Week-1 2.4%, Day-7 0%

**17. Make email the retention engine.** A weekly-cadence product cannot rely on users remembering it — the 0% Day-7 across every cohort is what "relying on memory" looks like. Email is the only push channel you have, so every retention gain has to travel through it while the list is small. The links are already deep (`/app/league/${leagueId}` carries `teamId`, `/app/squad`), so the work is reach and rhythm, not plumbing: this compounds directly with items 15 and 16, and none of it needs a new feature.

**18. Ship the two matchday painkillers.** Build-next 1 and 2 — the live mini-league tracker and Rival Watch. This is the real answer to Gate 3 and the only item here likely to move Week-1 past 10%. It is also the longest lead, which is precisely why it starts now rather than after the faster gates close. Aim it at the **uncontested Sunday trough**, where sessions already run 113s against the Wednesday peak's 26.7s: the deep cohort is present and has nothing to open.

### Sequencing note

Items 12, 13 and 15 are XS–S changes against structural gaps and should land first — together they cost less than a day and touch three separate failing gates. Item 18 is the only genuinely large piece, and it is the one that decides whether a *season* pass is sellable at all. Items 11 and 14 are one workstream, not two.
