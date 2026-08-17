# Static assets for Remotion renders

Audio beds live here. Files are **gitignored** (regenerable, large) — the compositions are source,
the media is not.

## Adding the music bed to all four videos

Every composition defaults to the shared bed named in [`../src/audio.ts`](../src/audio.ts)
(`DEFAULT_MUSIC`, currently `bed.mp3`). Drop one file in and every render picks it up — no
per-video flags.

1. **Download a track** from [Pixabay Music](https://pixabay.com/music/) — Pixabay Content License
   allows commercial use with **no attribution required**. Pick something in the
   stadium-drum / sport-trailer register; 60s+ is ideal but shorter loops fine.
2. **Trim any slow intro out of the file itself.** The bed must be at full energy from frame 1 —
   the first three seconds decide whether the video is watched at all, and the composition starts
   the fade-in immediately.
3. Save it as **`video/public/bed.mp3`**.
4. Render everything:
   ```bash
   cd video && npm run render:all
   ```

That produces all four videos × three cuts, each with the bed faded in and out.

### Changing the track or the level

Edit [`../src/audio.ts`](../src/audio.ts) — `DEFAULT_MUSIC`, `MUSIC_VOLUME` (0.6 with no
narration), `MUSIC_VOLUME_UNDER_VOICE` (0.14, applied automatically when a `voice` file is also
passed), and the fade lengths. One edit, all four videos.

### Rendering silent

```bash
npx remotion render FR08Fatigue out/x.mp4 --props=./props/silent.json
```

Any props file with `"music": ""` renders without a bed. **Use a props file, not inline
`--props='{...}'`** — inline JSON quoting is unreliable in Git Bash on Windows.

### If a render fails with a missing asset

`DEFAULT_MUSIC` points at a file that must exist. Either add `video/public/bed.mp3` or set
`DEFAULT_MUSIC = ''` in `src/audio.ts` to go back to silent renders.

## Voiceover

Optional and separate. Generate with the Higgsfield CLI (see
`.claude/skills/fpl-content/references/production-stack.md` §2.1), save to `video/public/`, then:

```bash
npx remotion render FR08Fatigue out/fr-08-60s.mp4 \
  --props=./props/fr08-voice.json    # {"variant":"master","voice":"fr-08-vo.mp3"}
```

The music ducks to `MUSIC_VOLUME_UNDER_VOICE` automatically whenever a voice track is present.

## Verifying audio actually landed

**Do not compare file sizes** — the AAC track is constant-bitrate, so a silent render and a scored
render come out to the identical byte count. Compare hashes, or read the render log:

```bash
npx remotion render FR08Fatigue out/x.mp4 --log=verbose 2>&1 | grep -i "Html5Audio\|asset positions"
```

A working bed shows the file loading from `/public/…` and an `asset positions` entry whose
`volume` array ramps up from ~0 to the configured peak.
