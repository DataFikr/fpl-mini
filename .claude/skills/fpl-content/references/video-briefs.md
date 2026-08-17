# The Founding Ten — 60s video briefs

Ten videos, one feature each, built to the constraints in `viral-playbook.md`:
**hook lands inside 3s · a payoff every ~15s · 70% completion target · one CTA · loops back to frame 1.**

## Shared spec

| Field | Value |
|---|---|
| Master format | 1080×1920, 9:16, 60s, H.264, ≤30MB |
| Shorts variant | Same master cut to **40s** (drop beat 3) — Shorts punishes partial views harder |
| Captions | Burned in, Bebas Neue, ≥64px, safe area 220px top / 320px bottom |
| Palette | Sportify tokens — ink `#150000`, red `#FF5050`, green `#7CFB9E`, gold `#FFD100` |
| Footage | Playwright walkthrough of a **real demo league** at 390×844. No player/manager photos. No broadcast footage. |
| Audio | Licence-clean (Uppbeat/Pixabay class) + ElevenLabs VO. Must work **muted**. |
| End card | 3s: hex logo · `FPLRANKER.COM` · "Free · No signup · Just your Team ID" |
| CTA rule | One destination, named out loud and shown on screen, matching the bio link for that day |
| UTM | `?utm_source={platform}&utm_medium=social&utm_campaign=fr-{id}-{slug}` |

**Retention scaffold every brief follows**
```
0–3s    HOOK        a claim or an image that costs nothing to keep watching
3–15s   PROOF       the app doing the thing, fast, real data
15–30s  ESCALATE    pattern interrupt — number slams in, tag flips, chart moves
30–45s  PAYOFF      the thing they came for, delivered
45–55s  RESOLVE     one sentence of "and here's what you do with it"
55–60s  CTA + LOOP  end card whose last frame visually rhymes with frame 1
```

---

## FR-01 — "Your mini-league has a villain"
**Feature:** ESPN-style AI Headlines · `/app/league/[id]` → Headlines tab
**Source:** `src/app/api/leagues/[id]/headlines/route.ts`
**Hook family:** named villains (playbook §4.1) · **Publish:** Aug 16

**Cover:** Ink background, diagonal red brand stripe, oversized `BENCH NIGHTMARE` tag-cut chip.
Overlay: **"YOUR LEAGUE HAS A VILLAIN."**

> **Built 2026-08-15.** Every headline is real output of `GET /api/leagues/[id]/headlines`,
> captured to `video/src/data/fr01-headlines.json`; the ten tags are extracted from the engine's
> source so the video can't show a category the product doesn't emit. **Team names only, never
> `detail.manager`** — see `video/src/data/README.md`.

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Real headline card slams in, red chip snapping a beat later, stat footer (21 pts benched) | **IT FOUND YOUR VILLAIN.** | "This app called my mate a bench nightmare. By name." |
| 3–15 | The real story feed drifting upward — six cards, real tags, real teams | THIS IS AUTOMATIC. | "It reads your mini-league every gameweek and writes the story itself." |
| 15–30 | All ten engine tags accumulate one by one, in their real colours, then hold | TEN WAYS TO GET EXPOSED. | "Bench nightmare. Captain calamity. Bottle job. Panic merchant. Clone wars — when you and your rival own the same eleven players." |
| 30–45 | Slow push into the CAPTAIN CALAMITY card with its stat footer | REAL TEAMS. REAL NUMBERS. | "Real teams. Real numbers. Straight from the FPL API." |
| 45–55 | Tone flips to green — the ON THE CHARGE card | OR IT MAKES YOU THE HERO. | "And four of the ten are good news, if you've earned them." |
| 55–60 | End card | FPLRANKER.COM | "Paste your league. Find out who your villain is." |

*Caption changes from the original draft: "IT NAMED HIM" became "IT FOUND YOUR VILLAIN" (the
subject is a team name, not a person) and "IT USES REAL NAMES" became "REAL TEAMS. REAL NUMBERS"
for the same reason.*

**Retention devices:** the tag rattle at 15s is a rhythm change — hardest drop-off point covered.
The 45s tone flip (red → green) is a second interrupt.
**Loop:** last frame is the same red tag chip as frame 1.
**CTA:** bio link → `/app/league/[id]` example league, Headlines tab preselected.
**Caption:** `it wrote "CAPTAIN CALAMITY" about my mate and I have never recovered 💀 free, link in bio #fpl #fantasypremierleague #minileague`
**Hashtags:** `#fpl #fantasypremierleague #fplcommunity #minileague #premierleague #fplgw1`
**Success bar:** completion ≥70%, saves ≥2% (this one should be *sent to the group chat* — shares are the real metric).

---

## FR-02 — "The rank race"
**Feature:** Rank progression chart · `/app/league/[id]` → Analytics tab
**Source:** `AnalyticsTab` / `rankMatrix()` in `LeagueDetailClient.tsx`, `charts/rank-progression-chart.tsx`
**Hook family:** bar chart race (playbook §2.3 — the most-shared data format in short-form) · **Publish:** Aug 19

