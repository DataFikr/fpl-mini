# Publishing checklist — TikTok · Instagram Reels · YouTube Shorts

Operational runbook for getting a rendered FR-xx video live and measurable.
Setup (§1) is once. §2 is every video. §3 is the FR-08 kit, ready to paste.

---

## 1. One-time setup

### 1.1 Accounts — same handle everywhere (`@fplranker`)

| Platform | Account type | Why it matters |
|---|---|---|
| **TikTok** | **Business** — Settings → Account → Switch to Business Account | A Business account gets the clickable **Website** field in Edit Profile at **zero followers**. Personal accounts still hit a reported 1,000-follower gate in some regions. This is the single highest-value setup decision, because the bio link *is* the CTA. |
| **Instagram** | Professional / Creator | Bio link available to everyone; Creator gives Reels insights. |
| **YouTube** | Standard channel | Shorts description links are low-CTR — the pinned comment and the on-screen URL carry the click. |

**TikTok Business caveat:** Business accounts can only use TikTok's **Commercial Sounds** library,
not the general music catalogue. That is not a cost here — the licence-clean rule already rules the
general catalogue out, and a commercial-library track is safe by definition.

The Website field is mobile-app only (Profile → Edit profile → Website). It does not appear on desktop.

### 1.2 Bio link
One link, and it must point at **the destination of the video posted that day** — not the homepage.
Video/landing mismatch is the biggest documented conversion leak in this channel.

TikTok allows exactly one bio link, so **swap it daily**. Keep the target page fast on mobile with
the primary button above the fold.

### 1.3 Tracking
GA4 parses `utm_*` off the landing URL automatically — no code change needed. The site already
loads gtag via `src/components/analytics/GoogleAnalytics.tsx`.

Before the first post, confirm in **GA4 → Realtime** that a hit to a UTM'd URL shows up with the
right `session_campaign`. If it doesn't, nothing measured afterwards is trustworthy.

---

## 2. Per-video sequence

1. **Confirm the destination page is live and matches the video's claims.** Load it on a phone.
2. **Swap the bio link** on all three platforms to that video's UTM'd destination.
3. **Upload** per the platform matrix below.
4. **Pin the link as the first comment** — the standard workaround for suppressed in-caption links.
5. **Log the row** in the Notion content calendar: video ID, platform, post date, hook variant, UTM.
6. **Reply to comments with video** for the first 2 hours. Early engagement velocity is a ranking
   signal, and every "my league needs this" reply is a free next post.

### Platform matrix

| | TikTok | Facebook Reels | YouTube Shorts | X |
|---|---|---|---|---|
| **File** | `fr-xx-60s.mp4` | `fr-xx-60s.mp4` | `fr-xx-40s.mp4` | `fr-xx-60s.mp4` |
| **Why that cut** | 60s is fine; completion ≥70% is the bar | 60s, posts to feed too | **Never post the 60s master here** — Shorts treats a partial view as a negative signal | Free tier caps at **140s / 512MB**; a 60s master at 5–18MB is well inside |
| **Cover** | Scrub the cover picker to the frame noted in each kit | Upload `fr-xx-cover.png` | Upload `fr-xx-cover.png` as thumbnail (channel page only, not the Shorts feed) | X picks a frame; no custom cover on the free tier |
| **CTA** | Bio link + pinned comment | Bio link or in-post link | Pinned comment + description link | **Put the URL directly in the post** — see below |
| **Title/caption** | Caption + hashtags | Caption + hashtags | Title must include **#Shorts** | Short post + inline link; 1–2 hashtags max |
| **Settings** | Comments, Duet, Stitch **on** | Comments on | Comments on | Replies open |
| **Export** | Clean master from `video/out/` | Same file, native upload | Same | Same |

**X is the one platform where the link goes in the post.** Everywhere else the CTA has to survive a
bio-link detour; on X you paste the UTM'd URL straight into the tweet, so it's the highest-intent
placement in the set. It also rewards a different caption register — drier, no emoji-stacking, one
or two hashtags rather than six. X's algorithm does deprioritise posts with external links, so the
usual workaround is link in the **first reply** if reach looks suppressed; test both.

Specs: MP4, H.264 + AAC, 1080×1920 supported, up to 60fps — all four masters already comply.

**Never** download from one platform and re-upload to another. Watermarked reposts are demoted —
explicitly so under Facebook/Meta's 2026 original-content rules. Always upload from `video/out/`.

---

## 3. FR-08 kit — ready to paste

