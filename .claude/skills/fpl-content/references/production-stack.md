# Production Stack — MCP evaluation & the FPLRanker video pipeline

How to actually manufacture 10 × 60s videos (plus platform variants) with Claude, and which MCP
servers earn their place. Evaluated Aug 2026.

---

## 1. The core decision

FPLRanker is a Next.js + React app with a shipped design system (FR-DLS / Sportify tokens, Bebas
Neue display face) and a live data layer. That changes the calculus: **the highest-leverage video
tool is the one that renders React** — because the video can import the app's real components,
real tokens and real league data instead of re-creating them in a video editor.

That points to **Remotion as the spine**, with AI-generative MCPs used only for the 3–5s
attention-grabbing openers that Remotion is bad at.

---

## 2. MCP evaluation matrix

| MCP / tool | What it does | Fit for FPLRanker | Verdict |
|---|---|---|---|
| **Remotion** (React → MP4, not strictly an MCP — Claude writes the code directly) | Frame-by-frame React rendering; full source control; free/OSS under $1M revenue | **Perfect.** Imports `rank-progression-chart.tsx`, the headline card markup, Sportify tokens. Every video becomes a `<Composition>` parameterised by a league ID — 10 videos becomes 10 templates × N leagues. Version-controlled alongside the app. | **SPINE — build here** |
| **Figma MCP** *(already connected)* | `create_new_file`, `use_figma`, `get_design_context`, `download_assets`, `export_video` | Thumbnails/covers, caption frames, storyboard boards. Already the sanctioned path in `VIDEO_LANDING_PLAN_2026.md` §5 Phase 2 and pairs with the `fpl-analytics-design` skill. Weak as a *video* renderer (prototype export only). | **ADOPT — covers + static frames** |
| **Higgsfield** — via the **CLI**, not the MCP (see §2.1) | 30+ image/video models (Veo, Sora, Kling, Seedance, MiniMax Hailuo, Soul, Cinema Studio) **plus 5 audio models**: Text-to-Speech, Seed Audio 1.0 (SFX from a prompt), Sonilo Music. TTS engines include **ElevenLabs (Eleven v3)**, MiniMax Speech 2.8 HD, VibeVoice, Seed Speech, Cozy Voice — 40+ preset voices, custom clones, 70+ languages | Covers **voiceover, music bed, SFX and cinematic openers on one subscription**. Because Eleven v3 is one of its TTS engines, consolidating here doesn't trade away voice quality. **Must never generate footballer likenesses** (legal constraint). | **ADOPT — whole audio + generative layer** |
| ~~**ElevenLabs MCP**~~ | TTS voiceover, voice cloning, SFX | **Superseded.** Higgsfield exposes Eleven v3 as a TTS engine, so a separate ElevenLabs subscription pays for the same voices twice. | **DROP — redundant** |
| **Playwright** *(project already has `playwright.config.ts` + `tests/`)* | Scripted browser automation with video/trace recording | Free, deterministic **product-in-motion B-roll**: script a run through `/app/league/[id]` → Headlines → Analytics → `/app/squad` → Rival watch, record at 1080×1920 mobile viewport, get identical footage every week with fresh data. Removes the founder from the shoot loop entirely. | **ADOPT — app B-roll capture** |
| **JSON2Video MCP** | Data-driven video from a JSON spec; hosted TTS, subtitles, transitions | Genuine overlap with Remotion but hosted (no render infra). Good **fallback** if Remotion render times on the founder's Windows machine become the constraint. | **HOLD — fallback** |
| **Creatomate MCP** | Template + REST API; thousands of variations from one design; bills per render | Right model for *one template, many leagues* — e.g. auto-generating a personalised recap clip per league. Only worth adding once a per-league video loop exists. | **DEFER — phase 3** |
| **HeyGen MCP** | Avatar video, cloned voice, official remote MCP with OAuth for Claude Code | An AI presenter is a talking head. The research says FPL short-form is *already saturated* with talking heads and FPLRanker's wedge is data drama. Also an authenticity risk. | **REJECT for the core 10** |
| **Notion MCP** *(already connected)* | Databases, pages | Content calendar: one row per video × platform × post date, with status, hook variant, UTM, and the metrics write-back. | **ADOPT — ops layer** |
| **Canva MCP** | Template design | Redundant with Figma, which is already connected and already has the design system. | **REJECT** |

