import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { C, F, V } from '../theme';

/**
 * Burned caption. The story has to survive muted playback — most short-form is
 * watched with the sound off — so these carry the script, not the voiceover.
 *
 * Sits above the bottom safe area so TikTok's caption/CTA chrome never covers
 * it. `accent` words render red to give the eye a landing point.
 */
export const Caption: React.FC<{
  text: string;
  accent?: string;
  accentColor?: string;
  size?: number;
  delay?: number;
}> = ({ text, accent, accentColor = C.red, size = 78, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  const y = (1 - t) * 34;

  const parts = accent ? text.split(new RegExp(`(${accent})`, 'i')) : [text];

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        bottom: V.safeBottom - 40,
        opacity: t,
        transform: `translateY(${y}px)`,
        fontFamily: F.display,
        fontSize: size,
        lineHeight: 0.94,
        letterSpacing: '0.01em',
        color: C.white,
        textAlign: 'center',
        textShadow: '0 8px 46px rgba(0,0,0,.9)',
      }}
    >
      {parts.map((p, i) =>
        accent && p.toLowerCase() === accent.toLowerCase() ? (
          <span key={i} style={{ color: accentColor }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  );
};
