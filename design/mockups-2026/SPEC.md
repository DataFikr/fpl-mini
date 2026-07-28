# Session 0 — Claude Design Spec (FPL Ranker × Sportify, 2026 relaunch)

Deliverable pack: `design/mockups-2026/` — 10 self-contained HTML mockups + this spec.
Each mockup inlines the full token set, so any file can be opened (or handed to a dev) standalone.
Open `index.html` for the review hub.

---

## 1. Tokens → Tailwind mapping

Source of truth: `src/app/app/_styles/sportify-fpl.css`. Add to `tailwind.config` `theme.extend`:

| Token (CSS var) | Value | Tailwind key |
|---|---|---|
| `--red` | `#FF5050` | `colors.brand.DEFAULT` |
| `--red-dark` | `#CC4040` | `colors.brand.dark` |
| `--ink` | `#150000` | `colors.ink.DEFAULT` |
| `--ink-2` | `#2F0000` | `colors.ink.2` |
| `--charcoal` | `#322D2D` | `colors.charcoal` |
| `--navy` | `#12233F` | `colors.navy.DEFAULT` (focus rings) |
| `--navy-deep` | `#001B58` | `colors.navy.deep` |
| `--bg` | `#FAFAFA` | `colors.paper` |
| `--line` | `#D6D5D5` | `colors.line.DEFAULT` |
| `--line-2` | `#EEEDED` | `colors.line.soft` |
| `--t2` / `--t3` / `--t4` | `#5B5757` / `#848181` / `#ADABAB` | `colors.text.2/3/4` |
| `--green` | `#009C54` | `colors.pos` |
| `--yellow` | `#FFD100` | `colors.premium` |
| `--shadow` | `0 12px 34px -14px rgba(21,0,0,.28)` | `boxShadow.card` |

Fonts: `fontFamily.display` → `'Bebas Neue', Impact, sans-serif` · `fontFamily.body` → `'Manrope', system-ui, sans-serif` · `fontFamily.mono` → `'JetBrains Mono', monospace`.