**Cover:** The race frozen late, Interval collapsed to 8th in red, Kickin' FC risen to 2nd in green.
Overlay: **"HE LED FOR 5 WEEKS. THEN THIS HAPPENED."**

> **Built 2026-08-15.** Ranks come from the app's own `rankMatrix` via
> `video/scripts/capture-fr02.mts` — 12 managers × 20 gameweeks, **129 rank changes**. The story is
> real and unarranged: **Interval led the first 5 gameweeks and finished 8th** (−7); **Kickin' FC
> started 9th and finished 2nd** (+7). Numbers in the earlier draft ("38 seconds", "GW1→19",
> "four times before Christmas") were placeholders.

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | The premise, with the rank-change count | WATCH THE LEADER COLLAPSE. | "One mini-league. Twenty gameweeks. A hundred and twenty-nine rank changes." |
| 3–25 | The race runs GW1→20, GW counter above it, rows overtaking | EVERY GAMEWEEK. REAL RANKS. | "Every gameweek, from the real rank history." |
| 25–38 | Interval named: 1st → 8th, "top for the first 5 gameweeks" | 7 PLACES. NO RECOVERY. | "Interval led for five gameweeks. It finished eighth. It never recovered." |
| 38–50 | The inversion: Kickin' FC 9th → 2nd | UP 7 PLACES. | "And while everyone watched the collapse, this one climbed seven places." |
| 50–55 | "It's the Analytics tab" — not an edit | RUN YOURS. IT'S FREE. | "This isn't an edit. It's the Analytics tab, built from your league's rank history." |
| 55–60 | End card | FPLRANKER.COM | "Run yours. It's free." |

**Build note — the race mechanic.** Rows are positioned by rank and **hold for ~62% of each
gameweek slot, then move**. Two earlier approaches failed: tweening each team's rank linearly
leaves several pairs mid-swap at all times, so rows stack; deriving rank from interpolated points
with a soft step fails too, because this league's totals sit 1–4 points apart, well inside any
useful smoothing width. Points must ride the *same* easing as rank or the table contradicts itself
(a row in 4th showing more points than 2nd).

**Retention devices:** the race itself is the retention device — leaderboard tension holds without
a cut. Slow-mo at 20s is the interrupt.
**Loop:** end card wipes back into the first frame of the race.
**CTA:** bio link → `/app/league/[id]` Analytics tab.
**Caption:** `every gameweek of a mini-league in 40 seconds. watch the collapse at 0:22 🫠 #fpl #fantasypremierleague`
**Success bar:** rewatch rate ≥20% — this is the format most likely to be replayed.
**Build note:** render in Remotion from `rankMatrix` output. Don't screen-record it — the race needs
frame-accurate easing the live chart doesn't do.

---

## FR-03 — "Manager of the Month resets everything"
**Feature:** Manager of the Month · `/app/league/[id]` → MOTM tab
**Source:** `motm()` in `LeagueDetailClient.tsx`, `ui/manager-of-the-month.tsx`
**Hook family:** recurring calendar drama · **Publish:** Aug 23 (post-GW1)

**Cover:** Gold trophy on ink. Overlay: **"6TH IN THE LEAGUE AND HE JUST WON."**

> **Built 2026-08-15.** Derived from the FR-02 capture via `video/src/motm.ts`, using the app's own
> last-4-gameweeks rule. **The brief's "dead last" was wrong** — the lowest-ranked monthly winner in
> the real data sat **6th**, so the video says 6th. Overstating by five places to keep a punchier
> line is exactly what gets a data channel called out in the replies.
>
> **Verified figures:** 5 windows of 4 GWs · **4 distinct winners** · lowest-ranked winner
> **KakiBangkuFC, 6th, GW17–20** · Kickin' FC won GW13–16 from **4th** · season leader unchanged
> **since GW6** · top-to-bottom gap **175 pts**.

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Trophy, then the paradox in Bebas | THE TABLE ISN'T THE ONLY RACE. | "Sixth in the league. And he just won the month." |
| 3–19 | The five windows arrive one by one — winner, their league rank at the time, points | 4 DIFFERENT WINNERS. | "Every four gameweeks the table resets. Four different winners in five months." |
| 19–33 | Split: season table (frozen since GW6) vs monthly winners (four names) | THE SEASON STOPS MOVING. THE MONTH DOESN'T. | "One league, two completely different stories." |
| 33–45 | The retention argument: 175 points off the top, and the next window starts level | THIS IS WHY PEOPLE DON'T QUIT. | "A hundred and seventy-five points off the top? The season table is gone. The next four gameweeks start level for everyone." |
| 45–55 | It's a tab — every mini-league gets one | RUN YOURS. IT'S FREE. | "Nobody has to track it. Nobody can argue with it." |
| 55–60 | End card | FPLRANKER.COM | "Free. Just your Team ID." |

