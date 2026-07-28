# FPLRanker — Integration Master Plan (Design + Feature Relaunch)
**Prepared:** July 6, 2026 · **Relaunch:** GW1 ~Aug 15, 2026 · **Revenue goal:** $1k by ~Oct 31
**Supersedes as execution source:** `LAUNCH_PLAN_2026.md` (strategy/market context remains valid) and `DESIGN_REVIEW_2026.md` (design rationale remains valid). This document is the single handoff for all remaining pre-GW1 sessions.

---

## 1. Where we are (verified state, 2026-07-06)

**Shipped & typecheck-clean (LAUNCH_PLAN S1–S3):**
- S1 — `/admin/emails` gate + route audit, `llms.txt`, affiliate `trackAffiliateClick()` + `affiliate-link.tsx` wrapper, magic-link auth backend (`src/lib/auth.ts`, `/api/auth/*`, Prisma `User`/`Session`/`LoginToken`/`UserLeague`).
- S2 — Login UI + AccountChip, team-ID persistence, predictor TS port (`src/lib/predictor/`, bit-identical to `scripts/fpl-predictor`).
- S3 — Cron consolidation (`/api/cron/daily` dispatcher), predictions API + `/predictions` teaser, Lemon Squeezy billing (`src/lib/billing.ts`, webhook) + `/premium` page.

**Not yet built (feature gap):**
- S4 revenue UI — captain-picks UI, transfer-suggestions UI in the squad Prediction tab (blur-teaser for free users).
- S5 — programmatic `/players/[slug]` pages + JSON-LD + sitemap, newsletter double opt-in, premium newsletter block (personalized AI captain/transfer calls).
- S6 — Playwright smoke (auth/payment/prediction), live payment test, launch announce.

**Not yet fixed (design gap, DESIGN_REVIEW D1–D3):**
- D1 — Money-path pages (`/premium`, `/predictions`, `/auth/login`, AccountChip) are inline-styled FR-DLS dark; marketing landing is FR-DLS dark. Funnel crosses three visual languages.
- D2 — Perf/a11y debt: render-blocking font `@import`, 2.2MB hero PNG, dead `framer-motion` + `react-icons`, sub-12px text, missing focus states, unwired skeletons.
- D3 — Sportify tokens not in Tailwind config, 4 CSS files / duplicated systems, no oversized stat numerics, no tablet breakpoint, `.pcard` overflow.

**Founder to-dos (block launch, not sessions):** `npx prisma db push` against prod DB · Lemon Squeezy store activation + live keys · set `ADMIN_KEY`/`CRON_SECRET` in Vercel · trigger first `/api/cron/daily` · confirm MoR account approved.

**Locked decisions (do not relitigate):** Sportify light/red is the single design system (FR-DLS deprecated). Full perf/a11y debt fix is in pre-GW1 scope. Freemium £15 season pass (→£20 Sept 1) / £30 annual via Lemon Squeezy. Dark mode, blog restyle, team-color theming, animated banter cards, bento dashboard, PWA — all deferred post-GW1.

---

## 2. Execution model

Two tracks, one sequence:

1. **Design session (×1) — Claude Code on Fable 5 ("Claude Design").** Produces high-fidelity mockups + a written design spec for every screen that will be touched. No functional code.
2. **Implementation sessions (×6) — Claude Code on Opus.** Build functionally against the mockups/spec. Each session ends with `npx tsc --noEmit` + `npm run build` clean.

**Why design first:** DESIGN_REVIEW's core finding is that S4's revenue UI must land on the unified Sportify system, and D1's funnel unification is conversion-critical. One Fable session resolving *all* visual decisions up front means the Opus sessions never make design judgment calls — they implement.

