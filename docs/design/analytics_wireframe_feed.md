# FPL Ranker -- Premium Analytics Wireframe Feed

> **Version:** 1.0.0
> **Date:** 2026-06-09
> **Status:** Engineering-ready specification
> **Target:** Reddit FPL community pain points + high-conversion affiliate monetization

---

## 0. Design System Token Reference

All components inherit from the established FPL Design Language System. This section maps DLS tokens to the three elite analytics primitives.

| Token | Value | Usage |
|---|---|---|
| `fpl-primary` | `#2B1654` | Card chrome, header bars, primary surfaces |
| `fpl-accent` | `#78FF9E` | Live badges, success states, glow triggers |
| `fpl-dark` | `#0C0C0C` | Page-level backdrop (overridden to `bg-slate-950` for analytics views) |
| `fpl-text-secondary` | `#9BA1B0` | Stat labels, secondary copy |
| `font-jakarta` | Plus Jakarta Sans | Card titles, stat values, headlines |
| `font-inter` | Inter | Table body text, labels, descriptions |
| `rounded-fpl` | `12px` | Card corners, badge radii |
| `shadow-fpl-glow` | `0 0 20px rgba(120,255,158,0.3)` | Active/live player glow |
| `shadow-fpl-glow-violet` | `0 0 20px rgba(43,22,84,0.5)` | Premium card depth |
| `backdrop-blur-fpl` | `12px` | Glass overlays on cards |

### Analytics-Specific Backdrop Override

```
Analytics page root:
  bg-slate-950          -- Sorare-grade dark canvas
  min-h-screen
  text-white
  font-inter
```

All child components render against this ultra-dark canvas to maximize card contrast and data legibility.

---

## 1. Sorare Interface Style -- Player Card Primitives

### 1.1 Card Anatomy

```
+-----------------------------------------------+
|  GRADIENT BORDER (1px)                         |
|  from-fpl-violet-500 via-fpl-accent to-fpl-violet-700  |
|                                                |
|  +-------------------------------------------+ |
|  |  bg-slate-900/80  backdrop-blur-fpl       | |
|  |                                           | |
|  |  [PLAYER IMAGE]          [STATUS BADGE]   | |
|  |  aspect-[3/4]            absolute top-3   | |
|  |  object-cover             right-3         | |
|  |  rounded-t-fpl                            | |
|  |                                           | |
|  |  +----- STAT RIBBON ----+                 | |
|  |  | Name    | Pts | Form |                 | |
|  |  | Jakarta | 2xl | sm   |                 | |
|  |  +----------------------+                 | |
|  |                                           | |
|  |  +----- MICRO STATS ----+                 | |
|  |  | xG  | xA  | BPS | Mins |              | |
|  |  | mono| mono| mono| mono |              | |
|  |  +----------------------+                 | |
|  |                                           | |
|  |  [AFFILIATE CTA ZONE]                    | |
|  |  "Get Official Kit at Fanatics"           | |
|  +-------------------------------------------+ |
+-----------------------------------------------+
```

### 1.2 Tailwind Class Matrix -- `<PlayerCard />`

| Zone | Element | Classes |
|---|---|---|
| **Outer border** | `div` | `p-[1px] rounded-fpl bg-gradient-to-br from-fpl-violet-500 via-fpl-accent/40 to-fpl-violet-700` |
| **Inner card** | `div` | `bg-slate-900/80 backdrop-blur-fpl rounded-fpl overflow-hidden flex flex-col` |
| **Image wrapper** | `div` | `relative aspect-[3/4] overflow-hidden` |
| **Player image** | `img` | `w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105` |
| **Status badge** | `span` | `absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-jakarta font-bold uppercase tracking-wider` |
| -- Live/Playing | | `bg-fpl-accent text-fpl-dark animate-pulse-slow` |
| -- Auto-sub IN | | `bg-emerald-400 text-fpl-dark shadow-[0_0_12px_rgba(52,211,153,0.6)]` |
| -- Auto-sub OUT | | `bg-red-500 text-white` |
| -- Benched | | `bg-slate-600 text-slate-300` |
| -- Captain | | `bg-amber-400 text-fpl-dark` |
| **Stat ribbon** | `div` | `px-4 py-3 border-t border-slate-700/50` |
| **Player name** | `h3` | `font-jakarta font-bold text-lg text-white truncate` |
| **Points value** | `span` | `font-jakarta text-2xl font-extrabold text-fpl-accent` |
| **Form badge** | `span` | `text-sm font-inter text-fpl-text-secondary` |
| **Micro stats row** | `div` | `grid grid-cols-4 gap-2 px-4 py-2 border-t border-slate-700/30` |
| **Stat cell** | `div` | `flex flex-col items-center` |
| **Stat label** | `span` | `text-[10px] uppercase tracking-wider text-fpl-text-secondary font-inter` |
| **Stat value** | `span` | `text-sm font-mono font-semibold text-white` |
| **CTA zone** | `div` | `px-4 py-3 border-t border-slate-700/30` |

