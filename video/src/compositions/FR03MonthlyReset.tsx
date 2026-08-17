import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR03Cover } from './FR03Cover';
import { C, F, V, HEX } from '../theme';
import { months, distinctWinners, biggestUpset, leagueName, WINDOW, seasonGap, leaderSinceGw } from '../motm';
import { finalTable } from '../rankrace';

export const fr03Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  /** Frames of static cover held at 0:00 so YouTube can lift it as the thumbnail. */
  coverFrames: z.number().optional(),
});
export type FR03Props = z.infer<typeof fr03Schema>;

/**
 * FR-03 — Manager of the Month.
 *
 * The retention argument, made with data: the season table calcifies by
 * November, but a 4-gameweek window keeps producing new winners, so people who
 * are out of the title race still have something to play for.
 *
 * Derived from the same capture as FR-02 (see src/motm.ts) using the app's own
 * last-4-gameweeks rule. The brief's original hook was "he's dead last and he
 * just won" — the real data's lowest monthly winner sat 6th, so the video says
 * 6th. Overstating it by five places to keep a punchier line is exactly the
 * kind of thing that gets a data channel called out.
 */
const BEATS = {
  master: { hook: 3, winners: 16, split: 14, why: 12, cta: 10, end: 5 },
  shorts: { hook: 3, winners: 12, split: 10, why: 0, cta: 8, end: 7 },
  loop: { hook: 4, winners: 4, split: 0, why: 0, cta: 0, end: 2 },
} as const;

export const fr03Duration = (variant: FR03Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.winners + b.split + b.why + b.cta + b.end) * fps;
};

const ord = (n: number) => {
  const v = n % 100;
  return ['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th';
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

const Trophy: React.FC<{ size?: number; color?: string }> = ({ size = 96, color = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h12v3a6 6 0 0 1-12 0z" />
    <path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" />
    <path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" />
  </svg>
);

/** Beat 1 — the paradox. Mid-table, and still holding a trophy. */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text={`${leagueName.toUpperCase()} · MANAGER OF THE MONTH`} />
      <div style={{ opacity: t, transform: `scale(${interpolate(t, [0, 1], [0.8, 1])})` }}>
        <Trophy size={130} />
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 148,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          marginTop: 22,
        }}
      >
        {biggestUpset.leagueRank}
        <span style={{ fontSize: 72 }}>{ord(biggestUpset.leagueRank)}</span> IN THE
        <br />
        LEAGUE. <span style={{ color: C.yellow }}>WON THE MONTH.</span>
      </div>
      <Caption text="THE TABLE ISN'T THE ONLY RACE." accent="ONLY RACE." accentColor={C.yellow} delay={12} />
    </AbsoluteFill>
  );
};

