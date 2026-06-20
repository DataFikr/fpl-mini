# Component Style Guide — FR-DLS

> Visual style guide preventing design drift across FPL Ranker components.
> All classes reference `tailwind.config.ts` and `src/app/globals.css`.

---

## 1. Button Variants

### Primary (CTA)

```
bg-fpl-accent text-fpl-dark
font-jakarta font-bold text-sm uppercase tracking-wider
px-5 py-2.5 rounded-full
shadow-fpl-glow
hover:bg-fpl-accent/90 hover:shadow-[0_0_24px_rgba(120,255,158,0.4)]
active:scale-[0.98] transition-all duration-200
focus-visible:ring-2 focus-visible:ring-fpl-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fpl-dark
```

Use for: Main page CTAs, form submissions, affiliate buttons.

### Secondary

```
bg-fpl-primary/30 text-white
font-jakarta font-semibold text-sm
px-5 py-2.5 rounded-full
border border-fpl-primary/40
hover:bg-fpl-primary/50 hover:border-fpl-violet-500/40
active:scale-[0.98] transition-all duration-200
```

Use for: Secondary actions, filter toggles, cancel buttons.

### Ghost

```
bg-transparent text-fpl-text-secondary
font-inter font-medium text-sm
px-4 py-2 rounded-lg
hover:bg-white/5 hover:text-white
active:scale-[0.98] transition-all duration-150
```

Use for: Tertiary actions, "See all" links, dismiss buttons.

### Danger

```
bg-red-500/15 text-red-400
font-inter font-semibold text-sm
px-4 py-2.5 rounded-full
border border-red-500/30
hover:bg-red-500/25 hover:border-red-500/50
active:scale-[0.98] transition-all duration-200
```

Use for: Delete, remove, destructive actions.

---

## 2. Input Fields

### Text Input

```
Container: relative
Input:
  w-full bg-white/5 text-white
  font-inter text-sm
  px-4 py-3 rounded-fpl
  border border-white/10
  placeholder:text-fpl-text-secondary/60
  focus:border-fpl-accent/50 focus:ring-1 focus:ring-fpl-accent/30
  focus:outline-none
  transition-colors duration-200
Label:
  font-inter text-xs font-medium text-fpl-text-secondary uppercase tracking-wider
  mb-2 block
```

### Select / Dropdown

```
Same as text input, with:
  appearance-none
  bg-[url('chevron-down.svg')] bg-no-repeat bg-[right_12px_center] bg-[length:16px]
  pr-10
```

### Search Input

```
Container: flex rounded-fpl overflow-hidden border border-white/12 bg-white/5
Input: flex-1 px-4 py-3 bg-transparent text-white text-sm outline-none
Button: px-5 bg-fpl-primary text-fpl-accent font-bold text-sm
```

---

## 3. Pill / Chip Variants

### Filter Chip

```
px-4 py-2 rounded-full
font-inter text-sm font-medium
border border-white/12 bg-white/5 text-fpl-text-secondary
cursor-pointer select-none
hover:border-white/25 hover:text-white
transition-colors duration-150

Active state:
  bg-fpl-violet-500/20 border-fpl-violet-500/40 text-white
```

### Status Chip

```
inline-flex items-center gap-1.5
px-3 py-1 rounded-full
text-[11px] font-bold uppercase tracking-wide

Variants:
  Live:    bg-emerald-500/15 text-emerald-400 border border-emerald-500/30
  Warning: bg-amber-500/15 text-amber-400 border border-amber-500/30
  Danger:  bg-red-500/15 text-red-400 border border-red-500/30
  Info:    bg-fpl-violet-500/15 text-fpl-violet-400 border border-fpl-violet-500/30
  Neutral: bg-white/5 text-fpl-text-secondary border border-white/10

Dot indicator (optional):
  w-1.5 h-1.5 rounded-full bg-current
```

### Tag Chip

```
inline-flex items-center
px-2.5 py-1 rounded-md
text-[10px] font-bold uppercase tracking-wider
bg-fpl-primary/30 text-fpl-text-secondary
border border-fpl-primary/40
```

---

## 4. Card Variants

### Glass Card (Standard)

```
glass-card               (from globals.css)
  backdrop-blur-fpl
  bg-white/[0.06]
  border border-white/10
  rounded-fpl
  p-5
```