### 1.3 Status Badge State Machine

```
PLAYER STATUS           BADGE                          GLOW TRIGGER
----------------------------------------------------------------------
Playing (live GW)       "LIVE" bg-fpl-accent           card border pulses
Auto-sub activated      "SUB IN" bg-emerald-400        full card glow animation
Auto-sub replaced       "SUB OUT" bg-red-500           none
On bench (no sub)       "BENCH" bg-slate-600           none
Captain                 "C" bg-amber-400               none
Vice-captain            "VC" bg-amber-400/70           none
Triple captain chip     "TC" bg-gradient-to-r          card border + glow
                        from-amber-400 to-fpl-accent
```

### 1.4 Card Grid Layout

```
Desktop (>=1280px):  grid grid-cols-5 gap-4
Laptop  (>=1024px):  grid grid-cols-4 gap-4
Tablet  (>=768px):   grid grid-cols-3 gap-3
Mobile  (>=640px):   grid grid-cols-2 gap-3
Small   (<640px):    grid grid-cols-2 gap-2
```

### 1.5 Glow Animation Keyframes

```css
/* Triggered when player haul >= 10 pts OR auto-sub activates */
@keyframes cardGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(120,255,158,0.2); }
  50%      { box-shadow: 0 0 24px rgba(120,255,158,0.5); }
}

.animate-card-glow {
  animation: cardGlow 2s ease-in-out infinite;
}
```

---

## 2. FBref Data Density Style -- Statistical Tables

### 2.1 Design Philosophy

FBref tables succeed because they present maximum data in minimum space without sacrificing legibility. Rules:

1. **No zebra striping** -- use `hover:bg-slate-800/50` for row identification
2. **Tight vertical rhythm** -- `py-1.5 px-2` cell padding
3. **Right-aligned numerics** -- all stat columns `text-right font-mono`
4. **Sticky headers** -- `sticky top-0 z-10 bg-slate-900`
5. **Semantic HTML** -- `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` for AEO crawlers
6. **Sortable columns** -- visual indicator on active sort column
7. **Compact typography** -- `text-xs` for stats, `text-sm` for player names

### 2.2 Table Component Architecture -- `<StatsDenseTable />`

```
<div class="overflow-x-auto rounded-fpl border border-slate-700/50">
  <table class="w-full text-left text-xs font-inter">
    <thead class="sticky top-0 z-10 bg-slate-900 border-b border-slate-700">
      <tr>
        <th><!-- sortable column headers --></th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-800/50">
      <tr class="hover:bg-slate-800/50 transition-colors">
        <td><!-- data cells --></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 2.3 Column Configuration Matrix

| Column | Width | Align | Font | Classes |
|---|---|---|---|---|
| **Rank** | `w-10` | center | mono | `text-center font-mono text-fpl-text-secondary` |
| **Player** | `min-w-[140px]` | left | jakarta | `font-jakarta font-medium text-sm text-white` |
| **Team** | `w-12` | center | -- | `text-center` (team crest 16x16) |
| **Pos** | `w-10` | center | inter | `text-center uppercase text-fpl-text-secondary` |
| **Pts** | `w-14` | right | mono | `text-right font-mono font-bold text-fpl-accent` |
| **GW Pts** | `w-14` | right | mono | `text-right font-mono text-white` |
| **xG** | `w-12` | right | mono | `text-right font-mono text-fpl-text-secondary` |
| **xA** | `w-12` | right | mono | `text-right font-mono text-fpl-text-secondary` |
| **BPS** | `w-12` | right | mono | `text-right font-mono text-fpl-text-secondary` |
| **Mins** | `w-14` | right | mono | `text-right font-mono text-fpl-text-secondary` |
| **Form** | `w-12` | right | mono | `text-right font-mono` + conditional color |
| **Price** | `w-14` | right | mono | `text-right font-mono text-white` |
| **Delta** | `w-12` | right | mono | `text-right font-mono` + `text-emerald-400` / `text-red-400` |

### 2.4 Sortable Header Pattern

```
<th scope="col"
    class="px-2 py-2 cursor-pointer select-none
           text-[10px] uppercase tracking-wider
           text-fpl-text-secondary font-inter
           hover:text-white transition-colors"
    role="columnheader"
    aria-sort="ascending|descending|none">
  <div class="flex items-center gap-1 justify-end">
    <span>Pts</span>
    <ChevronUp class="w-3 h-3" />   <!-- or ChevronDown -->
  </div>