**Retention devices:** the 0–3s claim is a paradox — the brain needs the resolution.
The split screen at 30s is the interrupt.
**CTA:** bio link → `/app/league/[id]` MOTM tab.
**Caption:** `dead last in the league and still walked away with a trophy. monthly leaderboards are undefeated 🏆 #fpl #minileague`
**Success bar:** comments — this format pulls "my league needs this" replies. Reply to every one with a video.

---

## FR-04 — "The team IDs the official site won't give you"
**Feature:** Ambassador roster + CSV export · `/app/league/[id]` → Ambassador tab
**Source:** `AmbassadorTab.tsx`
**Hook family:** pure utility → saves (playbook §4.8) · **Publish:** Aug 24

**Cover:** A spreadsheet of team IDs on ink, one column glowing green, a red ✕ over the official
FPL standings page beside it. Overlay: **"THE OFFICIAL SITE HIDES THIS."**

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Official FPL standings, cursor copying an ID out of the URL bar, one at a time | **"STOP DOING THIS"** | "If you've ever copied team IDs out of the URL bar one by one — stop." |
| 3–15 | Cut to Ambassador tab: full roster, rank, team, manager, **team ID**, in one list | EVERY ID. ONE PAGE. | "Every manager in your mini-league, with their FPL team ID, on one page." |
| 15–30 | Tap **Export CSV** → file lands → opens in Sheets with all columns | AND IT EXPORTS | "One tap and it's a spreadsheet — points, gameweek score, a link to their official team, and a link to their FPLRanker breakdown." |
| 30–45 | Scroll the sheet, hover the two link columns | TWO LINKS PER MANAGER | "So you can audit anyone in your league in two clicks." |
| 45–55 | Sign-in screen, magic link, no password field | SIGN IN. NO PASSWORD. | "It's behind a sign-in — a roster of real people shouldn't be scrapeable. Magic link, no password." |
| 55–60 | End card | FPLRANKER.COM | "Free. Export your league today." |

**Retention devices:** 0–3s is a recognised pain, not a claim — the "that's me" reflex.
The CSV landing at 15s is the payoff most people didn't know existed.
**CTA:** bio link → `/app/league/[id]` Ambassador tab.
**Caption:** `the official FPL site will not give you everyone's team ID. this will, as a csv 📄 #fpl #fantasypremierleague #fplcommunity`
**Success bar:** **saves** — utility content is saved, not shared. Save rate ≥3%.

---

## FR-05 — "See your rival's captain before the deadline"
**Feature:** Rival Watch · `/app/squad` → Rival watch tab
**Source:** `RivalWatch` in `SquadScreen.tsx`
**Hook family:** surveillance / edge · **Publish:** Aug 18

> **Unblocked and built 2026-08-16.** The block was a *demo data* problem, not a feature problem:
> `src/lib/demo/fpl-demo.ts` produced a fixed 4/4/4 captaincy split, six players at 100% ownership
> and 12/12 "no chip". None of that is true of a real league, and the video is now cut from a real
> one — the screen capture `fplranker_planner.mp4` (2026-07-12, GW38 of 2025/26, 9 managers).
>
> **The demo generator is still broken** and still backs the landing page's "try the demo" links.
> The three root causes stand and are worth fixing on their own merit: `squadFor(entry)` is
> memoized with no gameweek argument, every squad is dealt the same 6-player premium core, and
> `synthPicks` hardcodes `active_chip: null`.
>
> **Verified figures — from the capture, transcribed in `video/src/squadcapture.ts`:**
> effective ownership **167 / 89 / 67 / 56 / 33 / 33%** (B.Fernandes the only player at 100% owned);
> most captained **Haaland 4×, B.Fernandes 3×, Gibbs-White 1×, Bowen 1×** — summing to all 9
> managers. The brief's "9 of 12", "94%" and "8% differential" were placeholders and are gone.
>
> **The chips beat is cut.** All nine managers played no chip in GW38, so there is genuinely
> nothing to show; an all-zero row reads as a broken feature. It returns when a capture has chip
> variety.
>
> **Privacy:** the capture is of a real private league. Its name appears once, in the Rival Watch
> subtitle, and is patched at render time by `Redact` in `components/AppFootage.tsx`. No
> `detail.manager` value appears — see `video/src/data/README.md`.

**Cover:** `167%` in red on ink over "EVERY TEAM IN THIS LEAGUE OWNS HIM" — a number that can only
be a mini-league figure, which is the whole proposition. → `out/fr-05-cover.png`

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–4 | The claim, then 167% slams in | THAT'S NOT A GLOBAL NUMBER. | "Every single team in this league owns the same man." |
| 4–13 | **Footage** — the real Rival Watch tab, EO list, league name redacted | THIS IS YOUR LEAGUE, NOT THE GAME. | "This is effective ownership, but for your mini-league — not the global game." |
| 13–26 | The slope rebuilt natively: 167 → 89 → 67 → 56 → 33 | AND THEN IT FLOORS AT 33%. | "One player everybody has. Then it falls off a cliff." |
| 26–41 | Most captained: 4 / 3 / 1 / 1 of 9, then the turn — most owned ≠ most captained | ONE OF NINE IS A REAL DIFFERENTIAL. | "Four of the nine captained Haaland. But the man they all *own* is someone else." |
| 41–52 | The argument | KNOW WHAT THEY OWN. | "You're not playing the whole game. You're playing nine people." |
| 52–60 | End card | FPLRANKER.COM/APP/SQUAD | "Free. Just your Team ID." |

