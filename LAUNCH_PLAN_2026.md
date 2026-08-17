# FPLRanker — Product-Market Fit Evaluation & Path to First $1k
**Prepared:** July 5, 2026 · **Season 2026/27 GW1:** ~Aug 15, 2026 · **Revenue goal:** $1,000 within 3 months of season start (by ~Oct 31)

---

## 1. Context

fplranker.com (launched Oct 2025) is a free FPL mini-league analytics app by a solo founder. Revenue today depends solely on Kitbag affiliate links; traffic is <500 visits/week, too low for AdSense. This plan dissects the MVP, validates it against the Opus 4.8 research docs and fresh market research, performs SWOT/PMF analysis, and lays out a build + monetization + inbound-visibility roadmap to ship a polished relaunch before GW1 and hit $1k by end of October.

**Decisions confirmed with founder:** (1) freemium premium tier (£15 launch-offer season pass / £30 annual), (2) lightweight magic-link email accounts, (3) development via discrete AI-assisted Claude Code sprint sessions.

---

## 2. MVP Feature Inventory (from codebase dissection)

**Live & differentiated:** League standings + rank progression charts, ESPN-style AI Headlines engine (unique in market), Rival Watch (effective ownership, captaincy, chips), Manager of the Month, pitch-view squad + transfer planner + Transfer Impact verdict, WC-2026 fatigue tracker, Kit Hub (Kitbag affiliate), Resend newsletter with 2 automated crons (deadline reminder + GW summary), share/OG infographics, blog (3 posts), GA4.

**Built but not shipped:** `scripts/fpl-predictor` — standalone points-prediction engine with online learning (v2 walk-forward ridge, backtested MAE **1.002** vs **1.268** frozen baseline; capture **83.3%**; held-out GW20–38 MAE **0.963**. The earlier "MAE 1.84 vs 1.95 / capture 88–92%" figures in this doc were wrong — corrected 2026-08-15 against `scripts/fpl-predictor/out/convergence-v2.json`). The /app/squad Prediction tab is a stub. This is the premium product waiting to be wired in.

**Missing:** user accounts (app is fully stateless — root cause of 3–6% Week-1 retention), payments (no Stripe/any), programmatic SEO pages, llms.txt, captaincy/transfer recommendations, affiliate click tracking (Kitbag anchors fire no GA4 event at all — "zero conversions" is partly a measurement bug). Security hole: `/admin/emails` is unprotected.

---

## 3. SWOT

| | |
|---|---|
| **Strengths** | Headlines/storytelling engine no competitor matches; working predictor with proven learning signal; automated email infrastructure (Resend + crons); modern design system (FR-DLS); real-time FPL API layer with Redis caching; AI-crawler-friendly robots.txt + JSON-LD foundation |
| **Weaknesses** | Statelessness → 3–6% Week-1 retention (PRD target was 95%); zero monetization beyond untracked affiliate; blog invisible (single-digit views, 539 organic users in 8 months); no payments/auth; admin route unprotected; predictor unshipped |
| **Opportunities** | Willingness to pay proven at £30–50/yr (FFix £47, FFScout £50, League Legacy £36); no competitor combines mini-league storytelling + AI advisor + SEO-indexable pages; livefpl (450k users) is auth-walled with zero SEO; AI-referral traffic already arriving (89 sessions from ChatGPT/Copilot); preseason "post-WC fatigue / new signings / promoted teams" query wave for 2026/27 |
| **Threats** | Crowded free tier (Minus4, RivalFPL, FPLPulse free); pure mini-league tools historically fail to monetize — revenue requires bundling with captain/transfer AI; official FPL app could add league features; seasonal cliff (Jun–Aug dead zone); FPL API ToS/rate-limit risk |

---

## 4. Market validation (community research, 2023–2026)