</th>
```

### 2.5 Conditional Cell Formatting

```
Form >= 7.0     text-fpl-accent font-bold
Form 5.0-6.9    text-white
Form 3.0-4.9    text-amber-400
Form < 3.0      text-red-400

Price delta > 0  text-emerald-400 (+ prefix)
Price delta < 0  text-red-400 (- prefix)
Price delta = 0  text-fpl-text-secondary

BPS rank 1-3     bg-amber-400/10 text-amber-400 font-bold rounded px-1
```

### 2.6 AEO Semantic Layer

Every table must include structured data attributes for AI scraper optimization:

```html
<table itemscope itemtype="https://schema.org/Table">
  <caption class="sr-only" itemprop="description">
    FPL Gameweek 38 Player Statistics
  </caption>
  <thead>
    <tr itemscope itemtype="https://schema.org/ItemList">
      <th itemprop="name" scope="col">Player</th>
      <th itemprop="name" scope="col">Total Points</th>
    </tr>
  </thead>
</table>
```

---

## 3. Live Match Ticker -- Real-Time Data Strip

### 3.1 Ticker Anatomy

```
+------------------------------------------------------------------+
|  STICKY TOP BAR  bg-slate-900/95  backdrop-blur-sm  border-b     |
|  border-slate-700/50  z-50                                        |
|                                                                   |
|  [GW38 LIVE]  |  [Match 1]  |  [Match 2]  |  ...  |  [>>]      |
|                                                                   |
|  overflow-x-auto  flex  gap-3  px-4  py-2  scrollbar-hide        |
+------------------------------------------------------------------+
```

### 3.2 Component Structure -- `<LiveMatchTicker />`

| Zone | Element | Classes |
|---|---|---|
| **Container** | `div` | `sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50` |
| **Inner scroll** | `div` | `flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-hide` |
| **GW badge** | `div` | `flex-shrink-0 px-3 py-1 rounded-full bg-fpl-accent text-fpl-dark text-xs font-jakarta font-bold uppercase` |
| **Match pill** | `div` | `flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-fpl bg-slate-800/80 border border-slate-700/30` |
| **Team crest** | `img` | `w-5 h-5 object-contain` |
| **Score** | `span` | `font-mono font-bold text-sm text-white` |
| **Live dot** | `span` | `w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse` |
| **Minute** | `span` | `text-[10px] text-fpl-text-secondary font-mono` |

### 3.3 Match Pill States

```
STATE              VISUAL
------------------------------------------------------
Pre-match          Score hidden, "KO 15:00" text
Live (1H)         Red pulse dot, minute counter, live score
Half-time          "HT" badge, score visible, no pulse
Live (2H)         Red pulse dot, minute counter, live score
Full-time          "FT" badge, final score, no pulse
Postponed          "PP" badge, bg-amber-400/10, text-amber-400
```

### 3.4 Ticker Data Feed Schema

```typescript
interface TickerMatch {
  id: number;
  homeTeam: { name: string; shortName: string; crestUrl: string; score: number | null };
  awayTeam: { name: string; shortName: string; crestUrl: string; score: number | null };
  status: 'pre' | 'live_1h' | 'ht' | 'live_2h' | 'ft' | 'postponed';
  minute: number | null;
  started: boolean;
  finished: boolean;
}
```

### 3.5 BPS Live Tracker Sub-Component

Nested inside the ticker or as a collapsible drawer below it:

```
+-- BPS LIVE PANEL -------------------------------------------+
|  bg-slate-800/60  border border-slate-700/30  rounded-fpl   |
|                                                              |
|  MATCH: ARS 2-1 CHE                                        |
|  +---------+--------+--------+                              |
|  | Player  | BPS    | Bonus  |                              |
|  | Saka    | 42     | 3 pts  |  text-amber-400              |
|  | Saliba  | 38     | 2 pts  |  text-slate-300              |
|  | Rice    | 35     | 1 pt   |  text-amber-700              |
|  +---------+--------+--------+                              |
+-------------------------------------------------------------+
```

### 3.6 Auto-Sub Alert Integration

When an auto-sub triggers during a live match, inject an alert into the ticker:

```
+-- AUTO-SUB ALERT -------------------------------------------+
|  bg-emerald-400/10  border border-emerald-400/30            |
|  px-3 py-1.5  rounded-fpl  animate-card-glow               |
|                                                              |
|  [arrow-up icon]  Watkins (46pts) replaces                  |
|  [arrow-down icon]  Haaland (2pts)                          |
|  "Auto-sub activated"  text-emerald-400                     |
+-------------------------------------------------------------+
```

---

## 4. Fanatics Affiliate Visual Loop

### 4.1 The Image Wrapper Pattern

Every player image in the card grid wraps in an affiliate-aware container:

```tsx
<div className="relative group cursor-pointer">
  {/* Player image */}
  <img
    src={playerImageUrl}
    alt={`${playerName} - ${clubName} - Premier League 2025/26`}
    className="w-full h-full object-cover object-top
               transition-transform duration-300
               group-hover:scale-105"
    loading="lazy"
  />

  {/* Hover overlay with CTA */}
  <div className="absolute inset-0 bg-gradient-to-t
                  from-fpl-dark/90 via-fpl-dark/20 to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  flex items-end justify-center pb-4">
    <a
      href={getFanaticsUrl(teamId, playerName)}
      target="_blank"
      rel="sponsored nofollow"
      className="px-4 py-2 rounded-full
                 bg-fpl-accent text-fpl-dark
                 text-xs font-jakarta font-bold uppercase
                 tracking-wider
                 hover:bg-fpl-accent/90
                 transition-colors
                 shadow-[0_0_16px_rgba(120,255,158,0.3)]"
    >
      Get Official {playerName} Kit
    </a>
  </div>