### 2.1 Higgsfield: use the CLI, not the MCP

Higgsfield ships both. They are not equivalent, and for this project the CLI wins.

| | MCP (`https://mcp.higgsfield.ai/mcp`) | CLI (`@higgsfield/cli`) |
|---|---|---|
| Surface | Image gen, video gen, Soul character training, generation history, model selection | Everything the MCP has **plus** `higgsfield voices`, the 5 audio models, `higgsfield model` schema inspection, and job cost/wait/retrieve |
| **Audio / TTS** | **Not exposed as a standalone tool** — audio only appears as a by-product of video workflows | **`higgsfield generate` against the Text-to-Speech / Seed Audio / Sonilo Music models**, returning a downloadable file |
| Long renders | Subject to the 2–6 min agent-timeout problem below | `generate` splits into create → cost → wait → retrieve, so a job handle can be polled |
| Auth | OAuth via claude.ai connector settings; **cannot be completed in a non-interactive session** | `higgsfield auth`, once, in the terminal |
| Claude Code fit | Higgsfield's own docs say **"for Claude Code/Codex it's better to use the CLI"** | Native — Claude drives it through Bash like any other tool |

The decisive point is the middle row: **a standalone voiceover MP3 is exactly what the Remotion
pipeline needs**, and the MCP does not clearly expose one. The CLI does.

**Install (verified available for win32 x64, v1.1.23):**
```bash
npm install -g @higgsfield/cli
higgsfield auth            # one-time browser login, no API key
higgsfield model list      # confirm the audio models are visible
higgsfield voices list     # pick a brand voice, note its ID
```

**Generate a voiceover, then render with it:**
```bash
higgsfield generate --model text-to-speech \
  --input-text "$(cat scripts/fr-08-vo.txt)" --voice <VOICE_ID>
# retrieve the job output, save it to video/public/fr-08-vo.mp3

cd video
npx remotion render FR08Fatigue out/fr-08-60s.mp4 \
  --props='{"variant":"master","voice":"fr-08-vo.mp3","music":"fr-08-bed.mp3"}'
```

Exact flag names vary by CLI version — run `higgsfield model list` then
`higgsfield model show text-to-speech` to read the live parameter schema rather than trusting
these verbatim.

**Wiring is already in place:** `video/src/components/Soundtrack.tsx` mounts `<Audio>` only when a
filename is passed, so renders stay silent and safe until the files exist. Audio files are
gitignored — regenerable, and large.

**The MCP is still worth connecting** for interactive art direction on claude.ai (cinematic hook
openers, cover experiments) — it just isn't the audio path. Authorise it via claude.ai → Settings →
Connectors → add `https://mcp.higgsfield.ai/mcp`. That OAuth flow cannot be completed from a
non-interactive Claude Code session.

### 2.2 AI presenters / "UGC ads" — where the line is

Higgsfield ships a **UGC Ads** product: 40+ synthetic avatars delivering talking-head reviews,
unboxings and tutorials in 9:16, with lip-synced generated voice. It is explicitly marketed as
video "designed to look like organic user-generated content." Tempting, and it's on the
subscription already. Three things decide how it can be used here.

**1. A synthetic person endorsing the product is a fabricated testimonial.** An avatar saying "I use
FPLRanker and it transformed my season" is a made-up endorsement from a person who does not exist.
UK ASA/CAP rules and FTC endorsement guidance both treat fabricated testimonials as deceptive, and
FPLRanker is a UK business advertising itself. **Never generate a synthetic user endorsement.** This
is not a style preference — it is the one use of the feature that is actually out of bounds.

**2. Disclosure is mandatory, and it is visible.** As of March 2026 TikTok requires the built-in
*AI-generated* label on all AI content, synthetic faces explicitly included, enforced on a four-tier
ladder (warning → 7-day posting restriction → 30-day suspension → permanent ban). YouTube requires
disclosure for anything realistic enough to be mistaken for a real person or event; it stays
monetisable when disclosed. Meta requires it for synthetic media. Proactive labelling costs far less
reach than a retroactive flag — so the label is a modest tax, not a blocker, but note the irony:
content whose whole premise is *looking* organic must carry a badge saying it isn't.