**Retention devices:** the number in the first 4s *is* the hook, and it's unreadable as a global
figure — that confusion is what buys beat 2. The 26s turn (most-owned and most-captained are
different players) is the interrupt.
**Loop:** end card eases back toward the opening 167%.
**CTA:** bio link → `/app/squad` (Rival watch).
**Caption:** `global ownership is useless. this is ownership inside YOUR mini-league 🔭 free rn #fpl #fplcaptain #fantasypremierleague`
**Success bar:** click-through — this is the highest-intent brief in the set. Target ≥1% destination CTR.
**Render:** `npm run render:fr05:all` → `out/fr-05-60s.mp4` · `fr-05-40s.mp4` · `fr-05-loop.mp4` · `fr-05-cover.png`

---

## FR-06 — "The -4 that ate the gain"
**Feature:** Transfer Impact · `/app/squad` → Transfer Impact
**Source:** `SquadScreen.tsx` tab `impact`, `/api/teams/[id]/transfer-history`
**Hook family:** confession / arithmetic = comment bait · **Publish:** Aug 20 (deadline eve)

> **Unblocked and rewritten 2026-08-16.** All three original objections are resolved, two of them
> by deleting the thing that caused them:
>
> 1. **The old brief described a feature that doesn't exist** — a planner that scores a transfer
>    *before* you commit. Transfer Impact is retrospective. The video now sells what the tab
>    actually does: it grades every transfer already made. Old beats 2–4 are gone.
> 2. **There was no demo data** (`fpl-demo.ts:403` returns `[]`). The cut uses a real account
>    instead: `fplranker_planner.mp4`, GW36–38 of 2025/26, with a real history.
> 3. **The old beat 5 was fabricated** — *"I ignored it. I lost eleven points."* Still deleted, as
>    is the cover line "IT TOLD ME NOT TO. I DID IT ANYWAY." The confession in this cut is
>    arithmetic that actually happened.
>
> **Verified figures — from the capture, in `video/src/squadcapture.ts`:**
> GW38 · 1 transfer · no hit · IN 9 / OUT 0 · **+9 net**.
> GW37 · 2 transfers · **-4 hit** · IN 9 / OUT 6 · gain **+3** · **-1 net** · next-5 projection
> 46 in / 55 out · price change +£0.1m.
>
> **Honesty constraint:** the app badges GW37 **Neutral** — its costly threshold is -8. Nothing in
> the video calls it a disaster, and it must stay that way. The point is that the hit is priced in
> at all, which the official site never does.
>
> **Trim bounds matter.** Transfer Impact is only on screen from ~13s to ~24.5s of the capture, and
> the recording scrolls back to the top before switching tabs. A clip half a second long shows the
> wrong card — or, past 25s, the Rival Watch screen and the league's real name.

**Cover:** `+3 - 4` over a 400px `-1` on ink. Overlay: **"THE HIT ATE THE GAIN."**
→ `out/fr-06-cover.png`

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–4 | The claim, then "INCLUDING THIS ONE" slams in red | POINTS IN. POINTS OUT. THE HIT. | "It grades every transfer you've ever made. Including this one." |
| 4–12 | **Footage** — the real GW38 card: one transfer, no hit, +9 net | GW38: ONE TRANSFER. PLUS 9. | "One transfer, no hit, nine points up. Fine." |
| 12–21 | **Footage** — scroll to GW37: two transfers, `-4 PTS HIT`, `-1 net` in red | THEN GW37. TWO MOVES. A -4. | "Then the week I took a minus four for two of them." |
| 21–36 | The sum, native: IN 9 · OUT 6 · gain +3 · hit -4 · **NET -1** | A GAIN, UNTIL THE HIT. | "Nine in, six out. A three point gain — until the hit." |
| 36–52 | What else it grades: in vs out, hit priced in, 5-GW projection, price change | THE OFFICIAL SITE SHOWS YOU NONE OF THIS. | "Every gameweek, graded. The official site shows you none of this." |
| 52–60 | End card | FPLRANKER.COM/APP/SQUAD | "Free. Just your Team ID." |

**Retention devices:** the arithmetic at 21s is the payoff — a sum the viewer has done badly in
their own head all season. Beat 5 converts a single anecdote into a recurring reason to open the tab.
**Loop:** end card eases back toward the opening `-4`.
**CTA:** bio link → `/app/squad` (Transfer Impact).
**Caption:** `took a -4 for two transfers. they gained +3. do the maths 💀 what's your worst hit? #fpl #fplgw1 #fantasypremierleague`
**Success bar:** comments ≥1% of views. Pin the best "worst -4" reply and make it FR-06b.
**Render:** `npm run render:fr06:all` → `out/fr-06-60s.mp4` · `fr-06-40s.mp4` · `fr-06-loop.mp4` · `fr-06-cover.png`

