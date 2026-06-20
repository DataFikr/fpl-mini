---
name: fpl-retention-builder
description: Designs and builds lightweight micro-interactive retention tools with gamification patterns (badges, streaks, progress bars), animated counters, toast notifications, skeleton loading, sharing mechanics, and mobile tab bar navigation.
use-when: The user wants to design interactive features to stop site churn, add gamification, or improve weekly return rates.
---

# Retention Tool Builder — Gamification & Micro-Interactions

## Design System Reference
Read `tailwind.config.ts` and `src/app/globals.css` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` for component patterns. All tools must use exact FR-DLS tokens.

## Tool Ideas Library

### Tier 1: Core (enhance with design patterns)
1. **Rate My Team (RMT) Analyzer** — Paste team lineup, get optimization score with animated counter reveal
2. **Chip Strategy Planner** — Interactive calendar with streak-style visualization

### Tier 2: New Retention Tools
3. **Gameweek Predictor** — Predict captain, highest scorer, biggest differential. Score points for correct predictions
4. **Transfer Planner** — Plan 4-week transfer sequences with budget tracking and progress bar
5. **Set Piece Threat Ranker** — Visual ranking of set piece danger by team, sortable with podium top-3
6. **GW1 Draft Simulator** — Build draft squad against a countdown timer, share result with watermark
7. **FPL Personality Quiz** — "What type of FPL manager are you?" — shareable badge result
8. **Bench Boost Calculator** — Input bench, calculate optimal BB gameweek with DGW overlay
9. **Mini-League H2H Matchup** — Compare two managers side-by-side with animated stat counters
10. **Price Change Predictor** — Predicted price rises/falls with confidence bars

## Instructions

### 1. Tool Shell Pattern
Every retention tool follows this structure:

```
<ToolPage>                          Server component, SSR for SEO
  ├── <ToolHero />                  h1 + summary paragraph (AEO)
  ├── <ToolInput />                 Client component — interaction zone
  │   ├── Input fields / paste area
  │   ├── Submit button (bg-fpl-accent rounded-full)
  │   └── <SkeletonLoader />        Shown during processing
  ├── <ToolResult />                Client component — results zone
  │   ├── <AnimatedCounter />       Primary score with count-up
  │   ├── <ProgressBar />           Visual metric
  │   ├── <BadgeReveal />           Achievement earned (if applicable)
  │   └── <ShareCard />             Screenshot-optimized card
  ├── <AffiliateCTA />              Contextual kit link (Variant B from fpl-impact-linker)
  ├── <FaqAccordion />              AEO questions (pattern from fpl-aeo-optimizer)
  └── <RelatedTools />              Internal links to other tools
</ToolPage>
```

### 2. Reusable UI Components

#### `<AnimatedCounter />`
- Props: `value: number`, `duration?: number` (800ms default), `prefix?: string`, `suffix?: string`
- Animation: count 0 → value with `ease-out`
- Font: `font-jakarta text-4xl font-extrabold text-fpl-accent` (hero) or `font-mono text-lg` (inline)
- Stagger: 150ms offset between adjacent counters
- Trigger: `IntersectionObserver` — animate only when in viewport
- Respect `prefers-reduced-motion`: show final value immediately

#### `<ProgressBar />`
- Container: `h-2 w-full rounded-full bg-slate-800`
- Fill: `bg-gradient-to-r from-fpl-accent to-fpl-lime-600 rounded-full transition-[width] duration-700 ease-out`
- Label: percentage or fraction below in `text-xs text-fpl-text-secondary`
- Animated width: 0% → target on mount

#### `<BadgeReveal />`
- Trigger: tool completion or milestone hit
- Animation: scale 0 → 1.15 → 1.0 with `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring), 400ms
- Badge: circular 64x64px, `glass-card` bg, tier-colored border:
  - Bronze: `border-orange-700/40`
  - Silver: `border-slate-300/40`
  - Gold: `border-amber-400/40`
  - Platinum: `border-fpl-accent/40`
- Glow pulse once after reveal: `shadow-fpl-glow` for 1s

#### `<StreakCounter />`
- Layout: flame icon (`Flame` from lucide) + counter + "day streak" label
- Active: `text-fpl-accent` flame with `animate-pulse-slow`
- Broken: `text-fpl-text-secondary` dimmed flame
- Calendar grid (optional): 7-col, 24x24px squares per day
  - Active: `bg-fpl-accent/20 border border-fpl-accent/40`
  - Missed: `bg-slate-800/50`
  - Today: `ring-2 ring-fpl-accent`

#### `<Toast />`
- Singleton pattern (max 1 visible at a time)
- Position: `fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60]`
- Style: `glass-card-dark px-4 py-3 flex items-center gap-3 shadow-fpl min-w-[280px] max-w-[90vw]`
- Enter: `translateY(16px) opacity-0` → `translateY(0) opacity-1` (200ms ease-out)
- Exit: reverse (150ms)
- Types: success (check, green), error (x, red), info (info, white)
- Auto-dismiss: 2.5s (confirm), 5s (action), never (error — manual dismiss)

#### `<ShareCard />`
- Fixed dimensions: 520x300px (landscape for social cards)
- Background: `linear-gradient(135deg, #1A0E35, #2B1654)`
- Content: key stat + player/team names + tool name
- Watermark: `fplranker.com` in `text-[10px] font-bold text-fpl-accent/50` absolute bottom-right
- Glow decoration: `radial-gradient(circle at top-right, rgba(120,255,158,0.12), transparent 60%)`
- Export: html2canvas or dom-to-image for PNG download
- Share: Web Share API (native mobile), fallback: WhatsApp, Copy Link, Download Image

### 3. Mobile Tab Bar: `<MobileTabBar />`
- Visible only below lg (1024px)
- 4 items: Dashboard, Tools, Kits, More
- Each item: icon (24px) + label (10px) stacked, 48px min touch target
- Active: `text-fpl-accent`, inactive: `text-fpl-text-secondary`
- Background: `bg-fpl-dark/95 backdrop-blur-fpl border-t border-fpl-primary/20`
- Safe area: `pb-[env(safe-area-inset-bottom)]`

### 4. Skeleton Loading: `<ToolSkeleton />`
- Match exact layout of ToolResult
- Shimmer: `bg-slate-800` blocks with moving `linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)`
- Animation: `translateX(-100%)` to `translateX(100%)` over 1.5s infinite
- Corners: `rounded-fpl` matching actual content

## Pipeline Integration
- **Input from:** `fpl-competitor-gap` (retention gaps in competitor tools)
- **Input from:** `fpl-researcher` (community-requested tools)
- **Output:** Interactive tool components + share cards + gamification elements
- **Feeds into:** `fpl-impact-linker` (affiliate CTA placement in results)
- **Feeds into:** `fpl-aeo-optimizer` (FAQ sections on tool pages)
