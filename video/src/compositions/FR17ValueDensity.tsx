import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { CounterRoll } from '../components/CounterRoll';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR17Cover } from './FR17Cover';
import { C, F, V } from '../theme';
import { WC_FATIGUE, totalMins } from '../data';
import {
  gw,
  hero,
  topXpts,
  swap,
  valueBars,
  maxPpm,
  valueMultiple,
  budgetShare,
  deadlineLabel,
} from '../valuedensity';

export const fr17Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR17Props = z.infer<typeof fr17Schema>;

/**
 * FR-17 — the most expensive point in FPL.
 *
 * The argument is a paradox rather than a take: the app's own projector ranks
 * the hero first in the game *and* worst per million, and both halves are on
 * screen. The `concede` beat exists because of that — it puts his top ranking
 * and his home fixture back up before the CTA. A video that only showed the
 * bad half would be contradicting the destination page it sends people to.
 */
const BEATS = {
  master: { hook: 4, own: 11, value: 15, swap: 15, concede: 10, end: 5 },
  shorts: { hook: 4, own: 8, value: 12, swap: 9, concede: 0, end: 7 },
  loop: { hook: 3, own: 0, value: 5, swap: 0, concede: 0, end: 2 },
} as const;

export const fr17Duration = (variant: FR17Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.own + b.value + b.swap + b.concede + b.end) * fps;
};

/** Haaland's tournament load, from the app's fatigue module (FR-08's source). */
const heroMins = totalMins(WC_FATIGUE.find((p) => p.surname === hero.name)!);

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

/** Beat 1 — two numbers about one player that point opposite ways. */
const Hook: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const roll = Math.round(seconds * fps * 0.22);
  const second = spring({ frame: frame - roll - 8, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text={`GAMEWEEK ${gw} · PROJECTED POINTS`} />

      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <CounterRoll to={hero.xPts} durationInFrames={roll} size={260} suffix="" color={C.yellow} decimals={1} />
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '.14em',
          color: C.white,
          marginTop: 6,
        }}
      >
        HIGHEST IN THE GAME
      </div>

      <div
        style={{
          width: 320,
          height: 2,
          background: 'rgba(250,250,250,.14)',
          margin: '40px 0 34px',
          opacity: second,
        }}
      />

      <div
        style={{
          fontFamily: F.display,
          fontSize: 230,
          lineHeight: 0.82,
          color: C.red,
          textShadow: `0 0 100px ${C.red}55`,
          fontVariantNumeric: 'tabular-nums',
          opacity: second,
          transform: `scale(${interpolate(second, [0, 1], [0.86, 1])})`,
        }}
      >
        {hero.ppm.toFixed(2)}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '.14em',
          color: C.red,
          marginTop: 10,
          opacity: second,
        }}
      >
        POINTS PER £M · WORST OF ANY PREMIUM
      </div>

      <Caption text="BOTH OF THESE ARE TRUE." accent="BOTH" accentColor={C.yellow} delay={roll + 14} />
    </AbsoluteFill>
  );
};

/** Beat 2 — the real Players-tab ranking, with what he costs to sit on top of it. */
const Own: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (seconds * fps * 0.42) / topXpts.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 130}px`, justifyContent: 'center' }}>
      <Strip text={`SORTED BY PROJECTED POINTS · GW${gw}`} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {topXpts.map((p, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 15, mass: 0.6 } });
          const isHero = p.name === hero.name;
          return (
            <div
              key={p.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '19px 24px',
                background: isHero ? 'rgba(255,80,80,.14)' : 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${isHero ? C.red : C.dimmer}`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 48,
                    lineHeight: 1,
                    color: C.white,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 21, color: C.dim, marginTop: 5 }}>
                  {p.team} · {p.pos} · {p.owned}% owned
                </div>
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 52,
                  color: isHero ? C.red : C.dim,
                  width: 150,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                £{p.price.toFixed(1)}m
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 58,
                  color: isHero ? C.yellow : C.white,
                  width: 96,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.xPts.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 34,
          textAlign: 'center',
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 32,
          color: C.dim,
        }}
      >
        {budgetShare}% of a £100m budget · on one player
      </div>

      <Caption
        text={`${hero.owned}% OF THE GAME OWNS HIM.`}
        accent={`${hero.owned}%`}
        accentColor={C.red}
        delay={Math.round(seconds * fps * 0.5)}
      />
    </AbsoluteFill>
  );
};