</div>
```

### 4.2 The Emotional Trigger Layer

Glow activations are event-driven:

| Trigger Event | Visual Effect | Duration |
|---|---|---|
| Player scores 10+ GW pts | `animate-card-glow` on outer border | Persistent during GW |
| Auto-sub IN activates | Emerald glow + "SUB IN" badge | Persistent during GW |
| Captain haul (15+ pts) | Amber-to-accent gradient border pulse | Persistent during GW |
| Triple Captain activation | Double-ring glow border | Persistent during GW |
| Player scores a goal (live) | Brief flash: `animate-ping` on points badge | 3 seconds |

```css
/* Haul glow -- player scores 10+ */
.glow-haul {
  animation: cardGlow 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(120,255,158,0.35);
}

/* Captain haul glow -- captain scores 15+ */
.glow-captain-haul {
  animation: cardGlow 2s ease-in-out infinite;
  box-shadow: 0 0 24px rgba(251,191,36,0.4);
}

/* Auto-sub glow */
.glow-auto-sub {
  animation: cardGlow 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(52,211,153,0.4);
}
```

### 4.3 Affiliate CTA Placement Rules

```
CONTEXT                      CTA FORMAT                              PLACEMENT
---------------------------------------------------------------------------------------------
Player card (grid)           Hover overlay                           Over player image
Player card (expanded)       Fixed button below stats                Below micro-stats row
Stats table row              Icon link (shopping-bag)                End of row
Auto-sub alert               Inline text link                        After sub description
Captain haul banner          "Celebrate with the kit" CTA            Below haul announcement
Blog post player mention     Contextual inline link                  Within paragraph
Squad pitch view             Player tap opens card w/ CTA            Modal/drawer overlay
```

### 4.4 Hygiene Controls -- Affiliate Link Compliance

Every affiliate anchor element MUST include:

```html
<a
  href="{affiliateUrl}"
  target="_blank"
  rel="sponsored nofollow"
  data-affiliate="fanatics"
  data-player="{playerSlug}"
  data-team="{teamSlug}"
>
```

**Enforcement rules:**
1. All `rel` attributes auto-injected at render time via a wrapper component `<AffiliateLink />`
2. No affiliate links in `<nav>`, `<header>`, or `<footer>` elements
3. Affiliate links must never be the sole interactive element on a page
4. All affiliate images must have descriptive `alt` text containing player name, club, and league
5. `data-affiliate` attributes enable click tracking via GA4 custom events

### 4.5 `<AffiliateLink />` Wrapper Component Spec

```tsx
interface AffiliateLinkProps {
  href: string;
  playerName: string;
  teamSlug: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'button' | 'overlay' | 'inline' | 'icon';
}

// Auto-injects: target="_blank" rel="sponsored nofollow"
// Auto-fires: GA4 event "affiliate_click" with player + team params
// Renders: appropriate visual variant
```

---

## 5. Wireframe Component Architecture Matrix

### 5.1 Page Layout Hierarchy

```
<AnalyticsPage>
  ├── <LiveMatchTicker />              sticky top-0 z-50
  │
  ├── <main>                           max-w-7xl mx-auto px-4 py-6
  │   │
  │   ├── <SectionHeader />            "My Squad -- GW38"
  │   │
  │   ├── <PlayerCardGrid />           Sorare-style cards
  │   │   ├── <PlayerCard />           x11 starting + x4 bench
  │   │   └── <PlayerCard />           ...
  │   │
  │   ├── <SectionHeader />            "Detailed Statistics"
  │   │
  │   ├── <StatsDenseTable />          FBref-style stats
  │   │   ├── <SortableHeader />
  │   │   └── <StatsRow />             x15 players
  │   │
  │   ├── <SectionHeader />            "League Standings"
  │   │
  │   ├── <StatsDenseTable />          League table variant
  │   │
  │   ├── <SectionHeader />            "Captain Analysis"
  │   │
  │   └── <CaptainCompareCard />       Side-by-side captain vs. VC
  │
  └── <Footer />