Use for: General content containers, stat summaries, form wrappers.

### Glass Card Dark

```
glass-card-dark           (from globals.css)
  bg-fpl-dark/40
  border border-fpl-primary/20
  rounded-fpl
  backdrop-blur-fpl
  p-5
```

Use for: Table wrappers, FAQ accordions, secondary containers.

### Elevated Card

```
glass-card + additional:
  shadow-fpl
  hover:-translate-y-1 hover:shadow-fpl-glow
  transition-all duration-200
  cursor-pointer
```

Use for: Interactive cards (player cards, kit cards, tool cards).

### Stat Card

```
glass-card-dark p-5

Label: text-[10px] uppercase tracking-wider text-fpl-text-secondary font-inter mb-2
Value: font-jakarta text-2xl font-extrabold text-white
Sub:   text-xs text-fpl-text-secondary mt-1
```

Use for: Summary stat displays (e.g., "Players Tracked: 9").

### Accent-Border Card (Affiliate / Promo)

```
glass-card-dark p-5
border-l-4 border-fpl-accent/40
```

Use for: Affiliate CTAs, promotional callouts, sponsored content.

---

## 5. Typography Scale

All sizes shown with their Tailwind classes and usage context.

| Level | Element | Font | Classes | Usage |
|---|---|---|---|---|
| H1 | `<h1>` | Jakarta | `font-jakarta text-4xl md:text-5xl font-extrabold leading-tight` | Page title (1 per page) |
| H2 | `<h2>` | Jakarta | `font-jakarta text-2xl font-extrabold` | Section headers |
| H3 | `<h3>` | Jakarta | `font-jakarta text-lg font-bold` | Sub-section headers |
| Body | `<p>` | Inter | `font-inter text-base text-fpl-text-secondary leading-relaxed` | Paragraph text |
| Body Small | `<p>` | Inter | `font-inter text-sm text-fpl-text-secondary leading-relaxed` | Secondary paragraphs, descriptions |
| Label | `<span>` | Inter | `font-inter text-[10px] uppercase tracking-wider text-fpl-text-secondary font-medium` | Stat labels, card headers |
| Mono | `<span>` | Mono | `font-mono text-sm` | Table numbers, prices, scores |

### Gradient Text

```
Primary gradient:  text-gradient-primary   (from globals.css)
Violet gradient:   text-gradient-violet     (from globals.css)
Custom:            bg-gradient-to-r from-fpl-accent to-emerald-400 bg-clip-text text-transparent
```

---

## 6. Color-Coded Stat Formatting

Used in tables, stat grids, and player cards to indicate positive/negative/neutral values.

| Condition | Text Color | Companion Icon | Context |
|---|---|---|---|
| Positive / high form (>=7.0) | `text-emerald-400` | `▲` or `TrendingUp` (lucide) | Points, form, price rise |
| Neutral / average (5.0-6.9) | `text-white` | `—` or `Minus` | Average performance |
| Negative / low form (<5.0) | `text-red-400` | `▼` or `TrendingDown` (lucide) | Poor form, price fall |
| Warning / borderline | `text-amber-400` | `AlertTriangle` (lucide) | Injury doubt, medium risk |
| Accent / highlighted | `text-fpl-accent` | `Star` or `Zap` (lucide) | Captain pick, top pick, best value |

### Numeric Formatting Rules

- Always right-align numbers in tables: `text-right`
- Use `font-mono` for all numeric data
- Prices: `£` prefix, 1 decimal (e.g., `£7.5`)
- Points: no decimal (e.g., `142`)
- Percentages: 1 decimal + `%` suffix (e.g., `34.2%`)
- Form/score: 1 decimal (e.g., `7.3`)
- Deltas: `+` prefix for positive, `−` (minus sign) for negative

---

## 7. Icon Usage