/** Beat 3 — the interrupt: cheap defenders out-earn him per million. */
const Value: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (seconds * fps * 0.3) / valueBars.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 120}px`, justifyContent: 'center' }}>
      <Strip text="PROJECTED POINTS PER £M" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {valueBars.map((p, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 22, mass: 0.7 } });
          const isHero = p.name === hero.name;
          const col = isHero ? C.red : C.green;
          return (
            <div key={p.name} style={{ opacity: interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' }) }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
                <div style={{ fontFamily: F.display, fontSize: 46, color: C.white }}>
                  {p.name}
                  <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: C.dim, marginLeft: 14 }}>
                    {p.pos} · £{p.price.toFixed(1)}m
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 60,
                    color: col,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {p.ppm.toFixed(2)}
                </div>
              </div>
              <div style={{ height: 30, background: 'rgba(250,250,250,.06)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(p.ppm / maxPpm) * 100 * s}%`,
                    background: col,
                    boxShadow: `0 0 40px ${col}55`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontFamily: F.display,
          fontSize: 86,
          color: C.green,
          lineHeight: 0.95,
        }}
      >
        {valueMultiple}x THE VALUE
      </div>

      <Caption
        text={`A £${valueBars[0].price}M DEFENDER IS WORTH DOUBLE.`}
        accent="WORTH DOUBLE."
        accentColor={C.green}
        delay={Math.round(seconds * fps * 0.55)}
      />
    </AbsoluteFill>
  );
};

