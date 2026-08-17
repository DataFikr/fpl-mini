import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { RankRace, GwCounter } from '../components/RankRace';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR02Cover } from './FR02Cover';
import { C, F, V } from '../theme';
import {
  leagueName,
  gameweeks,
  biggestFaller,
  biggestRiser,
  riseAmount,
  fallAmount,
  fallerLedUntilGw,
  totalRankChanges,
} from '../rankrace';

export const fr02Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  /** Frames of static cover held at 0:00 so YouTube can lift it as the thumbnail. */
  coverFrames: z.number().optional(),
});
export type FR02Props = z.infer<typeof fr02Schema>;

/**
 * FR-02 — the rank race.
 *
 * The bar-chart-race format, applied to the thing it was made for: a season
 * replayed so the standings physically overtake each other. All ranks come from
 * the app's own rankMatrix via video/scripts/capture-fr02.mts.
 *
 * The story is real: the league leader after GW1 fell to 8th, and the team that
 * started 9th finished 2nd. Nothing here is arranged.
 */
const BEATS = {
  master: { hook: 3, race: 22, collapse: 13, comeback: 12, cta: 5, end: 5 },
  shorts: { hook: 3, race: 16, collapse: 9, comeback: 0, cta: 5, end: 7 },
  loop: { hook: 3, race: 5, collapse: 0, comeback: 0, cta: 0, end: 2 },
} as const;

export const fr02Duration = (variant: FR02Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.race + b.collapse + b.comeback + b.cta + b.end) * fps;
};

const Strip: React.FC<{ text: string; color?: string }> = ({ text, color = C.amber }) => (
  <div
    style={{
      position: 'absolute',
      top: V.safeTop - 90,
      left: 70,
      right: 70,
      textAlign: 'center',
      fontFamily: F.body,
      fontWeight: 800,
      fontSize: 25,
      letterSpacing: '.2em',
      color,
    }}
  >
    {text}
  </div>
);

/** Beat 1 — the promise, with the clock already ticking. */
const ord = (n: number) => {
  const v = n % 100;
  const suf = ['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th';
  return suf;
};

const Hook: React.FC<{ raceSeconds: number }> = ({ raceSeconds }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
    <Strip text={`${leagueName.toUpperCase()} · ${gameweeks} GAMEWEEKS`} />
    <div
      style={{
        fontFamily: F.display,
        fontSize: 138,
        lineHeight: 0.9,
        color: C.white,
        textAlign: 'center',
      }}
    >
      A WHOLE SEASON
      <br />
      IN <span style={{ color: C.amber }}>{raceSeconds} SECONDS</span>
    </div>
    <div
      style={{
        marginTop: 44,
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 36,
        color: C.dim,
        textAlign: 'center',
      }}
    >
      {totalRankChanges} rank changes. One league.
    </div>
    <Caption text="WATCH THE LEADER COLLAPSE." accent="COLLAPSE." delay={10} />
  </AbsoluteFill>
);

/** Beat 2 — the race itself. This beat needs no cuts; the motion holds it. */
const Race: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ padding: `${V.safeTop - 30}px 50px ${V.safeBottom + 140}px` }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
        <GwCounter raceFrames={Math.round(seconds * fps * 0.9)} />
      </div>
      <RankRace raceFrames={Math.round(seconds * fps * 0.9)} />
      <Caption text="EVERY GAMEWEEK. REAL RANKS." accent="REAL RANKS." delay={20} />
    </AbsoluteFill>
  );
};