- **Pain points confirmed:** no rank-history/recaps in official app; demand for banter/roast shareables (Minus4: 1,000+ leagues roasted); rivals' transfer visibility; "who to captain" is the #1 recurring weekly query; DEFCON/live tracking gaps.
- **Monetization reality:** bundled tools monetize (FFScout/FFix), pure mini-league tools don't. Newsletter-as-a-service is viable (League Legacy £36/yr). Ads are a dead end below ~50k visits/month.
- **PMF verdict:** the mini-league niche is a *traffic and retention magnet*, not a standalone revenue engine. FPLRanker's fit = **mini-league specialist (free, viral, SEO) funding a premium AI-advisor bundle** (captain picks + transfer suggestions + premium personalized newsletter + rival alerts).
- **Revenue math to $1k (~£800):** ~30 premium sales at £15–30 blended ≈ £600–750, + fixed affiliate tracking targeting £100–300 over Aug–Oct. Checkpoints: 10 sales by Sep 1, 20 by Oct 1, 30 by Oct 31. If <5 by Sep 1, the constraint is traffic → shift effort to SEO/content, not features.

---

## 5. Build roadmap (sprint sessions ≈ 2–4h Claude Code each; ~17 pre-GW1)

### Workstreams
- **A. Magic-link auth (3 sessions)** — hand-rolled signed-token flow (NOT Auth.js: avoids adapter tables/mailer churn; ~250 LOC reusing existing Resend service). New Prisma models: `User` (email, fplTeamId, isPremium, premiumUntil), `Session`, `LoginToken`, `UserLeague`; add `userId`/`verifiedAt` to `newsLetterSubscriptions`. Files: `src/lib/auth.ts`, `src/app/api/auth/{request,verify,logout}/route.ts`, login page, middleware gating `/admin/*`. Reuse `src/services/email-service.ts`.
- **B. Payments via merchant-of-record (2 sessions)** — Lemon Squeezy or Polar (MoR handles UK/EU VAT; raw Stripe = VAT registration overhead absurd for 30 sales). **Apply for MoR account in week 1** (approval latency is a top risk; fallback = Stripe Checkout + Stripe Tax). Products: Season Pass £15 (rises to £20 Sept 1) + £30/yr. Files: `src/app/premium/page.tsx`, `src/app/api/webhooks/billing/route.ts`, `src/lib/billing.ts`.
- **C. Predictor productization (4 sessions, riskiest)** — port dependency-free `scripts/fpl-predictor/lib/*.mjs` into `src/lib/predictor/`; new tables `PlayerPrediction` + `PredictorState` (persists SGD weights between weekly runs; seed GW1 weights from 2025/26 backtest). **Consolidate both existing crons + prediction refresh into one `/api/cron/daily` dispatcher** (Vercel Hobby 2-cron limit; wrap existing handlers unchanged). Premium UI: captain picks + transfer suggestions in the squad Prediction tab (blur-teaser for free users); public `/predictions` ISR teaser page for SEO.
- **D. Affiliate fix (1–2 sessions, do first)** — Kitbag anchors across 5 components fire no GA4 event. Add `trackAffiliateClick()` to `src/lib/analytics.ts`; create `src/components/ui/affiliate-link.tsx` wrapper (GA4 event + Impact `subId1/subId2` params + `rel="sponsored"`); swap 5 call sites; verify in GA4 DebugView + Impact click reports — if Impact still shows zero, regenerate the tracking link in the Impact dashboard.
- **E. Retention & newsletter (2 sessions)** — hydrate team ID/leagues from account (localStorage fallback for anonymous); double opt-in for newsletter; premium newsletter variant prepending personalized "AI captain & transfer calls" from `PlayerPrediction` — extend existing templates in `email-service.ts`, don't rewrite.
- **F. Programmatic SEO/AEO (3–4 sessions)** — `/players/[slug]` pages (top 300 by ownership, ISR 6h, `dynamicParams` for tail): stats, form, FDR, next-GW xPts teaser, FAQ block + Person/FAQPage JSON-LD, Kitbag CTA, premium CTA. Weekly `/gameweek/[gw]/captaincy` ISR pages. `public/llms.txt` (15 min, sprint 1). Extend `sitemap.ts`. Reuse `fpl-api.ts`, `structured-data.tsx`, `fpl-pseo-generator`/`fpl-aeo-optimizer` skills.
- **G. Polish & security (2 sessions)** — **sprint 1: gate `/admin/emails` + audit `send-bulk`/`test-email` routes** (interim env-key check, session-based allowlist after A); fix tooltip positioning, head-to-head leader/chaser bug, sticky chart (post-GW1 OK).

