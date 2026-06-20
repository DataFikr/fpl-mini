---
name: fpl-analytics-design
description: Designs award-winning fantasy sports UI using the FR-DLS token system — glassmorphism cards, animated stat counters, gamification patterns, responsive grids, and premium dark-mode analytics layouts with Fanatics affiliate visual loops.
use-when: The user wants to design beautiful dashboards, map out analytics wireframes, embed player-image affiliate modules, or create new visual component specifications.
---

# Premium Sports Analytics UI Pattern Assessment

## 0. Design System Foundation — Read Before Designing

Before generating any wireframe or component spec, read these files to load the FR-DLS token system:

- **`tailwind.config.ts`** — Color palette (`fpl-primary` #2B1654, `fpl-accent` #78FF9E, `fpl-dark` #0C0C0C, `fpl-text-secondary` #9BA1B0, full `fpl-violet-50..900` and `fpl-lime-50..900` scales), font families (`font-jakarta`, `font-inter`), `rounded-fpl` (12px), `shadow-fpl` / `shadow-fpl-glow` / `shadow-fpl-glow-violet`, `backdrop-blur-fpl` (12px), `animate-pulse-slow`, `animate-glow`
- **`src/app/globals.css`** — Utility classes: `glass-card` (backdrop-blur + white/10 + rounded-fpl), `glass-card-dark` (fpl-dark/40 + fpl-primary/20 border), `text-gradient-primary`, `text-gradient-violet`, `bg-animated-gradient` (gradientShift 8s), `animate-slide-in`
- **`docs/design/analytics_wireframe_feed.md`** — Component registry, Tailwind class matrices, spacing system, content hierarchy levels 1-7
- **`docs/wireframes/*.html`** — Existing wireframe patterns for fatigue-tracker, kits-hub

All output MUST use these exact tokens. Never invent new color values, radii, or shadows outside the DLS. If a new token is needed, propose it as an addendum to `tailwind.config.ts`.

## 1. Analytics Design Primitives

### The Sorare Interface Style
Ultra-premium dark-mode backdrop (`bg-fpl-dark`). High-impact player cards with gradient borders (`bg-gradient-to-br from-fpl-violet-500 via-fpl-accent/40 to-fpl-violet-700` on a 1px wrapper), vibrant status badges (neon green for live, amber for captain), and clear typography (`font-jakarta` headings, `font-inter` body).

### The FBref Data Density Style
Clean, compact statistical data grids. No zebra striping — use `divide-y divide-slate-800/50` for row separation. Tight padding (`px-2 py-1.5`). Right-aligned numerics in `font-mono`. Sticky headers with `sticky top-0 z-10 bg-slate-900`. Semantic `<table>` markup optimized for AEO.

### The Live Match Ticker Style
Persistent real-time ticker: `sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm`. Match pills with crests, scores, live dots. Horizontal scroll with `overflow-x-auto scrollbar-hide`.

## 2. Micro-Interaction Design Patterns

All animations MUST only use `transform` and `opacity` (GPU-compositor properties) for 60fps.

### Animated Stat Counters
- Numbers count from 0 to target value with `ease-out` easing
- Duration: 800ms per counter
- Stagger: 100-200ms offset between adjacent counters
- Font: `font-jakarta text-2xl font-extrabold` for hero stats, `font-mono text-sm` for table stats
- Use Framer Motion `useSpring` or `requestAnimationFrame` — no `setInterval`
- Trigger: `IntersectionObserver` — animate only when scrolled into viewport

### Skeleton Loading States
- Shimmer: `bg-slate-800` base with `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)` moving left-to-right
- Animation: `transform: translateX(-100%)` to `translateX(100%)` over 1.5s infinite
- Match exact dimensions of loaded content (card skeleton = card shape, table skeleton = row shapes)
- Rounded corners: `rounded-fpl` (12px) matching actual content

### Cursor-Tracking Card Glow (Stripe-inspired)
- On `glass-card` elements, track mouse via `onMouseMove`
- Render `radial-gradient(600px circle at ${x}px ${y}px, rgba(120,255,158,0.06), transparent 40%)` as overlay
- Desktop only (min-width 1024px) — disabled on touch devices
- Implementation: CSS custom properties `--mouse-x` / `--mouse-y` via JS, consumed by `::before` pseudo-element

### Toast Notifications
- Position: `fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]` (desktop), `bottom-20` (mobile, above tab bar)
- Background: `glass-card-dark` with elevated shadow
- Duration: 2-3s for confirmations, 5-6s for actions
- Enter: `translateY(16px) opacity-0` → `translateY(0) opacity-1` (200ms ease-out)
- Exit: reverse (150ms)
- Maximum 1 toast visible — queue subsequent toasts

### Hover & Focus States
- Cards: `transition-transform duration-200 hover:-translate-y-1 hover:shadow-fpl-glow`
- Focus visible: `focus-visible:ring-2 focus-visible:ring-fpl-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fpl-dark`
- Buttons: `active:scale-[0.98] transition-transform duration-100`
- Links: `hover:underline decoration-fpl-accent underline-offset-4`

## 3. Gamification Design Patterns

### Podium Leaderboard (Top 3)
- Top 3 entries use elevated card treatment instead of table rows
- Layout: 3-column grid, center card (rank 1) 20% taller via `scale-105`
- Rank 1: gold accent `bg-amber-400/10 border-amber-400/30`, medal icon, `shadow-[0_0_20px_rgba(251,191,36,0.2)]`
- Rank 2: silver `bg-slate-300/10 border-slate-300/30`
- Rank 3: bronze `bg-orange-600/10 border-orange-600/30`
- Below rank 3: standard `StatsDenseTable` rows

### Achievement Badges
- Tier system: Bronze (`bg-orange-700/15`), Silver (`bg-slate-300/15`), Gold (`bg-amber-400/15`), Platinum (`bg-fpl-accent/15`)
- Locked badges: `grayscale opacity-40` with lock icon overlay
- Reveal animation: scale 0 → 1.15 → 1.0 with `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot), 400ms

### Progress Bars
- Container: `h-2 w-full rounded-full bg-slate-800`
- Fill: `bg-gradient-to-r from-fpl-accent to-fpl-lime-600 rounded-full transition-[width] duration-700 ease-out`
- Label: percentage below in `text-xs text-fpl-text-secondary`

### Streak Counter
- Layout: flame icon (lucide `Flame`) + counter + "day streak" label
- Active: `text-fpl-accent` flame with `animate-pulse-slow`
- Broken: `text-fpl-text-secondary` dimmed flame
- Calendar grid: 7-col, each day 24x24px rounded square. Active: `bg-fpl-accent/20 border border-fpl-accent/40`. Today: `ring-2 ring-fpl-accent`

## 4. High-Conversion Fanatics Visual Affiliate Loop

### The Image Wrapper Pattern
Wrap player images in interactive flex-box grid. On hover, overlay gradient `from-fpl-dark/90 via-fpl-dark/20 to-transparent` with CTA button.

### The Emotional Trigger Layer
When player haul >= 10pts, apply `animate-card-glow` (2s ease-in-out infinite). Captain haul uses amber glow. Auto-sub triggers green border pulse.

### The Action Link Overlays
Hover overlay with "Get Official [Player] [Club] Kit" CTA. Button: `bg-fpl-accent text-fpl-dark font-jakarta font-bold rounded-full`. All links: `rel="sponsored nofollow"` + `target="_blank"`.

## 5. Responsive Design Rules

### Mobile Tab Bar
- Position: `fixed bottom-0 left-0 right-0 z-50 bg-fpl-dark/95 backdrop-blur-fpl border-t border-fpl-primary/20`
- Items: 3-5 max, each 48px min touch target height
- Active: `text-fpl-accent`, inactive: `text-fpl-text-secondary`
- Hidden on desktop (lg+). Safe area: `pb-[env(safe-area-inset-bottom)]`

### Grid Cascade
- Cards: `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Horizontal scroll: tables/tickers use `overflow-x-auto scrollbar-hide` below md
- Touch targets: minimum 48x48px for all interactive elements

### Chart Dark Mode Rules
- Text: `#E0E0E0` (not pure white — reduces glare)
- Font weight: semibold minimum for axis labels
- Fill opacity: 80-90% (semi-transparent) for area/bar fills
- Tooltip: `glass-card-dark` with 200ms transition

## 6. Accessibility Standards (WCAG AA)

### Contrast Ratios on bg-fpl-dark (#0C0C0C)
- `#FFFFFF` = 19.4:1 (pass)
- `#9BA1B0` = 6.8:1 (pass for large text, use for labels only)
- `#78FF9E` = 12.6:1 (pass)
- Never use color alone — always pair with icon, label, or pattern

### Semantic Requirements
- Single `<h1>` per page matching primary keyword
- `<table>` for tabular data (never div grids)
- `aria-live="polite"` on real-time regions (ticker, alerts)
- `aria-sort` on sortable table headers
- `role="status"` on toast notifications

### Motion
- Respect `prefers-reduced-motion: reduce` — disable glow, counters, shimmer
- Provide `@media (prefers-reduced-motion: reduce)` overrides for all keyframe animations

## 7. Wireframe Component Architecture Feed

Generate structured component matrix with layout guidelines, flex-box distributions, content hierarchies, and Tailwind class combinations. Output to `docs/design/analytics_wireframe_feed.md`.

When creating wireframes, also output self-contained HTML wireframes to `docs/wireframes/[feature].html` following existing patterns (fatigue-tracker.html, kits-hub.html).

## Pipeline Integration

- **Input from:** `fpl-feature-builder` (feature spec with route, component list)
- **Input from:** `fpl-competitor-gap` (competitor visual weaknesses to exploit)
- **Output to:** `docs/design/analytics_wireframe_feed.md` (component registry, Tailwind matrices)
- **Output to:** `docs/wireframes/[feature].html` (visual wireframes)
- **Consumed by:** Developers implementing React components
