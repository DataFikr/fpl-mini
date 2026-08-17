import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { AppFootage, Redact } from '../components/AppFootage';
import { FR05Cover } from './FR05Cover';
import { C, F, V } from '../theme';
import { ownership, captains, captainPct, mostOwned, topCaptain, eoFloor, CAPTURE } from '../squadcapture';

export const fr05Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR05Props = z.infer<typeof fr05Schema>;

/**
 * FR-05 — "Every team in this league owns him"
 *
 * The brief was BLOCKED on degenerate demo data: a fixed 4/4/4 captaincy split,
 * six players pinned at 100% ownership, and 12/12 managers on no chip. The
 * capture this is cut from is a real league and has a real distribution — one
 * player at 100%, a genuine slope down to a 33% floor, and captaincy spread
 * 4/3/1/1 across nine managers.
 *
 * What it still doesn't have is chip variety: all nine played no chip in GW38.
 * So the brief's chips beat ("who's burned their Wildcard") is cut rather than
 * shown empty — an all-zero row would read as a broken feature.
 *
 * The turn the video is built on is real and is the reason the tab exists: the
 * most-*owned* player and the most-*captained* player are two different people.
 */
/**
 * Rival Watch is on screen from ~25s to ~29s of the capture before the recording
 * scrolls down to the chips row — which is all zeroes and stays cut.
 *
 *   -ss 25.5 -t 3.5 -> fr05-eo.mp4 (106 frames)
 */
const CLIP_EO = { src: 'fr05-eo.mp4', seconds: 106 / 30 };

const BEATS = {
  master: { hook: 4, proof: 9, cliff: 13, captaincy: 15, resolve: 11, end: 8 },
  shorts: { hook: 3, proof: 7, cliff: 0, captaincy: 14, resolve: 9, end: 7 },
  loop: { hook: 3, proof: 0, cliff: 0, captaincy: 5, resolve: 0, end: 2 },
} as const;

export const fr05Duration = (variant: FR05Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.proof + b.cliff + b.captaincy + b.resolve + b.end) * fps;
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
      <Strip text={`ONE MINI-LEAGUE · ${CAPTURE.managers} MANAGERS`} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 138,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        EVERY SINGLE TEAM
        <br />
        IN THIS LEAGUE
        <br />
        OWNS THE SAME MAN.
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: F.display,
          fontSize: 230,
          lineHeight: 0.85,
          color: C.red,
          opacity: slam,
          transform: `scale(${interpolate(slam, [0, 1], [1.45, 1])})`,
          textShadow: `0 0 100px ${C.red}66`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {mostOwned.eo}%
      </div>
      <Caption text="THAT'S NOT A GLOBAL NUMBER." accent="GLOBAL" delay={26} size={62} />
    </AbsoluteFill>
  );
};

/**
 * The footage beat. The Rival Watch subtitle names the real league the capture
 * is of, so it is patched over — see data/README.md on `detail.manager` and
 * private leagues. Coordinates measured in the 960x1380 window.
 */
const Proof: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <AppFootage src={CLIP_EO.src} clipSeconds={CLIP_EO.seconds} seconds={seconds}>
      <Redact
        top={381}
        height={52}
        text={`What the rest of your mini-league is doing in GW${CAPTURE.gameweek} - across ${CAPTURE.managers} managers.`}
        fontSize={22}
      />
    </AppFootage>
    <Strip text="REAL LEAGUE · REAL OWNERSHIP" />
    <Caption text="THIS IS YOUR LEAGUE, NOT THE GAME." accent="YOUR LEAGUE," size={60} delay={16} />
  </AbsoluteFill>
);

const Bar: React.FC<{
  name: string;
  team: string;
  value: number;
  max: number;
  suffix?: string;
  color: string;
  delay: number;
  note?: string;
}> = ({ name, team, value, max, suffix = '%', color, delay, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.7 } });
  const w = interpolate(t, [0, 1], [0, (value / max) * 100]);

  return (
    <div style={{ opacity: Math.min(1, t * 2.2) }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: F.display, fontSize: 62, color: C.white, lineHeight: 1 }}>
          {name}
          <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 26, color: C.dimmer, marginLeft: 14 }}>
            {team}
          </span>
        </span>
        <span
          style={{
            fontFamily: F.display,
            fontSize: 66,
            color,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {Math.round(interpolate(t, [0, 1], [0, value]))}
          {suffix}
        </span>
      </div>
      <div style={{ height: 22, background: 'rgba(250,250,250,.08)' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color }} />
      </div>
      {note && (
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 26, color: C.dim, marginTop: 7 }}>{note}</div>
      )}
    </div>
  );
};