### Pre-GW1 calendar (Jul 7 → Aug 15)
| Sprint | Deliverables |
|---|---|
| S1 (Jul 7–13) | Admin gate + llms.txt · affiliate instrumentation + verification · auth backend · **apply for MoR account** |
| S2 (Jul 14–20) | Login UI + account · team-ID persistence · predictor port + schema |
| S3 (Jul 21–27) | Cron consolidation + weight seeding · predictions API + /predictions teaser · MoR checkout + webhook |
| S4 (Jul 28–Aug 3) | /premium pricing page + launch offer · captain-picks UI · transfer-suggestions UI |
| S5 (Aug 4–10) | Player pages + JSON-LD + sitemap · double opt-in · premium newsletter block |
| S6 (Aug 11–15) | Playwright smoke (auth/payment/prediction) · live payment test · **launch announce to email list** |

**Must-ship line (ship even if S5 slips):** A, B, C-captain-picks, D, E1, G1-security, llms.txt.
**Cut order if behind:** transfer-suggestions UI → /predictions teaser → weekly GW pages → double opt-in → player pages down to 100 → UI bugs. Never cut: auth, payments, captain picks, affiliate fix, admin gate.

### In-season (Aug 15 → Oct 31): revenue + SEO compounding
- **Aug:** monitor first live cron cycles + premium emails; weekly captaincy/EO pages from GW1; launch-offer push in every newsletter; fix live bugs.
- **Sep:** expand player pages to 500, iterate on Search Console data; ship rival transfer alerts (third premium promise — reuses existing rival-watch API + saved leagues); weekly "GW n captain" blog posts interlinked with programmatic pages; monthly Impact reconciliation.
- **Oct:** price rise £15→£20 urgency campaign; AEO iteration; retention gamification (streaks/badges); GA4 funnel review (teaser → /premium → purchase).

---

## 6. Inbound visibility plan (SEO / AEO / GEO / LLM)

1. **Programmatic surface** (workstream F) — 300–500 player pages + weekly gameweek pages answer the highest-volume queries ("who to captain GW n", "[player] FPL", FDR) with structured data; livefpl's auth wall means this is uncontested ground among live-data tools.
2. **AEO/LLM:** llms.txt; FAQPage/HowTo/Person JSON-LD on all tool pages; AI crawlers already allowed in robots.ts. Perplexity/AI Overviews favor pages with clean Q&A blocks — every player/gameweek page gets one. Baseline is 89 AI-referral sessions; target 100+/month by Oct.
3. **Content cadence:** weekly captain/differential post during Aug–Oct tied to actual predictor output (unique data = citable by LLMs), internally linked to player pages and /predictions.
4. **Distribution seeds (still inbound-compatible):** shareable league infographics and headline cards carry the domain into Reddit/WhatsApp/Discord organically — the May Reddit spike (297 users) proves the channel; accounts + saved teams now catch that traffic instead of losing 99.7% of it.

---

## 7. Verification

- **Auth:** magic-link round trip in <30s, token single-use/expiring, `/admin/emails` 401s anonymously (Playwright test).
- **Payments:** test-mode purchase flips `isPremium` via webhook within seconds; refund revokes; GA4 `purchase` event fires; live-mode £15 test transaction before launch.
- **Predictor:** cron writes ~700 `PlayerPrediction` rows/GW idempotently; live learning MAE ≤ frozen baseline over trailing 5 GWs; premium captain picks render for the user's real squad in <2s; existing reminder/summary emails unchanged after cron consolidation (curl dispatcher with CRON_SECRET before switching vercel.json).
- **Affiliate:** GA4 DebugView shows `affiliate_click` with placement param; Impact dashboard shows matching click rows with SubIds within 24h.
- **SEO:** player pages return 200 with unique meta + JSON-LD passing Rich Results test; GSC discovery within 2 weeks; llms.txt live.
- **Business:** revenue checkpoints 10/20/30 sales at Sep 1 / Oct 1 / Oct 31; if <5 by Sep 1, reallocate sessions from features to SEO/content.

