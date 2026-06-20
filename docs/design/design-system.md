# FR-DLS Design System v2.0 — Unified Token Reference

> **Version:** 2.0.0
> **Date:** 2026-06-12
> **Status:** Single source of truth for all FPL Ranker components, skills, and wireframes
> **Supersedes:** Scattered token definitions across 5 skill files and 3 design docs

---

## 0. Design Philosophy

Three principles govern every visual decision, inspired by Linear, Sorare, and Stripe:

1. **Restraint over excess** — One accent color per screen section. Maximum 2 actively-animating elements visible simultaneously. Glow effects reserved for: live data, achievements, and primary CTAs only.
2. **Depth through layering** — Use surface elevation (not decoration) to create hierarchy. Each layer has a defined purpose.
3. **Motion with meaning** — Every animation must communicate state change. No decorative motion. Budget: max 3 animating CSS properties per element.

---

## 1. Color Tokens

### 1.1 Core Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `fpl-primary` | `#2B1654` | `43, 22, 84` | Card chrome, header bars, primary surfaces |
| `fpl-accent` | `#78FF9E` | `120, 255, 158` | Live badges, CTAs, success states, glow triggers |
| `fpl-dark` | `#0C0C0C` | `12, 12, 12` | Page-level backdrop |
| `fpl-text-secondary` | `#9BA1B0` | `155, 161, 176` | Labels, secondary copy, stat descriptions |

### 1.2 Extended Violet Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `fpl-violet-50` | `#F5F3FF` | Lightest tint (rare, light mode only) |
| `fpl-violet-100` | `#EDE9FE` | Light backgrounds |
| `fpl-violet-200` | `#DDD6FE` | Borders on light surfaces |
| `fpl-violet-300` | `#C4B5FD` | Hover borders |
| `fpl-violet-400` | `#A78BFA` | Text accent, info states (7.2:1 contrast on fpl-dark) |
| `fpl-violet-500` | `#8B5CF6` | Gradient borders, active filters, glow source |
| `fpl-violet-600` | `#7C3AED` | Gradient midpoints |
| `fpl-violet-700` | `#6D28D9` | Gradient endpoints |
| `fpl-violet-800` | `#5B21B6` | Deep accent |
| `fpl-violet-900` | `#2B1654` | Alias of `fpl-primary` |

### 1.3 Accent Green Scale

> **Note:** The `fpl-lime` key in `tailwind.config.ts` holds accent greens (not true lime). This is intentional — the naming prioritizes Tailwind convention over color accuracy.

| Token | Hex | Usage |
|-------|-----|-------|
| `fpl-lime-500` | `#78FF9E` | Primary accent (alias of `fpl-accent`) |
| `fpl-lime-600` | `#65D84A` | Gradient endpoint for progress bars |
| `fpl-lime-700` | `#4ADE80` | Secondary green (emerald-adjacent) |
| `fpl-lime-800` | `#22C55E` | Deep green for contrast |

### 1.4 Semantic Status Colors

| Context | Background | Text | Border | Icon Color |
|---------|-----------|------|--------|------------|
| **Success / Live** | `emerald-500/15` | `emerald-400` | `emerald-500/30` | `emerald-400` |
| **Warning / Doubt** | `amber-500/15` | `amber-400` | `amber-500/30` | `amber-400` |
| **Error / Danger** | `red-500/15` | `red-400` | `red-500/30` | `red-400` |
| **Info** | `fpl-violet-500/15` | `fpl-violet-400` | `fpl-violet-500/30` | `fpl-violet-400` |
| **Neutral** | `white/5` | `fpl-text-secondary` | `white/10` | `fpl-text-secondary` |

### 1.5 Conditional Stat Color Rules

| Condition | Text Color | Icon | Context |
|-----------|-----------|------|---------|
| Form >= 7.0 / Positive | `text-emerald-400` | `▲` TrendingUp | High form, price rise, surplus |
| Form 5.0–6.9 / Neutral | `text-white` | `—` Minus | Average performance |
| Form < 5.0 / Negative | `text-red-400` | `▼` TrendingDown | Poor form, price fall, deficit |
| Highlighted / Best pick | `text-fpl-accent` | `Star` or `Zap` | Captain pick, best value |
| Cautionary | `text-amber-400` | `AlertTriangle` | Injury doubt, medium risk |