**3. It aims at the lane we are deliberately avoiding.** The channel research found FPL short-form
is already saturated with talking-head opinion, and that FPLRanker's wedge is mini-league *data
drama* — the thing no competitor generates automatically. A synthetic presenter walks straight back
into the crowded lane with a worse version of what established creators already do with real faces.

**Verdicts**

| Use | Call |
|---|---|
| Synthetic avatar giving a testimonial / review of FPLRanker | **Never.** Fabricated endorsement. |
| Synthetic presenter narrating verified facts, labelled as AI | **Allowed, not recommended.** Legal when disclosed, but competes in the saturated lane and dilutes the wedge. Test it, don't default to it. |
| AI **b-roll** for the 0–3s hook — a reaction, a phone slam, stadium atmosphere; no claimed identity, no speech, no endorsement | **Best use of the subscription.** Buys human-face stopping power for three seconds, then hard-cuts to real data. Still label it. |
| Non-human generative footage — abstract "data storm", motion texture | **Free win.** Strongest hook material with the least disclosure surface. |
| **Real** UGC — actual users posting their own league cards | **The real goal.** The Ambassador tab and OG share cards exist to manufacture exactly this, and the Roast My Strava precedent says it is what actually compounds. |

**If you want to settle it with data rather than argument:** cut one AI-presenter variant of FR-08
against the current data-native master, post both a few days apart, and compare completion and
destination CTR. That is a cheap, honest experiment — the recommendation above is a judgement call,
not a law.

### Known MCP constraint to design around
Video renders take **2–6 minutes** — far longer than an agent session will wait on a synchronous
call. Servers that work either return a **job handle to poll** or stream progress. Build every
render step as: *submit → record job ID → poll → collect*, never as a blocking call. Remotion
sidesteps this entirely by rendering locally in the background (`run_in_background: true`).

---

## 3. The pipeline

```
                 ┌─────────────────────────────────────────────┐
   REAL DATA ───▶│ Playwright: scripted app walkthrough,        │
   (demo league) │ 1080×1920 viewport, video record            │──┐
                 └─────────────────────────────────────────────┘  │
                 ┌─────────────────────────────────────────────┐  │
   BRAND ───────▶│ Figma MCP: cover/thumbnail, caption frames,  │──┤
   (FR-DLS)      │ end card — export via download_assets        │  │
                 └─────────────────────────────────────────────┘  │
                 ┌─────────────────────────────────────────────┐  │
   HOOK ────────▶│ Higgsfield MCP: 3s cinematic opener          │──┤
                 │ (no likenesses) — poll job, collect MP4      │  │
                 └─────────────────────────────────────────────┘  ├──▶ REMOTION
                 ┌─────────────────────────────────────────────┐  │    <Composition>
   VOICE ───────▶│ ElevenLabs MCP: VO track + stings           │──┤    assembles,
                 └─────────────────────────────────────────────┘  │    burns captions,
                 ┌─────────────────────────────────────────────┐  │    renders MP4
   LIVE STATS ──▶│ FPL API via src/services/fpl-api.ts →        │──┘    per platform
                 │ props passed straight into the composition   │
                 └─────────────────────────────────────────────┘
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │ Renders: 9:16 60s (TikTok/Reels)  │
                    │          9:16 40s (Shorts)        │
                    │          1:1 covers, 9:16 covers  │
                    │          10s silent GIF (outreach)│
                    └───────────────────────────────────┘
                                      │
                                      ▼
                    Notion MCP content calendar → manual upload
                              → GA4 UTM write-back
```

### Why Remotion assembles rather than CapCut
- The rank-race, the headline cards and the stat counters are **the app's own React components**.
  Re-drawing them in a timeline editor guarantees brand drift and hand-work every week.
- Captions are burned from the script string — no manual subtitle timing.
- One `--props='{"leagueId":123,"gw":1}'` flag re-renders a whole video with this week's data.
- Renders in the background on the founder's machine; no per-render billing.

### Status — the spine is built (2026-08-15)

`video/` exists and works. See [`video/README.md`](../../../../video/README.md).