### Handoff artifacts (Design → Implementation)
The design session must leave in-repo, under `design/mockups-2026/`:
- **Static HTML mockups** (self-contained, Sportify tokens inline) — one file per screen listed in §3. HTML over Figma because it hands Opus exact class structures, spacing, and copy to port into TSX; open in a browser to review.
- **`SPEC.md`** — token table (final CSS vars → Tailwind names), type scale, button/card/badge inventory, per-screen annotations (states: loading/skeleton, empty, free-vs-premium blur, error), and an explicit "do not change" list for shipped Sportify app screens.
- Optimized hero asset (WebP) if the landing mockup replaces `public/redesign/hero-bg-v3.png`.

---

## 3. Session 0 — Claude Design (Fable 5, 1 session)

**Brief:** "Unify FPLRanker's funnel and premium UI on the shipped Sportify design system (light #FAFAFA / red #FF5050 / navy #12233F, Bebas Neue + Manrope + JetBrains Mono, hex clip-path buttons — source of truth: `src/app/app/_styles/sportify-fpl.css`, `app-screens.css`, `redesign.css`). Produce static HTML mockups + SPEC.md per §2. Benchmarks: SofaScore (nav/dark surfaces), FotMob (density/speed), Sleeper (share cards), ESPN Fantasy (oversized numerics), fpl.page (the FPL bar to beat)."

**Screens to mock (10):**
1. **Marketing landing `/`** — migrate hero from FR-DLS dark/violet/lime to Sportify light/red; optimized hero art; one CTA style (`.s-btn--red hex`).
2. **`/premium`** — pricing page: £15 launch offer vs £30 annual, launch-offer urgency, Sportify cards; must feel continuous with the app shell.
3. **`/predictions`** — public ISR teaser: top predicted scorers with blur-gated depth + premium CTA.
4. **`/auth/login`** — magic-link entry + "check your email" state.
5. **AccountChip** — signed-out/signed-in/premium states, replacing hardcoded #2B1654/#888.
6. **Captain Picks (squad Prediction tab)** — premium: ranked picks with xPts in oversized Bebas numerics, confidence, fixture context; free: blur-teaser + upsell.
7. **Transfer Suggestions (same tab)** — in/out pairs with predicted point delta; free-blur variant.
8. **`/players/[slug]` template** — pSEO page: player hero, stat grid, form/FDR, next-GW xPts teaser, FAQ accordion block, Kitbag CTA, premium CTA.
9. **Skeleton states** — league standings, squad pitch, predictions list (wire `.sk` shimmer visual language).
10. **Oversized-numerics treatment** — GW points/rank on squad + league headers (ESPN pattern), plus tablet (≥768px) layout notes for the shell.

**Design constraints baked into the spec:** all text ≥12px · visible `focus-visible` rings on every interactive element · 44px minimum touch targets · lime/violet tokens absent · `prefers-reduced-motion` variants noted · one shadow system, one muted-text gray (`--t3`).

---

## 4. Implementation sessions — Claude Code (Opus, 6 sessions)

Each session brief assumes the mockups/SPEC.md exist. Order matters: I1–I3 unify the system, I4 builds revenue UI on it, I5 builds SEO surface on it, I6 verifies and launches.

### I1 — Funnel unification: money path (≈ D1 part 1)
Restyle `/premium`, `/predictions`, `/auth/login`, `AccountChip.tsx` to match mockups 2–5 using Sportify classes/tokens; delete all inline dark-theme style objects. Wrap standalone pages in minimal Sportify page chrome.
**Verify:** visual walk `/predictions` → `/premium` → `/auth/login` matches mockups; build clean.

### I2 — Funnel unification: landing + perf debt (≈ D1 part 2 + D2 part 1)
Migrate `/` hero to Sportify per mockup 1. Fonts → `next/font/google` in `layout.tsx` (Bebas/Manrope/JetBrains Mono; drop Jakarta/Inter). Hero → WebP + `next/image` priority/sizes. Remove `react-icons` (swap 5 social icons to lucide/inline SVG) and `framer-motion` from package.json.
**Verify:** no `fonts.googleapis.com` request; Lighthouse mobile FCP improves on `/`; blog pages untouched (documented exception).