All icons from [Lucide React](https://lucide.dev/) unless noted.

| Context | Icon | Size | Color |
|---|---|---|---|
| Navigation active | Varies | `w-6 h-6` | `text-fpl-accent` |
| Navigation inactive | Varies | `w-6 h-6` | `text-fpl-text-secondary` |
| Inline action | Varies | `w-4 h-4` | `text-fpl-text-secondary` |
| External link | `ExternalLink` | `w-3 h-3` | `opacity-60` |
| Affiliate / shop | `ShoppingBag` | `w-4 h-4` | `text-fpl-accent` |
| Share | `Share2` | `w-4 h-4` | `text-fpl-text-secondary` |
| Streak fire | `Flame` | `w-5 h-5` | `text-fpl-accent animate-pulse-slow` |
| Success toast | `Check` | `w-5 h-5` | `text-emerald-400` |
| Error toast | `X` | `w-5 h-5` | `text-red-400` |
| Info toast | `Info` | `w-5 h-5` | `text-white` |
| Sort ascending | `ChevronUp` | `w-4 h-4` | `text-fpl-accent` |
| Sort descending | `ChevronDown` | `w-4 h-4` | `text-fpl-accent` |
| Accordion closed | `ChevronDown` | `w-4 h-4` | `text-fpl-text-secondary` |
| Accordion open | `ChevronDown` (rotated) | `w-4 h-4 rotate-180` | `text-fpl-accent` |

---

## 8. Spacing & Layout Constants

| Token | Value | Usage |
|---|---|---|
| Page max-width | `max-w-7xl` (1280px) | Content container |
| Page padding | `px-4 md:px-8` | Horizontal page gutters |
| Section gap | `py-8 md:py-12` | Vertical spacing between sections |
| Card padding | `p-4 md:p-5` | Internal card padding |
| Card gap (grid) | `gap-3 md:gap-4` | Space between grid cards |
| Table row height | `min-h-[52px]` | Comfortable touch targets |
| Header height | `h-16` (64px) | Sticky header |
| Tab bar height | `h-[60px]` | Mobile bottom nav |

---

## 9. 3D Card Tilt (Sorare-Inspired)

Interactive perspective-based card hover effect. Cards subtly rotate toward the cursor, creating perceived depth.

### CSS Setup

```css
/* Container must set perspective */
.tilt-container {
  perspective: 1000px;
}

/* Card receives transform */
.tilt-card {
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

/* Glare overlay tracks cursor */
.tilt-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    105deg,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0.03) 45%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 55%,
    rgba(255, 255, 255, 0) 60%
  );
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tilt-card:hover::after {
  opacity: 1;
}
```

### React Hook — `useCardTilt`

```tsx
import { useCallback, useRef, useEffect } from 'react';

export function useCardTilt(maxRotation = 8) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -maxRotation;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxRotation;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.setProperty('--glare-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--glare-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, [maxRotation]);

  const handleLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)'; // spring-gentle
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    setTimeout(() => {
      if (card) card.style.transition = 'transform 0.1s ease-out';
    }, 400);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave]);

  return cardRef;
}
```

### Constraints

- **Max rotation:** 8 degrees (Linear-inspired restraint — subtle, not dramatic)
- **Disabled on touch** (`pointer: coarse`): returns static card
- **Reduced motion:** skip transform, keep card flat
- **Apply to:** Player cards, kit cards, stat cards, podium cards
- **Do not apply to:** Tables, accordions, navigation elements

---

## 10. Premium Noise Texture Overlay

Subtle grain adds tactile quality perceived as premium. Used by Stripe, Linear, and Vercel.

### Implementation

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

### Usage Rules

| Apply to | Opacity | Blend Mode |
|----------|---------|------------|
| `glass-card-elevated` | 0.015 | overlay |
| Hero sections | 0.02 | overlay |
| Modal backgrounds | 0.015 | overlay |
| Page canvas (optional) | 0.01 | soft-light |

**Do not apply to:** Buttons, inputs, text elements, table cells. Noise on small elements creates visual dirt.

---

## 11. Enhanced Glassmorphism

Three tiers of glass effect for different contexts:

### Tier 1 — Standard Glass

```
glass-card
backdrop-blur-fpl bg-white/[0.06] border border-white/10 rounded-fpl
```

Use for: General containers, form wrappers, non-interactive panels.

### Tier 2 — Enhanced Glass

```
glass-card + backdrop-saturate-150
```

Use for: Interactive cards, stat panels, dashboard sections.

`backdrop-saturate-150` boosts color vibrancy through the blur, creating a richer perceived depth.

### Tier 3 — Premium Glass (Animated)

```
glass-card-elevated + noise-overlay + gradient-border (on hover)
backdrop-blur-fpl bg-white/[0.06] border border-white/10
shadow-fpl backdrop-saturate-150
+ noise texture (§10)
+ animated conic-gradient border (design-system.md §8.4, on hover or featured state)
```

Use for: Featured player cards, premium/live content, hero containers, podium cards.

### Animated Gradient Border (CSS)

See `design-system.md` §8.4 for `@property --angle` implementation. Apply only on hover or for persistently-featured items:

```css
.card:hover .gradient-border::before,
.card.is-featured .gradient-border::before {
  opacity: 1;
}
.gradient-border::before {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

---

## 12. Error, Empty & Loading States (Stripe-Inspired)

### Page-Level Error

```
glass-card-dark p-6 border-l-4 border-red-500/40

Layout:  flex items-start gap-4
Icon:    AlertCircle (lucide) w-6 h-6 text-red-400 flex-shrink-0 mt-0.5
Content: flex-1
Title:   font-jakarta font-bold text-white text-lg mb-1
Message: font-inter text-sm text-fpl-text-secondary leading-relaxed
Action:  danger button variant, mt-4
```

### Form Field Error

```
Input:  border-red-500/50 ring-1 ring-red-500/30 (replaces default border)
Error:  text-xs text-red-400 mt-1.5 font-inter
        flex items-center gap-1
        Enter via: translateY(-4px) → translateY(0), opacity 0 → 1, 150ms ease-out
Icon:   AlertCircle w-3.5 h-3.5 text-red-400 inline
```

### Form Field Success

```
Input:  border-emerald-500/50 ring-1 ring-emerald-500/30
Check:  CheckCircle w-4 h-4 text-emerald-400, absolute right-3 top-1/2 -translate-y-1/2
```

### Empty State

```
Container: flex flex-col items-center justify-center py-16 text-center

Icon:      w-16 h-16 text-fpl-text-secondary/20 mb-4 (context-specific lucide icon)
Title:     font-jakarta text-lg font-bold text-white mb-2
Message:   font-inter text-sm text-fpl-text-secondary max-w-sm mb-6
CTA:       primary or secondary button

Examples:
  "No players match your filters"  → Filter icon    → "Clear Filters" button
  "Select a player to compare"     → Users icon     → "Browse Players" button
  "No leagues found"               → Trophy icon    → "Join a League" button
```

### Skeleton Loading

Match skeleton shapes to final content dimensions:

```
Text line:     h-4 w-3/4 skeleton rounded mb-2
Heading:       h-6 w-1/2 skeleton rounded mb-4
Avatar:        h-10 w-10 skeleton rounded-full
Stat card:     h-[120px] skeleton rounded-fpl
Player card:   aspect-[3/4] skeleton rounded-fpl
Table row:     h-[52px] w-full skeleton rounded mb-1
```

Shimmer animation: see `micro-interaction-patterns.md` §1 (0.04 opacity, 1.5s duration).

---

## 13. Restraint Philosophy (Linear-Inspired)

Design rules to maintain premium quality through discipline:

### Accent Budget

- **One accent color per screen section**: either `fpl-accent` green OR `fpl-violet-500` purple, never both competing for attention in the same card or section.
- **Exception:** Gradient borders may blend both, as they serve as decorative framing (not competing focal points).

### Animation Budget

- **Max 2 actively-animating elements** visible simultaneously per viewport.
- **Max 3 animating CSS properties** per element (e.g., transform + opacity + box-shadow).
- Persistent animations (glow pulse, shimmer) count toward the budget — limit to 1 persistent animation per viewport.

### Glow Discipline

Glow effects (`shadow-fpl-glow`, `shadow-fpl-glow-violet`) are reserved for:
- Live data states (match in progress)
- Achievement moments (badge reveal, milestone)
- Primary CTA buttons
- **Never** for static informational cards, secondary elements, or decorative purposes.

### Whitespace Minimums

- Minimum `24px` (space-6) vertical gap between distinct content groups.
- Minimum `16px` (space-4) between cards in a grid.
- Cards must have at least `16px` internal padding (`p-4`).

### Information Density Balance

- Tables: FBref-density is acceptable (tight rows, many columns).
- Cards: Limit to 4 micro-stat cells maximum per player card.
- Hero sections: Maximum 4 stat counters in a row.
- Feature grids: Maximum 4 cards visible without scrolling (desktop).

---

*Part of the FR-DLS (FPL Ranker Design Language System) v2.0. Cross-reference with `docs/design/design-system.md` for token definitions.*
