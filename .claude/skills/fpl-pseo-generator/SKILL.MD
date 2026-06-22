---
name: fpl-pseo-generator
description: Generates data-driven page templates for programmatic SEO with premium dark-mode design — animated counters, skeleton loading, player hero cards, stat grids, and contextual Kitbag/Fanatics affiliate offers.
use-when: The user wants to launch programmatic landing pages for thousands of long-tail FPL terms.
---

# Programmatic SEO Page Generator

## Design System Reference
Before generating any template, read `tailwind.config.ts` and `src/app/globals.css` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` for component patterns. All pages must use exact FR-DLS tokens. (pSEO pages are public/marketing pages → FR-DLS/Tailwind, NOT the `/app` CSS-variable system.)

## Codebase Guardrails (READ FIRST)

From the 2026 SEO audit: programmatic pages only work if Google/LLMs can actually discover, fetch, and trust them. The repo today has **zero** working pSEO (no player pages, no `generateStaticParams`, no `revalidate`, dynamic pages absent from the sitemap, no internal links). A page that isn't crawlable + indexed + interlinked is wasted. Enforce:

1. **Canonical domain.** One home: **`fplranker.com`**. Every URL/OG/JSON-LD value derives from `SITE_URL` in `src/lib/seo.ts`; never hard-code `fpl-mini.vercel.app` or `fpl-league-hub.vercel.app`. Every `generateMetadata` sets `alternates: { canonical }` (absolute) + full OG + Twitter.
2. **Server-rendered, not client-only.** The page's hero, stat grid values, and FAQ must be in the SSR HTML (the existing `/league/[id]` and `/team/[id]` dashboards are client-rendered and invisible to crawlers — do NOT copy that pattern). Interactive flourishes (counters, hover) hydrate on top of real server text.
3. **Indexability is mandatory** — see new §6. A generated route that isn't in `src/app/sitemap.ts` does not exist to search engines.
4. **Interlink or die** — see new §7. Isolated pages don't rank; they need breadcrumbs + related-entity links.

## Instructions

### 1. Dynamic Route Structure
Build Next.js App Router template at `/player/[player-name]-analytics/page.tsx`:
- **Server component (SSR)** — the visible content (hero, stats, FAQ) renders server-side. No `'use client'` wrapper around the content.
- `generateMetadata()` producing title, description, **`alternates: { canonical }`** (absolute on `SITE_URL`), OG + Twitter with player name.
- `generateStaticParams()` sourced from **real data**: top-N players from `FPLApiService.getBootstrapData()` (`src/services/fpl-api.ts`), slugged by `web_name`. Don't invent a static list.
- `export const revalidate = 86400` (ISR — the repo currently sets `revalidate` nowhere, so pages would be fully dynamic and waste crawl budget). Tune per data freshness.
- Slug ↔ player resolution must be deterministic and reversible (build a slug map from bootstrap); 404 cleanly for unknown slugs.

### 2. Player Hero Card Design

#### Hero Section
- Background: `bg-fpl-dark` with subtle `bg-animated-gradient` decorative stripe
- Player image: 240x320px desktop, 160x240px mobile, `rounded-fpl`
- Name: `font-jakarta text-3xl font-extrabold text-white`
- Club + position: `glass-card` pill with team primary color accent from `teamPrimaryColors`
- Live price: `font-mono text-xl text-fpl-accent` with animated counter (count-up from 0, 800ms)

#### Stat Grid
- Layout: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3`
- Each cell: `glass-card-dark p-4` with stat label + value
- Stat label: `text-[10px] uppercase tracking-wider text-fpl-text-secondary font-inter`
- Stat value: `font-jakarta text-2xl font-extrabold` with color-coding:
  - Form >= 7.0: `text-fpl-accent`
  - Form 5.0-6.9: `text-white`
  - Form < 5.0: `text-red-400`
- Metrics: Projected Points, Form, Effective Ownership (EO), ICT Index, xG, Transfer Delta
- Stagger animation: 100ms offset per cell using animated counter pattern

#### Skeleton Loading State
- Card skeleton: `glass-card-dark` with shimmer overlay matching card dimensions
- Text: `h-4 w-24 bg-slate-800 rounded animate-pulse`
- Image: `aspect-[3/4] bg-slate-800 rounded-fpl` with shimmer
- Shimmer: moving `linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)` over 1.5s

#### Hover Effects
- Hero card: cursor-tracking radial glow (desktop only, disabled on touch)
- Stat cells: `hover:-translate-y-0.5 hover:shadow-fpl-glow transition-all duration-200`

