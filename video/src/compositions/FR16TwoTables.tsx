import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { AppFootage, Redact } from '../components/AppFootage';
import { FR16Cover } from './FR16Cover';
import { C, F, V } from '../theme';
import { LEAGUE, season, bestGw, motm, storylines } from '../analyticscapture';

export const fr16Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR16Props = z.infer<typeof fr16Schema>;

/**
 * FR-16 — "Two tables, two different seasons"
 *
 * Combines the two strongest cuts available in `fplranker_analytics.mp4`: the
 * league-position sawtooth on the Analytics tab (A1) and the Manager of the
 * Month card (A3). They belong in one video because they are the same argument
 * from two directions — the season table remembers one number, and everything
 * that actually happened is somewhere else.
 *
 * The sawtooth beat is footage rather than a redraw on purpose: the chart is
 * *interactive*, and scrubbing it drives the rank, the gameweek score, the
 * season total and the highlighted bar below it all at once. No re-render sells
 * that; and a hand-traced polyline of the rank history would be invented data.
 *
 * Names: the MOTM card carries a real manager name, the page title carries the
 * real league name, and the previous-months list peeking in at the bottom
 * carries a second manager name. All three are patched (see `Redact`). The
 * native beats name no manager and no team.
 */

/**
 *   -ss 8.0  -t 6.0 -> fr16-scrub.mp4 (182 frames)  chart scrub, no names in frame
 *   -ss 18.6 -t 2.9 -> fr16-motm.mp4  (89 frames)   MOTM card, three names patched
 *
 * Both windows are scroll-free, which is what lets the patches stay on target;
 * the recording scrolls at ~14.5s and again at ~21.5s, and either would drag a
 * fixed bar off the line it covers.
 */
const CLIP_SCRUB = { src: 'fr16-scrub.mp4', seconds: 182 / 30 };
const CLIP_MOTM = { src: 'fr16-motm.mp4', seconds: 89 / 30 };

const BEATS = {
  master: { hook: 4, scrub: 14, swing: 9, motm: 8, stories: 10, resolve: 7, end: 8 },
  shorts: { hook: 3, scrub: 11, swing: 0, motm: 7, stories: 9, resolve: 2, end: 8 },
  loop: { hook: 3, scrub: 5, swing: 0, motm: 0, stories: 0, resolve: 0, end: 2 },
} as const;

export const fr16Duration = (variant: FR16Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.scrub + b.swing + b.motm + b.stories + b.resolve + b.end) * fps;
};

