import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { RankRace } from '../components/RankRace';
import { C, F, HEX } from '../theme';
import { gameweeks, biggestFaller, fallAmount } from '../rankrace';

/**
 * FR-02 cover.
 *
 * Freezes the race mid-overtake — roughly two thirds through the season, where
 * the leader has already started falling. A static final table wouldn't sell
 * anything; a race caught in motion is the promise.
 */
export const FR02Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '230px 40px 290px',
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
        {gameweeks} GAMEWEEKS · REAL RANKS
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 150,
          lineHeight: 0.88,
          color: C.white,
          textAlign: 'center',
          marginTop: 26,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        HE LED FOR
        <br />
        5 WEEKS. THEN
        <br />
        <span style={{ color: C.red }}>THIS HAPPENED</span>
      </div>

      <div
        style={{
          marginTop: 20,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        {biggestFaller.team} · down {fallAmount} places
      </div>

      {/* Frozen late enough that the fall has actually happened — a cover that
          promises a collapse must show the collapsed table, not the lead. */}
      <div style={{ marginTop: 40, transform: 'scale(0.92)', transformOrigin: 'center top' }}>
        <RankRace raceFrames={1} gwOverride={(gameweeks - 1) * 0.88} />
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