Signature clip-paths (keep as utility classes, they don't map to Tailwind):
- `.hex` — hexagonal button: `polygon(8px 0, calc(100%-8px) 0, 100% 50%, calc(100%-8px) 100%, 8px 100%, 0 50%)`
- `.notch` — corner-cut card: `polygon(14px 0, 100% 0, 100% calc(100%-14px), calc(100%-14px) 100%, 0 100%, 0 14px)`
- Badge notch (AccountChip, icons): 6–9px version of `.notch`

## 2. Type scale

| Role | Font | Size | Notes |
|---|---|---|---|
| Hero display | Bebas | clamp(38–96px) | line-height .78–.92, red `em` accent |
| Section H2 | Bebas | 28–44px | uppercase inherent |
| Card H3 / panel headers | Bebas | 20–28px | letter-spacing .02–.03em |
| Oversized numerics | Bebas | 56 / 64 / 96px | `font-variant-numeric: tabular-nums` |
| Body | Manrope 500–600 | 13.5–17px | line-height 1.5–1.65 |
| UI labels / meta | JetBrains Mono 600 | **12px minimum** | uppercase, tracking .04–.08em |
| Buttons | Bebas | 14–16px | min-height 44px |

**D2 floor: nothing below 12px anywhere.** (Shipped CSS had 10–11px metas — raise them.)

## 3. Component inventory (per mockup)

| # | File | Route | Components |
|---|---|---|---|
| 01 | `01-landing.html` | `/` | Sticky light header, hero + manager-ID form (`.id-field` notch input), live kicker, **hero video-placeholder on ink panel** (`hero-video-placeholder.svg` — see §7; replaces the copyrighted player image), 4-up feature grid, single ink premium band, ink footer |
| 02 | `02-premium.html` | `/premium` | Launch-offer banner (`--yellow` tag + countdown), Season Pass £15 (was £20) vs Annual £30 plan cards, feature list, Lemon Squeezy note. States: signed-out CTA, already-premium card |
| 03 | `03-predictions.html` | `/predictions` | xPts table (top-10 free, rank-1 highlight row), blur+lock overlay for rows 11+, FAQ accordion, pre-season empty state |
| 04 | `04-login.html` | `/auth/login` | Magic-link card ×4 states: default, `?error=invalid` banner, sent (ink success panel), sending (disabled) |
| 05 | `05-account-chip.html` | `AppShell` | AccountChip: signed-out ghost button, ink initial badge (notch), premium yellow frame + star; open menu free/premium; mobile app-head placement. Replaces hardcoded `#2B1654`/`#888` |
| 06 | `06-captain-picks.html` | `/app/squad` Prediction tab | Captain hero card (rank/xPts/confidence bar/armband call), ranked rows 2–5, vice note. Free = blurred + gate card |
| 07 | `07-transfer-suggestions.html` | `/app/squad` Prediction tab | Bank/FT strip, move cards (out→in, 3-factor grid, why-copy, tags). Free = blurred + gate card |
| 08 | `08-player-page.html` | `/players/[slug]` | pSEO template: ink hero (price/ownership/fixture chips, xPts), 4-stat grid, form bars, FDR fixture list, captain-teaser band, FAQ, Kitbag affiliate CTA (`rel="sponsored"`) |
| 09 | `09-skeletons.html` | loading states | `.sk` shimmer reused from `redesign.css`: standings, squad pitch (kit clip-path slots), predictions list. Zero-CLS: skeleton grids = loaded grids |
| 10 | `10-numerics-tablet.html` | app shell | GW summary hero (96px), rank cards (▲ green / ▼ red), tablet ≥768px two-pane League HQ with top-nav |

## 4. Shared patterns

- **Gate/upsell pattern** (03, 06, 07): blur(6–7px) the real layout + gradient scrim + ink gate card with red hex CTA + mono fine-print "From £15 · one-off · full season". Always show real (teasing) numbers in overlay copy.
- **Ink panels**: exactly one dark band per marketing page; app cards use ink only for hero/summary cards.
- **Red slab**: decorative `--red` polygon at .14–.16 opacity, top-right of ink panels only.
- **Buttons**: `.s-btn` Bebas uppercase, variants red/navy/ghost; hex clip for primary CTAs.
- **Pricing strings** (from `lib/billing.ts`): Season Pass **£15** launch → **£20** after 1 Sep; Annual **£30**/yr. Countdown = days until `LAUNCH_OFFER_ENDS`.

## 5. D2 accessibility fixes (baked into every mockup)

1. Text floor 12px (was 10–11px in shipped mono metas).
2. `:focus-visible` — 3px `--navy` ring, white on ink (`.on-ink`).
3. 44px min touch targets on all buttons/inputs/menu items.
4. `prefers-reduced-motion: reduce` kills pulse/shimmer (`.sk` → flat `#ececec`).
5. Semantic states: `role="alert"` on errors, `role="status"` on confirmations, `aria-expanded` on accordions/menus, `aria-current="page"` on tabs.

## 6. Do-not-change list

- Token hex values in `sportify-fpl.css` — mockups consume them verbatim.
- `.sk` keyframe/gradient in `redesign.css` (only ADD the reduced-motion override).
- Existing squad tabs order (Pitch · Prediction · Planner · Analytics).
- Route structure (`/`, `/premium`, `/predictions`, `/auth/login`, `/players/[slug]`, `/app/*`).
- Lemon Squeezy checkout flow + copy ("merchant of record — VAT handled").
- Magic-link auth flow (15-min expiry copy is contractual with backend workstream A).

## 7. Assets

- **`assets/hero-video-placeholder.svg`** — 1324×800 branded poster (ink + red rays motif, play button, wordmark). **Replaces the previous `hero-rays-players.webp`/`.png`, which was dropped for copyright/trademark reasons (real EPL player likenesses).** No player or manager imagery is used anywhere in the funnel.
  - **Implementation (I2):** the `.hero-video` block becomes a click-to-play `<video>` once the 45s teaser is recorded — this SVG is its `poster`, the recording is the source. Until then it renders as a static branded panel with a play affordance. See `VIDEO_LANDING_PLAN_2026.md` for the shot list (app-UI-only, no player photos).
  - Load with `fetchpriority="high"`, explicit width/height (zero-CLS).
- Google Fonts: Bebas Neue 400 · Manrope 400–800 · JetBrains Mono 600–700 (self-host at build time).
- **Demo data:** the video is recorded against the 2025/26 season snapshot (see the repo `.env` flag `FPL_DEMO_SEASON`), because the live FPL API has rolled past 2025/26 and 2026/27 GW1 has not started — there is otherwise no populated season to showcase.