---

## Execution status (resumed 2026-07-05)
Plan approved; began S1. **Next up (in order):** (1) gate `/admin/emails` + audit `send-bulk`/`test-email`; (2) `public/llms.txt`; (3) affiliate `trackAffiliateClick()` in `src/lib/analytics.ts` + `src/components/ui/affiliate-link.tsx` and swap 5 Kitbag call sites; (4) auth backend (Prisma `User`/`Session`/`LoginToken`/`UserLeague` + `src/lib/auth.ts` + `/api/auth/{request,verify,logout}`). Verify build after each.

---

## 8. Revised premium roll-out — HOLD until GW5 (added 2026-07-27)

**Decision (founder):** Do **not** monetize at GW1. Hold the premium roll-out and run a **free launch window through GW5**, then turn pricing on.

**Why:**
- The predictor/transfer advisor only produces meaningful output once real gameweek points exist. GW1–GW5 is the first live window to confirm every FPL API endpoint (picks/entry/live/history) behaves correctly for real accounts after the season starts.
- The prediction weights are seeded from the 2025/26 backtest; they must be **retuned on actual 2026/27 gameweek data** before we charge. Shipping a paid model on unvalidated output risks refunds and reputation.
- A free window maximizes **sign-ups** (magic-link accounts + saved teams) during the highest-traffic pre-season/GW1 wave, feeding retention and the newsletter — the funnel we monetize later.

**What's live during the hold:**
- **Premium unlocked for everyone** (incl. anonymous): AI captain picks, transfer suggestions and the full points-prediction table. Implemented via `src/lib/premium.ts` (`isFreeLaunchWindow`), threaded through `hasActivePremium` (server) and `useAccount` (client). Self-expires on the cutoff date.
- **Pricing turned off:** `/premium` shows a "Free until GW5" state instead of the £15/£30 plans and checkout. Billing code (`src/lib/billing.ts`, webhook, checkout links) is untouched and simply dormant.
- **Demo mode on** (`FPL_DEMO_SEASON=2025-26`) so the app renders real 2025/26 snapshots pre-GW1; retire once live GW1 data lands.
- Landing hero now runs the branded product teaser video (`public/video/FPL Teaser Video.mp4`).

**Cutoff:** `NEXT_PUBLIC_PREMIUM_FREE_UNTIL` (default `2026-09-22`, ~end of GW5). Flip monetization back on by letting the date pass or setting it in the past — no code change required.

**Exit checklist before pricing goes live (post-GW5):**
1. All FPL endpoints verified against real accounts across GW1–GW5 (no 404/shape drift).
2. Predictor retuned on live GW1–GW5 data; trailing MAE ≤ frozen baseline.
3. Lemon Squeezy MoR account approved; test + live £-transaction flips `isPremium` via webhook.
4. Communicate the change to signed-up users (newsletter): "premium launches after GW5 — you were early."

**Revenue-timeline impact:** the $1k-by-Oct-31 checkpoints in §4/§7 shift ~4–5 weeks later; monetization effectively starts ~mid-September. Re-baseline the 10/20/30-sales checkpoints from the GW5 cutoff, not GW1.

---

## 9. Data review — GA4, 1 Jul – 13 Aug 2026 (added 2026-08-13, 8 days before GW1)

First read of real traffic since the relaunch. 44 days, 376 active users, 372 new. Small sample —
treat directionally, not as proof.

### 9.1 What the numbers say

