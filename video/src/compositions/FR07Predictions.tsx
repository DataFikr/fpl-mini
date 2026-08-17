import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { CounterRoll } from '../components/CounterRoll';
import { LearningCurve } from '../components/LearningCurve';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR07Cover } from './FR07Cover';
import { C, F, V, HEX } from '../theme';
import { summary, rows, fmt, FREE_UNTIL_LABEL, FREE_UNTIL_GW } from '../predictor';

export const fr07Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  /** Frames of static cover held at 0:00 so YouTube can lift it as the thumbnail. */
  coverFrames: z.number().optional(),
});
export type FR07Props = z.infer<typeof fr07Schema>;

/**
 * FR-07 — the AI captain pick.
 *
 * The brief originally planned a "here's who to captain this week" video. That
 * isn't honest pre-season: 2026/27 GW1 hasn't happened, the PlayerPrediction
 * table is empty, and any pick shown would be invented. So the video sells the
 * thing that IS real and verifiable — a 38-gameweek backtest with a held-out
 * validation half — and lets the receipts do the arguing.
 *
 * Every figure comes from scripts/fpl-predictor/out/convergence-v2.json via
 * ../predictor. The brief's old "MAE 1.84 vs 1.95" numbers were wrong.
 */
const BEATS = {
  master: { hook: 3, curve: 15, valid: 14, capture: 13, free: 10, end: 5 },
  shorts: { hook: 3, curve: 11, valid: 0, capture: 11, free: 8, end: 7 },
  loop: { hook: 4, curve: 4, valid: 0, capture: 0, free: 0, end: 2 },
} as const;

export const fr07Duration = (variant: FR07Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.curve + b.valid + b.capture + b.free + b.end) * fps;
};

const Strip: React.FC<{ text: string; color?: string }> = ({ text, color = C.amber }) => (
  <div
    style={{
      position: 'absolute',
      top: V.safeTop - 90,
      left: 70,
      right: 70,
      textAlign: 'center',
      fontFamily: F.body,
      fontWeight: 800,
      fontSize: 25,
      letterSpacing: '.2em',
      color,
    }}
  >
    {text}
  </div>
);