### 1.6 Gamification Rank Colors

| Rank | Background | Border | Shadow |
|------|-----------|--------|--------|
| 1st (Gold) | `amber-400/10` | `amber-400/30` | `0 0 20px rgba(251,191,36,0.2)` |
| 2nd (Silver) | `slate-300/10` | `slate-300/30` | `0 0 20px rgba(203,213,225,0.15)` |
| 3rd (Bronze) | `orange-600/10` | `orange-600/30` | `0 0 20px rgba(234,88,12,0.15)` |
| Badge tiers | Tier-specific | Tier-specific | Per-tier glow |

### 1.7 WCAG AA Contrast Ratios (on `fpl-dark` #0C0C0C)

| Color | Hex | Ratio | Compliance |
|-------|-----|-------|------------|
| White | `#FFFFFF` | 19.4:1 | AAA |
| `fpl-accent` | `#78FF9E` | 12.6:1 | AAA |
| `fpl-text-secondary` | `#9BA1B0` | 6.8:1 | AA (large text only; use for labels, not body) |
| `fpl-violet-400` | `#A78BFA` | 7.2:1 | AA |
| `amber-400` | `#FBBF24` | 11.1:1 | AAA |
| `emerald-400` | `#34D399` | 9.2:1 | AAA |
| `red-400` | `#F87171` | 7.8:1 | AA |

---

## 2. Surface Layering System

Depth hierarchy for dark mode. Each layer gets progressively lighter to communicate elevation.

| Layer | Token / Class | Value | Usage |
|-------|--------------|-------|-------|
| **L0 — Canvas** | `bg-fpl-dark` | `#0C0C0C` | Default page body |
| **L1 — Analytics Canvas** | `bg-slate-950` | `#020617` | Analytics views only (Sorare-grade dark) |
| **L2 — Card Surface** | `bg-slate-900/80` | `rgba(15,23,42,0.8)` | Primary card backgrounds (data views) |
| **L2-alt — Marketing Surface** | `bg-fpl-primary/25` | `rgba(43,22,84,0.25)` | Marketing cards, promo containers |
| **L3 — Hover / Active** | `bg-slate-800/50` | `rgba(30,41,59,0.5)` | Hover states, skeleton base |
| **L4 — Glass** | `bg-white/[0.06]` | `rgba(255,255,255,0.06)` | Glass card surfaces |

### Border Philosophy

| Context | Border Color | Usage |
|---------|-------------|-------|
| **Data views** (tables, analytics, stats) | `border-slate-700/50` | Neutral, recedes behind content |
| **Marketing views** (hero, promo, kits) | `border-fpl-primary/20` or `border-fpl-violet-500/20` | Branded, warmer feel |
| **Glass surfaces** | `border-white/10` | Universal glass card border |
| **Interactive hover** | `border-white/25` | Lifts on hover |
| **Accent / featured** | `border-fpl-accent/40` | Affiliate CTAs, featured items |

### When to use L2 vs L2-alt

- **L2 (slate-900/80):** Player cards, stats tables, analytics panels, BPS drawer — anywhere data density is high
- **L2-alt (fpl-primary/25):** Kit cards, promo banners, hero sections, marketing content — warmer, branded feel

---

## 3. Typography

### 3.1 Font Stack

| Token | Family | Weights | Usage |
|-------|--------|---------|-------|
| `font-jakarta` | Plus Jakarta Sans | 400, 500, 600, 700, 800 | Headlines, card titles, CTAs, display text |
| `font-inter` | Inter | 400, 500, 600 | Body text, labels, descriptions, table copy |
| `font-mono` | JetBrains Mono / system mono | 600, 700 | Numeric data, prices, scores, countdowns |

### 3.2 Type Scale