| Metric | Value | Plan assumption | Verdict |
|---|---|---|---|
| Weekly new users | 7 → 16 → 17 → 66 → 84 → **141** | "<500 visits/week", too low for ads | **Beating it.** ~doubling every 2 weeks since 19 Jul |
| Organic share | 261/372 = **70%** | SEO is the growth engine | **Confirmed** |
| Week-1 retention | **0–2.9%** (best cohort 2/68) | §3 called out 3–6%; PRD target 95% | **Unchanged. Accounts did not move it** |
| Day-7 / Day-30 retention | **0% in every cohort** | accounts fix statelessness | **Not yet true** |
| Returning share (last 7d) | 15/165 = **9%** | — | Thin |
| Team-ID form start | 75 = **20% of visits** | core activation | **Healthy — the funnel's best number** |
| Newsletter subscribe | 6 = **1.6%** | list funds the premium launch | **Far too low** |
| Affiliate click | 8 = **2.2%** | £100–300 Aug–Oct | **≈£0. ~1–2% of target** |
| Share league | 2 = **0.5%** | viral loop carries the domain | **Loop is not running** |
| AI-assistant sessions | 16 (ChatGPT 15, Copilot 1) | 100+/month by Oct | **~11/month. Behind, but real** |
| Engagement/user | 10–30s recent | — | Shallow |
| DAU/MAU | 0.06–0.09 | — | Well below the ~0.2 "sticky" line |

Top pages: landing 470 · **My Squad 162** · Blog 71 · Home 69 · My Leagues 59 · Find Team ID 32 ·
Players hub 17 · Premium 14 · Predictions 10. The 200 `/players/[slug]` pages have **~6 views total** —
they shipped 12–13 Aug, so this is a start-line reading, not a failure.

Data hygiene: Bath (17) as top city and Ashburn/Moses Lake/The Dalles are almost certainly bot or
data-centre traffic — discount ~5–10%. Old page titles still appearing ("FPL Ranker - Fantasy Premier
League Mini-League Analytics", 45 views) are pre-redesign URLs; the 308 redirects added 9 Aug should
retire them.

### 9.2 Refreshed SWOT — what actually changed

| | |
|---|---|
| **Strengths** | Organic compounding hard and unaided (7→141 weekly new users in 6 weeks, no paid, no social); 20% of visitors start the Team-ID form — activation intent is genuinely strong; blog is already the #3 page; AI-assistant referrals arriving before the AEO work has matured; product side of the plan is shipped |
| **Weaknesses** | **Retention is still ~0** — the one thing §3 flagged as the root problem is unfixed; email capture 1.6% and only 1 of 28 subscribers verified, so the list is effectively empty 8 days from GW1; affiliate ≈£0 despite tracking now being correct; share loop dead at 0.5%; 10–30s sessions |
| **Opportunities** | GW1 (21 Aug) is the single largest traffic event of the year and it is 8 days out — capture rate, not traffic, decides what it's worth; 200 player pages + captaincy pages enter their first live gameweek with fresh data; US is 24% of users (89) — an under-served FPL segment; kit-buying season peaks Aug and affiliate converts in-session without needing retention |
| **Threats** | Monetizing at GW5 against a base that doesn't accumulate; pre-season has no weekly hook, so today's retention number may understate the real product — but if it doesn't move by GW3 the premium thesis is invalidated; bot noise inflating a small sample |

### 9.3 On track for GW1?

**Product: yes.** Every must-ship item from §5 is live — auth, dormant billing, predictor + cron
dispatcher, affiliate instrumentation, 200 player pages, llms.txt, admin gate, plus the Sportify
relaunch, blog migration and mobile fixes. Nothing on the "never cut" list slipped.

**Audience: no.** The plan's thesis is *free + viral + SEO builds an audience → premium converts it*.
Three of those four legs are unverified: viral (2 shares), email (1 verified subscriber),
retention (0% D7). Only SEO is working.

**Net: on track to launch, not on track to monetize.** GW1 will deliver the traffic. On current
capture rates it converts to almost nothing durable.

### 9.4 The diagnosis in §4 is wrong — correct it

§4 says: *"If <5 sales by Sep 1, the constraint is traffic → shift effort to SEO/content, not features."*

The data says the opposite. Traffic is compounding on its own; **capture is the constraint.** Following
the original rule would pour more water into a leaking bucket. Replace it with:

> If <5 sales by 1 Oct (post-GW5 re-baseline), check capture before traffic. If weekly new users are
> still growing but Week-1 retention is <10% and verified subscribers <150, the constraint is capture —
> fix activation and email, not content volume.

### 9.5 Priorities for the 8 days to GW1 — capture, not features

Ranked by expected value. All are small; none are new products.

1. **Re-confirm the 27 unverified subscribers.** The list is the launch channel and it is currently one
   person. Use the new Sportify subscribe template. *(Blocked on a founder decision: re-confirm vs
   backfill `verifiedAt` for pre-double-opt-in rows.)*
2. **Move the email ask to the moment of value.** 1.6% capture is a placement problem — the CTA sits on
   pages people don't reach. Prompt after a squad or league loads, framed as the GW1 deadline reminder.
3. **Prompt the save-your-team account after activation.** 20% start the form; almost none leave an
   identity behind. This is the retention fix the accounts work was supposed to deliver and it was never
   wired into the flow.
4. **Fix the share prompt.** 2 shares in 44 days with a working button and a genuinely good OG card
   (now carrying storyline photos). Surface it after a headline is read, not behind a menu.
5. **Move the Kitbag CTA to reachable pages.** Kit Hub has 8 views; the affiliate CTA mostly lives
   where nobody goes. August is peak kit-buying — this is the only revenue line that works *without*
   retention, and it is currently the cheapest £ on the table.

### 9.6 Revised monetization for post-GW5

The original model — accumulate a base for 5 gameweeks, then sell to it — assumes retention that does
not currently exist. Two changes:

**a) Sell at decision time, in-session, not by nurture.** The recurring high-intent moment in FPL is the
hours before a deadline: *who do I captain?* Gate the current-gameweek captain call, keep everything
historical free. That converts a first-time visitor on the same visit, which is what the traffic
actually is today.

