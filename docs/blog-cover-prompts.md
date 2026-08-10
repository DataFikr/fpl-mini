# Blog cover art — AI image generation prompts

Prompts for the nine `/app/blog` covers. Each is written to survive the three
crops the same file gets put through, and to stay copyright-clean.

---

## 1. Output spec

| | |
|---|---|
| Generate at | **1600 × 900** (16:9) |
| Ship as | `1200px` wide `.webp`, quality 82 |
| Location | `public/images/blog/cover-<slug>.webp` |
| Registry field | `coverImage` + `coverAlt` on the post in `src/content/blog-posts.ts` |

Convert with the same pipeline used for the headline photos:

```js
await sharp(src).resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 82 }).toFile(out);
```

### The safe zone (this is the part that matters)

One file is cropped three ways by `object-fit: cover`:

| Surface | Box | Effective ratio | What gets cut |
|---|---|---|---|
| Index feature | `.hl-hero` 200px tall, full width | ~5.6 : 1 | most of the top and bottom |
| Article hero | `.art-hero` 210px × 760px | ~3.6 : 1 | top and bottom |
| List thumbnail | `.hl-item .ph` 96px wide | ~1.5 : 1 | most of the left and right |

So: **keep the subject inside the central 60% horizontally and the central 55%
vertically.** Anything at an edge is gone in at least one crop.

And because `.hl-hero`/`.art-hero` lay a `rgba(21,0,0,.88)` gradient plus white
title text over the bottom third, **the lower third must be dark and empty** —
put nothing there you would miss.

---

## 2. House style — prefix every prompt with this

Keeping this block identical across all nine is what makes the index read as one
designed set rather than nine stock images.

```
Editorial sports-magazine cover art. Cinematic, high contrast, desaturated
except for one accent colour. Deep warm near-black background (#150000).
Dramatic low-key directional lighting, subtle film grain, shallow depth of
field. Subject centred with generous margin on all sides; bottom third of the
frame dark, empty and unlit. No text, no lettering, no numbers, no logos, no
badges, no crests, no brand marks, no recognisable faces. 16:9.
```

Then append the per-post block, which sets the **subject** and the **accent
colour**. The accent matches that post's category chip, so cover and chip agree:

| Category | Accent | Hex |
|---|---|---|
| Strategy / Analysis | deep navy + red | `#12233F` / `#FF5050` |
| Transfers | emerald green | `#0B7A3B` |
| Tips | violet | `#7A1FA2` |
| Line-ups | burnt orange | `#B4530A` |
| News | crimson | `#8A0F2A` |

### Shared negative prompt

```
text, letters, numbers, watermark, signature, logo, club crest, team badge,
sponsor, brand mark, football kit, replica shirt, jersey, recognisable face,
celebrity likeness, real player, real stadium, cluttered background,
low contrast, washed out, busy edges, subject touching frame edge
```

---

## 3. The nine prompts

Ordered newest first, matching the index.

---

### 1. `gw1-template-without-world-cup-players` · Strategy · 26 Jul 2026
**FPL GW1 Template & World Cup Fatigue Guide 2026/27**

> Concept: the template as a crowd of identical shapes, with the fatigue risk sitting inside it.

```
A tight grid of identical dark mannequin torsos in unmarked plain shirts,
receding into shadow, all facing forward — the "template" squad. One figure
near the centre is lit in cold red and slumped forward, exhausted, breaking the
uniformity. Deep navy and red accents. Fog and volumetric light from above.
```
`coverAlt`: *Identical mannequin figures forming a template squad, one lit red and slumped with fatigue*

---

### 2. `best-new-signings-fpl-2026-27` · Transfers · 26 Jul 2026
**Best New Signings to Buy in FPL 2026/27**

> Concept: arrival. Movement into a new place, without naming anyone.

```
A single unmarked kit bag and a pair of new football boots on a polished dark
tunnel floor, backlit by a bright doorway of emerald green light at the end of
the tunnel. Long shadow stretching toward camera. Emerald green accent, deep
warm black surroundings. Sense of arrival and new beginnings.
```
`coverAlt`: *A new kit bag and boots in a dark tunnel, lit by green light from the doorway ahead*

---

### 3. `best-4-5m-defenders-promoted-teams-2026-27` · Tips · 26 Jul 2026
**Best £4.0m Defenders: Promoted-Team Budget Enablers**

> Concept: cheap materials doing a defensive job — value and blocking in one image.

```
A defensive wall of five plain concrete blocks standing on a dark pitch,
photographed low and head-on, lit from one side in violet. Simple, brutalist,
unglamorous — deliberately cheap-looking material rendered heroically. Violet
accent on deep warm black. Mist at ground level.
```
`coverAlt`: *Five plain concrete blocks forming a defensive wall, lit in violet on a dark pitch*