| Level | Element | Font | Classes | Usage |
|-------|---------|------|---------|-------|
| **Display** | `<h1>` hero | Jakarta | `font-jakarta text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-[-0.02em]` | Page hero titles (gradient text) |
| **H1** | `<h1>` | Jakarta | `font-jakarta text-3xl font-extrabold tracking-[-0.02em]` | Page titles (1 per page) |
| **H2** | `<h2>` | Jakarta | `font-jakarta text-2xl font-extrabold` | Section headers |
| **H3** | `<h3>` | Jakarta | `font-jakarta text-lg font-bold` | Sub-section, card titles |
| **Body** | `<p>` | Inter | `font-inter text-base text-fpl-text-secondary leading-relaxed` | Paragraph text |
| **Body Small** | `<p>` | Inter | `font-inter text-sm text-fpl-text-secondary leading-relaxed` | Descriptions, secondary text |
| **Label** | `<span>` | Inter | `font-inter text-[10px] uppercase tracking-[0.08em] text-fpl-text-secondary font-medium` | Stat labels, card headers |
| **Mono** | `<span>` | Mono | `font-mono text-sm font-semibold` | Table numbers, prices, scores |
| **Caption** | `<span>` | Inter | `font-inter text-xs text-fpl-text-secondary` | Timestamps, footnotes |

### 3.3 Gradient Text

```
Primary gradient:  text-gradient-primary   → fpl-accent → fpl-lime-600
Violet gradient:   text-gradient-violet     → fpl-violet-500 → fpl-primary
Custom:            bg-gradient-to-r from-fpl-accent to-emerald-400 bg-clip-text text-transparent
```

### 3.4 Numeric Formatting Rules

- Always right-align numbers in tables: `text-right`
- Use `font-mono` for all numeric data
- Prices: `£` prefix, 1 decimal (e.g., `£7.5`)
- Points: integer, no decimal (e.g., `142`)
- Percentages: 1 decimal + `%` (e.g., `34.2%`)
- Form/score: 1 decimal (e.g., `7.3`)
- Deltas: `+` prefix for positive, `−` (U+2212) for negative

---

## 4. Spacing & Layout

### 4.1 Modular Spacing Scale (8px-based)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Tight gaps (icon + label) |
| `space-2` | `8px` | Grid gaps (small), inner padding |
| `space-3` | `12px` | Card grid gaps (mobile) |
| `space-4` | `16px` | Card padding, card grid gaps (desktop) |
| `space-6` | `24px` | Section separation (small) |
| `space-8` | `32px` | Section gaps |
| `space-12` | `48px` | Major section spacing |
| `space-16` | `64px` | Page section dividers |
| `space-24` | `96px` | Hero top/bottom padding |

### 4.2 Layout Constants

| Token | Value | Usage |
|-------|-------|-------|
| Page max-width | `max-w-7xl` (1280px) | Content container |
| Page padding | `px-4 md:px-8` | Horizontal gutters |
| Section gap | `py-8 md:py-12` | Vertical spacing between sections |
| Card padding | `p-4 md:p-5` | Internal card padding |
| Card gap (grid) | `gap-3 md:gap-4` | Space between grid cards |
| Header height | `h-16` (64px) | Sticky header |
| Tab bar height | `h-[60px]` | Mobile bottom nav |
| Table row height | `min-h-[52px]` | Touch-friendly rows |

### 4.3 Responsive Grid Cascade (Unified)

Standard grid for card layouts (player cards, kit cards, tool cards):

```
grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
gap-3 md:gap-4
```

| Breakpoint | Width | Columns | Gap |
|------------|-------|---------|-----|
| Default / `sm` | < 768px | 2 | 12px |
| `md` | 768px+ | 3 | 16px |
| `lg` | 1024px+ | 4 | 16px |
| `xl` | 1280px+ | 5 | 16px |

### 4.4 Touch Target Minimums

- All interactive elements: `48px × 48px` minimum
- Filter chips: `min-h-[44px] px-4`
- Table rows: `min-h-[52px]`
- Close / dismiss buttons: `w-10 h-10` minimum
- Mobile tab bar items: `min-h-[48px]`