### I3 — A11y, skeletons, tokens (≈ D2 part 2 + D3)
Raise sub-12px text to ≥12px; `focus-visible` rings on Sportify inputs/buttons; touch alternatives for hover-only rows; `prefers-reduced-motion` coverage. Wire `.sk` skeletons into league standings + squad pitch + predictions fetches per mockup 9. Map Sportify vars into `tailwind.config.ts` (`sport-red`, `ink`, `navy`, `bg`); mark FR-DLS tokens deprecated; delete dead utilities; collapse toward 2 stylesheets. Oversized Bebas numerics on squad/league headers; tablet breakpoint; `.pcard` width fix. Update `docs/design/design-system.md`: Sportify v1 is the single source of truth.
**Verify:** Lighthouse a11y ≥90; keyboard-tab shows rings through the funnel; throttled network shows shimmer not blank white; `npm run test:accessibility` passes.

### I4 — Revenue UI: captain picks + transfer suggestions (= S4, on unified system)
Build the squad Prediction tab per mockups 6–7 against the shipped predictions API (`PlayerPrediction` rows from `/api/cron/daily`): premium users see ranked captain picks + transfer in/out pairs for their real squad; free users see blur-teaser + `/premium` CTA. GA4 events on teaser→premium clicks.
**Verify:** picks render for a real premium test account in <2s; blur gating flips with `isPremium`; funnel events visible in GA4 DebugView.

### I5 — SEO surface + newsletter (= S5)
`/players/[slug]` pages per mockup 8 (top 300 by ownership, ISR 6h, `dynamicParams`): stats, form, FDR, xPts teaser, FAQ + Person/FAQPage JSON-LD, Kitbag CTA via `affiliate-link.tsx`, premium CTA. Weekly `/gameweek/[gw]/captaincy` ISR page. Extend `sitemap.ts`. Newsletter: double opt-in (`verifiedAt`); premium variant prepending personalized AI captain/transfer calls from `PlayerPrediction` — extend `email-service.ts` templates, don't rewrite.
**Verify:** player pages 200 with unique meta + JSON-LD passing Rich Results test; opt-in round trip works; premium email block renders real predictions.

### I6 — QA + launch (= S6)
Playwright smoke: auth round trip (<30s, single-use token), test-mode purchase flips `isPremium` via webhook + refund revokes, prediction tab renders, admin 401s anonymously. Visual continuity walk `/` → enter ID → `/app/squad` → `/predictions` → `/premium` → `/auth/login` — one palette/font/button end-to-end (screenshot each step). Live-mode £15 test transaction. Launch announce to email list with launch offer.
**Verify:** full §6 checklist of both source docs; GA4 `purchase` fires; announce sent.

---

## 5. Calendar (Jul 7 → Aug 15) and cut order

| Week | Sessions |
|---|---|
| Jul 7–13 | **Session 0 (Fable design)** · I1 |
| Jul 14–20 | I2 · I3 |
| Jul 21–27 | I4 |
| Jul 28–Aug 3 | I5 |
| Aug 4–10 | I6 (QA half) · buffer / bug-fix |
| Aug 11–15 | I6 (launch half) · **launch announce** |

**Must-ship line (even if behind):** Session 0, I1, I4 captain picks, I6 security/payment verification. The funnel must be visually unified and the premium product must exist.
**Cut order if slipping:** transfer-suggestions UI → weekly GW pages → double opt-in → player pages down to 100 → D3 nice-to-haves (numerics/tablet) → I2 landing migration (keep perf fixes). **Never cut:** money-path restyle (I1), captain picks (I4), a11y minimums, live payment test.
**In-season (post-GW1):** unchanged from LAUNCH_PLAN §5 — Aug: monitor crons + launch-offer push; Sep: 500 player pages, rival transfer alerts, weekly captain posts; Oct: £15→£20 urgency, AEO iteration, funnel review. Deferred design items (dark mode first) start September.

