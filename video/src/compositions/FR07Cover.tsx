import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { LearningCurve } from '../components/LearningCurve';
import { C, F, HEX } from '../theme';
import { rows, summary, fmt } from '../predictor';

/**
 * FR-07 cover.
 *
 * The brief's original overlay was "IT PICKED MY CAPTAIN. I'M 2 FOR 2." — a
 * fabricated personal record with nothing behind it. Replaced with the claim the
 * backtest actually supports: a machine answered the captaincy question for a
 * full season, and here is the error curve.
 */
export const FR07Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '250px 50px 300px',
      }}
    >
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.2em',
          color: C.amber,
        }}
      >
        BACKTESTED · 2025/26 SEASON
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 148,
          lineHeight: 0.88,
          color: C.white,
          textAlign: 'center',
          marginTop: 30,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        I LET AN AI PICK
        <br />
        MY <span style={{ color: C.amber }}>CAPTAIN</span>
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 104,
          color: C.green,
          marginTop: 18,
        }}
      >
        {rows.length} TIMES
      </div>

      {/* The curve is the proof, sitting under the claim. */}
      <div style={{ marginTop: 46, opacity: 0.95 }}>
        <LearningCurve drawFrames={1} progressOverride={1} showFrozen showValidation={false} />
      </div>

      <div
        style={{
          marginTop: 30,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        error {fmt(summary.frozen_mae)} &rarr; {fmt(summary.mae)} · {Math.round(summary.capture)}% capture
      </div>
    </AbsoluteFill>

    <div
      style={{
        position: 'absolute',
        left: 60,
        bottom: 150,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          clipPath: HEX,
          background: C.red,
          width: 62,
          height: 55,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.display,
          fontSize: 26,
          color: C.white,
        }}
      >
        FR
      </div>
      <div style={{ fontFamily: F.display, fontSize: 52, color: C.white, letterSpacing: '.02em' }}>
        FPLRANKER<span style={{ color: C.red }}>.COM</span>
      </div>
    </div>
  </AbsoluteFill>
);