---

## 5. Shadows & Elevation

### 5.1 Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-fpl` | `0 4px 12px rgba(0, 0, 0, 0.25)` | Default card elevation |
| `shadow-fpl-glow` | `0 0 20px rgba(120, 255, 158, 0.3)` | Accent glow (CTAs, live states, hauls) |
| `shadow-fpl-glow-violet` | `0 0 20px rgba(139, 92, 246, 0.4)` | Premium card depth, featured items |
| `shadow-fpl-elevated` | `0 8px 32px rgba(0, 0, 0, 0.4)` | **NEW** — 3D elevated cards, modals |

### 5.2 Shadow Usage Guide

| Context | Shadow Token | When |
|---------|-------------|------|
| Static card | `shadow-fpl` | Default resting state |
| Card hover | `shadow-fpl-glow` | On `:hover` for interactive cards |
| Featured / premium | `shadow-fpl-glow-violet` | Featured items, premium badges |
| 3D tilt hover | `shadow-fpl-elevated` | Cards with 3D tilt active |
| CTA button | `shadow-fpl-glow` | Primary CTA resting state |
| CTA button hover | `0 0 24px rgba(120,255,158,0.4)` | Intensified glow on hover |
| Live player haul | `cardGlow` keyframe | Pulsing glow (>= 10 pts) |
| Captain haul | `captainGlow` keyframe | Amber pulsing glow (>= 15 pts) |

### 5.3 Elevation Levels

| Level | Shadow | Z-Index | Usage |
|-------|--------|---------|-------|
| E0 | none | `z-0` | Flat content, text blocks |
| E1 | `shadow-fpl` | `z-0` | Cards at rest |
| E2 | `shadow-fpl-glow` or `shadow-fpl-elevated` | `z-10` | Hovered cards, sticky headers |
| E3 | `shadow-fpl-glow-violet` | `z-30` | Dropdowns, popovers |
| E4 | `shadow-fpl-elevated` | `z-50` | Header, ticker, tab bar |
| E5 | `shadow-fpl-elevated` + glow | `z-70` | Modals, drawers |

---

## 6. Z-Index Hierarchy

| Level | Value | Usage |
|-------|-------|-------|
| Base content | `z-0` | Default stacking |
| Sticky table headers | `z-10` | `<thead>` with `sticky top-0` |
| Floating labels, tooltips | `z-20` | Tooltip popups, floating badges |
| Dropdowns, popovers | `z-30` | Select menus, autocomplete |
| Sticky mobile CTA | `z-40` | Fixed CTA above tab bar |
| Header / Ticker / Tab bar | `z-50` | Primary navigation chrome |
| Toast notifications | `z-60` | Ephemeral feedback |
| Modals, drawers | `z-70` | Overlay content |
| Critical overlays | `z-80` | Loading screens, error catches |

---

## 7. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-fpl` | `12px` | Cards, inputs, containers, images |
| `rounded-full` | `9999px` | Pills, badges, buttons, status dots |
| `rounded-md` | `6px` | Tag chips, small controls |
| `rounded-lg` | `8px` | Ghost buttons, inner containers |

---

## 8. Glass & Surface Effects

### 8.1 Glass Card Variants

```css
/* Standard glass — light frosted surface */
.glass-card {
  @apply backdrop-blur-fpl bg-white/[0.06] rounded-fpl border border-white/10;
}

/* Dark glass — branded, warmer surface */
.glass-card-dark {
  @apply backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20;
}

/* Elevated glass — premium interactive surface (NEW) */
.glass-card-elevated {
  @apply backdrop-blur-fpl bg-white/[0.06] rounded-fpl border border-white/10;
  @apply shadow-fpl backdrop-saturate-150;
  /* Add noise texture via ::after (see 8.3) */
}
```

### 8.2 Enhanced Glassmorphism

For award-winning polish, add `backdrop-saturate-150` to glass cards. This boosts color vibrancy through the blur, creating depth perceived as premium:

```
Standard:  backdrop-blur-fpl bg-white/[0.06] border-white/10
Enhanced:  backdrop-blur-fpl bg-white/[0.06] border-white/10 backdrop-saturate-150
Premium:   backdrop-blur-fpl bg-white/[0.06] border-white/10 backdrop-saturate-150 + noise + animated border
```

### 8.3 Noise / Grain Texture Overlay

Subtle grain adds tactile premium quality (seen on Stripe, Linear, Vercel). Barely perceptible but subconsciously registers as "premium."

```css
.noise-overlay {
  position: relative;
}
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.015;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

Apply to: `glass-card-elevated`, hero sections, modal backgrounds, page canvas.

### 8.4 Animated Gradient Borders

For featured/live cards. Uses CSS `@property` for smooth rotation:

```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.gradient-border {
  position: relative;
  border-radius: 12px;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle),
    #8B5CF6,
    #78FF9E,
    #6D28D9,
    #78FF9E,
    #8B5CF6
  );
  z-index: -1;
  animation: borderRotate 4s linear infinite;
}

@keyframes borderRotate {
  to { --angle: 360deg; }
}
```

Usage: Apply to featured player cards, live-state cards, hero containers. Only on hover or for persistently-featured items.

### 8.5 Cursor-Tracking Glow

Desktop-only radial glow following mouse position:

```css
.glow-card {
  position: relative;
  overflow: hidden;
}
.glow-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(120, 255, 158, 0.06),
    transparent 40%
  );
  pointer-events: none;
  z-index: 1;
}
```

Paired with `useMouseGlow()` hook (see micro-interaction-patterns.md).

---

## 9. Spring Easing Curves

Named cubic-bezier curves for organic, physics-based motion:

| Name | Value | Feel | Usage |
|------|-------|------|-------|
| `spring-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot + settle | Badge reveals, achievement popups |
| `spring-gentle` | `cubic-bezier(0.22, 1, 0.36, 1)` | Smooth settle | Card lifts, drawer slides, card tilt reset |
| `spring-snappy` | `cubic-bezier(0.16, 1, 0.3, 1)` | Quick snap | Button presses, chip toggles |

Add to `tailwind.config.ts`:
```typescript
transitionTimingFunction: {
  'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'spring-gentle': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'spring-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
},
```

---

## 10. Error, Empty & Loading States

### 10.1 Error States

**Page-level error:**
```
glass-card-dark p-6 border-l-4 border-red-500/40

Icon:    AlertCircle (lucide) w-6 h-6 text-red-400
Title:   font-jakarta font-bold text-white text-lg
Message: font-inter text-sm text-fpl-text-secondary mt-2
Action:  danger button variant (see component-style-guide.md)
```

**Form field error:**
```
Input border:  border-red-500/50 ring-1 ring-red-500/30
Error text:    text-xs text-red-400 mt-1.5 font-inter
               Enter via 150ms slide-down animation
Icon:          AlertCircle w-3.5 h-3.5 inline text-red-400
```

**Inline error (table cell, stat):**
```
text-red-400 font-mono
Tooltip on hover: glass-card-dark p-2 text-xs
```

### 10.2 Empty States

```
Container: flex flex-col items-center justify-center py-16 text-center

Icon:      w-16 h-16 text-fpl-text-secondary/20 mb-4
Title:     font-jakarta text-lg font-bold text-white mb-2
Message:   font-inter text-sm text-fpl-text-secondary max-w-sm mb-6
Action:    primary or secondary button
```

### 10.3 Loading States

