import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';

/**
 * FR-10 cover.
 *
 * No stopwatch and no time claim — see the note in FR10Onboarding. The promise
 * on the cover is the one the product can always keep.
 */
export const FR10Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '250px 60px 300px',
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
        THE ENTIRE SIGNUP
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 176,
          lineHeight: 0.86,
          color: C.white,
          textAlign: 'center',
          marginTop: 34,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        NO EMAIL.
        <br />
        NO PASSWORD.
      </div>

      <div
        style={{
          clipPath: HEX,
          background: C.green,
          color: C.ink,
          fontFamily: F.display,
          fontSize: 86,
          padding: '24px 70px',
          marginTop: 48,
          boxShadow: `0 24px 90px ${C.green}44`,
        }}
      >
        JUST YOUR TEAM ID
      </div>

      <div
        style={{
          marginTop: 46,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 40,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        Your squad, league and rivals — free
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
