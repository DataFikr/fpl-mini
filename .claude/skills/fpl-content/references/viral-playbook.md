# Viral Short-Form Playbook — Sports / Fantasy / Gaming (24-month research, Aug 2026)

Evidence base for the `fpl-content` skill. Everything below is either a platform-published
number, a benchmark from published creator research, or a named case study. Where a claim is
an inference rather than a measured fact it is marked **[inference]**.

---

## 1. Platform mechanics — what actually decides distribution

### TikTok (2026)
| Signal | Weight / threshold |
|---|---|
| Watch time + completion rate | Estimated 40–50% of the whole ranking decision |
| Completion rate to go viral | **70%+** in 2026 (was ~50% in 2024) |
| Rewatch rate | **15–20%+** is a strong boost signal |
| Hook window | First **3 seconds** decide completion; 63% of highest-CTR videos hook inside 3s (TikTok for Business) |
| Distribution model | Follower-first seed test → velocity escalation → FYP fan-out |

**Consequence for a 60s video:** 70% completion of 60s = 42s of held attention. That is a hard
bar. Every 60s script must be built as **4 × 15s micro-payoffs**, not one 60s arc, so the viewer
is re-hooked before each drop-off cliff.

### YouTube Shorts (2026)
| Signal | Weight / threshold |
|---|---|
| Swipe-away rate in first 2–3s | Single dominant signal — decides if stage-2 distribution happens at all |
| Swipe-through rate | >50% strong, <30% kills distribution |
| Partial views | A 6s view of a 60s Short is now a **negative** signal — only completed views and rewatches count meaningfully |
| Ranking order | early retention → completion → rewatches → shares → comments → likes |

**Consequence:** on Shorts, a 60s cut is riskier than on TikTok. Ship a **35–45s Shorts variant**
of every 60s TikTok master (see skill §5 platform matrix).

### Facebook / Instagram Reels (2026)
- Meta shipped tournament-wide football surfaces across Facebook, Instagram, Threads and WhatsApp
  in June 2026 — a dedicated football destination that surfaces top Reels and **fan content**
  alongside rights-holder content.
- Facebook 2026 reach rules privilege **original** content; reposted/watermarked material is
  demoted. Export platform-clean masters (no TikTok watermark) per destination.
- Facebook still delivers strong reach for football communities, weighted to LatAm/Africa — which
  maps onto FPL's real geography (the app's own GA4 shows Singapore as the #2 city after London).

### Conversion benchmark — views → site visits
- TikTok **destination** CTR (a click that actually loads your site) benchmarks at **0.5–0.7%**;
  "clicks (all)", which includes profile visits and likes, runs ~1.77%. Those are paid benchmarks;
  organic profile-link traffic is normally *lower* per view but higher-intent. **[inference]**
- Practical planning band for organic short-form → website: **0.3–1.0% of views**, with the top of
  the band reachable only when the video *is* the product demo and the CTA names one destination.

**Funnel arithmetic for the 1,000 visits/day goal**
```
1,000 visits/day ÷ 0.5% CTR  = 200,000 video views/day
1,000 visits/day ÷ 1.0% CTR  = 100,000 video views/day
```
At the app's Jun-2026 baseline (~1,562 users across 8 months ≈ 6/day), 1,000/day is a ~160×
step. It is not a one-week number. See `docs/marketing/social-traffic-plan-2026.md` for the
staged ramp and what has to be true at each stage.

---

## 2. What went viral — case evidence, last 24 months

### 2.1 FIFA World Cup 2026 on TikTok (the largest recent dataset in football)
Source: TikTok Newsroom, post-tournament report.

| Metric | Value |
|---|---|
| Total World Cup content views | **1.2 trillion** |
| Videos shared with WC hashtags | ~22 million (≈7× the entire 2022 tournament) |
| @fifaworldcup account | 28B views, 1.7B likes, +57M followers since Jan 2026 |
| #FIFAWorldCup | 12M+ posts, **+1,700% vs 2022** |
| #WorldCup | 12M+ posts, +600% vs 2022 |
| FIFA World Cup Hubs | 520M visits |
| Panini digital-card collection game | **96M** participants |
| Creator Correspondents | 30 creators, 22 countries |

