import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { NationChip } from '../components/NationChip';
import { C, F, HEX, riskLabel } from '../theme';
import { heaviest, totalMins, appearances } from '../data';

/**
 * The 1080x1920 cover, rendered as a Remotion still.
 *
 * Deliberately built from the same components and the same data as the video's
 * first frame — a cover that promises a number the video doesn't open on is the
 * classic short-form bait-and-switch, and it shows up as a swipe-away.
 *
 * The overlay claim is capped at seven words and set large enough to survive
 * being scaled to ~120px wide in a feed.
 */
export const FR08Cover: React.FC = () => {
  const mins = totalMins(heaviest);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop drift={false} />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '150px 60px 240px',
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
          WORLD CUP 2026 · FULL TIME
        </div>

        {/* The number is the whole cover. It has to read at ~120px wide in a feed. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: 26,
            fontFamily: F.display,
            lineHeight: 0.78,
            color: C.red,
            textShadow: `0 0 120px ${C.red}66`,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ fontSize: 460 }}>{mins}</span>
          <span style={{ fontSize: 200, color: C.white, marginTop: 30, marginLeft: 6 }}>&apos;</span>
        </div>

        <div
          style={{
            clipPath: HEX,
            background: C.red,
            color: C.white,
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: '.16em',
            padding: '18px 54px',
            marginTop: 10,
          }}
        >
          {riskLabel(heaviest.risk)} GW1 RISK
        </div>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 140,
            color: C.white,
            marginTop: 54,
            letterSpacing: '.01em',
            lineHeight: 0.9,
          }}
        >
          {heaviest.surname.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <NationChip nation={heaviest.nation} size={24} />
          <span style={{ fontSize: 42, color: C.dim, fontFamily: F.body, fontWeight: 700 }}>
            {heaviest.club} · {appearances(heaviest)} matches
          </span>
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 80,
            fontFamily: F.display,
            fontSize: 152,
            lineHeight: 0.88,
            color: C.white,
            textAlign: 'center',
            textShadow: '0 8px 50px rgba(0,0,0,.92)',
          }}
        >
          DON&apos;T PICK HIM
          <br />
          <span style={{ color: C.red }}>IN GAMEWEEK 1</span>
        </div>
      </AbsoluteFill>

      {/* brand mark, bottom-left, out of the platform's caption zone */}
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
};
