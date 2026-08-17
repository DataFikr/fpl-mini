import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { hitWeek, gross, net } from '../squadcapture';

/**
 * FR-06 cover — the arithmetic, and nothing else.
 *
 * The whole proposition is legible from three numbers at thumbnail size: a gain,
 * a hit, and the negative it leaves behind. No player names, no UI chrome.
 */
export const FR06Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '230px 60px 300px' }}>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.2em',
          color: C.amber,
        }}
      >
        GW{hitWeek.gw} · {hitWeek.transfers} TRANSFERS
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 30,
          marginTop: 40,
          fontFamily: F.display,
          fontSize: 170,
          lineHeight: 0.9,
          color: C.white,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ color: C.green }}>+{gross(hitWeek)}</span>
        <span style={{ color: C.dimmer }}>-</span>
        <span style={{ color: C.red }}>{hitWeek.hit}</span>
      </div>

      <div
        style={{
          width: 520,
          height: 5,
          background: C.hair,
          margin: '26px 0 10px',
        }}
      />

      <div
        style={{
          fontFamily: F.display,
          fontSize: 400,
          lineHeight: 0.82,
          color: C.red,
          textShadow: `0 0 120px ${C.red}55`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {net(hitWeek)}
      </div>

      <div
        style={{
          fontFamily: F.display,
          fontSize: 116,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          // The 400px net figure runs on a 0.82 line-height; without this the
          // headline's cap-line collides with the digit's baseline.
          marginTop: 44,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        THE HIT ATE
        <br />
        <span style={{ color: C.red }}>THE GAIN</span>
      </div>

      <div
        style={{
          marginTop: 34,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        It grades every transfer you&rsquo;ve made
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
