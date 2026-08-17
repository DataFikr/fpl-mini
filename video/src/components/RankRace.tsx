import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F } from '../theme';
import { teams, gameweeks, positionsAt, biggestFaller, biggestRiser, type RaceTeam } from '../rankrace';

/**
 * The bar chart race — the single most-shared data format in short-form video.
 *
 * Rows are positioned by *rank*, not by index, and tween between gameweeks, so
 * teams physically overtake each other. That motion is the whole point: a static
 * final table is a fact, an overtake is a story.
 *
 * Bar length is scaled to cumulative points so the leader's bar grows as the
 * season runs — rank alone would make every row identical width.
 */
const ROW_H = 84;
const GAP = 8;
const LABEL_W = 380;
const BAR_MAX = 470;

const colorFor = (t: RaceTeam) =>
  t.id === biggestFaller.id ? C.red : t.id === biggestRiser.id ? C.green : C.amber;

export const RankRace: React.FC<{
  /** Frames over which the race runs GW1 -> final. */
  raceFrames: number;
  /** Optional fixed gameweek (0-based float) — used by the cover still. */
  gwOverride?: number;
  highlightStory?: boolean;
}> = ({ raceFrames, gwOverride, highlightStory = true }) => {
  const frame = useCurrentFrame();
  const gwFloat =
    gwOverride ??
    interpolate(frame, [0, raceFrames], [0, gameweeks - 1], {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    });

  const snapshot = positionsAt(gwFloat).map((s) => ({ t: s.team, rank: s.rank, points: s.points }));
  const maxPts = Math.max(...snapshot.map((s) => s.points), 1);
  const minPts = Math.min(...snapshot.map((s) => s.points), 0);
  const span = Math.max(1, maxPts - minPts);

  return (
    <div style={{ position: 'relative', height: teams.length * (ROW_H + GAP), width: LABEL_W + BAR_MAX + 190 }}>
      {snapshot.map(({ t, rank, points }) => {
        const y = (rank - 1) * (ROW_H + GAP);
        const col = highlightStory ? colorFor(t) : C.amber;
        const isStory = highlightStory && (t.id === biggestFaller.id || t.id === biggestRiser.id);
        // Scale from the current minimum so the field spreads out visibly rather
        // than every bar sitting at ~90% of the leader.
        const w = 120 + ((points - minPts) / span) * (BAR_MAX - 120);

        return (
          <div
            key={t.id}
            style={{
              position: 'absolute',
              top: y,
              left: 0,
              right: 0,
              height: ROW_H,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 62,
                textAlign: 'right',
                fontFamily: F.display,
                fontSize: 48,
                color: isStory ? col : C.dimmer,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(rank)}
            </div>

            <div
              style={{
                width: LABEL_W - 80,
                fontFamily: F.display,
                fontSize: 42,
                lineHeight: 1,
                color: isStory ? C.white : C.dim,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t.team}
            </div>

            <div
              style={{
                width: w,
                height: 40,
                background: col,
                opacity: isStory ? 1 : 0.42,
                boxShadow: isStory ? `0 0 34px ${col}66` : 'none',
                transition: 'none',
              }}
            />

            <div
              style={{
                fontFamily: F.display,
                fontSize: 46,
                color: isStory ? col : C.dimmer,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {points}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** The GW counter that runs alongside the race — the clock the viewer tracks. */
export const GwCounter: React.FC<{ raceFrames: number; gwOverride?: number }> = ({
  raceFrames,
  gwOverride,
}) => {
  const frame = useCurrentFrame();
  const gwFloat =
    gwOverride ??
    interpolate(frame, [0, raceFrames], [0, gameweeks - 1], {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    });

  return (
    <div
      style={{
        fontFamily: F.display,
        fontSize: 110,
        lineHeight: 1,
        color: C.white,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      GW<span style={{ color: C.amber }}>{Math.floor(gwFloat) + 1}</span>
    </div>
  );
};