**The single most important finding, quoted from TikTok's own read of the data:**
> "People aren't only watching highlights, they're watching **reactions, tactical breakdowns,
> behind-the-scenes access, and fan perspectives**."

Highlights were *not* the growth engine. Interpretation, identity and community were. FPLRanker
cannot post highlights (rights) — and the data says it doesn't need to.

**Formats that over-performed:**
- Fan-culture identity content (Scotland's Tartan Army in Boston, Norway's "Viking Row") — these
  spread *beyond* football audiences.
- Participation mechanics (the 96M-player card collection): daily task → collect → trade → share.
- Watch-party / group-reaction content ("Great American Sleepover").
- Player-generated novelty (name-pronunciation challenges).

**Transferable rule:** the mini-league *is* a fan-culture unit. Content about "your group chat"
outperforms content about "the data".

### 2.2 Roast My Strava — closest structural analogue to FPLRanker
A free tool that reads a user's own sports data via the platform's **official API** and returns a
personalised, funny, shareable verdict.

| Milestone | Date |
|---|---|
| Prototype launched | Sep 2024 |
| 10,000 athletes | Nov 2024 |
| 50,000+ connected users | Dec 2025 |
| Cumulative reach | 100,000+ athletes, "millions of impressions" |

Growth channel: organic sharing driven by an **Instagram trend** — users posted their own roast,
friends asked what it was, friends went to the site. Free, no paywall, official API.

**Transferable rules:**
1. The share asset must be about **the user**, not about the product.
2. It must be funny/insulting enough that sharing is a flex, not an ad.
3. The tool must be free at the moment of virality. (FPLRanker's Free-until-GW5 window,
   `NEXT_PUBLIC_PREMIUM_FREE_UNTIL=2026-09-22`, is exactly this window — use it.)

### 2.3 Bar chart race — the most shareable data format in short-form
Origin: John Burn-Murdoch's FT "most populous cities" race (2019); now one of the most-shared
formats on YouTube, TikTok, X and LinkedIn.

Why it works, per the format research: it converts numbers into **tension, momentum and a
leaderboard reveal** — the identical psychological loop as a sports highlight. Top viral use case
named explicitly: *replaying a season so team points race week by week toward the final table.*

**This is FPLRanker's rank-progression chart, exactly.** `AnalyticsTab` in
`src/app/app/_components/LeagueDetailClient.tsx` already computes a full `rankMatrix` — rank per
manager per gameweek. That data structure *is* a bar chart race waiting to be rendered.

### 2.4 SaaS / tool product-demo short-form
- Notion, Monday, Webflow and PLG-first startups generate hundreds of thousands of organic
  impressions/week from **micro-demos**, not entertainment content — clipping "key product
  moments that act as visual micro-demos and drive curiosity."
- 2025–26 shift: **slideshow/carousel** formats reached near-video performance at roughly half the
  production cost — no creator, no filming, no editor.
- Documented outlier: a SaaS reaching $80K MRR in 117 days on organic TikTok via repeatable
  format templates rather than one-off virals.

**Transferable rule:** the video should show the app doing the thing in under 10 seconds. Curiosity
about *what tool that is* is the click driver — not persuasion.

### 2.5 Fantasy-sport short-form (NFL + FPL)
- The NFL fantasy niche runs on ranked/list formats: draft strategy, sleepers, busts, "players to
  avoid", round-by-round guides. Educational 30–60s clips are the most-saved and most-shared type.
- FPL creator ecosystem is YouTube-long-form dominant (Let's Talk FPL ~494K subs; FPL Harry; The
  FPL Wire; Holly Shand running Shorts + streams). **#fantasypremierleague on TikTok is only
  ~86.3K posts** — versus 2.4M for #SoccerTikTok and 12M+ for #FIFAWorldCup.

**The gap:** FPL is a mass UK/global hobby with a comparatively thin short-form supply. The
established creators are talking-head opinion; nobody owns **mini-league data drama** in
short-form. That is the wedge.

