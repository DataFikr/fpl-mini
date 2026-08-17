import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F } from '../theme';
import { rows, VALIDATION_FROM_GW } from '../predictor';

/**
 * The predictor's real per-gameweek error, drawn across the 2025/26 season.
 *
 * This is the one visual that proves the claim rather than asserting it: the
 * learning model's error falls away from a frozen baseline that stays flat.
 * Lower is better, so a descending line reads correctly without explanation.
 *
 * The line draws progressively — a finished chart is a fact, a drawing chart is
 * a story, and the story is what holds a 15-second beat.
 */
const W = 960;
const H = 430;
const PAD = { l: 84, r: 28, t: 26, b: 54 };

export const LearningCurve: React.FC<{
  /** Frames over which the line draws to full length. */
  drawFrames: number;
  showFrozen?: boolean;
  showValidation?: boolean;
  /**
   * Force a draw progress (0–1), ignoring the frame clock. Stills render at
   * frame 0, where a time-driven draw is still empty — covers must pass 1.
   */
  progressOverride?: number;
}> = ({ drawFrames, showFrozen = true, showValidation = false, progressOverride }) => {
  const frame = useCurrentFrame();
  const progress =
    progressOverride ??
    interpolate(frame, [0, drawFrames], [0, 1], {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    });

  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const maes = rows.map((r) => r.mae);
  const frozens = rows.map((r) => r.frozen_mae);
  const lo = Math.min(...maes, ...frozens) - 0.06;
  const hi = Math.max(...maes, ...frozens) + 0.06;

  const x = (i: number) => PAD.l + (i / (rows.length - 1)) * plotW;
  const y = (v: number) => PAD.t + ((hi - v) / (hi - lo)) * plotH;

  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const learnPath = path(maes);
  const frozenPath = path(frozens);
  const valX = x(VALIDATION_FROM_GW - 1);

  // Gridlines at sensible MAE values.
  const ticks = [0.9, 1.0, 1.1, 1.2, 1.3].filter((t) => t >= lo && t <= hi);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {showValidation && (
        <>
          <rect
            x={valX}
            y={PAD.t}
            width={W - PAD.r - valX}
            height={plotH}
            fill={C.green}
            opacity={0.09}
          />
          <line
            x1={valX}
            x2={valX}
            y1={PAD.t}
            y2={PAD.t + plotH}
            stroke={C.green}
            strokeWidth={2}
            strokeDasharray="7 6"
          />
          <text
            x={valX + 14}
            y={PAD.t + 26}
            fill={C.green}
            fontFamily={F.body}
            fontWeight={800}
            fontSize={21}
            letterSpacing="0.1em"
          >
            NEVER TUNED ON
          </text>
        </>
      )}

      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke={C.hair} strokeWidth={1} />
          <text
            x={PAD.l - 16}
            y={y(t) + 9}
            textAnchor="end"
            fill={C.dimmer}
            fontFamily={F.body}
            fontWeight={700}
            fontSize={24}
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}

      {[1, 10, 20, 30, 38].map((g) => (
        <text
          key={g}
          x={x(g - 1)}
          y={H - PAD.b + 36}
          textAnchor="middle"
          fill={C.dimmer}
          fontFamily={F.body}
          fontWeight={700}
          fontSize={22}
        >
          GW{g}
        </text>
      ))}

      {showFrozen && (
        <path
          d={frozenPath}
          fill="none"
          stroke={C.red}
          strokeWidth={4}
          strokeDasharray="10 8"
          opacity={0.55}
          pathLength={1}
          style={{ strokeDasharray: `${progress} 1`, strokeDashoffset: 0 }}
        />
      )}

      <path
        d={learnPath}
        fill="none"
        stroke={C.green}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{ strokeDasharray: `${progress} 1` }}
      />

      {/* Head of the line — the eye follows the dot, not the path. */}
      {progress > 0.02 && (
        <circle
          cx={x((rows.length - 1) * progress)}
          cy={y(maes[Math.round((rows.length - 1) * progress)])}
          r={11}
          fill={C.green}
          style={{ filter: `drop-shadow(0 0 18px ${C.green})` }}
        />
      )}

      <text
        x={W - PAD.r}
        y={PAD.t - 4}
        textAnchor="end"
        fill={C.dim}
        fontFamily={F.body}
        fontWeight={700}
        fontSize={22}
      >
        prediction error (MAE) · lower is better
      </text>
    </svg>
  );
};
