import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { mostOwned, CAPTURE } from '../squadcapture';

/**
 * FR-05 cover — one number that only makes sense once you know it's a
 * mini-league figure, not a global one. 167% effective ownership is impossible
 * to read as anything but "everyone, and then some captained him".
 */
export const FR05Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '240px 60px 300px' }}>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.2em',
          color: C.amber,
        }}
      >
        EFFECTIVE OWNERSHIP · {CAPTURE.managers} MANAGERS
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 360,
          lineHeight: 0.82,
          color: C.red,
          marginTop: 22,
          textShadow: `0 0 120px ${C.red}55`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {mostOwned.eo}
        <span style={{ fontSize: 150, color: C.white }}>%</span>
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 124,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          marginTop: 18,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        EVERY TEAM IN
        <br />
        THIS LEAGUE
        <br />
        <span style={{ color: C.red }}>OWNS HIM</span>
      </div>

      <div
        style={{
          marginTop: 36,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        Ownership inside your mini-league, not the game
      </div>
    </AbsoluteFill>

    <div style={{ position: 'absolute', left: 60, bottom: 150, display: 'flex', alignItems: 'center', gap: 18 }}>
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