---

## 3. CTA mechanics that survive the algorithm

| Rule | Detail |
|---|---|
| **One CTA per video** | Multiple CTAs split attention and all get ignored. |
| **Named reason, not "check us out"** | "Type your Team ID, it's free, takes 10 seconds" beats "link in bio". |
| **Bio link is a conversion hub, not a menu** | Most traffic is mobile: readable without pinching, no heavy scripts, primary button above the fold. |
| **Video ↔ landing continuity** | If the video is about the Headlines tab, the bio link must land on Headlines, not the homepage. Mismatch is the #1 documented leak. |
| **UTM per series** | `?utm_source=tiktok&utm_medium=social&utm_campaign=fr-03-rankrace` — track which *format* converts, not just which platform. |
| **Say the URL out loud AND on screen** | Suppressed-link platforms still let the viewer type a domain they heard twice. |
| **Comment-pin the link** | Pinned first comment + a reply-to-comment follow-up video is the standard organic workaround. |

---

## 4. The nine hooks FPLRanker actually owns

Verified against the codebase, not aspirational.

| # | Hook | Where it lives | Why it can travel |
|---|---|---|---|
| 1 | **Named villains** — auto-generated tags: `BENCH NIGHTMARE`, `CAPTAIN CALAMITY`, `GALAXY BRAIN`, `CLONE WARS`, `CHIP KING`, `BOTTLE JOB`, `PANIC MERCHANT`, `DERBY DAY`, `ON THE CHARGE`, `TOP SCORE` | `src/app/api/leagues/[id]/headlines/route.ts` | Roast-as-a-service. Same loop as Roast My Strava; the insult is generated *about a named friend*. |
| 2 | **Rank race** — `rankMatrix` per manager per GW | `LeagueDetailClient.tsx` → `AnalyticsTab` | The proven-viral bar-chart-race format, already computed. |
| 3 | **Rival Watch** — effective ownership, captaincy split, chip usage across the league | `SquadScreen.tsx` → `RivalWatch` | Surveillance/edge framing. "See your rival's captain before the deadline." |
| 4 | **Manager of the Month** | `LeagueDetailClient.tsx` → `motm()`, `ui/manager-of-the-month.tsx` | Resets the story every 4 GWs — a recurring, calendar-driven reason to post. |
| 5 | **WC-2026 fatigue tracker** — real tournament minutes → GW1 burnout risk | `_lib/fatigue-data.ts`, `/app/fatigue` | Rides the 1.2-trillion-view World Cup tailwind into an FPL decision. **Perishable — highest value in Aug/Sep 2026.** |
| 6 | **AI captain picks + xPts** (free until GW5) | `src/lib/predictor/`, `/predictions` | Answers the #1 recurring weekly FPL query. Free window = zero-friction virality. |
| 7 | **Transfer Impact verdict** | `SquadScreen` → `impact` tab | Binary yes/no verdict = perfect comment-bait ("it said NO, do I listen?"). |
| 8 | **Ambassador team-ID roster + CSV** | `AmbassadorTab.tsx` | Answers a question the *official* FPL site cannot. Pure utility → saves and shares. |
| 9 | **Zero-signup onboarding + share card** | `Landing.tsx`, `/api/og/league` | 10 seconds, Team ID only, no password. Removes every excuse not to click. |

---

## 5. Hard constraints carried from the product

- **No real player or manager photography, ever.** All EPL manager/player photos were removed from
  the codebase after the Jul 25 2026 copyright/trademark review (see `VIDEO_LANDING_PLAN_2026.md`).
  Video and thumbnails use app UI, text cards, generated stat graphics and generic jerseys only.
- **No broadcast footage.** No match clips, no goal replays, no commentary audio.
- **Music must be licence-clean** — Uppbeat/Pixabay-class tracks, or the platform's own commercial
  library. A copyright strike on a growth account is unrecoverable at this stage.
- **Real data only.** Demo mode (`FPL_DEMO_SEASON=2025-26`) renders authentic 2025/26 snapshots —
  use a real demo league for footage; never fabricate standings, points or verdicts.
