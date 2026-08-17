import React from 'react';
import { Audio, staticFile, useVideoConfig, interpolate } from 'remotion';
import {
  MUSIC_VOLUME,
  MUSIC_VOLUME_UNDER_VOICE,
  FADE_IN_FRAMES,
  FADE_OUT_FRAMES,
} from '../audio';

/**
 * Optional audio bed — voiceover and/or music, both dropped into `video/public/`.
 *
 * Deliberately optional. Captions carry the story because most short-form is
 * watched muted, so a render with no audio is still shippable; audio is an
 * enhancement, not a dependency. Nothing mounts unless a filename is passed,
 * so a silent render can never break.
 *
 * Music is faded at both ends and ducked automatically when a voiceover is
 * present — a bed that cuts dead on the last frame reads as a broken file, and
 * a bed mixed for music-only will bury narration.
 *
 * A track shorter than the video loops. Trim any long intro out of the file
 * itself before dropping it in: the bed should be at full energy from frame 1,
 * because the first three seconds decide whether the video is watched at all.
 */
export const Soundtrack: React.FC<{
  /** Filename in video/public/, e.g. "fr-08-vo.mp3" */
  voice?: string;
  /** Filename in video/public/, e.g. "bed.mp3" */
  music?: string;
  /** Override the automatic level (0–1). */
  musicVolume?: number;
}> = ({ voice, music, musicVolume }) => {
  const { durationInFrames } = useVideoConfig();

  const peak = musicVolume ?? (voice ? MUSIC_VOLUME_UNDER_VOICE : MUSIC_VOLUME);

  // Fades are clamped so they can never overlap on a very short cut (the 10s
  // outreach loop is only 300 frames).
  const fadeIn = Math.min(FADE_IN_FRAMES, Math.floor(durationInFrames / 3));
  const fadeOut = Math.min(FADE_OUT_FRAMES, Math.floor(durationInFrames / 3));

  const bedVolume = (f: number) =>
    interpolate(
      f,
      [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
      [0, peak, peak, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

  return (
    <>
      {music ? <Audio src={staticFile(music)} volume={bedVolume} loop /> : null}
      {voice ? <Audio src={staticFile(voice)} /> : null}
    </>
  );
};