**b) Treat affiliate as the near-term revenue line, premium as the compounding one.** Affiliate needs no
retention and Aug–Sep is kit season; premium needs a base that will not exist by 22 Sep. Do not let
the £15 season pass carry the whole $1k.

**Reforecast.** At the current ~141 new users/week, a 3–5× GW1 spike then decay gives roughly
1,500–2,500 new users to 31 Oct. At 1–1.5% purchase conversion (fair for a new paid product with a thin
list): **15–37 sales × £15 ≈ £225–555.** Affiliate at a fixed 10× improvement on today's rate adds
~£100–200. **Realistic range £325–755 — short of $1k, and the gap is conversion, not traffic.**

Levers if that gap matters more than the date: hold the free window past GW5 to build the base;
raise the price to £20 for fewer, higher-value sales; or accept $1k slipping to ~Nov/Dec and optimise
for a larger base into the busiest part of the season.

**Re-baselined checkpoints (from the 22 Sep cutoff, not GW1):**

| Date | Target | If missed |
|---|---|---|
| 1 Sep | 150 verified subscribers · Week-1 retention ≥10% | Capture is broken — stop feature work, fix the funnel |
| 22 Sep (GW5) | Predictor retuned on live GW1–5 · MoR approved · 400+ verified subs | Extend the free window rather than sell to an empty list |
| 1 Oct | 10 sales | Re-read §9.4 before adding content |
| 31 Oct | 30 sales (£450) + £150 affiliate | Re-forecast honestly; consider Nov/Dec horizon |

**The one number to watch:** Week-1 retention after GW1–GW3. Pre-season has no weekly reason to return,
so today's ~0% is not yet a fair verdict on the product. If it does not clear 10% once real gameweeks
are running, the premium thesis — not the execution — is what needs revisiting.