- **Team-ID form stays the primary CTA.** Established in the landing plan; the video CTA must
  match it.

---

## Sources

- [TikTok Newsroom — FIFA World Cup 2026 content reaches more than 1 trillion views](https://newsroom.tiktok.com/fifa-world-cup-2026-content-reaches-more-than-1-trillion-views-on-tiktok)
- [TikTok Newsroom — FIFA World Cup 2026, as seen on TikTok](https://newsroom.tiktok.com/fifa-world-cup-2026-as-seen-on-tiktok)
- [TikTok Newsroom — FIFA World Cup 2026 Creator Correspondents](https://newsroom.tiktok.com/tiktok-and-fifa-introduce-the-fifa-world-cup-2026-creator-correspondents)
- [Yahoo Sports — Best viral moments from the 2026 FIFA World Cup](https://sports.yahoo.com/articles/best-viral-moments-2026-fifa-021910414.html)
- [Socialync — TikTok Algorithm 2026: the 7 signals that decide if you go viral](https://www.socialync.io/blog/tiktok-algorithm-2026-what-works-now)
- [Hansen Insights — The 3-second hook: why TikTok videos win or die in 2026](https://hansencommerce.com/insights-tiktok-hook-3-seconds)
- [go-viral.app — TikTok algorithm 2026: watch time, completion rate](https://www.go-viral.app/blog/tiktok-algorithm-2026/)
- [Hootsuite — How the TikTok algorithm works in 2026](https://blog.hootsuite.com/tiktok-algorithm/)
- [Socialync — YouTube Shorts algorithm 2026: what pushes views now](https://www.socialync.io/blog/youtube-shorts-algorithm-2026)
- [Social Champ — YouTube Shorts algorithm 2026](https://www.socialchamp.com/blog/youtube-shorts-algorithm/)
- [Meta Newsroom — Going all in for global football fans across Meta apps](https://about.fb.com/news/2026/06/going-all-in-for-global-football-fans-across-meta-apps/)
- [Icebox Designs — Facebook 2026 reach rules: original content, Reels](https://iceboxdesigns.co.uk/blog/facebook-2026-reach-rules-original-content-reels/)
- [Emplifi — 2026 global football tournament social media trends](https://emplifi.io/resources/football-trends-social/)
- [Jason Kuperberg — Roast My Strava](https://jasonkuperberg.com/roast-my-strava)
- [DataToVid — Bar chart race templates for TikTok & Reels](https://www.datatovid.com/templates/bar-chart-race)
- [Flourish — Visualize sports data](https://flourish.studio/resources/sports/)
- [dansiepen.io — 14 best SaaS organic TikTok growth strategies](https://www.dansiepen.io/growth-checklists/saas-organic-tiktok-growth-strategies-tactics)
- [Octospark — TikTok growth strategies for SaaS: the $80K MRR in 117 days blueprint](https://octospark.ai/blog/tiktok-growth-strategies-saas-80k-mrr-blueprint)
- [Reap — SaaS founders use Shorts to drive traffic for growth](https://reap.video/blog/saas-founders-shorts-traffic)
- [SocialKit — TikTok CTAs: driving action without killing reach](https://socialk.it/en/blog/tiktok-cta-conversion-guide)
- [Admetrics — How to drive website traffic with TikTok](https://www.admetrics.io/en/post/how-to-drive-website-traffic-with-tiktok)
- [Socialinsider — 2026 TikTok benchmarks](https://www.socialinsider.io/social-media-benchmarks/tiktok)
- [WebFX — 2026 TikTok marketing benchmarks](https://www.webfx.com/blog/social-media/tiktok-benchmarks/)
- [Feedspot — 100 Fantasy Premier League YouTubers to follow in 2026](https://videos.feedspot.com/fantasy_premier_league_youtube_channels/)
- [TikTok — #fantasypremierleague hashtag](https://www.tiktok.com/tag/fantasypremierleague?lang=en)
- [Teleprompter.com — Short-form video strategy: the complete 2026 guide](https://www.teleprompter.com/blog/short-form-video-strategy)