**Skeleton shimmer:**
```css
/* Base skeleton element */
.skeleton {
  background: #1e293b; /* slate-800 */
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**Skeleton shapes:**
- Text line: `h-4 w-3/4 rounded`
- Heading: `h-6 w-1/2 rounded`
- Avatar: `h-10 w-10 rounded-full`
- Card: match final card dimensions, `rounded-fpl`
- Table row: `h-[52px] w-full rounded`

**Full-page spinner:**
```
fixed inset-0 z-80 bg-fpl-dark/80 flex items-center justify-center
Spinner: w-8 h-8 border-2 border-fpl-accent/30 border-t-fpl-accent rounded-full animate-spin
```

### 10.4 Status Messaging Hierarchy (Stripe-inspired)

| Level | Border | Icon | Usage |
|-------|--------|------|-------|
| Success | `border-l-4 border-emerald-500/40` | `CheckCircle` emerald-400 | Confirmation, save complete |
| Warning | `border-l-4 border-amber-500/40` | `AlertTriangle` amber-400 | Non-blocking alert |
| Error | `border-l-4 border-red-500/40` | `AlertCircle` red-400 | Action failed |
| Info | `border-l-4 border-fpl-violet-500/40` | `Info` fpl-violet-400 | Guidance, tips |

---

## 11. Responsive Breakpoints

| Token | Width | Usage |
|-------|-------|-------|
| `sm` | 640px | 2-column grids, mobile landscape |
| `md` | 768px | 3-column grids, tablet |
| `lg` | 1024px | 4-column grids, desktop features enabled |
| `xl` | 1280px | 5-column grids, full desktop |

### Mobile-Specific Tokens

| Element | Spec |
|---------|------|
| Tab bar height reservation | `pb-[60px]` on `<main>` when `lg:hidden` tab bar present |
| Safe area bottom | `pb-[env(safe-area-inset-bottom)]` on tab bar |
| Sticky CTA position | `fixed bottom-[calc(env(safe-area-inset-bottom)+60px)]` (above tab bar) |
| Toast position | `fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-60` |

---

## 12. Icon System

All icons from [Lucide React](https://lucide.dev/).

| Context | Icon | Size | Color |
|---------|------|------|-------|
| Nav active | Varies | `w-6 h-6` | `text-fpl-accent` |
| Nav inactive | Varies | `w-6 h-6` | `text-fpl-text-secondary` |
| Inline action | Varies | `w-4 h-4` | `text-fpl-text-secondary` |
| External link | `ExternalLink` | `w-3 h-3` | `opacity-60` |
| Affiliate / shop | `ShoppingBag` | `w-4 h-4` | `text-fpl-accent` |
| Share | `Share2` | `w-4 h-4` | `text-fpl-text-secondary` |
| Streak fire | `Flame` | `w-5 h-5` | `text-fpl-accent animate-pulse-slow` |
| Success toast | `Check` | `w-5 h-5` | `text-emerald-400` |
| Error toast | `X` | `w-5 h-5` | `text-red-400` |
| Sort ascending | `ChevronUp` | `w-4 h-4` | `text-fpl-accent` |
| Sort descending | `ChevronDown` | `w-4 h-4` | `text-fpl-accent` |
| Accordion closed | `ChevronDown` | `w-4 h-4` | `text-fpl-text-secondary` |
| Accordion open | `ChevronDown` | `w-4 h-4 rotate-180` | `text-fpl-accent` |

---

## 13. Accessibility Baseline

### Semantic HTML

- Single `<h1>` per page matching primary search query
- `<table>` for tabular data (never `<div>` grids)
- `<thead>` / `<tbody>` separation with sticky headers
- `<caption class="sr-only">` for table descriptions
- `aria-live="polite"` on real-time regions (ticker, alerts)
- `aria-sort` on sortable headers
- `role="status"` on toasts
- `aria-expanded` on accordions
- `aria-label` on icon-only buttons

### Focus Management

```
All interactive elements:
  focus-visible:ring-2
  focus-visible:ring-fpl-accent
  focus-visible:ring-offset-2
  focus-visible:ring-offset-fpl-dark
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
  .haul-glow { animation: none; }
  .badge-reveal { animation: none; opacity: 1; transform: scale(1); }
  .toast-enter { animation: none; opacity: 1; }
  .gradient-border::before { animation: none; }
  [class*="animate-"] { animation: none !important; }
  .hover\:-translate-y-1:hover { transform: none; }
  .progress-fill { transition-duration: 0.01ms; }
}
```

### Image Alt Text Pattern

`"{Player} - {Club} - Premier League 2025/26"`

---

## 14. Affiliate Integration Tokens

### Link Attributes

```html
<a href="..." target="_blank" rel="sponsored nofollow"
   data-affiliate="fanatics" data-player="{slug}" data-team="{slug}">
