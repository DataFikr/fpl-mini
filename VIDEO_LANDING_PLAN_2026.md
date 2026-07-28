# FPLRanker Landing Page Video & Onboarding Plan
_Status: updated Jul 27, 2026 — landing rebuilt from mockup `01-landing.html` (§2); teaser video wired into the hero. Player/manager photo elements removed after legal review (Jul 25)._

> **Implementation note (Jul 27, 2026):** The layout shipped as the full `01-landing.html` marketing page (§2), which supersedes the earlier "PromoVideoSection inserted below the CTA" approach described in §5 Phase 1 — the video now lives in the hero's right column rather than a separate section. The click-to-play *modal* was simplified to an in-hero ambient loop that expands to fullscreen-with-sound on click. Phases 2–4 (Figma asset production, analytics funnel, iteration) still stand.

## Context

The Jul 2026 relaunch (GW1 deadline Aug 15) needs the landing page to convert outreach traffic with near-zero friction. Today `src/app/app/_components/Landing.tsx` shows a static hero + Team-ID form but never *shows the product moving* — the ESPN-style headlines, rank progression drama, and transfer planner are invisible until after onboarding. This plan adds a click-to-play teaser video (<60s, pure app UI screen recording with animated stat overlays + captions), a click-bait thumbnail, a value-props strip, and phases the work for handoff to a coding agent (Opus).

**Legal note (Jul 25, 2026):** All EPL manager photos (`public/redesign/news/`, `public/images/headlines/`) and player photos (`public/images/blog/players/`) have been removed from the codebase after a copyright/trademark review. The video plan has been updated accordingly — no player or manager photos of any kind in the video or thumbnail. The app screen recording must also avoid dwelling on the squad-view FPL CDN headshots (the rank charts, text headlines, and transfer planner UI are all safe to show).

**Decisions:** Pure app UI recording (no player/manager photo cutaways). Click-to-play only (static thumbnail + play button → modal with sound). No autoplay. Video/thumbnail production runs as a Claude Design session on the Opus 5 model (Figma MCP), with code implementation handed off to an Opus coding agent.

---

## 1. Reference Research (what the best do)