const Strip: React.FC<{ text: string; color?: string }> = ({ text, color = C.amber }) => (
  <div
    style={{
      position: 'absolute',
      top: V.safeTop - 92,
      left: 70,
      right: 70,
      textAlign: 'center',
      fontFamily: F.body,
      fontWeight: 800,
      fontSize: 25,
      letterSpacing: '.2em',
      color,
      zIndex: 5,
    }}
  >
    {text}
  </div>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const slam = spring({ frame: frame - 18, fps, config: { damping: 12, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text={`${LEAGUE.managers} MANAGERS · ${LEAGUE.season}`} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 140,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        YOUR LEAGUE TABLE
        <br />
        IS HIDING
        <br />
        TWENTY GAMEWEEKS.
      </div>

      <div
        style={{
          marginTop: 46,
          display: 'flex',
          alignItems: 'baseline',
          gap: 26,
          opacity: slam,
          transform: `scale(${interpolate(slam, [0, 1], [1.4, 1])})`,
        }}
      >
        <span style={{ fontFamily: F.display, fontSize: 190, color: C.green, lineHeight: 1 }}>
          {season.bestRank}
          <span style={{ fontSize: 80, color: C.dim }}>nd</span>
        </span>
        <span style={{ fontFamily: F.display, fontSize: 90, color: C.dimmer }}>THEN</span>
        <span style={{ fontFamily: F.display, fontSize: 190, color: C.red, lineHeight: 1 }}>
          {season.finalRank}
          <span style={{ fontSize: 80, color: C.dim }}>rd</span>
        </span>
      </div>
      <Caption text="IT ONLY REMEMBERS THE LAST ONE." accent="THE LAST ONE." delay={26} size={62} />
    </AbsoluteFill>
  );
};

/** The interactive chart. Nothing native can make this point. */
const Scrub: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <AppFootage src={CLIP_SCRUB.src} clipSeconds={CLIP_SCRUB.seconds} seconds={seconds} push={0.04} />
    <Strip text="DRAG THE CHART. EVERY NUMBER MOVES." />
    <Caption
      text={`GW${LEAGUE.chartFrom} TO ${LEAGUE.chartTo}. ONE AT A TIME.`}
      accent="ONE AT A TIME."
      size={62}
      delay={16}
    />
  </AbsoluteFill>
);

const Tile: React.FC<{ label: string; value: string; sub?: string; color: string; delay: number }> = ({
  label,
  value,
  sub,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.6 } });

  return (
    <div
      style={{
        flex: 1,
        padding: '28px 26px',
        background: 'rgba(250,250,250,.05)',
        borderLeft: `6px solid ${color}`,
        opacity: t,
        transform: `translateY(${interpolate(t, [0, 1], [30, 0])}px)`,
      }}
    >
      <div style={{ fontFamily: F.display, fontSize: 128, lineHeight: 0.9, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '.12em',
          color: C.dim,
          marginTop: 12,
        }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 26, color: C.dimmer, marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
};

/** The stat tiles the app already computes — all verified, none drawn by hand. */
const Swing: React.FC = () => (
  <AbsoluteFill style={{ padding: `${V.safeTop + 30}px 70px ${V.safeBottom + 130}px`, justifyContent: 'center' }}>
    <Strip text="WHAT THE TABLE LEFT OUT" />
    <div style={{ display: 'flex', gap: 22 }}>
      <Tile label="BEST RANK" value={`${season.bestRank}`} color={C.green} delay={4} />
      <Tile label="AVG / GW" value={`${season.avgPerGw}`} color={C.white} delay={16} />
      <Tile label="CLIMBS" value={`${season.climbs}`} color={C.amber} delay={28} />
    </div>
    <div style={{ display: 'flex', gap: 22, marginTop: 22 }}>
      <Tile
        label="BEST GAMEWEEK"
        value={`${bestGw.gwPoints}`}
        sub={`GW${bestGw.gw} · nearly double the average`}
        color={C.red}
        delay={44}
      />
    </div>
    <Caption text="FOUR CLIMBS. ONE HUGE WEEK." accent="ONE HUGE WEEK." delay={72} size={64} />
  </AbsoluteFill>
);

/**
 * The MOTM card. Three patches, measured in unscaled 931x1340 footage space:
 * the page title (real league name), the winner's manager line, and the
 * previous-months row peeking in at the bottom (a second manager name).
 */
const Motm: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <AppFootage src={CLIP_MOTM.src} clipSeconds={CLIP_MOTM.seconds} seconds={seconds} push={0.03}>
      {/*
        Opaque, not blurred. The grounds were sampled out of a check frame — the
        page is exactly #FAFAFA and the MOTM card exactly #140000 — so a solid
        patch is seamless, where a blurred one left the name faintly legible
        underneath at every opacity that still looked like a blur.
      */}
      {/* Page title — the real league name. */}
      <Redact top={54} left={118} width={370} height={50} text="YOUR MINI-LEAGUE" fontSize={30} color="#2A1010" />
      {/* The winner's manager line, on the dark card. Keeps the gameweek range.
          The name runs to x~590 in footage space; a narrower bar left its tail
          readable. */}
      <Redact
        top={518}
        left={194}
        width={440}
        height={46}
        text={`GW${motm.fromGw} - ${motm.toGw}`}
        fontSize={23}
        bg="#140000"
        color="#B9A9A9"
        mono
      />
      {/* Previous-months list peeking in at the bottom — a second manager name. */}
      <Redact top={1156} height={184} text="" />
    </AppFootage>
    <Strip text={`${motm.month} · MANAGER OF THE MONTH`} color={C.yellow} />
    <Caption text="THERE'S A SECOND TABLE." accent="SECOND TABLE." accentColor={C.yellow} size={66} delay={16} />
  </AbsoluteFill>
);

