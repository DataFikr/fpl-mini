import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { C, F, HEX } from '../theme';
import { season, LEAGUE } from '../analyticscapture';

/**
 * FR-16 cover — the real position chart, and the two ranks that disagree.
 *
 * An earlier version drew the sawtooth as a hand-traced polyline. That is
 * invented data wearing the label "GW19-38 - LEAGUE POSITION": the shape was
 * eyeballed off the recording, and no viewer could tell. So the cover shows an
 * actual frame of the actual chart instead, cropped to the card.
 *
 * `fr16-chart.png` is frame t=13.0 of fplranker_analytics.mp4 at 960x1380.
 * Regenerate with the ffmpeg command in video/README.md.
 */
const CHART = {
  /** Crop window into the 960x1380 frame, isolating the chart card. */
  x: 50,
  y: 214,
  w: 866,
  // Deep enough to keep the gameweek axis labels — a shorter window sliced them
  // in half and made the chart look broken rather than cropped.
  h: 408,
};

const RealChart: React.FC<{ scale: number }> = ({ scale }) => (
  <div
    style={{
      width: CHART.w * scale,
      height: CHART.h * scale,
      overflow: 'hidden',
      position: 'relative',
      background: '#FFFFFF',
      boxShadow: '0 30px 90px rgba(0,0,0,.7)',
    }}
  >
    <Img
      src={staticFile('fr16-chart.png')}
      style={{
        position: 'absolute',
        left: -CHART.x * scale,
        top: -CHART.y * scale,
        width: 960 * scale,
        height: 1380 * scale,
      }}
    />
  </div>
);

export const FR16Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Backdrop drift={false} />

    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '230px 60px 290px' }}>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.2em',
          color: C.amber,
          marginBottom: 40,
        }}
      >
        GW{LEAGUE.chartFrom}-{LEAGUE.chartTo} · LEAGUE POSITION
      </div>

      <RealChart scale={1.05} />

      <div
        style={{
          fontFamily: F.display,
          fontSize: 138,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          marginTop: 52,
          textShadow: '0 8px 50px rgba(0,0,0,.92)',
        }}
      >
        THE TABLE ONLY
        <br />
        SHOWS YOU
        <br />
        <span style={{ color: C.red }}>THE LAST ONE</span>
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
        Best rank {season.bestRank} · finished {season.finalRank} of {LEAGUE.managers}
      </div>
    </AbsoluteFill>

    <div style={{ position: 'absolute', left: 60, bottom: 140, display: 'flex', alignItems: 'center', gap: 18 }}>
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