### 3. Affiliate CTA Block
Position: Below stat grid, above FAQ section.
- Container: `glass-card p-5 border-l-4 border-fpl-accent/40`
- Copy: "Get the official {playerName} {clubName} kit"
- Button: `bg-fpl-accent text-fpl-dark font-jakarta font-bold rounded-full px-6 py-3 hover:bg-fpl-accent/90 shadow-fpl-glow`
- Link: `getKitbagUrl(teamId)` (or `getKitbagUrlByShort(short)`) from `src/utils/kitbag-urls.ts`, with `rel="sponsored nofollow"`
- Mobile: sticky CTA at bottom above tab bar (`fixed bottom-[calc(env(safe-area-inset-bottom)+60px)]`)
- Disclosure: "Ad" in `text-[9px] text-fpl-text-secondary uppercase`

### 4. FAQ Section (AEO)
- 3-5 questions sourced from community queries about this player
- Accordion: `glass-card-dark divide-y divide-slate-700/30`
- Header: `font-jakarta font-semibold text-sm text-white px-5 py-4` with chevron rotation
- Body: `font-inter text-sm text-fpl-text-secondary leading-relaxed px-5 py-4`
- Open state: `bg-fpl-primary/10 border-l-2 border-fpl-accent`
- Answers stay in the DOM (max-height collapse, never `display:none`/unmount) so they're extractable.
- JSON-LD: emit `FAQPage` + `Person` + `Dataset` + `BreadcrumbList` via the shared builders in `src/components/seo/structured-data.tsx` (all on `SITE_URL`). Defer schema construction details to the `fpl-aeo-optimizer` skill.

### 5. Responsive Rules
- Mobile (<640px): Stack vertically, 2-col stat grid, full-bleed hero image
- Tablet (768px): 3-col stat grid, side-by-side hero
- Desktop (1280px): 6-col stat grid, `max-w-5xl` centered
- Touch targets: 48x48px minimum on all interactive elements

### 6. Indexability (MANDATORY — pages don't exist without this)
- Every generated route MUST be emitted into `src/app/sitemap.ts`. Update the sitemap to `import` the same player/entity list used by `generateStaticParams` and `.map()` it into entries on `SITE_URL` (with `lastModified`, `changeFrequency: 'weekly'`, sensible `priority`). The current sitemap lists only ~4 stale URLs on the wrong domain — fix it.
- No `noindex` / `robots: { index: false }` on real content pages.
- Confirm `src/app/robots.ts` allows crawlers + AI agents and references `${SITE_URL}/sitemap.xml` (see `fpl-aeo-optimizer` guardrails).

### 7. Internal Linking & Breadcrumbs (authority graph)
Isolated pages don't rank. Each generated page must include:
- Visible breadcrumb (`Home › Players › {Player}`) + `BreadcrumbList` JSON-LD.
- A "Related players" block (e.g. same club / same position / similar price) linking 4–8 sibling pSEO pages — this is how crawlers discover the set and how authority flows. The repo currently has **no** inter-page links; do not skip this.
- Link back to relevant hubs (a `/players` index, the club page, the home tool) and from those hubs down to the pages, so nothing is orphaned.

### 8. Content Uniqueness (avoid thin/doorway penalties)
Each page must carry genuinely distinct, data-backed content (real projected points, EO, form, fixtures, price trajectory for THAT player) — not a templated shell with only the name swapped. Near-duplicate programmatic pages get filtered or penalized. If you can't produce unique value for an entity, don't generate its page.

## Pipeline Integration
- **Input from:** `fpl-researcher` (keyword clusters like "salah fpl points prediction 2026")
- **Input from:** `fpl-competitor-gap` (which competitor captures this player's traffic)
- **Shares:** `src/lib/seo.ts` (`SITE_URL`/`SITE_NAME`) and the structured-data builders with `fpl-aeo-optimizer`
- **Output:** Server-rendered page at `/player/[name]-analytics` with full SEO, canonical, JSON-LD, ISR, breadcrumbs, related-page links, affiliate CTAs — **and a matching `sitemap.ts` entry**
- **Feeds into:** `fpl-impact-linker` (affiliate injection), `fpl-aeo-optimizer` (schema + crawlability validation)
- **Validation:** no-JS `curl` of the page shows hero/stats/FAQ text + `<link rel="canonical">` + JSON-LD; route appears in `/sitemap.xml`; breadcrumb + related links present; `revalidate` set