---

## FR-07 — "The AI captain pick"
**Feature:** AI captain picks + xPts predictions · `/app/squad` → Prediction tab, `/predictions`
**Source:** `src/lib/predictor/`, `predictor-service.ts`
**Hook family:** the #1 recurring weekly FPL query · **Publish:** Aug 17

**Cover:** The real 38-GW error curve on ink, learning line green under a flat red frozen baseline.
Overlay: **"I LET AN AI PICK MY CAPTAIN — 38 TIMES."**

> **Rebuilt 2026-08-15.** Two corrections. (1) The old cover line *"I'm 2 for 2"* was a fabricated
> personal record and is gone. (2) **"MAE 1.84 vs 1.95" is wrong** — those figures appear nowhere in
> the generated report; `LAUNCH_PLAN_2026.md` §2 still carries them. The real v2 production numbers,
> from `scripts/fpl-predictor/out/convergence-v2.json`, are below.
>
> Also: the brief assumed a live "who to captain this week" table. That isn't honest pre-season —
> 2026/27 GW1 hasn't happened and `PlayerPrediction` is empty, so any pick shown would be invented.
> The video sells the **backtest track record** instead, which is real and checkable.

**Verified figures — quote these or nothing:**
| Metric | Value |
|---|---|
| Full-season MAE (learning) | **1.002** |
| Frozen-baseline MAE | **1.268** |
| GW1–19 (tuned on) | 1.040 |
| **GW20–38 (never tuned on)** | **0.963** — beats the tuning half |
| XI optimal-capture | **83.3%** |
| Avg actual pts from its captain pick | **5.66** |
| Spearman ρ (played pool) | 0.347 |

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | "WHO DO I CAPTAIN?" in Bebas, then the premise | 38 GAMEWEEKS. ONE MACHINE. | "Every week, the same question. I let a machine answer it thirty-eight times." |
| 3–18 | The real error curve draws GW1→38; green learning line falls away from the flat red frozen baseline | IT GOT SHARPER EVERY WEEK. | "Its error fell all season. The frozen version, which never learns, didn't." |
| 18–32 | Validation band over GW20–38: 1.040 tuned vs **0.963** never-seen | IT NEVER SAW THE SECOND HALF. | "Every setting was tuned on the first half. It scored *better* on the half it had never seen. That's not luck — that's learning." |
| 32–45 | 83% capture counter + 5.66 avg captain points | 83% OF A PERFECT TEAM. | "Its eleven captured eighty-three percent of the perfect team's points, every week." |
| 45–55 | FREE badge + "until Gameweek 5 · 22 September" | FREE UNTIL GAMEWEEK 5. | "It's normally the paid part. Free for everyone until gameweek five." |
| 55–60 | End card | FPLRANKER.COM/PREDICTIONS | "Go and take it." |

**Retention devices:** beat 3 is the one no opinion channel can run — held-out validation is the
credibility signal that separates this from a take. Beat 5 converts it into a dated deadline.
**CTA:** bio link → `/predictions`.
**Caption:** `free AI captain picks until GW5, then it's paid. take it while it's free 🧠 #fplcaptain #fpl #fantasypremierleague #fplgw1`
**Success bar:** destination CTR ≥1%. The free deadline is genuine — say the date (22 Sept).
**Accuracy rule:** never claim a hit rate the backtest doesn't support. Quote the table above or say nothing.

---

## FR-08 — "The World Cup broke your GW1 team"
**Feature:** WC-2026 fatigue tracker · `/app/fatigue`
**Source:** `FatigueScreen.tsx`, `_lib/fatigue-data.ts`
**Hook family:** World Cup tailwind — 1.2 **trillion** views of adjacent attention · **Publish: Aug 15 (FIRST — most perishable)**

**Cover:** A red minutes counter reading `649'` over a fatigue-risk bar at **HIGH**, ink
background, WORLD CUP 2026 · FULL TIME eyebrow. Overlay: **"DON'T PICK HIM IN GW1."**

> **Numbers verified 2026-08-15.** Rice **649'** across 8 matches is the heaviest load in the
> dataset; Watkins **51'** across 2 appearances is the lightest. Both were corrected in
> `src/app/app/_lib/fatigue-data.ts` after the pre-production audit — the earlier 672'/198'
> figures in this brief were placeholders and were wrong. The composition reads the data file
> directly, so it re-renders correct if the data changes again.

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Minutes counter rolling up to 649, risk bar snapping to red HIGH | **"649 MINUTES. IN ONE SUMMER."** | "Declan Rice just played six hundred and forty-nine World Cup minutes." |
| 3–15 | Fatigue list, all 9 players, heaviest first — club badge, nation, minutes, risk | REAL MINUTES. REAL RISK. | "Spain beat Argentina, the tournament's done, and half your gameweek-one picks are cooked." |
| 15–30 | Rice's tournament expands, match by match, to a 649' total | EVERY MATCH. EVERY MINUTE. | "Every match he played and the minutes in each one — including the ones he was rested for." |
| 30–45 | Filter to HIGH risk → Rice, Ødegaard, Haaland, Bruno Fernandes | THESE ARE YOUR GW1 LANDMINES | "These four are going into gameweek one on empty legs. Rotation risk. Injury risk." |
| 45–55 | Inversion: **Watkins, 51 minutes, 2 appearances in 8 matches**, green | 2 APPEARANCES. FRESH LEGS. | "And this one barely played. Fifty-one minutes all summer. Fresh legs nobody's pricing in." |
| 55–60 | End card | FPLRANKER.COM/APP/FATIGUE | "Check yours before the deadline." |

