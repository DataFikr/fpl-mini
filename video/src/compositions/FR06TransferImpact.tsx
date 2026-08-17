import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { AppFootage } from '../components/AppFootage';
import { FR06Cover } from './FR06Cover';
import { C, F, V } from '../theme';
import { hitWeek, freeWeek, gross, net, outlook } from '../squadcapture';

export const fr06Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR06Props = z.infer<typeof fr06Schema>;

/**
 * FR-06 — "The -4 that ate the gain"
 *
 * The brief was BLOCKED on two counts, both now resolved:
 *
 * 1. It described a feature that doesn't exist — a planner that scores a
 *    transfer *before* you commit. Transfer Impact is retrospective. This cut
 *    sells what the tab actually does: it grades every transfer already made.
 * 2. There was no transfer data at all — the demo generator returned `[]`. The
 *    capture this is built from is a real account with a real history, including
 *    a week where the hit turned a gain negative.
 *
 * The old beat 5 ("I ignored it. I lost eleven points.") was a fabricated
 * personal anecdote and stays deleted. The video's confession is arithmetic that
 * happened, not a story about the founder.
 *
 * Honesty note: GW37 nets -1, and the app badges that **Neutral** (its costly
 * threshold is -8). Nothing here calls it a disaster; the point is that the
 * hit is priced in at all, which is the thing the official site never shows.
 */
/**
 * Trimmed from `fplranker_planner.mp4` to constant 30fps. The bounds matter:
 * Transfer Impact is only on screen from ~13s to ~24.5s of the capture, and the
 * recording scrolls back to the top before the tab changes, so a clip that runs
 * even half a second long shows the wrong card — or, past 25s, the Rival Watch
 * screen and the league's real name.
 *
 *   -ss 15.0 -t 3.0  -> fr06-gw38.mp4   (91 frames)  GW38 card centred
 *   -ss 20.0 -t 2.8  -> fr06-gw37.mp4   (85 frames)  GW37 card centred
 */
const CLIP_38 = { src: 'fr06-gw38.mp4', seconds: 91 / 30 };
const CLIP_37 = { src: 'fr06-gw37.mp4', seconds: 85 / 30 };

const BEATS = {
  master: { hook: 4, proof38: 8, proof37: 9, maths: 15, resolve: 16, end: 8 },
  shorts: { hook: 3, proof38: 6, proof37: 7, maths: 12, resolve: 5, end: 7 },
  loop: { hook: 3, proof38: 0, proof37: 0, maths: 5, resolve: 0, end: 2 },
} as const;

export const fr06Duration = (variant: FR06Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.proof38 + b.proof37 + b.maths + b.resolve + b.end) * fps;
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
  const slam = spring({ frame: frame - 16, fps, config: { damping: 12, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text={`GW${hitWeek.gw} · ${hitWeek.transfers} TRANSFERS`} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 132,
          lineHeight: 0.9,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        IT GRADES EVERY
        <br />
        TRANSFER YOU&rsquo;VE
        <br />
        EVER MADE.
      </div>

      <div
        style={{
          marginTop: 44,
          fontFamily: F.display,
          fontSize: 150,
          color: C.red,
          opacity: slam,
          transform: `scale(${interpolate(slam, [0, 1], [1.5, 1])})`,
          textShadow: `0 0 90px ${C.red}66`,
        }}
      >
        INCLUDING THIS ONE
      </div>
      <Caption text="POINTS IN. POINTS OUT. THE HIT." accent="THE HIT." delay={22} size={64} />
    </AbsoluteFill>
  );
};

const Proof38: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <AppFootage src={CLIP_38.src} clipSeconds={CLIP_38.seconds} seconds={seconds} />
    <Strip text="REAL ACCOUNT · REAL TRANSFERS" />
    <Caption
      text={`GW${freeWeek.gw}: ONE TRANSFER. PLUS ${gross(freeWeek)}.`}
      accent={`PLUS ${gross(freeWeek)}.`}
      accentColor={C.green}
      size={64}
      delay={16}
    />
  </AbsoluteFill>
);

const Proof37: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <AppFootage src={CLIP_37.src} clipSeconds={CLIP_37.seconds} seconds={seconds} />
    <Strip text="THE WEEK IT COST SOMETHING" color={C.red} />
    <Caption
      text={`THEN GW${hitWeek.gw}. TWO MOVES. A -${hitWeek.hit}.`}
      accent={`A -${hitWeek.hit}.`}
      size={64}
      delay={16}
    />
  </AbsoluteFill>
);