</AnalyticsPage>
```

### 5.2 Complete Component Registry

| # | Component | Type | File Path (target) | Props |
|---|---|---|---|---|
| 1 | `LiveMatchTicker` | Client | `src/components/analytics/live-match-ticker.tsx` | `matches: TickerMatch[], gameweek: number` |
| 2 | `MatchPill` | Client | `src/components/analytics/match-pill.tsx` | `match: TickerMatch` |
| 3 | `BpsLivePanel` | Client | `src/components/analytics/bps-live-panel.tsx` | `matchId: number, bpsData: BpsEntry[]` |
| 4 | `AutoSubAlert` | Client | `src/components/analytics/auto-sub-alert.tsx` | `playerIn: PlayerData, playerOut: PlayerData` |
| 5 | `PlayerCardGrid` | Client | `src/components/analytics/player-card-grid.tsx` | `players: PlayerData[], teamId: number` |
| 6 | `PlayerCard` | Client | `src/components/analytics/player-card.tsx` | `player: PlayerData, teamId: number, isLive: boolean` |
| 7 | `StatsDenseTable` | Client | `src/components/analytics/stats-dense-table.tsx` | `columns: ColumnDef[], data: any[], sortable: boolean` |
| 8 | `SortableHeader` | Client | `src/components/analytics/sortable-header.tsx` | `column: ColumnDef, sortDirection: 'asc' \| 'desc' \| null` |
| 9 | `AffiliateLink` | Client | `src/components/analytics/affiliate-link.tsx` | `href, playerName, teamSlug, variant, children` |
| 10 | `SectionHeader` | Server | `src/components/analytics/section-header.tsx` | `title: string, subtitle?: string, badge?: string` |
| 11 | `CaptainCompareCard` | Client | `src/components/analytics/captain-compare-card.tsx` | `captain: PlayerData, viceCaptain: PlayerData` |
| 12 | `StatusBadge` | Server | `src/components/analytics/status-badge.tsx` | `status: PlayerStatus` |

### 5.3 Flex-Box Distribution Rules

| Component | Layout Method | Breakpoint Behavior |
|---|---|---|
| **Page root** | `flex flex-col min-h-screen` | Constant |
| **Ticker** | `flex items-center gap-3 overflow-x-auto` | Horizontal scroll all sizes |
| **Card grid** | `grid` | `cols-2` -> `cols-3` -> `cols-4` -> `cols-5` at breakpoints |
| **Stat ribbon (card)** | `flex items-baseline justify-between` | Constant |
| **Micro stats (card)** | `grid grid-cols-4 gap-2` | Constant (compact) |
| **Table container** | `overflow-x-auto` | Horizontal scroll < 768px |
| **Table header cell** | `flex items-center gap-1` | `justify-end` for numeric cols |
| **CTA overlay** | `absolute inset-0 flex items-end justify-center` | Constant |
| **Captain compare** | `grid grid-cols-2 gap-4` | `grid-cols-1` < 640px |
| **BPS panel** | `grid grid-cols-3 gap-2` | Constant |
| **Auto-sub alert** | `flex items-center gap-2` | Wraps at < 400px |

### 5.4 Content Hierarchy (Visual Weight)

```
LEVEL 1 -- Page Title
  font-jakarta text-2xl font-extrabold text-white
  mb-1

LEVEL 2 -- Section Header
  font-jakarta text-lg font-bold text-white
  flex items-center gap-2
  (optional: badge with bg-fpl-accent text-fpl-dark px-2 py-0.5 rounded-full text-xs)

LEVEL 3 -- Card Title / Player Name
  font-jakarta font-bold text-lg text-white truncate

LEVEL 4 -- Primary Stat (Points)
  font-jakarta text-2xl font-extrabold text-fpl-accent

LEVEL 5 -- Secondary Stat (xG, xA, BPS)
  font-mono text-sm font-semibold text-white

LEVEL 6 -- Label / Meta
  font-inter text-[10px] uppercase tracking-wider text-fpl-text-secondary

LEVEL 7 -- Table Body
  font-inter text-xs text-white (names)
  font-mono text-xs text-fpl-text-secondary (stats)
