import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { C } from '../theme';

/**
 * The house ground for every FR-xx video: ink radial, diagonal red brand
 * stripe, amber glow, vignette — the same construction as the shipped
 * public/video/Teaser Thumbnail.html, so covers and frames share a look.
 *
 * The stripe drifts a few pixels across the shot. It reads as almost nothing
 * consciously, but a completely static background is what makes a talking-
 * points video feel like a slideshow.
 */
export const Backdrop: React.FC<{ drift?: boolean }> = ({ drift = true }) => {
  const frame = useCurrentFrame();
  const x = drift ? interpolate(frame, [0, 1800], [0, -90]) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(78% 60% at 34% 26%, ${C.ink2} 0%, ${C.ink} 58%, ${C.inkDeep} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          transform: `translateX(${x}px)`,
          inset: -300,
          background:
            'linear-gradient(114deg, transparent 42%, rgba(255,80,80,.13) 42%, rgba(255,80,80,.13) 49%, transparent 49%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(46% 30% at 72% 26%, rgba(255,179,92,.20), transparent 72%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(120% 70% at 50% 42%, transparent 46%, rgba(5,0,0,.66) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
