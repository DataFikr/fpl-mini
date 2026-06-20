---
name: fpl-pseo-generator
description: Generates data-driven page templates for programmatic SEO with premium dark-mode design — animated counters, skeleton loading, player hero cards, stat grids, and contextual Kitbag/Fanatics affiliate offers.
use-when: The user wants to launch programmatic landing pages for thousands of long-tail FPL terms.
---

# Programmatic SEO Page Generator

## Design System Reference
Before generating any template, read `tailwind.config.ts` and `src/app/globals.css` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` for component patterns. All pages must use exact FR-DLS tokens.

## Instructions

### 1. Dynamic Route Structure
Build Next.js App Router template at `/player/[player-name]-analytics/page.tsx`:
- Server component (SSR) for SEO indexing
- `generateMetadata()` producing title, description, OG tags with player name
- `generateStaticParams()` for top 200 FPL assets (pre-build for crawl budget)

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
- Link: `getKitbagUrl(teamId)` from `src/utils/kitbag-urls.ts` with `rel="sponsored nofollow"`
- Mobile: sticky CTA at bottom above tab bar (`fixed bottom-[calc(env(safe-area-inset-bottom)+60px)]`)
- Disclosure: "Ad" in `text-[9px] text-fpl-text-secondary uppercase`

### 4. FAQ Section (AEO)
- 3-5 questions sourced from community queries about this player
- Accordion: `glass-card-dark divide-y divide-slate-700/30`
- Header: `font-jakarta font-semibold text-sm text-white px-5 py-4` with chevron rotation
- Body: `font-inter text-sm text-fpl-text-secondary leading-relaxed px-5 py-4`
- Open state: `bg-fpl-primary/10 border-l-2 border-fpl-accent`
- JSON-LD: `FAQPage` schema via `StructuredData` from `src/components/seo/structured-data.tsx`

### 5. Responsive Rules
- Mobile (<640px): Stack vertically, 2-col stat grid, full-bleed hero image
- Tablet (768px): 3-col stat grid, side-by-side hero
- Desktop (1280px): 6-col stat grid, `max-w-5xl` centered
- Touch targets: 48x48px minimum on all interactive elements

## Pipeline Integration
- **Input from:** `fpl-researcher` (keyword clusters like "salah fpl points prediction 2026")
- **Input from:** `fpl-competitor-gap` (which competitor captures this player's traffic)
- **Output:** Server-rendered page at `/player/[name]-analytics` with full SEO, JSON-LD, affiliate CTAs
- **Feeds into:** `fpl-impact-linker` (affiliate injection), `fpl-aeo-optimizer` (schema validation)