/** Beat 2 — a new name nearly every month. */
const Winners: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (seconds * fps * 0.62) / months.length;

  return (
    <AbsoluteFill
      style={{
        padding: `${V.safeTop}px 60px ${V.safeBottom + 150}px`,
        justifyContent: 'center',
      }}
    >
      <Strip text={`EVERY ${WINDOW} GAMEWEEKS, THE TABLE RESETS`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {months.map((m, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 16, mass: 0.6 } });
          const upset = m.leagueRank > 1;
          return (
            <div
              key={m.month}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '22px 30px',
                background: upset ? 'rgba(255,209,0,.10)' : 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${upset ? C.yellow : C.dimmer}`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [50, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: F.body,
                  fontWeight: 800,
                  fontSize: 21,
                  letterSpacing: '.1em',
                  color: C.dim,
                  width: 132,
                }}
              >
                GW{m.fromGw}–{m.toGw}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 52,
                    lineHeight: 1,
                    color: C.white,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {m.team}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: upset ? C.yellow : C.dim, marginTop: 6 }}>
                  {m.leagueRank}{ord(m.leagueRank)} in the league at the time
                </div>
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 62,
                  lineHeight: 0.9,
                  color: upset ? C.yellow : C.dim,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m.points}
              </div>
            </div>
          );
        })}
      </div>
      <Caption
        text={`${distinctWinners} DIFFERENT WINNERS.`}
        accent={`${distinctWinners} DIFFERENT`}
        accentColor={C.yellow}
        delay={Math.round(seconds * fps * 0.66)}
      />
    </AbsoluteFill>
  );
};

/** Beat 3 — one league, two tables. The season calcifies; the month doesn't. */
const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const top5 = finalTable.slice(0, 5);

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 150}px`, justifyContent: 'center' }}>
      <Strip text="ONE LEAGUE · TWO STORIES" />
      <div style={{ display: 'flex', gap: 26, opacity: t }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 23, letterSpacing: '.14em', color: C.dim, marginBottom: 18 }}>
            SEASON TABLE
          </div>
          {top5.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'baseline',
                padding: '16px 18px',
                marginBottom: 10,
                background: 'rgba(250,250,250,.045)',
              }}
            >
              <span style={{ fontFamily: F.display, fontSize: 38, color: C.dimmer }}>{i + 1}</span>
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 34,
                  color: i === 0 ? C.white : C.dim,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.team}
              </span>
            </div>
          ))}
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 24, color: C.dim, marginTop: 14 }}>
            Same leader since GW{leaderSinceGw}.
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 23, letterSpacing: '.14em', color: C.yellow, marginBottom: 18 }}>
            MONTHLY WINNERS
          </div>
          {months.map((m) => (
            <div
              key={m.month}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'baseline',
                padding: '16px 18px',
                marginBottom: 10,
                background: 'rgba(255,209,0,.10)',
              }}
            >
              <span style={{ fontFamily: F.body, fontWeight: 800, fontSize: 19, color: C.yellow, width: 40 }}>
                M{m.month}
              </span>
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 34,
                  color: C.white,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {m.team}
              </span>
            </div>
          ))}
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 24, color: C.yellow, marginTop: 14 }}>
            {distinctWinners} different names.
          </div>
        </div>
      </div>
      <Caption text="THE SEASON STOPS MOVING. THE MONTH DOESN'T." accent="THE MONTH DOESN'T." accentColor={C.yellow} size={62} delay={18} />
    </AbsoluteFill>
  );
};

/** Beat 4 — why it matters. The retention argument, stated plainly. */
const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="WHY IT MATTERS" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 120,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        {seasonGap} POINTS OFF
        <br />
        THE <span style={{ color: C.red }}>TOP?</span>
      </div>
      <div
        style={{
          marginTop: 46,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.35,
          opacity: t,
        }}
      >
        The season table is gone. The next {WINDOW}-gameweek window starts level for everyone.
      </div>
      <Caption text="THIS IS WHY PEOPLE DON'T QUIT." accent="DON'T QUIT." accentColor={C.yellow} delay={18} />
    </AbsoluteFill>
  );
};

/** Beat 5 — where it lives. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="IT RUNS ITSELF" />
      <div
        style={{
          clipPath: HEX,
          background: C.yellow,
          color: C.ink,
          fontFamily: F.display,
          fontSize: 84,
          padding: '26px 76px',
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
          boxShadow: `0 24px 90px ${C.yellow}44`,
        }}
      >
        MOTM TAB
      </div>
      <div
        style={{
          marginTop: 42,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.35,
        }}
      >
        Every mini-league gets one. Nobody has to track it, and nobody can argue with it.
      </div>
      <Caption text="RUN YOURS. IT'S FREE." accent="IT'S FREE." delay={16} />
    </AbsoluteFill>
  );
};

export const FR03MonthlyReset: React.FC<FR03Props> = ({ variant, voice, music, coverFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const b = BEATS[variant];
  const f = (s: number) => Math.round(s * fps);

  // Beats start after the cover lead-in, so the whole timeline shifts together.
  let cursor = coverFrames;
  const at = (s: number) => {
    const from = cursor;
    cursor += f(s);
    return from;
  };

  const hookFrom = at(b.hook);
  const winnersFrom = at(b.winners);
  const splitFrom = at(b.split);
  const whyFrom = at(b.why);
  const ctaFrom = at(b.cta);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR03Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.winners > 0 && (
        <Sequence from={winnersFrom} durationInFrames={f(b.winners)}>
          <Winners seconds={b.winners} />
        </Sequence>
      )}

      {b.split > 0 && (
        <Sequence from={splitFrom} durationInFrames={f(b.split)}>
          <Split />
        </Sequence>
      )}

      {b.why > 0 && (
        <Sequence from={whyFrom} durationInFrames={f(b.why)}>
          <Why />
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
