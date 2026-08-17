import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { CounterRoll } from '../components/CounterRoll';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR09Cover } from './FR09Cover';
import { C, F, V } from '../theme';
import {
  season,
  hero,
  mostOwned,
  heroPpmRank,
  poolSize,
  differentials,
  ownershipMultiple,
  valueMultiple,
  priceGap,
} from '../differentials';

export const fr09Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR09Props = z.infer<typeof fr09Schema>;

/**
 * FR-09 — the differentials nobody owned.
 *
 * Runs on finished 2025/26 data rather than a made-up 2026/27 pick; see
 * src/differentials.ts for why. Every figure is from the bootstrap snapshot.
 */
const BEATS = {
  master: { hook: 3, list: 15, value: 15, rank: 12, cta: 10, end: 5 },
  shorts: { hook: 3, list: 12, value: 11, rank: 0, cta: 7, end: 7 },
  loop: { hook: 3, list: 5, value: 0, rank: 0, cta: 0, end: 2 },
} as const;

export const fr09Duration = (variant: FR09Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.list + b.value + b.rank + b.cta + b.end) * fps;
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

const Chip: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = C.white }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: F.display, fontSize: 96, lineHeight: 0.9, color }}>{value}</div>
    <div
      style={{
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: '.14em',
        color: C.dim,
        marginTop: 10,
      }}
    >
      {label}
    </div>
  </div>
);

/** Beat 1 — the number that shouldn't go with the other number. */
const Hook: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text={`${season} · FINAL OWNERSHIP`} />
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <CounterRoll
          to={hero.owned}
          durationInFrames={Math.round(seconds * fps * 0.2)}
          size={280}
          suffix="%"
          color={C.green}
        />
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.14em',
          color: C.dim,
          marginTop: 4,
        }}
      >
        OWNED HIM
      </div>
      <div style={{ fontFamily: F.display, fontSize: 130, color: C.white, marginTop: 40, lineHeight: 0.9 }}>
        {hero.points} POINTS
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 32, color: C.dim, marginTop: 14 }}>
        {hero.name} · {hero.team} · £{hero.price}m
      </div>
      <Caption text="THE ONES NOBODY OWNED." accent="NOBODY OWNED." accentColor={C.green} delay={12} />
    </AbsoluteFill>
  );
};

/** Beat 2 — it wasn't a fluke. Six of them. */
const List: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (seconds * fps * 0.55) / differentials.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 150}px`, justifyContent: 'center' }}>
      <Strip text="UNDER 2% OWNED · OVER 120 POINTS" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {differentials.map((p, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 15, mass: 0.6 } });
          return (
            <div
              key={p.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '20px 26px',
                background: i === 0 ? 'rgba(124,251,158,.12)' : 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${i === 0 ? C.green : C.dimmer}`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 58,
                  color: C.green,
                  width: 118,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.owned}%
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 50,
                    lineHeight: 1,
                    color: C.white,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: C.dim, marginTop: 5 }}>
                  {p.team} · {p.pos} · £{p.price}m
                </div>
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 62,
                  color: C.white,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.points}
              </div>
            </div>
          );
        })}
      </div>
      <Caption text="SIX OF THEM. ONE SEASON." accent="SIX OF THEM." accentColor={C.green} delay={Math.round(seconds * fps * 0.6)} />
    </AbsoluteFill>
  );
};

