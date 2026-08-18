import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { gw, hero } from '../valuedensity';

/**
 * FR-17 cover — the paradox, as two numbers.
 *
 * Both figures describe the same player in the same gameweek, and they point
 * opposite ways. That contradiction is the whole video, and it has to be
 * readable at ~120px wide, so nothing else competes: gold for the projection,
 * red for what it costs per million.
 */
export const FR17Cover: React.FC = () => (
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
        GAMEWEEK {gw} · PROJECTED
      </div>

      {/* A rule between the two figures: at thumbnail width they otherwise read
          as one number rather than as a contradiction. */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, marginTop: 34 }}>
        {[
          { v: hero.xPts.toFixed(1), l: 'PROJECTED PTS', col: C.yellow, rank: 'HIGHEST IN THE GAME' },
          { v: 'rule' },
          { v: hero.ppm.toFixed(2), l: 'PTS PER £M', col: C.red, rank: 'WORST OF ANY PREMIUM' },
        ].map((s, i) =>
          s.v === 'rule' ? (
            <div key="rule" style={{ width: 3, height: 250, background: 'rgba(250,250,250,.16)', marginBottom: 62 }} />
          ) : (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 236,
                lineHeight: 0.82,
                color: s.col,
                textShadow: `0 0 110px ${s.col}55`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: '.14em',
                color: C.white,
                marginTop: 14,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: '.06em',
                color: s.col,
                marginTop: 8,
              }}
            >
              {s.rank}
            </div>
          </div>
          ),
        )}
      </div>

      {/* Three deliberate lines — letting "WORST VALUE." wrap on its own left an
          orphan that broke the read at thumbnail size. */}
      <div
        style={{
          fontFamily: F.display,
          fontSize: 118,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          marginTop: 56,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        HE&rsquo;S TOP.
        <br />
        HE&rsquo;S ALSO THE
        <br />
        <span style={{ color: C.red }}>WORST VALUE.</span>
      </div>

      <div
        style={{
          marginTop: 38,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.dim,
          textAlign: 'center',
        }}
      >
        £{hero.price}m · {hero.owned}% owned · {hero.fixture}
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