---

### 4. `fpl-gw1-team-reveals-2026-27` · Line-ups · 26 Jul 2026
**FPL GW1 Team Reveals: Official Scout Pick + Creator Drafts**

> Concept: the tactics board — the one object that means "line-up" instantly.

```
Overhead top-down view of a dark tactics board with eleven plain magnetic discs
arranged in a 4-4-2 formation, glowing burnt orange from beneath. Chalk-dust
texture, a few faint arrow scuffs, no writing. Shot straight down, centred,
generous dark margin. Burnt orange accent on deep warm black.
```
`coverAlt`: *Overhead tactics board with eleven glowing discs arranged in a formation*

---

### 5. `best-fpl-tools-2026-27` · Strategy · 26 Jul 2026
**Top 5 Fantasy Premier League Tools for 2026/27**

> Concept: instruments laid out — a toolkit, not a screenshot.

```
Five precision instruments — calipers, a compass, a magnifying glass, a slide
rule, a stopwatch — arranged in a neat fan on dark slate, shot from above,
rim-lit in red against deep navy shadow. Museum-catalogue styling, immaculate,
evenly spaced, centred with wide dark margins. Deep navy and red accents.
```
`coverAlt`: *Five precision measuring instruments arranged in a fan on dark slate*

---

### 6. `how-to-rank-your-fpl-mini-league` · Strategy · 20 Jul 2026
**How to Rank Your FPL Mini-League and Win the Bragging Rights**

> Concept: ranking made physical — a podium, seen as hierarchy.

```
A minimal three-step podium made of dark brushed metal on a black floor,
photographed from a low three-quarter angle, the top step lit hot red and the
lower two falling into shadow. Empty — no figures. Deep navy background, red
accent, hard rim light, faint haze.
```
`coverAlt`: *An empty three-step metal podium with the top step lit in red*

---

### 7. `world-cup-fatigue` · Analysis · 2 Jun 2026
**World Cup Fatigue Watch: Which FPL Stars Came Back With the Heaviest Legs**

> Concept: accumulated load. Replaces the current stock `world_cup.jpg`.

```
A close, cropped photograph of a lone athlete's legs from the knee down, seated
on a dark bench in an empty tunnel, socks rolled to the ankle, ice pack resting
beside them. Heavy, spent, still. Cold red light raking from one side, deep
shadow everywhere else. No kit markings, no visible face. Deep navy and red.
```
`coverAlt`: *An athlete's tired legs on a bench in an empty tunnel with an ice pack beside them*

---

### 8. `fdr-tools` · Analysis · 17 Feb 2026
**Master Your Long-Term Planning: Top 5 FPL Fixture Difficulty (FDR) Tools**

> Concept: the fixture ticker as a physical object — the green run you are hunting.

```
A three-dimensional grid of small matte tiles floating in dark space, each tile
a flat colour from deep red through amber to bright green, forming a diagonal
run of green tiles sweeping through the centre of the frame. Clean, geometric,
softly lit, subtle reflections. Deep navy void background, generous dark margin
at the edges.
```
`coverAlt`: *A floating grid of red-to-green tiles with a diagonal run of green sweeping through the centre*

---

### 9. `beyond-the-points` · News · 5 Jan 2026
**Beyond the Points: How FPL Ranker Turns Your Mini-League into a Premier League Experience**

> Concept: the amateur game given broadcast treatment — the whole thesis of the post.

```
A single empty broadcast microphone on a stand in the foreground, sharply lit in
crimson, with a softly blurred floodlit amateur pitch far behind it at dusk.
Shallow depth of field, the microphone centred and isolated. Sense of a small
game being given big-time coverage. Crimson accent on deep warm black.
```
`coverAlt`: *A broadcast microphone lit in crimson in front of a blurred floodlit amateur pitch*

---

## 4. Wiring them in

Generating the files is not enough on its own — **`BlogScreen` and `AppArticle`
currently render a hatched CSS placeholder** (`<div className="ph ph--dark">`)
rather than the `coverImage`. Three of the nine posts already set `coverImage`
and it is not displayed anywhere.

To ship these, the placeholders in `BlogScreen.tsx` (feature tile + list tiles)
and `AppArticle.tsx` (article hero) need to render an `<img>` inside `.ph`,
falling back to the current placeholder when `coverImage` is unset. The CSS is
already in place — `.hl-hero .ph img` and `.hl-item .ph img` are styled with
`object-fit: cover`, the same rules the headline photos use.