/** Beat 3 — the collapse, named and quantified. */
const Collapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const from = biggestFaller.ranks[0];
  const to = biggestFaller.ranks[biggestFaller.ranks.length - 1];

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="THE COLLAPSE" color={C.red} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 116,
          color: C.white,
          textAlign: 'center',
          lineHeight: 0.92,
          opacity: t,
        }}
      >
        {biggestFaller.team.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 34,
          color: C.dim,
          marginTop: 18,
          textAlign: 'center',
        }}
      >
        Top of the league for the first {fallerLedUntilGw} gameweeks
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 46,
          marginTop: 56,
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 190, lineHeight: 0.85, color: C.dimmer }}>
            {from}
            <span style={{ fontSize: 76 }}>{ord(from)}</span>
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: '.14em', color: C.dim }}>
            GAMEWEEK 1
          </div>
        </div>
        <div style={{ fontFamily: F.display, fontSize: 110, color: C.red }}>&rarr;</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 190, lineHeight: 0.85, color: C.red, textShadow: `0 0 70px ${C.red}55` }}>
            {to}
            <span style={{ fontSize: 76 }}>{ord(to)}</span>
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: '.14em', color: C.red }}>
            GAMEWEEK {gameweeks}
          </div>
        </div>
      </div>

      <Caption text={`${fallAmount} PLACES. NO RECOVERY.`} accent="NO RECOVERY." delay={20} />
    </AbsoluteFill>
  );
};

/** Beat 4 — the inversion. Someone else was climbing the whole time. */
const Comeback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const from = biggestRiser.ranks[0];
  const to = biggestRiser.ranks[biggestRiser.ranks.length - 1];

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="AND THE CLIMB NOBODY NOTICED" color={C.green} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 116,
          color: C.white,
          textAlign: 'center',
          lineHeight: 0.92,
          opacity: t,
        }}
      >
        {biggestRiser.team.toUpperCase()}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 46,
          marginTop: 56,
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 190, lineHeight: 0.85, color: C.dimmer }}>{from}<span style={{ fontSize: 76 }}>{ord(from)}</span></div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: '.14em', color: C.dim }}>
            GAMEWEEK 1
          </div>
        </div>
        <div style={{ fontFamily: F.display, fontSize: 110, color: C.green }}>&rarr;</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 190, lineHeight: 0.85, color: C.green, textShadow: `0 0 70px ${C.green}55` }}>
            {to}
            <span style={{ fontSize: 76 }}>{ord(to)}</span>
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: '.14em', color: C.green }}>
            GAMEWEEK {gameweeks}
          </div>
        </div>
      </div>
      <Caption text={`UP ${riseAmount} PLACES.`} accent={`${riseAmount} PLACES.`} accentColor={C.green} delay={20} />
    </AbsoluteFill>
  );
};

/** Beat 5 — this is a tab in the app, not an edit. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="THIS ISN'T AN EDIT" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 118,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        IT&rsquo;S THE
        <br />
        <span style={{ color: C.amber }}>ANALYTICS TAB</span>
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 880,
        }}
      >
        Built from your mini-league&rsquo;s real rank history. Any manager, any window.
      </div>
      <Caption text="RUN YOURS. IT'S FREE." accent="IT'S FREE." delay={16} />
    </AbsoluteFill>
  );
};

export const FR02RankRace: React.FC<FR02Props> = ({ variant, voice, music, coverFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const b = BEATS[variant];
  const f = (s: number) => Math.round(s * fps);

  // Beats start after the cover lead-in, so the whole timeline shifts together.
  let cursor = coverFrames;
  const at_ = (s: number) => {
    const from = cursor;
    cursor += f(s);
    return from;
  };

  const hookFrom = at_(b.hook);
  const raceFrom = at_(b.race);
  const collapseFrom = at_(b.collapse);
  const comebackFrom = at_(b.comeback);
  const ctaFrom = at_(b.cta);
  const endFrom = at_(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR02Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook raceSeconds={b.race} />
      </Sequence>

      {b.race > 0 && (
        <Sequence from={raceFrom} durationInFrames={f(b.race)}>
          <Race seconds={b.race} />
        </Sequence>
      )}

      {b.collapse > 0 && (
        <Sequence from={collapseFrom} durationInFrames={f(b.collapse)}>
          <Collapse />
        </Sequence>
      )}

      {b.comeback > 0 && (
        <Sequence from={comebackFrom} durationInFrames={f(b.comeback)}>
          <Comeback />
        </Sequence>
      )}

      {b.cta > 0 && (
        <Sequence from={ctaFrom} durationInFrames={f(b.cta)}>
          <Cta />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM" />
      </Sequence>
    </AbsoluteFill>
  );
};
