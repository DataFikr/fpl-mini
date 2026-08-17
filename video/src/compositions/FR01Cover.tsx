import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { heroStory, chipTextColor } from '../headlines';

/**
 * FR-01 cover. Same construction rule as FR-08's: built from the same data and
 * the same components as the video's first frame, so the cover can never promise
 * something the opening doesn't deliver.
 */
const tabCut = 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)';

export const FR01Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '260px 60px 300px',
        gap: 10,
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
        AUTO-GENERATED · EVERY GAMEWEEK
      </div>

      {/* The tag chip is the cover. It is the thing nobody else produces. */}
      <div
        style={{
          clipPath: tabCut,
          background: heroStory.tone,
          color: chipTextColor(heroStory.tone),
          fontFamily: F.display,
          fontSize: 128,
          lineHeight: 1,
          letterSpacing: '.02em',
          padding: '30px 90px 30px 46px',
          marginTop: 44,
          boxShadow: `0 26px 100px ${heroStory.tone}55`,
        }}
      >
        {heroStory.tag}
      </div>

      <div
        style={{
          marginTop: 80,
          fontFamily: F.display,
          fontSize: 158,
          lineHeight: 0.88,
          color: C.white,
          textAlign: 'center',
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        YOUR LEAGUE HAS
        <br />
        A <span style={{ color: C.red }}>VILLAIN</span>
      </div>

      <div
        style={{
          marginTop: 34,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 40,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        FPL Ranker finds them for you
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