/** Beat 4 — the payoff: what his price buys instead, and it clears. */
const Swap: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const inFrom = Math.round(seconds * fps * 0.22);
  const totalFrom = Math.round(seconds * fps * 0.48);
  const changeFrom = Math.round(seconds * fps * 0.66);
  const tTotal = spring({ frame: frame - totalFrom, fps, config: { damping: 200 } });
  const tChange = spring({ frame: frame - changeFrom, fps, config: { damping: 14, mass: 0.6 } });

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 120}px`, justifyContent: 'center' }}>
      <Strip text={`SAME MONEY · GAMEWEEK ${gw}`} />

      {/* Out */}
      <div
        style={{
          padding: '22px 26px',
          background: 'rgba(255,80,80,.12)',
          borderLeft: `6px solid ${C.red}`,
          opacity: t,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: '.14em', color: C.red }}>
            OUT
          </div>
          <div style={{ fontFamily: F.display, fontSize: 62, color: C.white, lineHeight: 1, marginTop: 6 }}>
            {swap.out.name}
          </div>
        </div>
        <div style={{ fontFamily: F.display, fontSize: 58, color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          £{swap.out.price.toFixed(1)}m
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 66,
            color: C.red,
            width: 108,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {swap.out.xPts.toFixed(1)}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontFamily: F.display, fontSize: 56, color: C.dim, margin: '14px 0' }}>
        BUYS
      </div>

      {/* In */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {swap.in.map((p, i) => {
          const s = spring({ frame: frame - inFrom - i * 8, fps, config: { damping: 18, mass: 0.7 } });
          return (
            <div
              key={p.name}
              style={{
                padding: '20px 26px',
                background: 'rgba(124,251,158,.12)',
                borderLeft: `6px solid ${C.green}`,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.display, fontSize: 56, color: C.white, lineHeight: 1 }}>{p.name}</div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 21, color: C.dim, marginTop: 5 }}>
                  {p.team} · {p.pos} · {p.fixture}
                </div>
              </div>
              <div style={{ fontFamily: F.display, fontSize: 52, color: C.white, fontVariantNumeric: 'tabular-nums' }}>
                £{p.price.toFixed(1)}m
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 62,
                  color: C.green,
                  width: 108,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.xPts.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* The sum */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: 40,
          marginTop: 34,
          opacity: tTotal,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 104, color: C.white, lineHeight: 0.9 }}>
            £{swap.cost.toFixed(1)}m
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: '.14em', color: C.dim, marginTop: 8 }}>
            TOTAL COST
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontSize: 104, color: C.green, lineHeight: 0.9 }}>
            {swap.xPts.toFixed(1)}
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: '.14em', color: C.dim, marginTop: 8 }}>
            PROJECTED PTS
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          textAlign: 'center',
          fontFamily: F.display,
          fontSize: 72,
          color: C.yellow,
          opacity: tChange,
          transform: `scale(${interpolate(tChange, [0, 1], [0.88, 1])})`,
        }}
      >
        +{swap.gain.toFixed(1)} PTS · £{swap.change}m LEFT OVER
      </div>

      <Caption
        text={`${swap.xPts.toFixed(1)} POINTS. AND £${swap.change}M LEFT.`}
        accent={`£${swap.change}M LEFT.`}
        accentColor={C.yellow}
        delay={changeFrom + 10}
      />
    </AbsoluteFill>
  );
};

/** Beat 5 — the concession. Without this the video contradicts its own CTA. */
const Concede: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const t2 = spring({ frame: frame - 18, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 60px 150px' }}>
      <Strip text="THE OTHER HALF" color={C.green} />

      <div
        style={{
          fontFamily: F.display,
          fontSize: 108,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        IT STILL RANKS HIM
        <br />
        <span style={{ color: C.yellow }}>FIRST IN THE GAME.</span>
      </div>

      <div style={{ display: 'flex', gap: 22, marginTop: 48, opacity: t2, width: '100%' }}>
        {[
          { v: hero.xPts.toFixed(1), l: 'PROJECTED PTS', col: C.yellow },
          { v: hero.fixture, l: `GAMEWEEK ${gw}`, col: C.green },
          { v: `${heroMins}'`, l: 'WORLD CUP MINS', col: C.amber },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              padding: '26px 14px',
              background: 'rgba(250,250,250,.05)',
              borderTop: `5px solid ${s.col}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: F.display, fontSize: 76, color: s.col, lineHeight: 0.9 }}>{s.v}</div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: '.12em',
                color: C.dim,
                marginTop: 12,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 44,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 34,
          color: C.dim,
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.35,
        }}
      >
        This isn&rsquo;t sell him. It&rsquo;s know what the £{hero.price}m is costing you.
      </div>

      <Caption
        text={`DEADLINE ${deadlineLabel}.`}
        accent={deadlineLabel}
        accentColor={C.red}
        delay={30}
        size={70}
      />
    </AbsoluteFill>
  );
};

export const FR17ValueDensity: React.FC<FR17Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const ownFrom = at(b.own);
  const valueFrom = at(b.value);
  const swapFrom = at(b.swap);
  const concedeFrom = at(b.concede);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR17Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook seconds={b.hook} />
      </Sequence>

      {b.own > 0 && (
        <Sequence from={ownFrom} durationInFrames={f(b.own)}>
          <Own seconds={b.own} />
        </Sequence>
      )}

      {b.value > 0 && (
        <Sequence from={valueFrom} durationInFrames={f(b.value)}>
          <Value seconds={b.value} />
        </Sequence>
      )}

      {b.swap > 0 && (
        <Sequence from={swapFrom} durationInFrames={f(b.swap)}>
          <Swap seconds={b.swap} />
        </Sequence>
      )}

      {b.concede > 0 && (
        <Sequence from={concedeFrom} durationInFrames={f(b.concede)}>
          <Concede />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM/APP/PLAYERS" />
      </Sequence>
    </AbsoluteFill>
  );
};
