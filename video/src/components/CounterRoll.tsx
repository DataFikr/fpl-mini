import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F } from '../theme';

/**
 * The 0 -> N minute roll that opens FR-08.
 *
 * This is the reason the beat is rendered natively rather than screen-recorded:
 * a live page just prints the final number, and a number that *arrives* is what
 * holds the first three seconds. Eases out hard so it lands rather than drifts.
 */
export const CounterRoll: React.FC<{
  to: number;
  durationInFrames: number;
  size?: number;
  suffix?: string;
  color?: string;
  /** Decimal places to hold. FR-17 rolls to 5.5, where rounding to 5 would
   *  contradict the same figure shown elsewhere in the same cut. */
  decimals?: number;
}> = ({ to, durationInFrames, size = 340, suffix = "'", color = C.red, decimals = 0 }) => {
  const frame = useCurrentFrame();

  const raw = interpolate(frame, [0, durationInFrames], [0, to], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const value = decimals > 0 ? +raw.toFixed(decimals) : Math.round(raw);

  // A single punch as it lands — the visual full stop on the hook.
  const landed = frame >= durationInFrames;
  const punch = landed
    ? interpolate(frame, [durationInFrames, durationInFrames + 7, durationInFrames + 16], [1.09, 1.0, 1.0], {
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        fontFamily: F.display,
        fontSize: size,
        lineHeight: 0.82,
        color,
        letterSpacing: '-0.01em',
        transform: `scale(${punch})`,
        textShadow: `0 0 90px ${color}55`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      <span style={{ fontSize: size * 0.42, color: C.white }}>{suffix}</span>
    </div>
  );
};
