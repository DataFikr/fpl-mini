# FPLRanker — Front-End Design Review & Uplift Guide
**Prepared:** July 5, 2026 · **Relaunch:** GW1 ~Aug 15, 2026 · Complements `LAUNCH_PLAN_2026.md` (S1–S3 shipped; S4 revenue UI pending)

---

## 1. Context

Honest design critique of fplranker.com ahead of the Aug 2026 relaunch: is the theme modern, lightweight, mobile-first; does the user flow meet the standard of established sports/fantasy apps; and what best-in-class references should guide the uplift. Two research streams inform this report: a full audit of the implemented design system (all CSS, tokens, components, flows) and market research on top-rated sports app design (FotMob, SofaScore, Sleeper, PrizePicks, ESPN Fantasy, OneFootball, official FPL app, fpl.page).

**Founder decisions (locked 2026-07-05):** unify on the **Sportify light/red identity** (the shipped app-shell theme) rather than the documented-but-unimplemented FR-DLS dark system; include the **full performance/accessibility debt fix** in the pre-GW1 scope.

---

## 2. Executive summary — the honest verdict

**The product is not badly designed — it is three products wearing one domain.**

1. **FR-DLS** (documented): dark #0C0C0C + violet #2B1654 + lime #78FF9E, Plus Jakarta Sans, glassmorphism. ~1,200 lines of docs, tokens in `tailwind.config.ts` — but only ~15% reaches components. Used on the marketing landing page and the new `/premium`, `/predictions`, `/auth/login` pages.
2. **Sportify** (shipped): light #FAFAFA + red #FF5050 + navy #12233F, Bebas Neue/Manrope/JetBrains Mono, hex clip-path buttons. The entire functional app shell — ~950 lines across `sportify-fpl.css`, `app-screens.css`, `redesign.css`. Complete, distinctive, working.
3. **Inline-styled drift**: ~40 instances of hardcoded style objects (AccountChip, login, premium, predictions) using a third set of grays (#888 vs --t3 #848181 vs #9BA1B0).

**The worst discontinuity sits exactly on the money path:** dark landing → light/red app → dark paywall → light app. A first-time visitor crosses three visual languages before paying. Every benchmark app (FotMob, SofaScore, Sleeper) is instantly recognizable on any screen; FPLRanker is not yet recognizable across its own screens.

**Scorecard against the brief:**

| Criterion | Grade | Notes |
|---|---|---|
| Modern | C+ | Sportify's editorial red/Bebas look is genuinely distinctive; but light-first runs against the 2025/26 dark-default convention, and fragmentation reads as unfinished |
| Lightweight | C− | Render-blocking Google Fonts `@import`, 2.2MB hero PNG, dual icon libraries, 15KB unused Framer Motion, 35 `use client` components |
| Mobile-first | B− | Real bottom tab bar, 480px shell, safe-area insets — good bones. But no tablet breakpoint (480→1024 jump), hover-only interactions, 8–11px labels, fixed 440px modal |
| User flow | C+ | Enter-ID → squad is fast (good, no forced signup — beats the official FPL app); league tabs are clean; but the predictions→premium→login→checkout funnel changes theme twice |
| Category standard | C | Has: pitch view, tab bar, share cards, live pins. Missing: skeleton loaders (defined, never wired), oversized stat numerics, pull-to-refresh feel, consistent live-state design, team-color theming |

---

## 3. Design SWOT

| | |
|---|---|
| **Strengths** | Distinctive Sportify identity (red/Bebas editorial energy — no FPL competitor looks like this; fpl.page and livefpl are generic dark dashboards); real mobile app shell (bottom tab bar, sheets, toasts, safe-area) rather than a shrunken website; strong modal/overlay consistency (`sheetUp`/`menuIn` animations); no-signup instant entry (better onboarding than the official FPL app's forced registration); pitch/formation view already matches category convention |
| **Weaknesses** | Three coexisting identities → zero brand recognition across the funnel; 1,127 lines of CSS in 4 files with 3 shadow systems, ~6 button styles, 3 muted-text grays; WCAG failures (9px labels, lime-on-white 3.2:1, missing focus states, hover-only affordances); performance debt (blocking font `@import`, 2.2MB hero, duplicate icon libs, dead Framer Motion); skeletons/glass/glow utilities defined but never used — documentation theater |
| **Opportunities** | One-sprint funnel unification instantly makes the paid path feel trustworthy (conversion-critical); oversized numerics + bento dashboard are cheap wins that read "2026" (ESPN/fpl.page pattern); Sleeper-style share/banter cards amplify the existing Headlines engine — FPLRanker's most differentiated feature is under-designed; team-color accents from the user's favorite club; Core Web Vitals gains from the debt fix feed SEO — the only acquisition channel |
| **Threats** | Light-first default vs 82% dark-mode preference and dark-first category leaders (mitigation: Sportify already has dark surfaces — navy sidebar, dark overlays — a dark variant can ship post-GW1); polish bar set by FotMob/SofaScore/Sleeper shapes user expectations even for web tools; fpl.page is cited as the best-looking FPL tool — design is a competitive axis in this niche, not decoration; every new page built during the season adds drift unless tokens are consolidated now |

---

## 4. Benchmarks — what "good" looks like (named references)

**Apps to emulate:** SofaScore (4-tab bottom nav + Quick Links + dark mode), FotMob (20M downloads; speed + card density + live tickers), Sleeper (social banter UI, match-up animations — the model for Headlines), PrizePicks ("jump in, pick, move on" simplicity), ESPN Fantasy 2025 redesign (personalized home, oversized player-card numerics), OneFootball (Red Dot award; backdrop framing).

**Community references:**
- FotMob UI Kit (Figma): figma.com/community/file/1503678217321983772/fotmob
- Premier League Fantasy Web Dark Dashboard (Dribbble): dribbble.com/shots/23076629
- ESPN Fantasy Data Viz (Dribbble): dribbble.com/shots/17111894
- PlayStake Sports UI Kit (Figma): figma.com/community/file/1458413798791189123
- Sports App UI Kit (Figma): figma.com/community/file/1315286609448303071
- Mobbin sports library: mobbin.com/explore/mobile/app-categories/sports · tab-bar glossary: mobbin.com/glossary/tab-bar
- Awwwards sports category: awwwards.com/websites/sports/

**Conventions checklist to meet:** 4–5 item bottom tab bar ✅ (have) · skeleton loading ❌ · live badges ✅ partial · oversized stat numerics ❌ · share/brag cards ✅ partial (under-designed) · sub-30s entry ✅ · 44px touch targets ⚠️ · dark mode ❌ (deferred by decision) · team-color theming ❌.

**Anti-patterns currently present:** inconsistent button styles, gray-on-gray small text, non-native-feeling standalone pages, no loading states.

---

## 5. Implementation plan (pre-GW1 design uplift — Sportify unification + debt fix)

Fits between S3 (done) and S4 (revenue UI). ~5–6 Claude Code sessions. S4's captain-picks UI should be built *on the unified system*, so run D1/D2 first.

### D1 — Funnel unification (~2 sessions) · conversion-critical
Restyle the money path onto Sportify classes/tokens (reuse `.s-btn .s-btn--red hex`, `.card`, `--ink/--bg/--red/--navy` vars, Bebas/Manrope stacks from `src/app/app/_styles/sportify-fpl.css`):
- `src/app/premium/page.tsx`, `src/app/predictions/page.tsx`, `src/app/auth/login/page.tsx` — replace all inline dark-theme style objects with Sportify classes; wrap in the marketing header/footer or a minimal Sportify page chrome.
- `src/app/app/_components/AccountChip.tsx` — drop hardcoded #2B1654/#888; use Sportify tokens.
- `src/app/page.tsx` (marketing landing) — migrate hero from FR-DLS dark/violet/lime to Sportify light/red. Blog long-form pages: keep current editorial style short-term; restyle post-GW1 (documented exception).

### D2 — Performance & accessibility debt (~2 sessions)
- **Fonts:** remove Google Fonts `@import` from `sportify-fpl.css`; load Bebas Neue + Manrope + JetBrains Mono via `next/font/google` in `src/app/layout.tsx` with CSS-variable wiring. Drop Jakarta/Inter once marketing migrates.
- **Hero image:** `public/redesign/hero-bg-v3.png` (2.2MB) → optimized WebP + `next/image` with priority/sizes.
- **Bundle:** remove `react-icons` (replace 5 social icons with lucide or inline SVGs) and `framer-motion` from package.json (unused).
- **A11y:** raise all sub-12px text (`.scr-sub`, `.np-row .meta`, mono labels) to ≥12px; add `focus-visible` rings to Sportify inputs/buttons; add touch alternatives for hover-only rows; alt text on hero; extend `prefers-reduced-motion` to Sportify animations.
- **Skeletons:** wire the existing `.sk` shimmer into league standings + squad pitch data fetches (defined in `redesign.css`, currently unused).

### D3 — Token consolidation + quick modern wins (~1–2 sessions)
- Map Sportify CSS vars into `tailwind.config.ts` (e.g. `sport-red: #FF5050`, `ink`, `navy`, `bg`) so new pages use utilities, not new CSS files; mark FR-DLS violet/lime tokens deprecated.
- Collapse to a target of 2 stylesheets (tokens + components); delete dead utilities (noise overlay, gradient borders, glow) from `globals.css`.
- **Modern wins:** oversized Bebas numerics for GW points/rank on squad + league headers (ESPN pattern); tablet breakpoint `@media (min-width:768px)`; fix `.pcard` fixed-width overflow (`min(440px, calc(100vw - 24px))`).
- Update `docs/design/design-system.md` to declare Sportify v1 the single source of truth (supersede FR-DLS sections).

### Explicitly deferred (post-GW1, September+)
Dark-mode variant of Sportify (mitigates the light-first threat), blog restyle, team-color theming, Sleeper-style animated banter cards for Headlines, bento dashboard, PWA/offline.

---

## 6. Verification

- **Visual continuity walk:** `/` → enter team ID → `/app/squad` → `/predictions` → `/premium` → `/auth/login` — one palette, one font stack, one button style end-to-end (screenshot each step via the dev server).
- **Typecheck + build:** `npx tsc --noEmit` clean (ignore pre-existing `page_old.tsx`); `npm run build` passes.
- **Performance:** Lighthouse mobile on `/` and `/app` before/after — expect FCP improvement from next/font + WebP hero; confirm no `fonts.googleapis.com` request in the network tab; bundle no longer contains framer-motion/react-icons.
- **A11y:** no text below 12px (spot-check computed styles); keyboard-tab through the funnel shows visible focus rings; Lighthouse a11y score ≥ 90.
- **Skeletons:** throttle network in devtools; league standings and squad pitch show shimmer, not blank white.
- **Playwright:** existing visual/accessibility suites (`npm run test:accessibility`) pass on restyled pages.

---

## Appendix — engagement status (for continuity)
S1 (security gate, affiliate tracking, auth backend), S2 (account chip, team-ID persistence, predictor TS port — bit-identical), S3 (cron consolidation, predictions API + `/predictions` teaser, Lemon Squeezy billing + `/premium`) are shipped and typecheck-clean; see `LAUNCH_PLAN_2026.md`. S4 (captain-picks/transfer-suggestions UI, premium newsletter block) should be built AFTER D1/D2 so it lands on the unified design system. Founder to-dos remain: `npx prisma db push`, Lemon Squeezy store setup, `ADMIN_KEY`, first `/api/cron/daily` trigger.