/** The three storylines, rebuilt at full resolution so the figures read. */
const Stories: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (seconds * fps * 0.42) / storylines.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 70px ${V.safeBottom + 120}px`, justifyContent: 'center' }}>
      <Strip text={`${motm.points} PTS IN FOUR GAMEWEEKS`} color={C.yellow} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {storylines.map((s, i) => {
          const t = spring({ frame: frame - i * step, fps, config: { damping: 15, mass: 0.6 } });
          return (
            <div
              key={s.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '24px 28px',
                background: 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${C.yellow}`,
                opacity: t,
                transform: `translateX(${interpolate(t, [0, 1], [-44, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 96,
                  lineHeight: 0.9,
                  color: C.yellow,
                  minWidth: 190,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s.figure}
              </div>
              <div>
                <div style={{ fontFamily: F.display, fontSize: 58, color: C.white, lineHeight: 1 }}>
                  {s.title.toUpperCase()}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 27, color: C.dim, marginTop: 8, lineHeight: 1.35 }}>
                  {s.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Caption text="IT WRITES THE REASONS TOO." accent="THE REASONS" accentColor={C.yellow} size={62} delay={Math.round(seconds * fps * 0.55)} />
    </AbsoluteFill>
  );
};

const Resolve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="ONE LEAGUE, TWO COMPETITIONS" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 126,
          lineHeight: 0.94,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        THE SEASON TABLE
        <br />
        <span style={{ color: C.dimmer }}>STOPS MOVING.</span>
        <br />
        THE MONTH
        <br />
        <span style={{ color: C.yellow }}>STARTS AGAIN.</span>
      </div>
      <Caption text="PASTE YOUR LEAGUE. SEE BOTH." accent="SEE BOTH." accentColor={C.yellow} size={68} delay={18} />
    </AbsoluteFill>
  );
};

export const FR16TwoTables: React.FC<FR16Props> = ({ variant, voice, music, coverFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const b = BEATS[variant];
  const f = (s: number) => Math.round(s * fps);

  let cursor = coverFrames;
  const at = (s: number) => {
    const from = cursor;
    cursor += f(s);
    return from;
  };

  const hookFrom = at(b.hook);
  const scrubFrom = at(b.scrub);
  const swingFrom = at(b.swing);
  const motmFrom = at(b.motm);
  const storiesFrom = at(b.stories);
  const resolveFrom = at(b.resolve);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR16Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.scrub > 0 && (
        <Sequence from={scrubFrom} durationInFrames={f(b.scrub)}>
          <Scrub seconds={b.scrub} />
        </Sequence>
      )}

      {b.swing > 0 && (
        <Sequence from={swingFrom} durationInFrames={f(b.swing)}>
          <Swing />
        </Sequence>
      )}

      {b.motm > 0 && (
        <Sequence from={motmFrom} durationInFrames={f(b.motm)}>
          <Motm seconds={b.motm} />
        </Sequence>
      )}

      {b.stories > 0 && (
        <Sequence from={storiesFrom} durationInFrames={f(b.stories)}>
          <Stories seconds={b.stories} />
        </Sequence>
      )}

      {b.resolve > 0 && (
        <Sequence from={resolveFrom} durationInFrames={f(b.resolve)}>
          <Resolve />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM" />
      </Sequence>
    </AbsoluteFill>
  );
};
