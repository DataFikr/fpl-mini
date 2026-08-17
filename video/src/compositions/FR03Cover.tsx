import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { biggestUpset, distinctWinners, months } from '../motm';

const ord = (n: number) => {
  const v = n % 100;
  return ['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th';
};

/**
 * FR-03 cover — the paradox, stated as plainly as possible.
 *
 * Uses the real lowest-ranked monthly winner (6th), not the brief's "dead last".
 * A cover that overstates by five places is the fastest way to lose a data
 * channel's credibility in the replies.
 */
export const FR03Cover: React.FC = () => (
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
        MANAGER OF THE MONTH
      </div>

      <svg
        width={150}
        height={150}
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.yellow}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginTop: 26, filter: `drop-shadow(0 0 40px ${C.yellow}66)` }}
      >
        <path d="M6 4h12v3a6 6 0 0 1-12 0z" />
        <path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" />
        <path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" />
      </svg>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 168,
          lineHeight: 0.88,
          color: C.white,
          textAlign: 'center',
          marginTop: 34,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        {biggestUpset.leagueRank}
        <span style={{ fontSize: 84 }}>{ord(biggestUpset.leagueRank)}</span> IN THE LEAGUE
        <br />
        <span style={{ color: C.yellow }}>AND HE JUST WON</span>
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 40,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        {distinctWinners} different winners in {months.length} months
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
