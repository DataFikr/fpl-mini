import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C, F } from '../theme';
import type { WcMatch } from '../data';

/**
 * The match-by-match expand — beat 3, and the beat the 40s Shorts cut drops.
 *
 * Rows stagger in one per ~4 frames so the eye tracks down the list rather
 * than being handed a finished table. Mirrors the accordion on /app/fatigue.
 */
export const MatchBreakdown: React.FC<{
  matches: (WcMatch & { mins: number })[];
  accent?: string;
}> = ({ matches, accent = C.red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div>
      {matches.map((m, i) => {
        const t = spring({
          frame: frame - i * 5,
          fps,
          config: { damping: 200, mass: 0.6 },
        });
        return (
          <div
            key={`${m.md}-${m.oppName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 24px',
              marginBottom: 10,
              background: 'rgba(250,250,250,.045)',
              opacity: t,
              transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 19,
                letterSpacing: '.12em',
                color: m.round ? accent : C.dimmer,
                width: 74,
              }}
            >
              {m.round ?? `MD${m.md}`}
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: F.body,
                fontWeight: 600,
                fontSize: 32,
                color: C.white,
              }}
            >
              {m.oppName}
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 28,
                color: C.dim,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {m.gf}–{m.ga}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 54,
                lineHeight: 0.85,
                color: accent,
                width: 130,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {m.mins}
              <span style={{ fontSize: 26, color: C.dimmer }}>&apos;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