/** The payoff: the sum the official site never does for you. */
const Row: React.FC<{ label: string; value: string; color: string; delay: number; big?: boolean }> = ({
  label,
  value,
  color,
  delay,
  big = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.6 } });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        width: '100%',
        opacity: t,
        transform: `translateX(${interpolate(t, [0, 1], [50, 0])}px)`,
      }}
    >
      <span
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: big ? 46 : 40,
          letterSpacing: '.06em',
          color: big ? C.white : C.dim,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: big ? 210 : 128,
          lineHeight: 0.9,
          color,
          fontVariantNumeric: 'tabular-nums',
          textShadow: big ? `0 0 100px ${color}55` : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
};

const Maths: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rule = spring({ frame: frame - 62, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop + 40}px 70px ${V.safeBottom + 120}px`, justifyContent: 'center' }}>
      <Strip text={`GW${hitWeek.gw} · THE ACTUAL SUM`} color={C.red} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Row label="POINTS IN" value={`${hitWeek.inPts}`} color={C.green} delay={4} />
        <Row label="POINTS OUT" value={`${hitWeek.outPts}`} color={C.white} delay={18} />
        <Row label="TRANSFER GAIN" value={`+${gross(hitWeek)}`} color={C.green} delay={34} />
        <Row label="THE HIT" value={`-${hitWeek.hit}`} color={C.red} delay={50} />

        <div
          style={{
            height: 6,
            background: C.red,
            transformOrigin: 'left',
            transform: `scaleX(${rule})`,
            margin: '12px 0 4px',
          }}
        />

        <Row label="NET" value={`${net(hitWeek)}`} color={C.red} delay={72} big />
      </div>

      <Caption text="A GAIN, UNTIL THE HIT." accent="UNTIL THE HIT." delay={92} size={68} />
    </AbsoluteFill>
  );
};

/** What else the card carries — the reason it's worth opening every week. */
const Resolve: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    ['Points in vs points out', 'every gameweek'],
    ['The hit, priced in', 'not hidden'],
    ['Next 5 GWs projected', `${outlook.projectedIn} in · ${outlook.projectedOut} out`],
    ['Price change since buy', outlook.priceChange],
  ];
  const step = (seconds * fps * 0.32) / items.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 70px ${V.safeBottom + 130}px`, justifyContent: 'center' }}>
      <Strip text="EVERY MOVE, VALIDATED" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {items.map(([label, sub], i) => {
          const t = spring({ frame: frame - i * step, fps, config: { damping: 15, mass: 0.6 } });
          return (
            <div
              key={label}
              style={{
                padding: '26px 32px',
                background: 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${C.green}`,
                opacity: t,
                transform: `translateX(${interpolate(t, [0, 1], [-44, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: F.display, fontSize: 66, color: C.white, lineHeight: 1 }}>{label}</div>
              <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 32, color: C.dim, marginTop: 8 }}>
                {sub}
              </div>
            </div>
          );
        })}
      </div>
      <Caption text="THE OFFICIAL SITE SHOWS YOU NONE OF THIS." accent="NONE OF THIS." size={58} delay={Math.round(seconds * fps * 0.45)} />
    </AbsoluteFill>
  );
};

export const FR06TransferImpact: React.FC<FR06Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const proof38From = at(b.proof38);
  const proof37From = at(b.proof37);
  const mathsFrom = at(b.maths);
  const resolveFrom = at(b.resolve);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR06Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.proof38 > 0 && (
        <Sequence from={proof38From} durationInFrames={f(b.proof38)}>
          <Proof38 seconds={b.proof38} />
        </Sequence>
      )}

      {b.proof37 > 0 && (
        <Sequence from={proof37From} durationInFrames={f(b.proof37)}>
          <Proof37 seconds={b.proof37} />
        </Sequence>
      )}

      <Sequence from={mathsFrom} durationInFrames={f(b.maths)}>
        <Maths />
      </Sequence>

      {b.resolve > 0 && (
        <Sequence from={resolveFrom} durationInFrames={f(b.resolve)}>
          <Resolve seconds={b.resolve} />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM/APP/SQUAD" />
      </Sequence>
    </AbsoluteFill>
  );
};