**Retention devices:** a real number nobody else has published in the first 3s. The 45s inversion
(risk → opportunity) turns a warning into an edge, which is what earns the click. The Saka
correction is the strongest comment-bait in the set — the consensus take is that he's a fade
candidate, and the minutes say he's the 8th-heaviest of nine.
**CTA:** bio link → `/app/fatigue` **direct** (deep link, not the homepage — video/landing continuity).
**Caption:** `the World Cup is over and your GW1 team doesn't know it yet 🥵 real minutes for every PL player, link in bio #fpl #worldcup2026 #fplgw1 #fantasypremierleague`
**Hashtags:** ride both pools — `#worldcup2026 #fifaworldcup #fpl #fantasypremierleague #premierleague`
**Success bar:** highest reach ceiling in the set — this is the only brief that can escape the FPL
audience into general football. Target ≥5× the reach of any other brief.
**Decay warning:** value drops sharply after ~GW3. Ship it first, push it hardest, retire it by mid-September.

---

## FR-09 — "The £4.5m nobody has picked"
**Feature:** Player pages + xPts/FDR · `/app/players`, `/players/[slug]`
**Source:** `PlayersScreen.tsx`, `src/app/players/[slug]/page.tsx`
**Hook family:** differential/sleeper — the highest-saved format in fantasy short-form · **Publish:** Aug 25

**Cover:** Player card on ink with `0.8% OWNED` in red and `£4.5m` in gold, generic jersey (no
photo). Overlay: **"0.8% OWN HIM. THAT'S THE POINT."**

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Ownership counter reading 0.8%, price chip £4.5m | **"0.8% OWNED"** | "Under one percent of the game owns this player." |
| 3–15 | Player page: form, xPts, next-five fixture difficulty strip going green | THREE GREEN FIXTURES | "Here's his page — form, expected points, and the next five fixtures colour-coded." |
| 15–30 | Fixture strip highlighted: GW1–3 all green | THE RUN IS THE POINT | "You're not buying the player. You're buying the run." |
| 30–45 | Players screen: sort by price, filter cheap defenders, three names surface | FILTER YOUR OWN | "Sort the whole player list by price, position, form — find your own before everyone else does." |
| 45–55 | Back to the player page, scroll to the FAQ block | EVERY PLAYER HAS A PAGE | "Every player in the game has one of these." |
| 55–60 | End card | FPLRANKER.COM | "Free. No signup." |

**Retention devices:** the 15s line ("you're not buying the player, you're buying the run") is a
reframe — reframes hold better than facts. 30s hands control to the viewer, which converts.
**CTA:** bio link → `/app/players`.
**Caption:** `0.8% ownership and three green fixtures. that's a differential 👀 #fpl #fpldifferentials #fantasypremierleague #fplgw1`
**Success bar:** saves ≥3%. Refresh the pick weekly — this composition is a **template**, re-render
with new props every gameweek. Highest-frequency reusable brief in the set.
**Accuracy rule:** the ownership % and price must be pulled live at render time. Never a stale number.

---

## FR-10 — "Ten seconds. No password."
**Feature:** Zero-signup onboarding + share card · `Landing.tsx`, `/app/find-team-id`, `/api/og/league`
**Source:** `Landing.tsx`, `ShareLeagueButton.tsx`, `api/og/league/route.tsx`
**Hook family:** friction removal + the share loop (playbook §2.2) · **Publish:** Aug 21 (GW1 deadline day)

**Cover:** A phone-shaped frame, a Team-ID input with a 6-digit number half-typed, and a stopwatch
reading `00:10`. Overlay: **"NO EMAIL. NO PASSWORD. TEN SECONDS."**

