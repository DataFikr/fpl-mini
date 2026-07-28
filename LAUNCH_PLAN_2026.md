# FPLRanker — Product-Market Fit Evaluation & Path to First $1k
**Prepared:** July 5, 2026 · **Season 2026/27 GW1:** ~Aug 15, 2026 · **Revenue goal:** $1,000 within 3 months of season start (by ~Oct 31)

---

## 1. Context

fplranker.com (launched Oct 2025) is a free FPL mini-league analytics app by a solo founder. Revenue today depends solely on Kitbag affiliate links; traffic is <500 visits/week, too low for AdSense. This plan dissects the MVP, validates it against the Opus 4.8 research docs and fresh market research, performs SWOT/PMF analysis, and lays out a build + monetization + inbound-visibility roadmap to ship a polished relaunch before GW1 and hit $1k by end of October.

**Decisions confirmed with founder:** (1) freemium premium tier (£15 launch-offer season pass / £30 annual), (2) lightweight magic-link email accounts, (3) development via discrete AI-assisted Claude Code sprint sessions.

---

## 2. MVP Feature Inventory (from codebase dissection)

**Live & differentiated:** League standings + rank progression charts, ESPN-style AI Headlines engine (unique in market), Rival Watch (effective ownership, captaincy, chips), Manager of the Month, pitch-view squad + transfer planner + Transfer Impact verdict, WC-2026 fatigue tracker, Kit Hub (Kitbag affiliate), Resend newsletter with 2 automated crons (deadline reminder + GW summary), share/OG infographics, blog (3 posts), GA4.

**Built but not shipped:** `scripts/fpl-predictor` — standalone points-prediction engine with online learning (backtested MAE 1.84 vs 1.95 frozen baseline; capture 88–92%). The /app/squad Prediction tab is a stub. This is the premium product waiting to be wired in.

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
