# FPLRanker Social Traffic Plan — 2026/27 Season Launch

> Written: Aug 15, 2026 · GW1: Fri Aug 21, 2026 · Goal: 1,000 visits/day from social
> Execution skill: `.claude/skills/fpl-content` · Research: `fpl-content/references/viral-playbook.md`

---

## 1. The honest arithmetic

The June 2026 GA4 audit recorded **1,562 total users across eight months** — roughly **6/day**, of
which organic social was 9.9%. The target is 1,000/day. That is a **~160× step**, and the numbers
say what it costs:

```
Views needed per day, at benchmark organic short-form → destination CTR:

  CTR 0.3%  →  333,000 views/day   (pessimistic)
  CTR 0.5%  →  200,000 views/day   (benchmark: TikTok destination CTR 0.5–0.7%)
  CTR 1.0%  →  100,000 views/day   (achievable when the video IS the product demo)
  CTR 1.5%  →   67,000 views/day   (FR-10 onboarding-style content only)
```

**1,000 visits/day is not a GW1 number.** Six days of posting from a standing start cannot produce
100,000+ daily views — the algorithms need a follower base to run the seed test against, and that
base does not exist yet. Anyone promising otherwise is selling something.

What *is* achievable is a compounding ramp where each stage is a precondition for the next. The
plan below is built to hit 1,000/day **by GW10 (early November)**, with the GW1 window used to
establish the account, the format library, and the follower seed that everything after depends on.

## 2. Staged targets

| Stage | Window | Views/day | Social visits/day | What has to be true |
|---|---|---|---|---|
| **0 — Seed** | Aug 15–21 (pre-GW1) | 3–8k | 30–60 | 10 videos live across 3 platforms; accounts have a real posting history; one video clears 50k views |
| **1 — Signal** | GW1–GW3 (Aug 21–Sep 7) | 15–30k | 100–200 | ≥2 of the 10 formats beat their success bar; weekly refresh loop running in <45 min |
| **2 — Compound** | GW4–GW6 (Sep 8–Oct 5) | 50–80k | 350–600 | Winning formats posted daily; share loop live (OG cards in group chats); 5k+ followers on the lead platform |
| **3 — Target** | GW7–GW10 (Oct 6–Nov 2) | 100–200k | **1,000+** | Two proven formats at daily cadence + returning direct traffic + SEO compounding underneath |

**Blended, not social-only.** By Stage 3 the 1,000/day is social *plus* the direct and organic
traffic that social creates downstream — group-chat shares of the OG league card, branded searches
for "fplranker", and the SEO surface that a bigger audience accelerates. Treating social as the
sole source makes the number look impossible; treating it as the top of a compounding funnel makes
it a schedule.

## 3. The founding ten

Ten 60s videos, one feature each, fully briefed in
`.claude/skills/fpl-content/references/video-briefs.md`.

| ID | Feature | Hook | Publish |
|---|---|---|---|
| FR-08 | WC-2026 fatigue tracker | "649 minutes. In one summer." | Fri 15 Aug |
| FR-01 | ESPN-style AI Headlines | "It publicly named my mate an idiot." | Sat 16 Aug |
| FR-07 | AI captain picks / xPts | "'Who do I captain' — solved." | Sun 17 Aug |
| FR-05 | Rival Watch (EO + captaincy + chips) | "9 of 12 captained the same man." | Mon 18 Aug |
| FR-02 | Rank progression race | "A whole season in 40 seconds." | Tue 19 Aug |
| FR-06 | Transfer Impact verdict | "It said don't. I did it anyway." | Wed 20 Aug |
| FR-10 | Zero-signup onboarding + share card | "Ten seconds. No password." | Thu 21 Aug (deadline day) |
| FR-03 | Manager of the Month | "He's last. He just won." | Sat 23 Aug |
| FR-04 | Ambassador team-ID CSV | "The official site hides this." | Sun 24 Aug |
| FR-09 | Player pages / differentials | "0.8% own him. That's the point." | Mon 25 Aug |

**FR-08 ships first and hardest.** The 2026 World Cup drove 1.2 trillion TikTok views and it is the
only asset in the set that can escape the FPL audience into general football. Its value decays
sharply after ~GW3 — retire it mid-September.