| t | Visual | Burned caption | VO |
|---|---|---|---|
| 0–3 | Stopwatch starts. Finger types a team ID into the landing form | **"TIMER STARTS NOW"** | "Ten seconds. No email, no password. Watch." |
| 3–12 | Enter → league HQ loads: standings, headlines, rank chart, all populated | 00:09 | "Type your Team ID. That's the whole signup." |
| 12–20 | Stopwatch stops at ~00:09, full league HQ on screen | **DONE. 9 SECONDS.** | "Nine seconds and your entire mini-league is on screen." |
| 20–32 | Cut to `/app/find-team-id` — where the number is, highlighted in the official URL | DON'T KNOW YOURS? | "Don't know your Team ID? It's in the URL of your official FPL team page — and there's a page that shows you exactly where." |
| 32–48 | Tap **Share** → the OG card generates: league name, top 3, a headline, rank chart → drops into a WhatsApp thread | AND IT MAKES THIS | "Then hit share, and it builds a card of your league — table, top three, this week's headline — straight into the group chat." |
| 48–55 | The card sitting in a group chat, replies stacking up | THE GROUP CHAT DOES THE REST | "Which is when the arguing starts." |
| 55–60 | End card | FPLRANKER.COM | "Ten seconds. Go." |

**Retention devices:** a live timer is the strongest completion device available — a running clock
is an open loop the viewer physically wants closed. The share-card reveal at 32s is a second
"I didn't know it did that."
**CTA:** bio link → `fplranker.com` homepage (this is the one brief where the homepage *is* the
matching destination).
**Caption:** `no email. no password. 9 seconds and your whole mini-league is on screen ⏱️ #fpl #fantasypremierleague #fplgw1 #minileague`
**Success bar:** highest destination CTR of the set — the video *is* the onboarding. Target ≥1.5%.
**Note:** this is the brief to re-shoot whenever onboarding changes. If the timer ever reads over
12 seconds, fix the product, not the video.

---

## Publishing order (GW1 = Fri 21 Aug 2026)

| Date | Video | Why this slot |
|---|---|---|
| Fri 15 Aug | **FR-08 Fatigue** | Most perishable; World Cup attention still live |
| Sat 16 Aug | **FR-01 Headlines** | Identity hook — builds the follower base the seed test needs |
| Sun 17 Aug | **FR-07 AI captain** | "Who to captain GW1" search peaks now |
| Mon 18 Aug | **FR-05 Rival Watch** | Team-planning window |
| Tue 19 Aug | **FR-02 Rank race** | Highest rewatch — feed it into a warm follower base |
| Wed 20 Aug | **FR-06 Transfer Impact** | Deadline-eve transfer anxiety |
| Thu 21 Aug | **FR-10 Onboarding** | Deadline day — maximum intent, lowest-friction ask |
| Sat 23 Aug | **FR-03 MOTM** | Post-GW1: the "it's not over" message |
| Sun 24 Aug | **FR-04 Ambassador** | Post-GW1 league admin surge |
| Mon 25 Aug | **FR-09 Differentials** | GW2 planning; becomes the weekly recurring template |

---

## Source captures — `C:\Users\Family\Videos\Captures\`

Screen recordings of the real app, signed in to a real account. **834×1200 (DAR 139:200), ~15fps
variable, no audio track.** Not 9:16: filling 1920 height needs a 1.6× upscale and crops 254px of
width, which is the column holding every xP chip, percentage and action button. Fit to the band
between the safe areas instead — `AppFootage` does this (931×1340 at y=190, a 1.12× upscale).

Trim to constant 30fps before use. The variable frame rate makes per-frame seeking both slow and
jittery, and `-r`-based frame extraction **drifts cumulatively** on these files — use exact `-ss`
seeks when mapping scene boundaries, or the timecodes will be wrong by several seconds.

| File | Len | League | Contents |
|---|---|---|---|
| `fplranker_planner.mp4` | 46.9s | **real, private** | Planner 0–13 · Transfer Impact 13–24.5 · Rival watch 25–29 · Prediction 29+ |
| `fplranker_analytics.mp4` | 35.4s | **real, private** | Analytics 0–17 (MOTM banner, Last 5/10/20 position chart, stat tiles, GW-points bars) · MOTM 27–36 |
| `fplranker_analytics_no_images.mp4` | 34.6s | demo | *Not* an image-free variant — a different capture (Best Man League, Headlines, GW20) at 692×1162 with broken headline covers. Unusable as-is. |

> ⚠ **`fplranker_analytics.mp4` shows six real full names** on the MOTM cards. `data/README.md`
> forbids surfacing `detail.manager` without the founder confirming those people consent. Decision
> (2026-08-16): **patch the names**, using the same `Redact` component FR-05 uses for the league
> name. Do not publish that footage un-patched.

**Still unbuilt from these captures** — evaluated 2026-08-16, ordered by strength:

| ID | Hook | Source | Blocker |
|---|---|---|---|
| P1 | "Your best XI is leaving 21 points on the table" (`122 → 143`) | planner 29+ | Only ~6s of footage; needs the most native extension |
| ~~A1~~ | ~~the rank sawtooth~~ | | **Built — see FR-16** |
| A2 | "He averages 61. Then this happened." (`118` spike) | analytics 13–17 | Now largely covered by FR-16's scrub beat; only worth a standalone if the 40s underperforms |
| ~~A3~~ | ~~"The season stopped moving. The month didn't."~~ | | **Built — see FR-16** |
| A4 | "Wildcard on GW32. 235 points." | analytics 30–33 | Names — redact first, same method as FR-16 |
| P4 | "Every transfer, priced before you make it" | planner 0–13 | *"Season complete (GW38)"* is burned into the on-screen copy — unusable in the GW1 window |

