import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { C, V } from '../theme';

/**
 * A real screen recording of the app, seated between the caption safe areas.
 *
 * The source captures are 834x1200 (DAR 139:200) — noticeably wider than 9:16.
 * Filling the 1920 height would need a 1.6x upscale and would crop 254px of
 * width, which is exactly the column the xP chips, percentages and action
 * buttons live in. Fitting to width instead leaves the clip 366px short of the
 * frame, with the captions then sitting on white app UI.
 *
 * So the window is the band *between* the safe areas, less the height the burned
 * caption actually occupies: the caption's box starts around y=1562, so a window
 * running to the full 1600 puts app UI underneath white text. 190..1530 clears
 * it, and at the source aspect that is 931px wide — a 1.12x upscale, the
 * sharpest of the three options, with both caption bands left on ink.
 *
 * Clips are pre-trimmed to constant 30fps (the captures are ~15fps variable, and
 * seeking a long VFR file per frame is both slow and jittery). See the `mk`
 * helper in the FR-05/FR-06 build notes.
 */
export const FOOTAGE_TOP = 190;
export const FOOTAGE_H = 1340;
export const FOOTAGE_W = 931;

export const AppFootage: React.FC<{
  /** Filename in video/public/. */
  src: string;
  /** Actual clip length in seconds — used to fit it to the beat. */
  clipSeconds: number;
  /** Beat length in seconds. */
  seconds: number;
  /** Scale beyond the fitted size, for a punch-in. 1 = native fit. */
  zoom?: number;
  /**
   * Slow push-in across the beat, as a scale delta.
   *
   * The clips are 3s of source stretched over a ~9s beat, which plays back at
   * roughly a third speed; on a mostly-static card that reads as a frozen
   * screenshot rather than a recording. A continuous push keeps the frame alive
   * independently of how slowly the source underneath is running.
   */
  push?: number;
  /** Positive moves the visible window down the page (crops the top). */
  offsetY?: number;
  children?: React.ReactNode;
}> = ({ src, clipSeconds, seconds, zoom = 1, push = 0.05, offsetY = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z = zoom + interpolate(frame, [0, seconds * fps], [0, push], { extrapolateRight: 'clamp' });
  const w = FOOTAGE_W * z;
  const h = FOOTAGE_H * z;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: FOOTAGE_TOP,
          left: (V.width - FOOTAGE_W) / 2,
          width: FOOTAGE_W,
          height: FOOTAGE_H,
          overflow: 'hidden',
          background: C.bg,
          boxShadow: '0 40px 130px rgba(0,0,0,.8)',
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          // Fit the clip to the beat rather than cutting it short or freezing.
          playbackRate={clipSeconds / seconds}
          muted
          style={{
            position: 'absolute',
            top: -offsetY - (h - FOOTAGE_H) / 2,
            left: -(w - FOOTAGE_W) / 2,
            width: w,
            height: h,
          }}
        />
        {/*
          Overlays ride the same transform as the video, so a patch pinned to a
          line of app UI stays on it while the push-in runs. Child coordinates
          are therefore in unscaled 931x1340 footage space.
        */}
        <div
          style={{
            position: 'absolute',
            top: -offsetY - (h - FOOTAGE_H) / 2,
            left: -(w - FOOTAGE_W) / 2,
            width: FOOTAGE_W,
            height: FOOTAGE_H,
            transform: `scale(${z})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Covers a strip of the footage and optionally writes replacement text over it.
 *
 * data/README.md forbids putting a `detail.manager` value on screen without the
 * people in that league consenting to appear. The captures are of a real private
 * league, so the lines carrying names are covered here rather than the clips
 * being thrown away. Coordinates are in unscaled footage space (931x1340).
 *
 * The ground defaults to the app's own `--bg` so the patch reads as part of the
 * UI rather than as a censor bar; pass `bg` when patching something that sits on
 * a dark card instead, and match it to that card.
 *
 * A patch only stays on target while the recording underneath is still. Trim to
 * a window with no scroll in it — check the head and tail frames agree — or the
 * bar drifts off the line it is meant to cover.
 */
export const Redact: React.FC<{
  top: number;
  left?: number;
  width?: number;
  height: number;
  text?: string;
  fontSize?: number;
  bg?: string;
  color?: string;
  /** Letter-spaced mono, matching the app's eyebrow type. */
  mono?: boolean;
  /**
   * Blur radius in px. Frosts whatever is underneath instead of painting over
   * it, which needs no colour match and so survives sitting on the dark MOTM
   * card and the light page alike.
   *
   * Belt and braces: a blur alone would leak the name if `backdrop-filter` ever
   * failed to apply, so a translucent scrim of `bg` goes over the top and the
   * radius is set well past the point of legibility. Always eyeball the still.
   */
  blur?: number;
}> = ({
  top,
  left = 0,
  width = FOOTAGE_W,
  height,
  text,
  fontSize = 26,
  bg = C.bg,
  color = '#5B5757',
  mono = false,
  blur = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width,
      height,
      // F2 = 95%. At 80% the underlying name still ghosted through the blur in
      // the FR-16 check frame; the remaining 5% is what lets the patch blend
      // into whatever it sits on instead of reading as a flat sticker.
      background: blur ? `${bg}F2` : bg,
      backdropFilter: blur ? `blur(${blur}px)` : undefined,
      WebkitBackdropFilter: blur ? `blur(${blur}px)` : undefined,
      display: 'flex',
      alignItems: 'center',
      fontFamily: mono ? 'ui-monospace, monospace' : 'system-ui, sans-serif',
      fontWeight: 600,
      fontSize,
      letterSpacing: mono ? '.08em' : undefined,
      color,
    }}
  >
    {text}
  </div>
);