---

## 6. Session handoff protocol

- Every session starts by reading this file's §1 status and the relevant mockups + `design/mockups-2026/SPEC.md`, and ends by updating the **Execution status** block below.
- Design decisions live in SPEC.md; if an Opus session hits an unspecified visual case, follow the nearest mockup pattern and log the gap in SPEC.md — do not invent new styles.
- Verification gates per session are listed inline (§4); build + typecheck clean is the floor for every session.

## Execution status
- 2026-07-06 — Master plan created; S1–S3 shipped; awaiting Session 0 (Fable design). **Next up: Session 0.**
- 2026-07-25 — **Session 0 landed** in `design/mockups-2026/` (10 HTML mockups + SPEC.md + _base.css + index.html). Copyright fix: dropped `hero-rays-players.webp` (real player likenesses); landing hero is now a **video-placeholder** (`assets/hero-video-placeholder.svg`, branded, play-affordance) that becomes a click-to-play `<video>` once the teaser is recorded post-implementation. Also removed all remaining manager/player photos from `public/` + code (headlines, blog, OG cards).
- 2026-07-25 — **Demo-season data layer** (`src/lib/demo/fpl-demo.ts`, gated by `FPL_DEMO_SEASON=2025-26`): serves real 2025/26 snapshots + a synthesized 12-manager league so the app can be recorded with a populated season. One interception point in `FPLApiService.fetchWithCache`. Verified through dev server (headlines, standings, squad, current GW).
- 2026-07-25 — **I6 shipped** (QA + launch gate). **Playwright smoke suite** ([tests/e2e/i6-launch-smoke.spec.ts](tests/e2e/i6-launch-smoke.spec.ts)) — **12/12 passing**: admin route denies anonymous access (fail-closed 401/503, never 200-with-data), billing webhook rejects forged signatures (401), `parseWebhook` maps `order_created`→grant / `order_refunded`+`subscription_expired`→revoke / cancel→ignore, funnel visual-continuity walk `/app · /predictions · /premium · /auth/login` (light Sportify + wordmark, screenshots in `tests/screenshots/`), premium launch pricing (£15), predictions FAQ, login magic-link form, player pSEO page + JSON-LD, and the **squad Prediction tab rendering Captain Picks**. **Bug fix:** `parseWebhook` now handles `order_refunded`→revoke (a Season-Pass refund previously wouldn't revoke). **Founder gate:** [LAUNCH_CHECKLIST_2026.md](LAUNCH_CHECKLIST_2026.md) documents the manual pre-GW1 steps that can't be automated — `prisma db push` to prod, Vercel/Lemon-Squeezy env, **turn OFF demo flags in prod**, first cron trigger, live £15 test purchase + refund, GA4 `purchase`/`premium_gate_click`, newsletter opt-in round trip, and the launch announce. **Note:** the older `home-page.spec.ts` asserts the retired FR-DLS home (`/`→307 `/app`) and should be updated/retired separately — not part of the launch gate. **The I1–I6 relaunch is code-complete; remaining items are the founder's manual launch gates.**
- 2026-07-25 — **I5 shipped** (SEO surface + newsletter). **SEO surface:** (1) `/players/[slug]` pSEO template ([page.tsx](src/app/players/[slug]/page.tsx) + [lib/players.ts](src/lib/players.ts)) per mockup 08 — ink hero (price/ownership/next-fixture chips + GW xPts), 4-stat grid, recent-form bars, FDR fixture list, captaincy teaser, FAQ accordion, **Kitbag `AffiliateLink`** (`rel="sponsored"`, placement `player_page_kitbag`), premium CTA. Unique `generateMetadata`, **Person + FAQPage + Breadcrumb JSON-LD**. ISR 6h + `dynamicParams`; `generateStaticParams` pre-renders the top 40 by ownership, the tail (sitemap lists 200) renders on demand. Reuses `projectPlayer`/`buildFixtureContext` so the xPts teaser matches the app; **no player photos** (copyright). (2) `/gameweek/[gw]/captaincy` ISR page — top-12 captain picks ranked by projected points, ItemList JSON-LD, links to player pages. (3) `sitemap.ts` now async — +200 player pages +2 gameweek pages. **Newsletter:** (4) **double opt-in** — HMAC token ([lib/newsletter-token.ts](src/lib/newsletter-token.ts)), `/api/newsletter/verify` route (sets `verifiedAt`, branded HTML confirmation), a confirm-your-subscription email added to `subscribe`, and **bulk send gated on `verifiedAt: { not: null }`**. (5) **premium email block** — `EmailService.buildPremiumPicksBlock()` (top-5 PlayerPrediction picks, returns '' if unseeded) prepended to premium subscribers' summaries in `send-bulk`. **Verify:** `next build` clean (98/98 static pages, up from 57); typecheck clean; `/players/erling-haaland` 200 with unique title + Person/FAQPage JSON-LD + Kitbag affiliate; `/gameweek/21/captaincy` 200 with ItemList; `sitemap.xml` has 200 player + 2 gameweek URLs. **Next up: I6 (QA + launch).**
- 2026-07-25 — **I4 shipped** (revenue UI — captain picks + transfer suggestions, on the unified Sportify system). Rewrote the squad **Prediction tab** ([PredictionBlock.tsx](src/app/app/_components/PredictionBlock.tsx)) per mockups 06–07: **Captain Picks** (your 15 ranked by projected points — ink hero card with #1 armband call + model-confidence bar, ranked rows 2–5, vice note) and **Transfer Suggestions** (in/out pairs ranked by xPts gain, 3-factor grid Form/Minutes/Cost, why-copy, Fits-budget/Nailed-starter/Needs-funds tags, "no moves needed" empty state). Both derived from the existing `PredictionData` (`rows[].cxp/pxp/act/factors`) — no new API needed. **Premium-gated** via `useAccount().isPremium`: free/anon see the real layout blurred + an ink upsell card (red hex "Go premium" → `/premium`), premium see the full data. **GA4**: `premium_gate_click` fires with `placement` (captain_picks / transfer_suggestions) on the gate CTAs. CSS added to `redesign.css` (cap-hero/cap-row/vice-note/ts-move/ts-side/pred-bank/gate-card; reuses existing `.tcard/.tf/.ttag`). **Showcase unlock:** `NEXT_PUBLIC_DEMO_PREMIUM=1` unblurs the premium UI for the promo video (off in prod; documented in `.env.example`). **Verify:** `next build` clean (57/57); typecheck clean; squad page 200; all I4 CSS present in served chunks. **Note:** live data still needs the founder to `prisma db push` + seed predictions (the tab uses the in-app `PredictionData` projection, which works today; the standalone `/predictions` page + `PlayerPrediction` table are the DB-backed path). **Next up: I5 (SEO surface + newsletter).**
- 2026-07-25 — **I3 shipped** (a11y, skeletons, tokens — D2 part 2 + D3). (1) **Tokens → Tailwind** (`tailwind.config.ts`): added the Sportify palette (`sport-red`, `ink`, `navy`, `paper`, `line`, `muted`, `pos`, `premium`) + fonts (`font-display`/`body`/`brand-mono` → the next/font vars); FR-DLS palette + jakarta/inter marked deprecated in-file. (2) **A11y** in `sportify-fpl.css`: global low-specificity `:focus-visible` rings (3px navy; white on ink surfaces; `.id-field` focus-within ring for the clipped input) and a full `prefers-reduced-motion` block (kills animations/pulse; `.sk`→flat `#ececec`). Verified in the built CSS (13× focus-visible, 3× reduced-motion). (3) **Skeletons** (`redesign.css`): `.sk-list`/`.sk-row`/`.sk-blk`/`.sk-pitch` primitives (shimmer honors reduced-motion) wired into the rival-watch loading state in `SquadScreen` with `role="status"`. (4) **Mockup 10 bits**: oversized Bebas numeric utilities (`.num-xl`/`.num-xxl`, tabular-nums) + `.pcard` width fix (`min(440px, 100vw - 24px)` gutter). (5) **Docs**: `docs/design/design-system.md` banner — FR-DLS deprecated, Sportify v1 is the single source of truth. **Verify:** `next build` clean (57/57 static pages); typecheck clean; I3 CSS present in served chunks. **Deliberately deferred (documented):** blanket sub-12px→12px sweep (107 declarations — the dense mobile mono labels, e.g. 7.5px bottom-nav, need a layout pass, not a blind bump; would break hex nav/stat grids), the ≥768px tablet breakpoint, applying the oversized numerics to specific squad/league headers, and broader skeleton rollout — all low-risk follow-ups for a polish pass. **Next up: I4 (captain picks + transfer suggestions UI — the revenue product).**
- 2026-07-25 — **I2 shipped** (landing + perf debt). (1) **Fonts → next/font**: Bebas Neue / Manrope / JetBrains Mono self-hosted in `layout.tsx` (variables on `<html>` so the CSS `:root` tokens resolve); removed the render-blocking `@import` from `sportify-fpl.css` + `sportify-pages.css`; dropped IBM Plex (`--alt`→Manrope). Verified: build CSS has **zero** `fonts.googleapis.com`, 25 self-hosted woff2 in the build. (2) **Landing hero**: replaced the copyrighted `hero-bg-v3.png` (2.2MB, player likenesses) with a CSS-drawn branded ink+red-ray backdrop (`.v2-hero-art`) that becomes a `<video>` once the teaser is recorded — deleted the PNG. *Deviation from plan:* no WebP/`next/image` because the raster is eliminated entirely (bigger perf win, no copyright). (3) **Dead FR-DLS root** `src/app/page.tsx` → server `redirect('/app')` (keeps the old marketing page out of the bundle; `/` already 307s via next.config). (4) **Removed `react-icons`** — new `src/components/ui/brand-icons.tsx` (inline X/Reddit/Instagram/WhatsApp SVGs) swapped across 6 files; **removed `framer-motion`** — converted `motion.*` in the old `/league/[id]` route + `enhanced-standings-table` to plain elements + Tailwind hover utilities. Both dropped from `package.json`. *Kept Jakarta/Inter* (blog/FR-DLS content still uses them; already next/font, not render-blocking) — documented exception. **Follow-ups:** run `npm install` to prune the two removed deps from the lockfile; I3 folds `sportify-pages.css` atoms into the Tailwind token map. **Verify:** `next build` clean (ignoreBuildErrors on for the pre-existing `page_old.tsx`); `/app`, `/premium`, `/predictions`, `/auth/login`, `/league/[id]` all 200. **Next up: I3 (a11y, skeletons, tokens).**
- 2026-07-25 — **I1 shipped** (money-path funnel unification). Restyled `/premium`, `/predictions`, `/auth/login`, and `AccountChip` from FR-DLS dark → Sportify per mockups 02–05; deleted all inline dark style objects. New shared stylesheet `src/app/_styles/sportify-pages.css` (imported by the three standalone pages, background scoped to `.sportify-page`); `.acct-*` styles added to app-scoped `redesign.css`. Predictions page now degrades to the empty state instead of crashing when the predictions table is unseeded; FAQ is a client accordion (`src/app/predictions/_faq.tsx`). Verified: all three pages render 200 with zero dark FR-DLS hex; typecheck clean. **Transitional note for I3:** sportify-pages.css and app `sportify-fpl.css` define overlapping atoms (`.s-btn`/`.tag`/`.kicker`) globally — fold into the Tailwind token map + single stylesheet during I3. **Next up: I2 (landing → Sportify + perf debt).**
