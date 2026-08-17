import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C, F, HEX } from '../theme';

/**
 * The shared close for every FR-xx video.
 *
 * The brief's loop rule lives here: the card fades its ground back toward the
 * opening frame's composition in the last few frames, so a rewatch doesn't
 * feel like a hard restart. Rewatch rate is a top-three ranking signal.
 */
export const EndCard: React.FC<{ destination?: string }> = ({
  destination = 'FPLRANKER.COM/APP/FATIGUE',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const t = spring({ frame, fps, config: { damping: 200, mass: 0.8 } });
  const sub = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  // Ease back toward the hook's framing for the loop.
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0.86], {
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${out})`,
      }}
    >
      <div
        style={{
          clipPath: HEX,
          background: C.red,
          width: 190,
          height: 168,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.display,
          fontSize: 62,
          color: C.white,
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.7, 1])})`,
          boxShadow: `0 24px 90px ${C.red}66`,
        }}
      >
        FR
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 96,
          color: C.white,
          marginTop: 46,
          letterSpacing: '.02em',
          opacity: t,
        }}
      >
        {destination}
      </div>

      <div
        style={{
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 34,
          color: C.dim,
          marginTop: 22,
          opacity: sub,
        }}
      >
        Free · No signup · Just your Team ID
      </div>
    </AbsoluteFill>
  );
};