### Destination URLs (bio link, per platform)
```
https://fplranker.com/app/fatigue?utm_source=tiktok&utm_medium=social&utm_campaign=fr-08-fatigue
https://fplranker.com/app/fatigue?utm_source=instagram&utm_medium=social&utm_campaign=fr-08-fatigue
https://fplranker.com/app/fatigue?utm_source=youtube&utm_medium=social&utm_campaign=fr-08-fatigue
```

### TikTok caption
```
the World Cup is over and your GW1 team doesn't know it yet 🥵

Rice played 649 minutes. Watkins played 51.
real minutes for every PL player — link in bio, free

#fpl #fantasypremierleague #fplgw1 #worldcup2026 #premierleague #fplcommunity
```

### Instagram Reels caption
```
The World Cup is over and your GW1 team doesn't know it yet 🥵

Declan Rice: 649 minutes across 8 matches.
Ollie Watkins: 51 minutes across 2.

Same tournament. Completely different legs going into Gameweek 1.

Real per-match minutes for every FPL-relevant Premier League player — link in bio. Free, no signup.

#fpl #fantasypremierleague #fplgw1 #worldcup2026 #premierleague #fplcommunity #fantasyfootball
```

### YouTube Shorts
**Title**
```
Rice played 649 World Cup minutes. Watkins played 51. #Shorts
```
**Description**
```
The World Cup is over and your GW1 team doesn't know it yet.

Real per-match World Cup 2026 minutes for every FPL-relevant Premier League player, with the GW1 burnout risk that follows:
https://fplranker.com/app/fatigue?utm_source=youtube&utm_medium=social&utm_campaign=fr-08-fatigue

Free. No signup. Just your Team ID.

#fpl #fantasypremierleague #fplgw1 #worldcup2026
```

### Pinned first comment (all three)
```
Full per-match minutes for all 9 players → fplranker.com/app/fatigue
Free, no signup. Who's the most fatigued pick in your team?
```

### Reply-bait to watch for
The **Saka** line is the strongest comment hook in the set: consensus says he's a GW1 fade
candidate, and the verified minutes put him 8th-heaviest of nine (357', only 3 starts, missed the
semi-final). Expect pushback. Reply with the match-by-match breakdown — that reply is FR-08b.

---

## 3b. FR-01 kit — "Your mini-league has a villain"

**Files:** `fr-01-60s.mp4` (TikTok/Reels) · `fr-01-40s.mp4` (Shorts) · `fr-01-cover.png` · `fr-01-loop.mp4`
**Publish:** Sat 16 Aug · **Destination:** the homepage — the CTA is "enter your Team ID", and a
specific league URL is meaningless to a stranger.

```
https://fplranker.com/?utm_source=tiktok&utm_medium=social&utm_campaign=fr-01-headlines
https://fplranker.com/?utm_source=instagram&utm_medium=social&utm_campaign=fr-01-headlines
https://fplranker.com/?utm_source=youtube&utm_medium=social&utm_campaign=fr-01-headlines
```

**TikTok caption**
```
it called my mate a BENCH NIGHTMARE and I have never recovered 💀

21 points left on the bench. the app wrote the headline itself.
free, link in bio — just your team ID

#fpl #fantasypremierleague #minileague #fplcommunity #premierleague #fplgw1
```

**Instagram Reels caption**
```
It called my mate a BENCH NIGHTMARE and I have never recovered 💀

FPL Ranker reads your mini-league every gameweek and writes the story itself — ESPN-style. Ten different ways to get exposed: Bench Nightmare, Captain Calamity, Bottle Job, Panic Merchant, Clone Wars…

And four of the ten are good news, if you've earned them.

Free, no signup — just your Team ID. Link in bio.

#fpl #fantasypremierleague #minileague #fplcommunity #premierleague #fantasyfootball
```

**YouTube Shorts title**
```
This app called my mate a "BENCH NIGHTMARE" automatically #Shorts
```

**Pinned first comment (all three)**
```
It writes these for your league too → fplranker.com
Free, no signup. What's the worst thing your league has done this season?
```

**Why this one should travel:** it's the roast-as-a-service loop that took Roast My Strava from 0
to 100k+ users. The share isn't "look at this app", it's "look what it said about *you*" — so the
comment prompt asking for the viewer's own league disaster is the most important line in the kit.

**Cover-frame note:** TikTok picks its cover from a video frame. Scrub to **~1.5s**, where the
headline card and the red chip have both landed.

## 3c. FR-07 kit — "I let an AI pick my captain"