```

### 5.5 Spacing System

| Context | Spacing Token | Value |
|---|---|---|
| Page horizontal padding | `px-4 sm:px-6 lg:px-8` | 16 / 24 / 32px |
| Section vertical gap | `space-y-8` | 32px |
| Card grid gap | `gap-2 sm:gap-3 lg:gap-4` | 8 / 12 / 16px |
| Card internal padding | `px-4 py-3` | 16 / 12px |
| Table cell padding | `px-2 py-1.5` | 8 / 6px |
| Ticker element gap | `gap-3` | 12px |
| Ticker padding | `px-4 py-2` | 16 / 8px |

### 5.6 Responsive Breakpoint Matrix

| Breakpoint | Width | Card Cols | Table | Ticker | Layout Notes |
|---|---|---|---|---|---|
| `sm` | 640px | 2 | scroll-x | scroll-x | Stack everything, full-bleed cards |
| `md` | 768px | 3 | full visible | scroll-x | Table gains horizontal space |
| `lg` | 1024px | 4 | full visible | scroll-x | Comfortable data density |
| `xl` | 1280px | 5 | full visible | all visible | Desktop premium experience |

### 5.7 Accessibility & AEO Requirements

| Requirement | Implementation |
|---|---|
| **Screen reader labels** | `aria-label` on all interactive card elements |
| **Table semantics** | `<th scope="col">`, `<caption class="sr-only">` |
| **Sort state** | `aria-sort="ascending\|descending\|none"` on `<th>` |
| **Live region** | `aria-live="polite"` on ticker and auto-sub alerts |
| **Color contrast** | All text meets WCAG AA (4.5:1 minimum) against `bg-slate-950` |
| **Focus indicators** | `focus-visible:ring-2 focus-visible:ring-fpl-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` |
| **Image alt text** | `"{Player} - {Club} - Premier League 2025/26"` |
| **Affiliate disclosure** | `rel="sponsored nofollow"` on all monetized links |
| **JSON-LD** | `SportsEvent` schema on match ticker, `Table` schema on stat tables |
| **Semantic headings** | `h1` page title -> `h2` sections -> `h3` card names |

### 5.8 JSON-LD Schema Templates

**Match Ticker Event:**
```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "Arsenal vs Chelsea - Premier League Gameweek 38",
  "startDate": "2026-05-24T15:00:00Z",
  "homeTeam": { "@type": "SportsTeam", "name": "Arsenal" },
  "awayTeam": { "@type": "SportsTeam", "name": "Chelsea" },
  "location": { "@type": "Place", "name": "Emirates Stadium" }
}
```

**Player Stats Table:**
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "FPL Gameweek 38 Player Statistics",
  "description": "Fantasy Premier League player performance data including points, expected goals, assists, and bonus points",
  "creator": { "@type": "Organization", "name": "FPL Ranker" },
  "variableMeasured": ["Total Points", "Expected Goals", "Expected Assists", "Bonus Points"]
}
```

---

## 6. Implementation Priority Map

| Phase | Components | Dependencies | Reddit Pain Point Addressed |
|---|---|---|---|
| **P0** | `PlayerCard`, `PlayerCardGrid`, `StatusBadge` | Player data types, team crests | "I can't see my squad at a glance" |
| **P0** | `LiveMatchTicker`, `MatchPill` | FPL live endpoint | "No real-time BPS during matches" |
| **P1** | `StatsDenseTable`, `SortableHeader` | Column definitions | "FPL app tables are too sparse" |
| **P1** | `AffiliateLink` | Fanatics URL builder | Revenue generation |
| **P1** | `BpsLivePanel` | BPS live data feed | "Can't track bonus during games" |
| **P2** | `AutoSubAlert` | Live pick comparison | "Auto-subs are invisible until GW ends" |
| **P2** | `CaptainCompareCard` | Captain/VC pick data | "Did I pick the right captain?" |
| **P3** | JSON-LD schemas | All components | AEO optimization |

---

## 7. File Output Manifest

```
docs/design/analytics_wireframe_feed.md     <-- THIS FILE
src/components/analytics/                    <-- Target component directory
  ├── live-match-ticker.tsx
  ├── match-pill.tsx
  ├── bps-live-panel.tsx
  ├── auto-sub-alert.tsx
  ├── player-card-grid.tsx
  ├── player-card.tsx
  ├── stats-dense-table.tsx
  ├── sortable-header.tsx
  ├── affiliate-link.tsx
  ├── section-header.tsx
  ├── captain-compare-card.tsx
  └── status-badge.tsx
```

---

*Generated for FPL Ranker engineering feed. All Tailwind classes reference the existing FPL DLS token system in `tailwind.config.ts`.*

---

## 8. Micro-Interaction Library

All animations use only `transform` and `opacity` (GPU-compositor properties) for 60fps rendering. Respect `prefers-reduced-motion` — show final state immediately when reduced motion is preferred.

### 8.1 CSS Keyframes