/** The slope: one player everybody has, then a floor six players share. */
const Cliff: React.FC = () => (
  <AbsoluteFill style={{ padding: `${V.safeTop + 20}px 70px ${V.safeBottom + 120}px`, justifyContent: 'center' }}>
    <Strip text="EFFECTIVE OWNERSHIP · TOP 6" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {ownership.map((p, i) => (
        <Bar
          key={p.name}
          name={p.name}
          team={p.team}
          value={p.eo}
          max={ownership[0].eo}
          color={p.eo >= 100 ? C.red : p.eo <= eoFloor ? C.green : C.amber}
          delay={i * 9}
        />
      ))}
    </div>
    <Caption text={`AND THEN IT FLOORS AT ${eoFloor}%.`} accent={`${eoFloor}%.`} accentColor={C.green} size={64} delay={78} />
  </AbsoluteFill>
);

/**
 * The turn. Most owned and most captained are different players, and the tail of
 * the captaincy list is a single manager backing himself.
 */
const Captaincy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = spring({ frame: frame - 96, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop + 20}px 70px ${V.safeBottom + 110}px`, justifyContent: 'center' }}>
      <Strip text={`MOST CAPTAINED · GW${CAPTURE.gameweek}`} color={C.yellow} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {captains.map((c, i) => (
          <Bar
            key={c.name}
            name={c.name}
            team={c.team}
            value={captainPct(c)}
            max={captainPct(captains[0])}
            color={c.count === 1 ? C.green : C.yellow}
            delay={i * 11}
            note={`${c.count} of ${CAPTURE.managers} managers`}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 34,
          padding: '22px 28px',
          background: 'rgba(255,80,80,.12)',
          borderLeft: `6px solid ${C.red}`,
          opacity: turn,
          transform: `translateY(${interpolate(turn, [0, 1], [26, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: 58, color: C.white, lineHeight: 1.02 }}>
          MOST OWNED: <span style={{ color: C.red }}>{mostOwned.name}</span>
          <br />
          MOST CAPTAINED: <span style={{ color: C.yellow }}>{topCaptain.name}</span>
        </div>
      </div>

      <Caption text="ONE OF NINE IS A REAL DIFFERENTIAL." accent="ONE OF NINE" accentColor={C.green} size={56} delay={120} />
    </AbsoluteFill>
  );
};

const Resolve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="WHY GLOBAL OWNERSHIP LIES" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 118,
          lineHeight: 0.94,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        {/* No global manager count on screen: the real figure moves every
            season and nothing in this repo verifies it. The contrast works
            without one. */}
        YOU&rsquo;RE NOT PLAYING
        <br />
        <span style={{ color: C.dimmer }}>THE WHOLE GAME.</span>
        <br />
        YOU&rsquo;RE PLAYING
        <br />
        <span style={{ color: C.red }}>{CAPTURE.managers} PEOPLE.</span>
      </div>
      <Caption text="KNOW WHAT THEY OWN." accent="WHAT THEY OWN." size={70} delay={20} />
    </AbsoluteFill>
  );
};

export const FR05RivalWatch: React.FC<FR05Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const proofFrom = at(b.proof);
  const cliffFrom = at(b.cliff);
  const captaincyFrom = at(b.captaincy);
  const resolveFrom = at(b.resolve);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR05Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.proof > 0 && (
        <Sequence from={proofFrom} durationInFrames={f(b.proof)}>
          <Proof seconds={b.proof} />
        </Sequence>
      )}

      {b.cliff > 0 && (
        <Sequence from={cliffFrom} durationInFrames={f(b.cliff)}>
          <Cliff />
        </Sequence>
      )}

      <Sequence from={captaincyFrom} durationInFrames={f(b.captaincy)}>
        <Captaincy />
      </Sequence>

      {b.resolve > 0 && (
        <Sequence from={resolveFrom} durationInFrames={f(b.resolve)}>
          <Resolve />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM/APP/SQUAD" />
      </Sequence>
    </AbsoluteFill>
  );
};
