# `video/` — the fpl-content render spine

Remotion workspace that renders the FR-xx social briefs in
[`.claude/skills/fpl-content/references/video-briefs.md`](../.claude/skills/fpl-content/references/video-briefs.md).

Deliberately a **sibling workspace**, not part of the Next.js app: it has its own
`package.json`, `tsconfig.json` and `node_modules`, so nothing here can affect the site build.

## Why Remotion rather than an editor

The compositions import the app's real data module
([`src/app/app/_lib/fatigue-data.ts`](../src/app/app/_lib/fatigue-data.ts)) through
[`src/data.ts`](src/data.ts). That is the whole point: the skill's
"every number on screen is real and current" gate is *enforced by the build* rather than by
someone remembering to check. Correct the data file and the next render is correct — no re-edit.

It also means a gameweek's content is a render command, not a production, which is what makes a
daily posting cadence survivable for one person.

Remotion 4 bundles its own FFmpeg, so no system FFmpeg install is needed (there isn't one on this
machine).

## Commands

```bash
npm install                  # once

npm run studio               # scrub the timeline, tweak beats live
npm run render:fr08          # 60s master  -> out/fr-08-60s.mp4   (TikTok, IG/FB Reels)
npm run render:fr08:shorts   # 40s cut     -> out/fr-08-40s.mp4   (YouTube Shorts)
npm run render:fr08:loop     # 10s silent  -> out/fr-08-loop.mp4  (outreach)
npm run render:fr08:cover    # 1080x1920   -> out/fr-08-cover.png (feed cover)
npm run render:fr08:all      # all four
```

Check a single frame without a full render — the fastest way to catch a layout bug:

```bash
npx remotion still FR08Fatigue out/check.png --frame=700
```

`out/` is gitignored. Compositions are source and *are* tracked; renders never are.

## Variants

One composition, three cuts, driven by the `variant` prop and the `BEATS` table in
[`src/compositions/FR08Fatigue.tsx`](src/compositions/FR08Fatigue.tsx):

| variant | length | beats | where it goes |
|---|---|---|---|
| `master` | 60s | hook · list · expand · high-risk · low-risk · end | TikTok, Reels |
| `shorts` | 40s | drops the expand beat | YouTube Shorts — partial views are a negative signal there, so a denser cut is safer |
| `loop` | 10s | hook · high-risk · end | silent outreach clip |

`calculateMetadata` in [`src/Root.tsx`](src/Root.tsx) derives `durationInFrames` from the variant,
so the timeline length follows the props automatically.

## Screen-capture footage (FR-05, FR-06, FR-10)

Most compositions render natively. Two beats per video in FR-05/FR-06 use real recordings of the
app, because "here is the actual screen" is a claim a re-render can't make.

Captures live outside the repo in `C:\Users\Family\Videos\Captures\` and are trimmed into
`public/` as constant-30fps clips. The originals are ~15fps **variable**, which makes per-frame
seeking slow and jittery, so never point `OffthreadVideo` at one directly:

```bash
npx remotion ffmpeg -ss 15.0 -t 3.0 -i "/c/Users/Family/Videos/Captures/fplranker_planner.mp4" \
  -r 30 -vf "scale=960:1380" -c:v libx264 -crf 20 -pix_fmt yuv420p -an public/fr06-gw38.mp4 -y
```

Two things that cost real time on the first build, both worth knowing:

- **Verify trim bounds with exact `-ss` seeks.** Extracting a contact sheet with `-r 1` or
  `-r 0.3333` drifts cumulatively on these VFR files — the first pass put the tab boundaries 3–4
  seconds late, and a clip that runs long shows the wrong card or the *next tab entirely*.
  Always check the trimmed clip's own tail (`-sseof -0.15`) before building against it.
- **The recordings scroll back to the top** before switching tabs, so the useful window for a given
  card is narrower than the tab's window.

`components/AppFootage.tsx` seats a clip between the caption safe areas and carries `Redact`, which
patches a strip of app UI with the app's own background — used to cover the one line naming the
real private league the captures are of. See `src/data/README.md` on that constraint.

## Adding the next brief (FR-01 … FR-10)

1. New file in `src/compositions/`, following `FR08Fatigue.tsx`: a `BEATS` table, one component
   per beat, `<Sequence>` per beat.
2. Reuse `components/` — `Backdrop`, `Caption`, `CounterRoll`, `RiskBar`, `PlayerRow`,
   `MatchBreakdown`, `NationChip`, `EndCard`. Add to `components/`, not inside a composition.
3. Register a `<Composition>` (and a `<Still>` for the cover) in `src/Root.tsx`.
4. Add `render:frNN*` scripts to `package.json`.

## House rules baked in

- **No player or manager photography, no broadcast footage** (Jul 2026 legal review). Club and
  nation identity is a short code on a colour — see `components/NationChip.tsx`.
- **No emoji.** Headless Chrome on Windows has no colour emoji font: 🇳🇴 renders as letterboxes and
  England's flag degrades to a grey glyph. Every emoji in a render is a silent failure.
- **Captions carry the story** — most short-form is watched muted, so a render with no voiceover
  must still land. Safe areas are 220px top / 320px bottom (`src/theme.ts`).
- **Palette** mirrors `src/app/app/_styles/sportify-fpl.css`, with one deliberate divergence:
  video green is `#7CFB9E` (the OG card's dark-ground green), not the system `#009C54`, which goes
  muddy on ink under compression.