---

## FR-16 — "Two tables, two different seasons"
**Feature:** Analytics position chart + Manager of the Month · `/app/league/[id]` → Analytics, MOTM
**Source:** `fplranker_analytics.mp4`
**Hook family:** paradox + data drama · **Publish:** any time — evergreen, no GW1 dependency

> **Built 2026-08-16**, combining A1 (the sawtooth) and A3 (Manager of the Month) because they are
> one argument from two directions: the league table remembers a single number, and everything that
> actually happened is somewhere else.
>
> **The sawtooth beat is footage, not a redraw, for two reasons.** The chart is *interactive* —
> scrubbing it drives the rank, the gameweek score, the season total and the highlighted bar below
> it simultaneously, which no re-render sells. And a hand-traced polyline of the rank history would
> be invented data: an earlier cover drew exactly that under the label "GW19-38 · LEAGUE POSITION"
> and was replaced with a real frame of the real chart (`public/fr16-chart.png`).
>
> **Verified figures — `video/src/analyticscapture.ts`:** best rank **2**, finished **3 of 9**,
> avg/GW **61**, climbs **4**, total **2302**; season-best gameweek **118 (GW33)**, against a 61
> average. MOTM May: **296 pts across GW35-38**, storylines 54 captain pts / 31 bonus pts / a 9.4%-owned
> differential.
>
> **Three names patched**, all measured in footage space and verified on check frames at both ends
> of the beat: the page title (real league name), the winner's manager line (replaced with
> `GW35 - 38`), and the previous-months row peeking in at the bottom (a second manager name).
> The patches are **opaque, not blurred** — the grounds were sampled out of a check frame (page
> `#FAFAFA`, MOTM card `#140000`), so a solid patch is seamless, whereas every blur opacity that
> still read as a blur left the name faintly legible underneath.
>
> **Both clips are scroll-free windows.** The recording scrolls at ~14.5s and again at ~21.5s;
> either would drag a fixed patch off the line it covers. The scrub window (8.0-14.0) also happens
> to be the only stretch with no MOTM banner in frame, so it needs no patching at all.

**Cover:** the real position chart, cropped to the card, over "THE TABLE ONLY SHOWS YOU THE LAST
ONE" and `Best rank 2 · finished 3 of 9`. → `out/fr-16-cover.png`

**40s cut** (the hero; `props/fr16-shorts.json`)

| t | Visual | Burned caption |
|---|---|---|
| 0–3 | `2nd` THEN `3rd` slams in | IT ONLY REMEMBERS THE LAST ONE. |
| 3–14 | **Footage** — the chart being scrubbed; rank, GW points, total and the highlighted bar all move | GW19 TO 38. ONE AT A TIME. |
| 14–21 | **Footage** — the MOTM card, three names patched | THERE'S A SECOND TABLE. |
| 21–30 | The three storylines rebuilt at full resolution: 54 · 31 · 9.4% | IT WRITES THE REASONS TOO. |
| 30–32 | The argument | PASTE YOUR LEAGUE. SEE BOTH. |
| 32–40 | End card | FPLRANKER.COM |

The **60s master** adds a `swing` beat between the two — the app's own stat tiles (best rank, avg/GW,
climbs, and the 118-point gameweek) — and a longer resolve.

**Retention devices:** the scrub is the retention payload; a chart that visibly drives four other
numbers is the rare thing viewers rewind. The 14s cut to a second, gold-coloured table is the
interrupt.
**Loop:** end card eases back toward the opening rank pair.
**CTA:** bio link → `/app/league/[id]`.
**Caption:** `2nd, 5th, 2nd, 5th — the league table hides all of it. and then there's a whole second competition 🏆 #fpl #minileague #fantasypremierleague`
**Success bar:** rewatch ≥20% (the scrub) and comments on the MOTM half ("my league needs this").
**Render:** `npm run render:fr16:all` → `out/fr-16-60s.mp4` · `fr-16-40s.mp4` · `fr-16-loop.mp4` · `fr-16-cover.png`

Combination 60s cuts worth trying: **P2+P1** (grades your past moves, then names the next one) and
**P3+P1**, both landing on a single `/app/squad` CTA.

## Bench (rotation 11–15, build after the founding ten prove out)

| ID | Feature | Angle |
|---|---|---|
| FR-11 | Kit Hub · `/app/kits` | "26/27 kits ranked by how much they'd embarrass you" — carries the Kitbag affiliate |
| FR-12 | Pitch view + bench regret · `/app/squad` Squad tab | "Your bench scored more than your team" |
| FR-13 | Newsletter · Resend crons | "It emails you before you forget the deadline" |
| FR-14 | Master the League · `/app/master-the-league` | "Five rules for winning a mini-league" — the listicle format that dominates fantasy short-form |
| FR-15 | Blog + GW previews · `/app/blog` | Repurpose each post's best stat as a 20s stat-drop |