```css
/* Shimmer — skeleton loading overlay */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
  animation: shimmer 1.5s infinite;
}

/* Counter — numeric count-up (visual reference, JS-driven) */
@keyframes counterFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Toast — enter/exit */
@keyframes toastEnter {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes toastExit {
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to { opacity: 0; transform: translateX(-50%) translateY(16px); }
}

/* Badge Reveal — spring overshoot */
@keyframes badgeReveal {
  0% { opacity: 0; transform: scale(0); }
  70% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}

/* Card Glow — pulsing border for haul events */
@keyframes cardGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(120,255,158,0.2); }
  50% { box-shadow: 0 0 30px rgba(120,255,158,0.4); }
}
```

### 8.2 JS Patterns

| Pattern | Trigger | Implementation |
|---|---|---|
| Animated Counter | `IntersectionObserver` (threshold 0.3) | `requestAnimationFrame` loop with `ease-out` easing, 800ms duration, 100-200ms stagger between siblings |
| Cursor-Tracking Glow | `mousemove` on `glass-card` | Set CSS custom properties `--mouse-x` / `--mouse-y`, render `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(120,255,158,0.06), transparent 40%)` via `::before` pseudo. Desktop only (min-width 1024px) |
| Skeleton Loader | Component mount before data fetch | Match exact layout dimensions of loaded content. Show shimmer animation on `::after` pseudo-element |
| Toast Queue | User action (share, save, error) | Singleton pattern — max 1 visible. Queue subsequent toasts. Auto-dismiss: 2.5s (confirm), 5s (action), never (error) |
| Badge Reveal | Tool completion or milestone hit | `badgeReveal` keyframe with `cubic-bezier(0.34, 1.56, 0.64, 1)`, 400ms. Follow with 1s `shadow-fpl-glow` pulse |