**Files:** `fr-07-60s.mp4` · `fr-07-40s.mp4` · `fr-07-cover.png` · `fr-07-loop.mp4`
**Publish:** Sun 17 Aug — "who to captain GW1" search peaks now.
**Destination:** `/predictions` (deep link, matches the video).

```
https://fplranker.com/predictions?utm_source=tiktok&utm_medium=social&utm_campaign=fr-07-captain
https://fplranker.com/predictions?utm_source=instagram&utm_medium=social&utm_campaign=fr-07-captain
https://fplranker.com/predictions?utm_source=youtube&utm_medium=social&utm_campaign=fr-07-captain
```

**TikTok caption**
```
I let a machine pick my FPL captain for a whole season 🧠

every setting was tuned on the first half. it scored BETTER on the half it had never seen.
free until GW5 — link in bio

#fplcaptain #fpl #fantasypremierleague #fplgw1 #premierleague
```

**Instagram Reels caption**
```
I let a machine pick my FPL captain 38 times 🧠

Prediction error fell from 1.268 to 1.002 across the season. But here's the part that matters: every hyperparameter was tuned on GW1–19 only. On GW20–38 — which it had never seen — the error was 0.963. Lower on the half it wasn't tuned on.

83% of a perfect XI's points. 5.66 average from its captain pick.

Free for everyone until Gameweek 5 (22 Sept), then it's the paid tier. Link in bio.

#fplcaptain #fpl #fantasypremierleague #fplgw1 #fantasyfootball
```

**YouTube Shorts title**
```
I let an AI pick my FPL captain for 38 gameweeks #Shorts
```

**Pinned first comment**
```
Full backtest + this gameweek's picks → fplranker.com/predictions
Free until GW5. Who are you captaining?
```

**Accuracy guardrail:** every number in this kit is read from
`scripts/fpl-predictor/out/convergence-v2.json`. Do not round 0.963 to "under 1" in a way that
implies a hit rate, and never claim a captain success percentage — the backtest measures error and
capture, not "picks correct".

**Cover-frame note:** TikTok covers come from a video frame; the curve is still drawing early on, so
scrub to **~15s** (the full curve with both totals visible) rather than the opening.

## 3d. FR-02 kit — "The rank race"

**Files:** `fr-02-60s.mp4` · `fr-02-40s.mp4` · `fr-02-cover.png` · `fr-02-loop.mp4`
**Publish:** Tue 19 Aug (brought forward — FR-05 is blocked, see the briefs).
**Destination:** homepage — the ask is a Team ID.

```
https://fplranker.com/?utm_source=tiktok&utm_medium=social&utm_campaign=fr-02-rankrace
https://fplranker.com/?utm_source=instagram&utm_medium=social&utm_campaign=fr-02-rankrace
https://fplranker.com/?utm_source=youtube&utm_medium=social&utm_campaign=fr-02-rankrace
```

**TikTok caption**
```
he led the league for 5 gameweeks and finished 8th 🫠

a whole mini-league season in 20 seconds. 129 rank changes.
run yours free — link in bio

#fpl #fantasypremierleague #minileague #premierleague #fplcommunity
```

**Instagram Reels caption**
```
A whole mini-league season in 20 seconds 🏁

Interval led for the first 5 gameweeks. Finished 8th.
Kickin' FC started 9th. Finished 2nd.
129 rank changes across 20 gameweeks.

This isn't an edit — it's the Analytics tab, built from your league's real rank history. Any manager, any window.

Free, no signup, just your Team ID. Link in bio.

#fpl #fantasypremierleague #minileague #fantasyfootball #premierleague
```

**YouTube Shorts title**
```
He led his FPL league for 5 weeks and finished 8th #Shorts
```

**Pinned first comment**
```
This is the Analytics tab → fplranker.com
Free, no signup. Who's your league's biggest collapse this season?
```

**Why this one should travel:** the bar chart race is the most-shared data format in short-form,
and the collapse/comeback pairing gives it a beginning and an end. Target **rewatch ≥20%** — this
is the brief most likely to be replayed, so rewatch matters more than CTR here.

**Cover-frame note:** TikTok covers come from a frame — scrub to **~22s**, near the end of the race
where the final table has settled.

## 3e. FR-03 kit — "6th in the league and he just won"

**Files:** `fr-03-60s.mp4` · `fr-03-40s.mp4` · `fr-03-cover.png` · `fr-03-loop.mp4`
**Publish:** Wed 20 Aug (brought forward — FR-06 is blocked).
**Destination:** homepage.

