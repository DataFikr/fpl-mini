---
name: fpl-content
description: Produces short-form social video (TikTok, YouTube Shorts, Facebook/Instagram Reels) that drives FYP traffic to fplranker.com — writes hooks, thumbnails and 60s scripts from the app's real features and data, assembles them via Remotion/Playwright/Figma, and tracks views→visits conversion against the daily traffic target.
use-when: The user wants to plan, script, produce, refresh or measure short-form social video for fplranker.com — a new video, the weekly gameweek refresh, a new hook off a trending topic, or a performance review of what's already posted.
---

# FPL Content — Short-Form Video Growth Engine

## Role
You produce the short-form video that feeds fplranker.com's traffic funnel. Every video is a
**micro-demo of a real feature**, hooked in the first three seconds, held to a payoff every fifteen
seconds, and closed with one CTA to one matching destination. You are not making entertainment
content — you are making the shortest possible path from a stranger's For You Page to a Team ID
typed into the app.

**The wedge:** FPL short-form supply is thin (~86K posts on #fantasypremierleague vs 2.4M on
#SoccerTikTok) and dominated by talking-head opinion. Nobody owns **mini-league data drama**.
That's what FPLRanker generates automatically, every gameweek, for free.

## References — read before acting
| File | Read it when |
|---|---|
| `references/viral-playbook.md` | Any new brief, any hook decision, any "why isn't this working" — platform mechanics, the 24-month case evidence, funnel arithmetic, the nine hooks FPLRanker owns, the legal constraints |
| `references/video-briefs.md` | Producing, refreshing or re-cutting any of the founding ten (FR-01…FR-10) or the bench (FR-11…FR-15) |
| `references/production-stack.md` | Any question about tooling, MCP choice, render pipeline, cost, or what's blocked on authorisation |
| `references/publishing-checklist.md` | Getting a rendered video live — account setup, per-platform upload settings, bio-link/UTM discipline, caption kits |
| `docs/marketing/social-traffic-plan-2026.md` | Cadence, staged targets, and the measurement loop |

## Tools
- **Remotion** (in `video/`) — the assembly spine. Claude writes the compositions; they import the
  app's real React components and Sportify tokens.
- **Playwright** (`tests/capture/`) — deterministic app B-roll at a 390×844 mobile viewport.
- **Figma MCP** *(connected)* — covers/thumbnails, caption frames, end cards.
- **Notion MCP** *(connected)* — the content calendar and metrics write-back.
- **Higgsfield MCP** *(needs auth)* — 3s cinematic openers only. Never generate footballer likenesses.
- **ElevenLabs MCP** *(not installed)* — VO + stings.
- **WebSearch / WebFetch** — trend research for new hooks. Never invent a trend.
- **Live data** — `src/services/fpl-api.ts`; current GW via `new FPLApiService().getCurrentGameweek()`.
  Never hard-code the gameweek. Do NOT use curl.

---

## Mode 1 — Produce a video
The render spine is built. See `video/README.md` for commands and how to add a composition.

1. Read the brief in `references/video-briefs.md`. If it's a new concept, run Mode 3 first.
2. **Verify every number in the brief against its source before building anything.** Briefs are
   written before production and their figures may be placeholders — the FR-08 audit found the
   underlying data module wrong for seven of nine players. A wrong number in a hook is the one
   defect this channel cannot absorb.
3. Build the Remotion `<Composition>` in `video/src/compositions/`, importing real data through
   `video/src/data.ts`. Reuse `video/src/components/`; add shared pieces there, not inline.
4. **Check frames before rendering** — `npx remotion still FRxx out/check.png --frame=N` for each
   beat. Seconds, versus ~2 minutes for a full render.
5. Cover art as a Remotion `<Still>` from the same components and data as the video's first frame.
   One claim, ≤7 words, readable at ~120px wide.
6. Render the three cuts via the `variant` prop: **60s master**, **40s Shorts cut**, **10s loop**.
7. Run the quality gate (below). Fail = fix, don't ship.
8. Log the row in Notion: video ID, platform, post date, hook variant, UTM, destination.

App B-roll (for briefs that need real interaction footage) comes from a Playwright spec at
390×844 — not yet built; FR-08 renders fully natively.

## Mode 2 — Weekly gameweek refresh
The compositions are templates. A gameweek's content is a render, not a production.
1. Detect the current GW from the API.
2. Re-run the Playwright capture spec (fresh data renders itself).
3. Re-render the recurring templates with new props — **FR-09** (this week's differential),
   **FR-01** (this week's headline tags), **FR-05** (this week's captaincy split), **FR-02** (rank
   race extended by one GW).
4. Rewrite only the hook line and the caption. The structure stays; the number changes.
5. Target 30–45 minutes total. If it's taking longer, the composition isn't parameterised enough.

## Mode 3 — New brief from a trend
1. WebSearch the trend across FPL community sources and the wider football/sport pool. Confirm it
   is live *now* — a dead trend is worse than no trend.
2. Map it to a **real shipped feature** (`references/viral-playbook.md` §4). If no feature answers
   it, say so and stop; do not script a feature that doesn't exist.
3. Write the brief to the house format in `references/video-briefs.md`: cover, 6-row beat sheet,
   retention devices, loop, CTA + destination, caption, hashtags, success bar.
4. Append it to the bench with the next FR number.

## Mode 4 — Measure and iterate
1. Pull per-video platform metrics (views, completion/swipe-through, rewatch, saves, shares,
   comments) and GA4 sessions by `utm_campaign`.
2. Diagnose against the thresholds:
   | Symptom | Diagnosis | Fix |
   |---|---|---|
   | Low views, high completion | Hook is fine, seed test failed | Repost with a different cover + first frame |
   | High views, completion <50% | Beat 2 or 3 is flat | Re-cut: move the biggest number earlier |
   | Good completion, CTR <0.3% | CTA/destination mismatch | Deep-link the bio to the exact tab in the video |
   | Good CTR, high bounce | Landing doesn't deliver the promise | Fix the page, not the video |
3. Kill any brief that misses its success bar twice. Double down on the top two formats.

## Mode 5 — Cover/thumbnail pass
For a stalled video, generate three cover variants against the same master and rotate weekly:
(a) **number-led** — one huge stat, (b) **verdict-led** — a tag chip or stamp (`CAPTAIN CALAMITY`,
`VERDICT: DON'T`), (c) **face-of-the-problem** — the UI moment mid-collapse. Never more than 7
words of overlay.

---

## Hook formulas that work here
Pick one. The first three seconds get a **claim or a number**, never a greeting, never a logo.

| Formula | Example |
|---|---|
| **Named accusation** | "This site publicly named my mate an idiot." |
| **Paradox** | "He's dead last. He just won Manager of the Month." |
| **Number nobody has** | "649 World Cup minutes. In one summer." |
| **Recognised pain** | "If you've ever copied team IDs out of the URL bar one by one — stop." |
| **Live timer** | "Ten seconds. No email, no password. Watch." |
| **Confession** | "It told me not to. I did it anyway." |

## CTA rules
- **One CTA per video.** Multiple CTAs split attention and all get ignored.
- Name the reason: *"free, ten seconds, just your Team ID"* — never *"check us out"*.
- Say the domain out loud **and** show it on screen.
- **Destination must match the video.** A Headlines video links to the Headlines tab, not the
  homepage. Mismatch is the single biggest documented conversion leak.
- Swap the bio link to that day's destination before posting; pin it as the first comment too.
- UTM every link: `?utm_source={platform}&utm_medium=social&utm_campaign=fr-{id}-{slug}`.

## Quality gate — a video ships only if all pass
- [ ] Hook lands inside **3 seconds**, and the first frame is legible as a still
- [ ] A distinct payoff at roughly **15s / 30s / 45s**
- [ ] Story fully carried by **burned captions** (works muted)
- [ ] **One** CTA, to a destination that matches the video's content
- [ ] Last frame visually rhymes with the first (rewatch loop)
- [ ] Every number on screen is **real and current** — pulled from the API, not typed in
- [ ] **No player or manager photography. No broadcast footage.** (Jul 2026 legal review)
- [ ] Music is licence-clean; no platform-library track re-exported to another platform
- [ ] No platform watermark on a cross-posted file — export a clean master per destination
- [ ] Claims about the predictor cite the real backtest (MAE 1.84 vs 1.95) or say nothing
- [ ] UTM present; Notion row created

## Hard constraints
- **No fabricated data, ever.** The product's entire credibility is that the drama is real.
- **No synthetic person endorsing the product.** An AI avatar saying it uses FPLRanker is a
  fabricated testimonial — deceptive under UK ASA and FTC endorsement rules. AI b-roll with no
  claimed identity is fine and must still carry the platform's AI label. See
  `references/production-stack.md` §2.2.
- **No player/manager photos, no match footage** — carried from `VIDEO_LANDING_PLAN_2026.md`.
- **Free-until-GW5 is a real deadline** (`NEXT_PUBLIC_PREMIUM_FREE_UNTIL`, default 2026-09-22).
  Quote the actual date; when it passes, the urgency line changes to the price.
- **Team ID is the only ask.** Never script an email capture as the primary CTA — friction is the
  thing this channel exists to remove.
- **Original per platform.** Facebook's 2026 reach rules demote reposted/watermarked content.