### 8.3 Reduced Motion Overrides

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer::after { animation: none; }
  [data-animate="counter"] { transition: none; }
  [data-animate="badge"] { animation: none; opacity: 1; transform: scale(1); }
  [data-animate="toast"] { animation: none; opacity: 1; }
  [data-animate="glow"] { animation: none; }
  .hover\:-translate-y-1:hover { transform: none; }
}
```

---

## 9. Gamification Component Registry

Extended component registry including all micro-interaction and gamification primitives.

| Component | Type | Tailwind Classes | Props/Slots | Animation |
|---|---|---|---|---|
| `AnimatedCounter` | Client | `font-jakarta text-4xl font-extrabold text-fpl-accent` | `value`, `duration?` (800ms), `prefix?`, `suffix?` | Count 0→value, ease-out, IntersectionObserver trigger |
| `SkeletonLoader` | Client | `bg-slate-800 rounded-fpl relative overflow-hidden` | `width`, `height`, `variant` (text\|card\|image) | Shimmer translateX 1.5s infinite |
| `Toast` | Client | `glass-card-dark px-4 py-3 fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60]` | `message`, `type` (success\|error\|info), `duration?` | Slide-up 200ms enter, 150ms exit |
| `ProgressBar` | Client | `h-2 w-full rounded-full bg-slate-800` (container), `bg-gradient-to-r from-fpl-accent to-fpl-lime-600 rounded-full` (fill) | `value` (0-100), `label?` | Width 0%→target, 700ms ease-out |
| `FaqAccordion` | Client | `glass-card-dark divide-y divide-slate-700/30 rounded-fpl` | `items[]` ({question, answer}), `schema?` (FAQPage JSON-LD) | Max-height 0→auto, 300ms, chevron rotate-180 |
| `ShareCard` | Client | `w-[520px] h-[300px] bg-gradient-to-br from-[#1A0E35] to-[#2B1654] rounded-fpl relative` | `title`, `stats[]`, `watermark` | Static — export via html2canvas |
| `MobileTabBar` | Client | `fixed bottom-0 left-0 right-0 z-50 bg-fpl-dark/95 backdrop-blur-fpl border-t border-fpl-primary/20 lg:hidden` | `items[]` ({icon, label, href}), `activeIndex` | None — static navigation |
| `PodiumLeaderboard` | Client | `grid grid-cols-3 gap-4` (top-3), rank-1: `scale-105 bg-amber-400/10 border-amber-400/30` | `entries[]` ({rank, name, value, avatar?}) | Counter stagger on values |
| `StreakCounter` | Client | `flex items-center gap-2` + flame icon `text-fpl-accent animate-pulse-slow` | `count`, `isActive`, `calendarDays?[]` | Flame pulse when active |
| `BadgeReveal` | Client | `w-16 h-16 glass-card rounded-full` + tier border color | `tier` (bronze\|silver\|gold\|platinum), `icon`, `label` | Scale 0→1.15→1.0 spring, 400ms |

### Badge Tier Color Map

| Tier | Border | Background | Glow |
|---|---|---|---|
| Bronze | `border-orange-700/40` | `bg-orange-700/15` | `shadow-[0_0_12px_rgba(194,120,3,0.2)]` |
| Silver | `border-slate-300/40` | `bg-slate-300/15` | `shadow-[0_0_12px_rgba(203,213,225,0.2)]` |
| Gold | `border-amber-400/40` | `bg-amber-400/15` | `shadow-[0_0_12px_rgba(251,191,36,0.2)]` |
| Platinum | `border-fpl-accent/40` | `bg-fpl-accent/15` | `shadow-fpl-glow` |

---

## 10. Accessibility & Reduced Motion

### 10.1 WCAG AA Contrast Ratios on `bg-fpl-dark` (#0C0C0C)

| Color | Hex | Ratio | Usage |
|---|---|---|---|
| White | `#FFFFFF` | 19.4:1 | Primary text, headings |
| `fpl-text-secondary` | `#9BA1B0` | 6.8:1 | Labels, secondary text (large text only at this ratio) |
| `fpl-accent` | `#78FF9E` | 12.6:1 | Interactive elements, success states, CTAs |
| `fpl-violet-400` | `#A78BFA` | 7.2:1 | Accent highlights, links |
| Amber warning | `#FBBF24` | 11.1:1 | Warning states |
| Rose error | `#FDA4AF` | 10.8:1 | Error text (use light rose, not #F43F5E at 4.6:1) |

### 10.2 Semantic HTML Requirements

- Single `<h1>` per page matching primary search query
- `<table>` for tabular data (never div grids for data)
- `<thead>` / `<tbody>` separation with `sticky top-0` headers
- `aria-live="polite"` on real-time regions (ticker, alerts, toast)
- `aria-sort="ascending|descending|none"` on sortable table headers
- `role="status"` on toast notifications
- `aria-expanded` on accordion headers
- Never use color alone — always pair with icon, label, or pattern

### 10.3 Focus Management

```
All interactive elements:
  focus-visible:ring-2
  focus-visible:ring-fpl-accent
  focus-visible:ring-offset-2
  focus-visible:ring-offset-fpl-dark
```

### 10.4 Motion Preferences

All keyframe animations and transitions must provide `@media (prefers-reduced-motion: reduce)` overrides that either:
1. Disable the animation entirely (`animation: none`)
2. Show the final state immediately (`transition-duration: 0.01ms`)

See Section 8.3 for the full CSS override block.

---

## 11. Mobile-First Responsive Patterns

### 11.1 Mobile Tab Bar Specification

```
Container:
  fixed bottom-0 left-0 right-0 z-50
  bg-fpl-dark/95 backdrop-blur-fpl
  border-t border-fpl-primary/20
  pb-[env(safe-area-inset-bottom)]
  lg:hidden

Items (4 max):
  flex-1 flex flex-col items-center justify-center
  min-h-[48px] gap-1

  Icon: w-6 h-6
  Label: text-[10px] font-medium

  Active: text-fpl-accent
  Inactive: text-fpl-text-secondary

Default items: Dashboard | Tools | Kits | More
```

### 11.2 Grid Cascade

| Breakpoint | Card Grid | Stat Grid | Table Behavior |
|---|---|---|---|
| Mobile (<640px) | `grid-cols-2` | `grid-cols-2` | Horizontal scroll with `overflow-x-auto scrollbar-hide` |
| Tablet (768px) | `grid-cols-3` | `grid-cols-3` | Show 5-6 columns |
| Desktop (1024px) | `grid-cols-4` | `grid-cols-4` | Full columns visible |
| Wide (1280px) | `grid-cols-5` | `grid-cols-6` | `max-w-5xl` centered |

### 11.3 Sticky CTA Pattern (Mobile)

For affiliate-heavy pages (kits, player detail), show a persistent bottom CTA:

```
Container:
  fixed bottom-[calc(env(safe-area-inset-bottom)+60px)]
  left-0 right-0 z-40
  bg-fpl-dark/95 backdrop-blur-fpl
  border-t border-fpl-primary/20
  px-4 py-3

Button:
  w-full bg-fpl-accent text-fpl-dark
  font-jakarta font-bold rounded-full
  py-3 text-center
  shadow-fpl-glow
```

Position above tab bar (60px offset). Hidden on desktop (lg+).

### 11.4 Touch Target Rules

- Minimum 48x48px for all interactive elements
- Filter chips: `min-h-[44px] px-4`
- Table rows: `min-h-[52px]` with comfortable padding
- Close/dismiss buttons: `w-10 h-10` minimum

---

*Updated for FPL Ranker v1.1 — Micro-interactions, gamification, accessibility, and mobile-first patterns added.*