- **Sleeper** (fantasy) — product-in-motion phone mockups directly under the hero CTA; drama/banter framing ("trash talk your league") not stats framing. Closest spiritual match for FPLRanker's mini-league angle.
- **DraftKings / FanDuel** — bold single CTA above the fold, video/social proof *below* it, never competing with signup. Dark bg + one accent color.
- **Underdog Fantasy** — short looping product clips inside device frames with oversized display-font captions.
- Best-practice findings: video on landing pages lifts conversion up to ~86%; 30–90s beats longer; video must never push the primary CTA below the fold; always ship a static poster fallback ([Apexure](https://www.apexure.com/blog/video-landing-page-examples), [Unbounce](https://unbounce.com/landing-pages/autoplay-landing-page-best-practices/), [Vidyard](https://www.vidyard.com/blog/video-landing-pages/), [LogRocket](https://blog.logrocket.com/ux-design/hero-section-examples-best-practices/), [99designs sports gallery](https://99designs.com/inspiration/websites/sports), [Dribbble betting landing pages](https://dribbble.com/tags/betting-landing-page), plus Mobbin's sports category: mobbin.com/explore/mobile/app-categories/sports).

**Design rule adopted:** Team-ID form stays the #1 above-the-fold CTA; the video section sits immediately below it as the "proof" layer.

---

## 2. Landing Page Layout (implemented — mockup `design/mockups-2026/01-landing.html`)

**Shipped Jul 27, 2026.** The landing was rebuilt from the `01-landing.html` mockup: a full-bleed marketing page (sticky header + nav, a 2-col hero with the teaser video on the right, a 4-card features grid, a premium band, and a footer) — replacing the phone-framed `v2` hero. The video lives **in the hero's right column** (not a separate section below the fold), so the Team-ID form stays the #1 above-the-fold CTA on the left.

```
┌───────────────────────────────────────────────────────────┐
│ ⬡ FPL RANKER   Predictions Premium Blog Find-ID  [Sign in][CTA] │  ← sticky header
├───────────────────────────────────────────────────────────┤
│  ● Gameweek N · Live                                       │
│  TRACK YOUR MINI-LEAGUE                 ┌──────────────────┐│
│  LIKE IT'S MATCHDAY                     │  TEASER VIDEO ▶  ││  ← hero-art
│  ESPN-style headlines, live rank…       │  (ambient loop,  ││    (right col)
│  [ Team ID __________ ] [RANK MY LEAGUE]│   click = sound  ││
│  Find your team ID → · try demo         │   + fullscreen)  ││
│  ● Live FPL data ● AI predictions ● Free│  ⬡ Watch 45s     ││
│                                         └──────────────────┘│  ← form = #1 CTA, left
├───────────────────────────────────────────────────────────┤
│ WHAT YOU GET · Built for the group chat argument           │  ← features (4 cards)
│ [League HQ] [Rank movers] [AI predictions] [Transfer impact]│
├───────────────────────────────────────────────────────────┤
│ FPL RANKER PREMIUM   (Free-until-GW5 band during the hold) │  ← premium band (ink)
├───────────────────────────────────────────────────────────┤
│ ⬡ FPL RANKER   Predictions Premium Blog About Contact …    │  ← footer
└───────────────────────────────────────────────────────────┘
```

- **Hero video:** `public/video/FPL Teaser Video.mp4` rendered as an ambient, muted, looping `<video>` in `.hero-art`; clicking (or Enter/Space) restarts it **with sound and goes fullscreen** — the click-to-play intent, without a black poster frame. No player/manager photos (photo-free per the legal note).
- **Premium band:** during the launch hold it shows the **Free-until-GW5** copy (driven by `isFreeLaunchWindow()` from `src/lib/premium.ts`); the £15 launch-price copy is retained behind the same conditional for when monetization resumes after GW5. See LAUNCH_PLAN_2026.md §8.
- **Scoping:** all mockup CSS is namespaced under `.lp` in `src/app/app/_styles/landing.css`, reusing the app's Sportify tokens + global `.s-btn/.hex/.logo`. A `:has(> .lp)` rule breaks the landing out of the `.fpl-app` 480px phone frame so it renders full-bleed and responsive (2-col ≥900px, stacked below).
- **Responsive:** 2-col hero + 4-col features on desktop; hero stacks and features go 2-then-1 col on narrow widths; primary nav collapses under 900px.

## 3. Click-Bait Thumbnail

Composite image (Figma via Claude Design, exported WebP ≤ 120KB, 1280×720) — **no real player or manager photos**:
- **Background:** dark red-to-black gradient with a diagonal FPLRanker brand stripe.
- **Left:** large animated stat graphic — oversized Bebas Neue "↓4" in red, with a mini rank-chart line plunging.
- **Right:** blurred mock-up of the ESPN-style headline card (pure text, no photos): white card, red FALLER tag, headline copy.
- **Text overlay (Bebas Neue, white + red):** "YOUR LEAGUE HAS A VILLAIN. FIND OUT WHO. 😱"
- Red hex-clipped ▶ button center, "0:45" duration chip bottom-right.
- Alt variant for A/B: "YOUR MINI-LEAGUE HAS A STORY. WATCH YOURS." over a rank-progression chart screenshot.

## 4. Video Content — 45s Shot List & Script

**No real player or manager photos in any shot.** All visuals are the app UI, stat cards, and Figma-designed graphic overlays.

| t | Visual | Caption (burned-in, Bebas) |
|---|--------|---------------------------|
| 0–4s | Animated stat graphic: rank chart plunging ↓4, red arrow, dark bg | "EVERY GAMEWEEK HAS A VILLAIN." |
| 4–10s | App: league table → rank progression chart animating (zoom punch) | "WATCH YOUR RANK RISE. OR FALL. LIVE." |
| 10–20s | App: ESPN-style text headline cards flipping (your generated copy, no photos) | "YOUR MINI-LEAGUE, COVERED LIKE ESPN." |
| 20–28s | App: squad view panning across points numbers + captain badge (avoid lingering on player headshots — keep motion fast, focus on the score numbers) | "SEE WHO WON YOU THE WEEK." |
| 28–38s | App: transfer planner — swap player entry, predicted points delta number animating | "PLAN TRANSFERS BEFORE YOUR RIVALS DO." |
| 38–45s | Share infographic card (text/stats only) → logo + URL + Team-ID form | "ENTER YOUR TEAM ID. FREE. 10 SECONDS. FPLRANKER.COM" |

**Voiceover script (optional, ~85 words):**
> "Every gameweek, someone in your mini-league becomes a legend — and someone becomes a punchline. FPLRanker turns your league into a story: live rank progression, ESPN-style headlines about YOUR rivals, and a transfer planner that tells you who to buy before they do. No signup. No password. Just your Team ID — and ten seconds. FPLRanker dot com. Your league will never be boring again."

**Audio:** high-energy stadium-drum / grime-adjacent build (e.g. "Sport Rock Trailer" / "Epic Stadium Anthem" class tracks from Uppbeat/Pixabay — free, no copyright strikes), crowd-roar sting at 0s and 38s, whistle at the final CTA. Captions carry the story so a muted GIF export also works for social outreach.

## 5. Execution Phases

**Phase 1 — Code scaffold (Opus coding agent, no video needed, ~1 session)**
- New `src/app/app/_components/PromoVideoSection.tsx`: thumbnail card (next/image, lazy), hex play button, modal player (`<video controls playsInline>` MP4+WebM sources, poster), CTA button inside modal that focuses the Team-ID input / routes to `/app/squad?teamId=`.
- New `.promo-*` styles appended to `redesign.css` reusing `.share-backdrop`/`.sheetUp`; value-prop chips row (3 items: Rank progression · ESPN-style highlights · Transfer planner).
- Wire into `Landing.tsx` between `.v2-overlay` and `.v2-sub`; desktop 2-col at ≥1024px.
- Placeholder assets in `public/video/` so the section ships behind real footage.
- Analytics events in `src/lib/analytics.ts`: `promo_video_open`, `promo_video_complete`, `promo_video_cta_click`.

**Phase 2 — Asset production via Claude Design (Opus 5 model, parallel, ~2 sessions)**
Run as a Claude Code design session on the **Opus 5 model** (`claude-opus-5`) using the Figma MCP server + `fpl-analytics-design` skill:
- **Thumbnail:** Opus 5 designs the click-bait thumbnail (§3, main + A/B variant) in Figma via `create_new_file`/`use_figma` — composites the manager-reaction cutaway, blurred rank chart, ↓4 arrow, Bebas Neue headline, hex ▶ button — then exports as `thumb.webp` (1280×720, ≤120KB) with `download_assets`.
- **Storyboard frames:** Opus 5 builds the 6 caption/cutaway frames from the shot list (§4) as Figma frames using Sportify tokens, with `upload_assets` for player/manager photos (same official PL image sourcing as the newsletter system).
- **Video assembly:** Opus 5 animates the storyboard (Figma prototype transitions / smart-animate) and exports via `export_video`; founder supplies only the raw app screen recordings (rank chart, headlines, transfer planner clips on a demo team ID) which Opus 5 sequences with the caption frames. Final pass in CapCut only if Figma export needs the audio track (music + crowd stings per §4) muxed in.
- **Deliverables into `public/video/`:** `teaser.mp4` (≤4MB), `teaser.webm`, `thumb.webp`, 10s `teaser-loop.mp4` for outreach.

**Phase 3 — Integration & polish (~0.5 session)**
- Swap placeholders, verify poster loads <2s on 3G throttle, `preload="none"`, VideoObject JSON-LD on the landing route (feeds AEO), OG image = thumbnail for link shares in outreach.

**Phase 4 — Measure & iterate (post-launch)**
- GA4 funnel: thumbnail impressions → opens → completes → Team-ID submits; swap thumbnail variant if open-rate <8%; reuse the 10s GIF cut in outreach emails/DMs pointing at the landing page.

## Verification

- `npm run dev` → `/app`: thumbnail renders below CTA, modal opens/plays with sound, ✕ closes, modal CTA lands on Team-ID entry; check 480px and 1280px widths.
- Lighthouse on `/app`: no LCP regression (poster lazy-loaded, video `preload="none"`).
- GA4 debug view shows the three new events firing.

**Key files:** `src/app/app/_components/Landing.tsx`, new `src/app/app/_components/PromoVideoSection.tsx`, `src/app/app/_styles/redesign.css`, `src/lib/analytics.ts`, `public/video/*`.
