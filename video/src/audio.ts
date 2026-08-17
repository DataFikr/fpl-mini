/**
 * Shared audio config for every FR-xx composition.
 *
 * One place to change the bed across the whole channel — swapping the track here
 * and re-rendering updates all four videos, rather than editing each one.
 *
 * Files live in `video/public/` and are gitignored (regenerable, large).
 * Licence: Pixabay Content License — commercial use, no attribution required.
 * See video/README.md for the caveats.
 */

/** Filename in video/public/. Set to '' to render silent. */
export const DEFAULT_MUSIC = 'bed.mp3';

/**
 * Music level. Loud enough to carry a muted-first video that someone happens to
 * watch with sound on; `Soundtrack` ducks this automatically when a voiceover
 * is also present, so the two settings never have to be kept in sync by hand.
 */
export const MUSIC_VOLUME = 0.6;

/** Music level under narration. */
export const MUSIC_VOLUME_UNDER_VOICE = 0.14;

/** Fade lengths in frames (30fps). A hard cut at the end reads as a glitch. */
export const FADE_IN_FRAMES = 18;
export const FADE_OUT_FRAMES = 36;