const BigStat: React.FC<{
  value: string;
  label: string;
  color?: string;
  size?: number;
  delay?: number;
}> = ({ value, label, color = C.green, size = 210, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return (
    <div style={{ textAlign: 'center', opacity: t, transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})` }}>
      <div
        style={{
          fontFamily: F.display,
          fontSize: size,
          lineHeight: 0.84,
          color,
          textShadow: `0 0 80px ${color}44`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 27,
          letterSpacing: '.14em',
          color: C.dim,
          marginTop: 14,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Beat 1 — the premise. A claim you can check, not a promise. */
const Hook: React.FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
    <Strip text="THE ONLY FPL QUESTION THAT MATTERS" />
    <div
      style={{
        fontFamily: F.display,
        fontSize: 132,
        lineHeight: 0.9,
        color: C.white,
        textAlign: 'center',
      }}
    >
      &ldquo;WHO DO I<br />
      <span style={{ color: C.amber }}>CAPTAIN?</span>&rdquo;
    </div>
    <div
      style={{
        marginTop: 46,
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 38,
        color: C.dim,
        textAlign: 'center',
      }}
    >
      I let a machine answer it {rows.length} times.
    </div>
    <Caption text={`${rows.length} GAMEWEEKS. ONE MACHINE.`} accent="ONE MACHINE." delay={10} />
  </AbsoluteFill>
);

/** Beat 2 — the receipts. The error falls; the frozen baseline doesn't. */
const Curve: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 55px 150px' }}>
      <Strip text="2025/26 · EVERY GAMEWEEK BACKTESTED" />
      <LearningCurve drawFrames={Math.round(seconds * fps * 0.75)} />
      <div style={{ display: 'flex', gap: 60, marginTop: 44 }}>
        <BigStat value={fmt(summary.mae)} label="LEARNING MODEL" color={C.green} size={140} delay={12} />
        <BigStat value={fmt(summary.frozen_mae)} label="FROZEN BASELINE" color={C.red} size={140} delay={22} />
      </div>
      <Caption text="IT GOT SHARPER EVERY WEEK." accent="EVERY WEEK." accentColor={C.green} delay={30} />
    </AbsoluteFill>
  );
};

/** Beat 3 — the honest test. This is the beat no opinion channel can run. */
const Validation: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 55px 150px' }}>
      <Strip text="THE PART EVERYONE ELSE SKIPS" color={C.green} />
      <LearningCurve drawFrames={Math.round(seconds * fps * 0.3)} showFrozen={false} showValidation />
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 54,
          marginTop: 40,
        }}
      >
        <BigStat value={fmt(summary.mae_h1)} label="GW1–19 · TUNED ON" color={C.dim} size={126} delay={14} />
        <BigStat value={fmt(summary.mae_h2)} label="GW20–38 · NEVER SEEN" color={C.green} size={158} delay={24} />
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 32,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        Lower error on the half it was never tuned on. That&rsquo;s not luck — that&rsquo;s learning.
      </div>
      {/* Accent must be a literal substring of `text` — a trailing period that
          isn't in the sentence silently drops the highlight. */}
      <Caption text="IT NEVER SAW THE SECOND HALF." accent="NEVER SAW" accentColor={C.green} delay={34} />
    </AbsoluteFill>
  );
};

/** Beat 4 — what the accuracy is actually worth in points. */
const Capture: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="WHAT THAT'S WORTH IN POINTS" />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        <CounterRoll
          to={Math.round(summary.capture)}
          durationInFrames={Math.round(seconds * fps * 0.22)}
          size={300}
          suffix="%"
          color={C.amber}
        />
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.14em',
          color: C.dim,
          marginTop: 10,
          textAlign: 'center',
        }}
      >
        OF THE PERFECT XI&rsquo;S POINTS, EVERY WEEK
      </div>

      <div
        style={{
          marginTop: 60,
          padding: '30px 54px',
          background: 'rgba(250,250,250,.05)',
          borderLeft: `6px solid ${C.amber}`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: 118, lineHeight: 0.85, color: C.white }}>
          {summary.captain_avg.toFixed(2)}
        </div>
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: 25,
            letterSpacing: '.14em',
            color: C.dim,
            marginTop: 12,
          }}
        >
          AVG POINTS FROM ITS CAPTAIN PICK
        </div>
      </div>
      <Caption text="83% OF A PERFECT TEAM." accent="83%" accentColor={C.amber} delay={26} />
    </AbsoluteFill>
  );
};

/** Beat 5 — the ask, with a real deadline. */
const Free: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="NORMALLY THE PAID PART" color={C.green} />
      <div
        style={{
          clipPath: HEX,
          background: C.green,
          color: C.ink,
          fontFamily: F.display,
          fontSize: 116,
          lineHeight: 1,
          padding: '30px 90px',
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
          boxShadow: `0 24px 90px ${C.green}44`,
        }}
      >
        FREE
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 96,
          color: C.white,
          marginTop: 40,
          textAlign: 'center',
          lineHeight: 0.92,
        }}
      >
        UNTIL GAMEWEEK {FREE_UNTIL_GW}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: '.1em',
          color: C.amber,
          marginTop: 22,
        }}
      >
        {FREE_UNTIL_LABEL} · THEN IT&rsquo;S PAID
      </div>
      <Caption text={`FREE UNTIL GAMEWEEK ${FREE_UNTIL_GW}.`} accent="FREE" accentColor={C.green} delay={18} />
    </AbsoluteFill>
  );
};

export const FR07Predictions: React.FC<FR07Props> = ({ variant, voice, music, coverFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const b = BEATS[variant];
  const f = (s: number) => Math.round(s * fps);

  // Beats start after the cover lead-in, so the whole timeline shifts together.
  let cursor = coverFrames;
  const at = (s: number) => {
    const from = cursor;
    cursor += f(s);
    return from;
  };

  const hookFrom = at(b.hook);
  const curveFrom = at(b.curve);
  const validFrom = at(b.valid);
  const captureFrom = at(b.capture);
  const freeFrom = at(b.free);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR07Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.curve > 0 && (
        <Sequence from={curveFrom} durationInFrames={f(b.curve)}>
          <Curve seconds={b.curve} />
        </Sequence>
      )}

      {b.valid > 0 && (
        <Sequence from={validFrom} durationInFrames={f(b.valid)}>
          <Validation seconds={b.valid} />
        </Sequence>
      )}

      {b.capture > 0 && (
        <Sequence from={captureFrom} durationInFrames={f(b.capture)}>
          <Capture seconds={b.capture} />
        </Sequence>
      )}

      {b.free > 0 && (
        <Sequence from={freeFrom} durationInFrames={f(b.free)}>
          <Free />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM/PREDICTIONS" />
      </Sequence>
    </AbsoluteFill>
  );
};
