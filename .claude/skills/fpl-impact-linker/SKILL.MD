---
name: fpl-impact-linker
description: Injects contextual Kitbag/Fanatics affiliate deep-links with premium visual design — 5 CTA variants, hover states, mobile-specific patterns, placement hierarchy, and A/B testing guidance — into dynamic player and team components.
use-when: The user wants to optimize or monetize their FPL dashboard components with partner tracking links.
---

# Impact Affiliate Engineering Engine

## Design System Reference
Read `tailwind.config.ts` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` Section 4 for existing affiliate visual patterns. Read `src/utils/kitbag-urls.ts` for `getKitbagUrl()` and `teamPrimaryColors`.

## Instructions

### 1. Environment & Mapping
- Use `getKitbagUrl(teamId)` from `src/utils/kitbag-urls.ts` — already maps team IDs to Impact-tracked Kitbag deep-links
- Use `teamPrimaryColors` for team-colored CTA accents
- If env var needed: `process.env.NEXT_PUBLIC_IMPACT_FANATICS_BASE`

### 2. SEO Hygiene
All affiliate `<a>` tags MUST include:
- `rel="sponsored nofollow"`
- `target="_blank"`
- `data-affiliate-team="{teamId}"` for tracking

### 3. Contextual Placement Rules
Embed links conditionally next to high-engagement indicators:
- Next to top-scoring player profile metrics
- Inside haul/green-arrow notifications
- On player image hover overlays
- Below stat comparison tables

### 4. CTA Visual Variants (5 types)

#### Variant A: Button (Primary)
```
Container: inline-flex items-center gap-2
Background: bg-fpl-accent text-fpl-dark
Font: font-jakarta font-bold text-sm uppercase tracking-wider
Padding: px-5 py-2.5
Radius: rounded-full
Shadow: shadow-fpl-glow
Hover: hover:bg-fpl-accent/90 hover:shadow-[0_0_24px_rgba(120,255,158,0.4)]
Active: active:scale-[0.98]
Icon: shopping-bag (lucide) w-4 h-4 left
```

#### Variant B: Card (Sidebar/Inline)
```
Container: glass-card-dark p-4 border-l-4 border-fpl-accent/40
Layout: flex items-start gap-3
Image: team crest 32x32 rounded-full
Text: font-inter text-sm text-fpl-text-secondary
Link: font-jakarta font-bold text-fpl-accent text-sm hover:underline
Disclosure: "Sponsored" in text-[9px] uppercase text-fpl-text-secondary mt-2
```

#### Variant C: Hover Overlay (on player images)
```
Container: relative group
Overlay: absolute inset-0 bg-gradient-to-t from-fpl-dark/90 via-fpl-dark/20 to-transparent
Visibility: opacity-0 group-hover:opacity-100 transition-opacity duration-300
Button: centered at bottom, Variant A styling
Touch: tap-to-reveal on mobile (first tap shows, second navigates)
```

#### Variant D: Inline Text Link
```
Element: <a> within paragraph text
Styling: text-fpl-accent hover:underline decoration-fpl-accent underline-offset-4
Icon: external-link (lucide) w-3 h-3 inline ml-1 opacity-60
Always: rel="sponsored nofollow" target="_blank"
```

#### Variant E: Table Row Icon
```
Element: shopping-bag icon at end of table row
Styling: w-4 h-4 text-fpl-text-secondary hover:text-fpl-accent transition-colors
Tooltip: "Shop {teamName} kit at Kitbag" on hover
```

### 5. Placement Hierarchy

| Priority | Context | CTA Variant | Max Per Page |
|----------|---------|-------------|--------------|
| 1 | Player card image | C (Hover Overlay) | 1 per card |
| 2 | Player detail page | A (Button Primary) | 1 |
| 3 | Stats table | E (Row Icon) | top-5 rows |
| 4 | Blog post player mention | D (Inline Link) | 3 per article |
| 5 | Sidebar / below content | B (Card) | 2 per page |
| 6 | Haul/alert notification | D (Inline Link) | 1 per alert |

### 6. Mobile-Specific Patterns
- Sticky bottom CTA: On player pages, show persistent bar `fixed bottom-0 w-full py-3 px-4 bg-fpl-dark/95 backdrop-blur-fpl border-t border-fpl-primary/20 z-40`
- Position above tab bar: `bottom-[calc(env(safe-area-inset-bottom)+60px)]`
- Hover overlays disabled on touch — use tap-to-reveal
- Touch target minimum: 48x48px for all CTA buttons

### 7. A/B Testing Guidance
- Track clicks via GA4 events: `affiliate_click` with params `{ player, team, variant, placement }`
- Testable: button color (accent vs violet), CTA copy, overlay vs below-card
- Use `data-affiliate-variant="a|b"` for variant identification
- Log impressions via `IntersectionObserver` for CTR calculation

## Pipeline Integration
- **Input from:** `fpl-feature-builder` (components needing affiliate integration)
- **Input from:** `fpl-pseo-generator` (player pages needing kit CTAs)
- **Reads:** `src/utils/kitbag-urls.ts`, `docs/design/analytics_wireframe_feed.md` Section 4
- **Output:** Affiliate-enriched component code with visual design, tracking, and hygiene