## 4. Cadence

| Platform | Cadence | Cut | Why |
|---|---|---|---|
| **TikTok** (lead) | 2/day | 60s master | Highest ceiling; completion ≥70% is the bar |
| **YouTube Shorts** | 1/day | 40s cut | Partial views are now a *negative* signal — never post the 60s master here |
| **Instagram Reels** | 1/day | 60s master, clean export | Meta's 2026 football surfaces actively distribute fan content |
| **Facebook Reels** | 1/day | 60s master, clean export | Strong football reach, weighted to the app's real #2 geography (APAC/Singapore) |

Rules that matter more than the schedule:
- **Export a clean master per platform.** Watermarked reposts are demoted, explicitly so on Facebook.
- **Swap the bio link daily** to match that day's video destination. Mismatch is the biggest
  documented conversion leak in the channel.
- **Reply to comments with video.** Every "my league needs this" comment is a free next post.
- 5 posts/day is only survivable because the Remotion compositions are templates — see
  `references/production-stack.md`.

## 5. Production stack (short version)

**Remotion** renders the videos from the app's own React components and live FPL data ·
**Playwright** captures deterministic app B-roll · **Figma MCP** produces covers and end cards ·
**Notion MCP** holds the calendar. **Higgsfield MCP** (3s cinematic openers) and **ElevenLabs**
(voiceover) are optional add-ons — both currently unauthorised.

**The pipeline can start today without them.** Captions carry the story (most short-form is watched
muted), so Figma + Playwright + Remotion is a complete v1. Full evaluation, including the MCPs
rejected and why, is in `references/production-stack.md`.

## 6. Measurement

Track weekly, per video, in the Notion calendar:

| Metric | Source | Bar |
|---|---|---|
| Views | Platform | — |
| Completion / swipe-through | Platform | ≥70% TikTok, ≥50% Shorts |
| Rewatch rate | Platform | ≥15% |
| Saves | Platform | ≥3% on utility briefs (FR-04, FR-09) |
| Shares | Platform | primary metric for FR-01, FR-02, FR-03 |
| Destination CTR | GA4 sessions ÷ views | ≥0.5%, ≥1% on FR-05/FR-07/FR-10 |
| Sessions by campaign | GA4 `utm_campaign` | — |
| Team-ID submissions from social | GA4 event, source=social | the only conversion that matters |

**Decision rule:** any brief that misses its success bar twice is killed. Any brief that beats it
twice goes daily. By Stage 2 the schedule should be dominated by two or three formats, not ten.

## 7. Risks

| Risk | Mitigation |
|---|---|
| Copyright strike on a growth account | No player/manager photos, no broadcast footage, licence-clean audio only. Non-negotiable — a strike at this stage is unrecoverable. |
| Cold-start: seed tests fail with no followers | Stage 0 exists for exactly this. Post consistently for a week before judging any format. |
| Solo-founder production burnout | Templates, not productions. If the weekly refresh exceeds 45 min, the composition isn't parameterised enough. |
| Traffic arrives, retention doesn't | Week-1 retention was 3–6%. Magic-link accounts + saved teams now catch it — but if Stage 1 traffic still bounces, fix the landing before buying more traffic. |
| Free-until-GW5 window closes mid-ramp | `NEXT_PUBLIC_PREMIUM_FREE_UNTIL=2026-09-22`. The "it's free" hook expires with it — FR-07's urgency line must switch to price on Sep 22. |
| FPL API rate limits under load | Existing Redis caching layer; monitor at Stage 2 volumes. |

## 8. Open items for the founder

1. **Authorise Higgsfield** (claude.ai connector settings) if cinematic openers are wanted — optional.
2. **Install ElevenLabs MCP** for voiceover — optional; captions work muted.
3. **Confirm GW1 date.** This plan uses **Fri 21 Aug 2026** per the founder. `LAUNCH_PLAN_2026.md`
   and the July memory both still say ~Aug 15 — those docs need correcting.
4. **Create the accounts** — TikTok, YouTube, Instagram, Facebook — with matching handles and a
   bio-link page that loads fast on mobile with the primary button above the fold.
5. **Pick the demo league** used for all B-roll, and confirm the managers in it are fine with their
   names appearing in videos.