/** Beat 3 — the head-to-head that makes the point land. */
const Value: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const t2 = spring({ frame: frame - 16, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 55px 150px' }}>
      <Strip text="THE TEMPLATE vs THE DIFFERENTIAL" />

      <div style={{ display: 'flex', gap: 28, width: '100%', opacity: t }}>
        {[
          { p: mostOwned, col: C.red, tag: 'EVERYONE HAD HIM' },
          { p: hero, col: C.green, tag: 'ALMOST NOBODY DID' },
        ].map(({ p, col, tag }) => (
          <div
            key={p.name}
            style={{
              flex: 1,
              padding: '28px 24px',
              background: 'rgba(250,250,250,.05)',
              borderTop: `6px solid ${col}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 19, letterSpacing: '.12em', color: col }}>
              {tag}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 62, color: C.white, marginTop: 16, lineHeight: 1 }}>
              {p.name}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 92, color: col, marginTop: 20, lineHeight: 0.9 }}>
              {p.owned}%
            </div>
            <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: C.dim, marginTop: 8 }}>
              owned · £{p.price}m
            </div>
            {/* Total points must be on screen next to points-per-million. Value
                alone invites the reading that the differential outscored the
                template — he didn't, he cost a third as much. */}
            <div style={{ fontFamily: F.display, fontSize: 58, color: C.white, marginTop: 18, lineHeight: 0.9 }}>
              {p.points}
            </div>
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 19, letterSpacing: '.12em', color: C.dim, marginTop: 6 }}>
              TOTAL POINTS
            </div>
            <div style={{ height: 2, background: 'rgba(250,250,250,.12)', margin: '20px 0' }} />
            <div style={{ fontFamily: F.display, fontSize: 78, color: C.white, lineHeight: 0.9 }}>{p.ppm}</div>
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: '.12em', color: C.dim, marginTop: 8 }}>
              PTS PER £M
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 54,
          marginTop: 46,
          opacity: t2,
          transform: `scale(${interpolate(t2, [0, 1], [0.9, 1])})`,
        }}
      >
        <Chip label="FEWER OWNERS" value={`${ownershipMultiple}x`} color={C.green} />
        <Chip label="CHEAPER" value={`£${priceGap}m`} color={C.green} />
        <Chip label="MORE VALUE" value={`${valueMultiple}x`} color={C.green} />
      </div>

      <Caption text="SAME GAME. DIFFERENT MATHS." accent="DIFFERENT MATHS." accentColor={C.green} delay={26} />
    </AbsoluteFill>
  );
};

/** Beat 4 — where that value sits in the whole game. */
const Rank: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="BEST VALUE IN THE GAME" />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        <CounterRoll
          to={heroPpmRank}
          durationInFrames={Math.round(seconds * fps * 0.22)}
          size={300}
          suffix=""
          color={C.green}
        />
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 82,
          color: C.white,
          marginTop: 20,
          textAlign: 'center',
          lineHeight: 0.95,
        }}
      >
        OUT OF {poolSize} PLAYERS
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 34,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 880,
          lineHeight: 1.35,
        }}
      >
        Eighth-best points per million of everyone who played a full season. At {hero.owned}% ownership.
      </div>
      <Caption text="HIDING IN PLAIN SIGHT." accent="PLAIN SIGHT." accentColor={C.green} delay={20} />
    </AbsoluteFill>
  );
};

/** Beat 5 — you can find your own. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="FIND YOUR OWN" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 122,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        EVERY PLAYER.
        <br />
        <span style={{ color: C.green }}>EVERY NUMBER.</span>
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
        Ownership, price, form and expected points — sortable, on one page.
      </div>
      <Caption text="FREE. NO SIGNUP." accent="NO SIGNUP." accentColor={C.green} delay={16} />
    </AbsoluteFill>
  );
};

export const FR09Differentials: React.FC<FR09Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const listFrom = at(b.list);
  const valueFrom = at(b.value);
  const rankFrom = at(b.rank);
  const ctaFrom = at(b.cta);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR09Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook seconds={b.hook} />
      </Sequence>

      {b.list > 0 && (
        <Sequence from={listFrom} durationInFrames={f(b.list)}>
          <List seconds={b.list} />
        </Sequence>
      )}

      {b.value > 0 && (
        <Sequence from={valueFrom} durationInFrames={f(b.value)}>
          <Value />
        </Sequence>
      )}

      {b.rank > 0 && (
        <Sequence from={rankFrom} durationInFrames={f(b.rank)}>
          <Rank seconds={b.rank} />
        </Sequence>
      )}

      {b.cta > 0 && (
        <Sequence from={ctaFrom} durationInFrames={f(b.cta)}>
          <Cta />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM/APP/PLAYERS" />
      </Sequence>
    </AbsoluteFill>
  );
};
