import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C, F, HEX, riskColor, riskLabel } from '../theme';

/**
 * The 0-100 tournament-load bar with its HIGH/MED/LOW flag.
 *
 * The label snaps in slightly *after* the bar finishes filling — the pause is
 * the payoff. Mirrors the risk chip on /app/fatigue.
 */
export const RiskBar: React.FC<{
  load: number;
  risk: 'hi' | 'md' | 'lo';
  width?: number;
  height?: number;
  showLabel?: boolean;
  delay?: number;
}> = ({ load, risk, width = 620, height = 26, showLabel = true, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const col = riskColor(risk);

  const fill = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 1.1 },
  });

  const labelIn = spring({
    frame: frame - delay - 14,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <div
        style={{
          width,
          height,
          background: 'rgba(250,250,250,.09)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${interpolate(fill, [0, 1], [0, load])}%`,
            height: '100%',
            background: col,
            boxShadow: `0 0 34px ${col}88`,
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            clipPath: HEX,
            background: col,
            color: risk === 'hi' ? C.white : C.ink,
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: '.14em',
            padding: '10px 26px',
            opacity: labelIn,
            transform: `scale(${interpolate(labelIn, [0, 1], [1.5, 1])})`,
          }}
        >
          {riskLabel(risk)}
        </div>
      )}
    </div>
  );
};
