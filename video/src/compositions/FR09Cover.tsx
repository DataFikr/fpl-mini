import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { hero, season, differentials } from '../differentials';

/**
 * FR-09 cover — the two numbers that shouldn't sit together.
 *
 * Ownership and return, side by side, with nothing else competing. The whole
 * proposition is legible at thumbnail size from those two figures alone.
 */
export const FR09Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '240px 60px 300px',
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
        {season} · FINAL OWNERSHIP
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 340,
          lineHeight: 0.82,
          color: C.green,
          marginTop: 26,
          textShadow: `0 0 110px ${C.green}55`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {hero.owned}
        <span style={{ fontSize: 150, color: C.white }}>%</span>
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 128,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          marginTop: 24,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        OWNED HIM.
        <br />
        HE SCORED <span style={{ color: C.green }}>{hero.points}</span>
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        £{hero.price}m · and {differentials.length - 1} more like him
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