```
https://fplranker.com/?utm_source=tiktok&utm_medium=social&utm_campaign=fr-03-motm
https://fplranker.com/?utm_source=instagram&utm_medium=social&utm_campaign=fr-03-motm
https://fplranker.com/?utm_source=youtube&utm_medium=social&utm_campaign=fr-03-motm
```

**TikTok caption**
```
6th in the league and he still walked away with a trophy 🏆

every 4 gameweeks the table resets. 4 different winners in 5 months.
free, link in bio

#fpl #fantasypremierleague #minileague #fplcommunity #premierleague
```

**Instagram Reels caption**
```
6th in the league. And he just won the month 🏆

The season table stopped moving in GW6 — same leader ever since. But the 4-gameweek window kept producing new names: 4 different winners in 5 months, two of them from outside the top three.

175 points off the top? The season is gone. The next 4 gameweeks start level for everyone.

That's Manager of the Month, and every mini-league gets one automatically. Free, no signup — just your Team ID.

#fpl #fantasypremierleague #minileague #fantasyfootball #premierleague
```

**YouTube Shorts title**
```
He's 6th in his FPL league and still won a trophy #Shorts
```

**Pinned first comment**
```
Every mini-league gets one automatically → fplranker.com
Free, no signup. Who'd win Manager of the Month in yours?
```

**Why this one converts rather than travels:** it's the retention argument, so the audience that
responds is league admins — the people who bring 10+ managers with them. Lower reach ceiling than
FR-08 or FR-02, higher value per click. Watch **comments and saves** over raw views.

**Cover-frame note:** scrub TikTok's picker to **~2s**, where the trophy and the paradox line have
both landed.

## 4. Success bars for FR-08

| Metric | Bar |
|---|---|
| Completion (TikTok) | ≥70% |
| Swipe-through (Shorts) | ≥50% |
| Rewatch | ≥15% |
| Destination CTR | ≥0.5% |
| Reach vs other briefs | This is the only brief that can escape the FPL audience into general football — target ≥5× |

**Decay:** FR-08's value drops sharply after ~GW3. Push it hard now, retire it mid-September.

---

## 5. Audio

Captions carry the story and most short-form is watched muted, so a silent render is publishable —
but silence reads as broken to a sound-on viewer, and audio is a real engagement input.

### Scoring all four videos at once

Every composition **defaults** to the shared bed named in `video/src/audio.ts`. One file in, one
command, all four scored:

1. Download a track from [Pixabay Music](https://pixabay.com/music/) — Pixabay Content License,
   commercial use, **no attribution required**.
2. Trim any slow intro out of the file first — the bed must be at full energy from frame 1.
3. Save as **`video/public/bed.mp3`**.
4. `cd video && npm run render:all`

Level, fades and the filename all live in `video/src/audio.ts`; change the track there and
re-render rather than editing four compositions. Music ducks from 0.6 to 0.14 automatically when a
voiceover is also passed, and fades in and out so no cut ends on a hard stop.

**Two Pixabay caveats, neither a blocker.** Some tracks still trigger **YouTube Content ID** claims
— resolvable by showing the licence, but keep a note of the track URL. And Pixabay offers **no
indemnification** and does not verify contributor uploads, so for anything high-stakes,
[Uppbeat](https://uppbeat.io) (free tier requires a credit, but carries a clearance guarantee) is
the safer source.

**Alternative with zero re-render:** add a track from TikTok's **Commercial Sounds** library at
upload. Licence-clean by definition, and a trending sound carries its own distribution. Instagram
has an equivalent. Good for TikTok/Reels; you still want a baked-in bed for YouTube and outreach.

### Voiceover (optional)

Generate with the Higgsfield CLI (`production-stack.md` §2.1) or ElevenLabs Starter, save to
`video/public/`, and pass `voice` in a props file.

`video/scripts/fr-08-vo.txt` is the FR-08 script — ~120 words, paced for the 60s master, numbers
spelled out so TTS reads them correctly ("six hundred and forty-nine", "F P L Ranker").

Keep one brand voice across every FR-xx video — note the voice ID and reuse it.

### Two gotchas found the hard way

- **Use props files, never inline `--props='{...}'`** — inline JSON quoting is unreliable in Git
  Bash on Windows and fails silently, falling back to defaults.
- **Never verify audio by file size.** The AAC track is constant-bitrate, so a silent render and a
  scored one produce the *identical* byte count. Compare hashes, or grep the verbose render log for
  `Html5Audio` / `asset positions`.

## 3f. FR-10 kit — "No email. No password."

**Files:** `fr-10-60s.mp4` · `fr-10-40s.mp4` · `fr-10-cover.png` · `fr-10-loop.mp4`
**Publish:** Thu 21 Aug — **GW1 deadline day**, maximum intent, lowest-friction ask.
**Destination:** homepage — this is the one brief where the homepage *is* the matching destination.

```
https://fplranker.com/?utm_source=tiktok&utm_medium=social&utm_campaign=fr-10-onboarding
https://fplranker.com/?utm_source=instagram&utm_medium=social&utm_campaign=fr-10-onboarding
https://fplranker.com/?utm_source=youtube&utm_medium=social&utm_campaign=fr-10-onboarding
```

**TikTok caption**
```
no email. no password. no account.

paste your FPL team ID and your squad, league and rivals are just… there.
free, link in bio

#fpl #fantasypremierleague #fplgw1 #minileague #premierleague
```

**Instagram Reels caption**
```
No email. No password. No account. 🔓

Paste your FPL team ID and your squad, your mini-league and your rivals are all there. That's the entire signup.

Don't know your team ID? Open your team on the official FPL site — it's the number in the address bar.

Free. Link in bio.

#fpl #fantasypremierleague #fplgw1 #minileague #fantasyfootball
```

**YouTube Shorts title**
```
No email, no password — the entire FPL Ranker signup #Shorts
```

**Pinned first comment**
```
Your team ID is the number in your FPL URL → fplranker.com
No signup, no card. What's stopping you?
```

**No time claim anywhere in this kit — deliberate.** The brief's stopwatch was dropped after three
capture runs measured the load at 5.7s / 1.9s / 0.7s; the spread is Next dev-server compile state,
not the product, and none of it reflects production. "No email, no password" is true regardless of
network. **Do not reintroduce a seconds claim** without a measurement taken against production.

**Footage:** real Playwright recording (`npm run capture:fr10`), not a mockup — which is why the
on-screen strip says so. Recapture whenever onboarding UI changes.

**Cover-frame note:** scrub TikTok's picker to **~2s**, on the "NO EMAIL / NO PASSWORD" card.

## 3g. FR-09 kit — "1.6% owned him. He scored 147."

**Files:** `fr-09-60s.mp4` · `fr-09-40s.mp4` · `fr-09-cover.png` · `fr-09-loop.mp4`
**Publish:** Mon 25 Aug · **Destination:** `/app/players`.

```
https://fplranker.com/app/players?utm_source=tiktok&utm_medium=social&utm_campaign=fr-09-differentials
https://fplranker.com/app/players?utm_source=instagram&utm_medium=social&utm_campaign=fr-09-differentials
https://fplranker.com/app/players?utm_source=youtube&utm_medium=social&utm_campaign=fr-09-differentials
```

**Verified figures — 2025/26 final, players over 900 minutes:**
| | Ownership | Price | Points | Pts/£m |
|---|---|---|---|---|
| E.Le Fée (SUN) | **1.6%** | £4.8m | 147 | **30.6** |
| Haaland (MCI) | 62.5% | £14.7m | 239 | 16.3 |

Le Fée ranked **8th of 339** for points per million. Five more sub-2% players cleared 120 points.

**TikTok caption**
```
1.6% of the game owned him. he scored 147 👀

six players under 2% ownership cleared 120 points last season.
find yours free — link in bio

#fpl #fpldifferentials #fantasypremierleague #fplgw1 #premierleague
```

**Instagram Reels caption**
```
1.6% owned him. He scored 147 points 👀

E.Le Fée, £4.8m — 30.6 points per million, 8th best value of 339 players who played a full season.

Haaland scored more (239) but cost £14.7m and 62.5% of the game had him. Same game, different maths.

Five more players under 2% ownership cleared 120 points last season. Every player's ownership, price, form and expected points is sortable on one page — free, no signup.

#fpl #fpldifferentials #fantasypremierleague #fantasyfootball #premierleague
```

**YouTube Shorts title**
```
1.6% of FPL owned him and he scored 147 #Shorts
```

**Pinned first comment**
```
Every player's ownership, price and form → fplranker.com/app/players
Free, no signup. Who's your differential for GW1?
```

**Accuracy guardrail:** the comparison card shows **total points alongside points-per-million** on
purpose. Value alone invites the reading that the differential outscored the template — he didn't,
he cost a third as much. Never crop that beat to just the pts/£m figures.

**This is the recurring template.** It runs on last season's finished data because 2026/27
ownership doesn't exist yet. **Once GW3+ of the new season has real ownership, recapture and
re-render weekly** — this is the highest-frequency reusable brief in the set.

**Cover-frame note:** scrub to **~2s**, on the ownership figure.