- Remotion 4 workspace, sibling to the app, own `package.json`/`tsconfig`/`node_modules`.
- Shared components: `Backdrop`, `Caption`, `CounterRoll`, `RiskBar`, `PlayerRow`,
  `MatchBreakdown`, `NationChip`, `EndCard`; Sportify tokens in `src/theme.ts`.
- `src/data.ts` is the single import boundary to the app's data modules — this is what makes the
  "every number is real" gate build-enforced rather than a habit.
- **FR-08 shipped**: 60s master, 40s Shorts cut, 10s silent loop, 1080×1920 cover, all rendered
  from one composition via a `variant` prop.
- Remotion bundles its own FFmpeg — there is no system FFmpeg on the founder's machine, and none
  is needed.

**Two production traps found the hard way, now encoded in the README:**
1. **No emoji in a render.** Headless Chrome on Windows has no colour emoji font — flag emoji
   render as letterboxes, and England's subdivision-tag flag degrades to a grey glyph. Nation
   identity goes through `NationChip` (a short code on a colour) instead.
2. **Check frames before rendering.** `npx remotion still FRxx out/check.png --frame=N` catches
   layout collisions in seconds; a full 60s render is ~2 minutes.

### Remaining setup (each step useful on its own)
1. Add `tests/capture/broll.spec.ts` — a Playwright spec that walks the demo league at
   `viewport: { width: 390, height: 844 }`, `video: 'on'`, with `slowMo` for readable motion.
   Note `playwright.config.ts` has `testDir: './tests/e2e'`, so this needs its own project entry.
2. Authorise **Higgsfield** and **ElevenLabs** MCPs (see §4 — blocked right now).
3. Notion: `Social Content Calendar` database — Video ID, Platform, Post date, Hook variant, UTM,
   Views, CTR, Visits.
4. Figma is **no longer needed for covers** — `FR08Cover` renders as a Remotion `<Still>` from the
   same components and the same data as the video's first frame, which is what stops the cover
   promising a number the video doesn't open on.

---

## 4. Authorisation blockers (as of this session)

These MCP connectors are visible but **not authorised**, so nothing can be generated through them
yet. This session is non-interactive and cannot run the OAuth flow.

| Server | Needed for | How to authorise |
|---|---|---|
| **Higgsfield CLI** | VO, music, SFX, generative openers — **the path that matters** | `npm i -g @higgsfield/cli && higgsfield auth` in a terminal. No OAuth connector needed. |
| **Higgsfield MCP** | Optional: interactive art direction on claude.ai | claude.ai → Settings → Connectors → `https://mcp.higgsfield.ai/mcp`. Not the audio path (§2.1). |
| **Google Drive** | Shared render/asset storage | claude.ai connector settings |
| **Gmail / Google Calendar** | Posting-cadence reminders (optional) | claude.ai connector settings |

Figma and Notion **are** connected and usable now. Remotion and Playwright need no authorisation —
they are local code, so **the pipeline can start today without any of the blocked connectors**,
using Figma covers + Playwright B-roll + Remotion assembly, with silent/captioned videos until VO
is wired in. Captions carry the story anyway (most short-form is watched muted).

---

## 5. Cost / effort model

| Item | Cost | Notes |
|---|---|---|
| Remotion | £0 | OSS licence, under $1M revenue |
| Playwright | £0 | Already in the repo |
| Figma MCP | existing seat | Already connected |
| Higgsfield | one subscription | Covers VO, music, SFX **and** generative openers — replaces the separate ElevenLabs line |
| ~~ElevenLabs~~ | £0 | Dropped — Eleven v3 is available as a Higgsfield TTS engine |
| Music | £0 | Higgsfield Sonilo Music, or the platform's own commercial library at upload |
| **First 10 videos** | **~2–3 Claude sessions** | Session 1: Remotion scaffold + Playwright capture. Session 2: 10 compositions. Session 3: covers + renders |
| **Weekly refresh thereafter** | **~30–45 min** | Re-run capture spec, re-render with new props, upload |

The economics are the point: once the 10 compositions exist, a gameweek's worth of content is a
render command, not a production. That is what makes a 5-posts-per-day cadence survivable for a
solo founder.