```

### Placement Rules

- No affiliate links in `<nav>`, `<header>`, `<footer>`
- Affiliate links never sole interactive element on page
- All affiliate images must have descriptive alt text
- Maximum CTA count per page (see fpl-impact-linker skill for hierarchy)

### Disclosure

```
Visible "Ad" badge: text-[10px] uppercase tracking-wider text-fpl-text-secondary bg-white/5 px-2 py-0.5 rounded
```

---

## 15. Token Cross-Reference

Maps each token to its source file:

| Token | `tailwind.config.ts` key | `globals.css` utility | Notes |
|-------|-------------------------|----------------------|-------|
| `fpl-primary` | `colors.fpl-primary` | — | `#2B1654` |
| `fpl-accent` | `colors.fpl-accent` | — | `#78FF9E` |
| `fpl-dark` | `colors.fpl-dark` | — | `#0C0C0C` |
| `fpl-text-secondary` | `colors.fpl-text-secondary` | — | `#9BA1B0` |
| `rounded-fpl` | `borderRadius.fpl` | — | `12px` |
| `shadow-fpl` | `boxShadow.fpl` | — | Base elevation |
| `shadow-fpl-glow` | `boxShadow.fpl-glow` | — | Accent glow |
| `shadow-fpl-glow-violet` | `boxShadow.fpl-glow-violet` | — | `rgba(139,92,246,0.4)` — UNIFIED v2.0 |
| `backdrop-blur-fpl` | `backdropBlur.fpl` | — | `12px` |
| `glass-card` | — | `.glass-card` | `bg-white/[0.06]` — UNIFIED v2.0 (was `/10`) |
| `glass-card-dark` | — | `.glass-card-dark` | Unchanged |
| `text-gradient-primary` | — | `.text-gradient-primary` | Accent → lime-600 |
| `text-gradient-violet` | — | `.text-gradient-violet` | Violet-500 → primary |
| `animate-pulse-slow` | `animation.pulse-slow` | — | 3s pulse |
| `animate-glow` | `animation.glow` | — | 2s accent glow |

---

## Inconsistency Resolution Log

All 13 identified inconsistencies resolved in v2.0:

| # | Issue | Resolution |
|---|-------|-----------|
| 1 | Shimmer opacity (0.05 vs 0.04) | Standardized to `0.04` |
| 2 | Toast position breakpoint | Mobile-first: `bottom-20 md:bottom-6` |
| 3 | Text color (`#E5E7EB` vs `#F8FAFC`) | Unified to `#F8FAFC` (slate-50) |
| 4 | Text-secondary (`#9CA3AF` vs `#9BA1B0`) | Unified to `#9BA1B0` (fpl-text-secondary) |
| 5 | Card bg variants undocumented | Documented as L2 vs L2-alt in §2 |
| 6 | Counter stagger (100-200ms vs 150ms) | Standardized to `150ms` |
| 7 | Grid cascade differs | Unified in §4.3 |
| 8 | Mobile tab bar spec scattered | Consolidated in §4.2 and §11 |
| 9 | Glass-card bg-white (/10 vs /0.06) | Standardized to `/[0.06]` |
| 10 | Shadow-fpl-glow-violet value | Standardized to `rgba(139,92,246,0.4)` |
| 11 | Border color philosophy | Documented in §2 |
| 12 | fpl-lime naming inaccuracy | Documented in §1.3 with note |
| 13 | Analytics bg override undocumented | Documented as L1 in §2 |

---

*FR-DLS v2.0 — FPL Ranker Design Language System. This document supersedes all per-skill token definitions. Implementation: `tailwind.config.ts`, `src/app/globals.css`.*
