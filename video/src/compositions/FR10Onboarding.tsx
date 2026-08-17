import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR10Cover } from './FR10Cover';
import { C, F, V, HEX } from '../theme';

export const fr10Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  coverFrames: z.number().optional(),
});
export type FR10Props = z.infer<typeof fr10Schema>;

/**
 * FR-10 — "No email. No password."
 *
 * The brief's device was a live stopwatch ("ten seconds"). Three capture runs
 * measured the load at 5.7s, 1.9s and 0.7s — the spread is Next dev-server
 * compile state, not the product, and none of it reflects production. A number
 * that swings 8x between runs cannot go on screen as a promise.
 *
 * So the video leads on the claim that is true regardless of network: there is
 * no email, no password and no account. That is a permanent property of the
 * product; a load time is a conditional one.
 *
 * The footage is a real Playwright recording of the real flow
 * (tests/capture/onboarding.spec.ts), not a mockup.
 */
const FOOTAGE = 'fr10-onboarding.webm';
/** Actual recording length. Slowed so a 6.65s clip fills the beat legibly. */
const FOOTAGE_SECONDS = 6.65;

const BEATS = {
  master: { hook: 4, demo: 12, friction: 14, findid: 14, cta: 11, end: 5 },
  shorts: { hook: 3, demo: 10, friction: 11, findid: 0, cta: 9, end: 7 },
  loop: { hook: 3, demo: 5, friction: 0, findid: 0, cta: 0, end: 2 },
} as const;

export const fr10Duration = (variant: FR10Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.demo + b.friction + b.findid + b.cta + b.end) * fps;
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
      zIndex: 5,
    }}
  >
    {text}
  </div>
);

/**
 * The recording is 1170x2532 (19.5:9) with ~20% letterbox at the bottom, inside
 * a 1080x1920 (9:16) frame.
 *
 * Filling the width and cropping vertically was tried first and pushed the
 * Team-ID form — the one thing this beat is about — off the bottom edge. So the
 * phone screen is fitted *inside* the frame instead: nothing is cropped, the
 * whole flow stays visible, and it reads as a device rather than a full-bleed
 * screenshot. `SRC_USABLE_H` trims the recorder's letterbox.
 */
const SRC_W = 1170;
const SRC_USABLE_H = 2532 * 0.79;

const Footage: React.FC<{ seconds: number }> = ({ seconds }) => {
  // Fit the usable region to ~86% of the frame height, leaving room for the
  // strip above and the burned caption below.
  // 0.70 leaves clean ink bands top and bottom so the strip and the burned
  // caption stay legible — at 0.86 both sat on the white app UI and vanished.
  const targetH = V.height * 0.70;
  const scale = targetH / SRC_USABLE_H;
  const dispW = SRC_W * scale;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120, backgroundColor: C.ink }}>
      <div
        style={{
          width: dispW,
          height: targetH,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 40px 120px rgba(0,0,0,.75)',
        }}
      >
        <OffthreadVideo
          src={staticFile(FOOTAGE)}
          playbackRate={FOOTAGE_SECONDS / seconds}
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: dispW,
            height: 2532 * scale,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="THE ENTIRE SIGNUP" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 158,
          lineHeight: 0.88,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        NO EMAIL.
        <br />
        NO PASSWORD.
        <br />
        <span style={{ color: C.green }}>NO ACCOUNT.</span>
      </div>
      <Caption text="JUST YOUR TEAM ID." accent="TEAM ID." accentColor={C.green} delay={14} />
    </AbsoluteFill>
  );
};

const Demo: React.FC<{ seconds: number }> = ({ seconds }) => (
  <AbsoluteFill>
    <Footage seconds={seconds} />
    <Strip text="REAL RECORDING · NOT A MOCKUP" />
    <Caption text="TYPE IT. THAT'S THE WHOLE THING." accent="THAT'S THE WHOLE THING." size={64} delay={16} />
  </AbsoluteFill>
);

/** What you didn't have to do — the friction that isn't there. */
const Friction: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    'No email address',
    'No password',
    'No card details',
    'No app to install',
    'No verification link',
  ];
  const step = (seconds * fps * 0.55) / items.length;

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 70px ${V.safeBottom + 150}px`, justifyContent: 'center' }}>
      <Strip text="WHAT YOU DIDN'T DO" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {items.map((label, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 15, mass: 0.6 } });
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '24px 32px',
                background: 'rgba(250,250,250,.05)',
                borderLeft: `6px solid ${C.green}`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
              }}
            >
              <svg width={54} height={54} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round">
                <path d="M5 12l5 5L19 7" />
              </svg>
              <span style={{ fontFamily: F.display, fontSize: 62, color: C.white, lineHeight: 1 }}>{label}</span>
            </div>
          );
        })}
      </div>
      <Caption text="THAT'S THE WHOLE SIGNUP." accent="WHOLE SIGNUP." accentColor={C.green} delay={Math.round(seconds * fps * 0.6)} />
    </AbsoluteFill>
  );
};

/** Where the Team ID actually lives — the one thing that stops people. */
const FindId: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });
  const glow = spring({ frame: frame - 26, fps, config: { damping: 14, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 55px 150px' }}>
      <Strip text="DON'T KNOW YOURS?" />
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.dim,
          textAlign: 'center',
          marginBottom: 40,
          opacity: t,
        }}
      >
        Open your team on the official FPL site.
        <br />
        It&rsquo;s the number in the address bar.
      </div>

      <div
        style={{
          background: C.bg,
          padding: '34px 30px',
          width: '100%',
          opacity: t,
          boxShadow: '0 30px 90px rgba(0,0,0,.6)',
        }}
      >
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 33,
            color: '#5A4C4C',
            wordBreak: 'break-all',
            lineHeight: 1.45,
          }}
        >
          fantasy.premierleague.com/entry/
          <span
            style={{
              background: C.yellow,
              color: C.ink,
              padding: '4px 10px',
              fontWeight: 800,
              boxShadow: `0 0 ${interpolate(glow, [0, 1], [0, 40])}px ${C.yellow}`,
            }}
          >
            6454003
          </span>
          /event/20
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: F.display,
          fontSize: 78,
          color: C.white,
          textAlign: 'center',
          lineHeight: 0.95,
        }}
      >
        THAT&rsquo;S <span style={{ color: C.yellow }}>YOUR TEAM ID</span>
      </div>
      <Caption text="ONE NUMBER. THAT'S ALL IT WANTS." accent="ONE NUMBER." accentColor={C.yellow} size={62} delay={20} />
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px 150px' }}>
      <Strip text="THEN IT'S ALL THERE" />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 124,
          lineHeight: 0.92,
          color: C.white,
          textAlign: 'center',
          opacity: t,
        }}
      >
        YOUR SQUAD.
        <br />
        YOUR LEAGUE.
        <br />
        <span style={{ color: C.red }}>YOUR RIVALS.</span>
      </div>
      <div
        style={{
          clipPath: HEX,
          background: C.green,
          color: C.ink,
          fontFamily: F.display,
          fontSize: 62,
          padding: '22px 64px',
          marginTop: 46,
          opacity: t,
          transform: `scale(${interpolate(t, [0, 1], [0.88, 1])})`,
        }}
      >
        FREE
      </div>
      <Caption text="NOTHING TO SIGN UP FOR." accent="NOTHING" accentColor={C.green} delay={16} />
    </AbsoluteFill>
  );
};

export const FR10Onboarding: React.FC<FR10Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const demoFrom = at(b.demo);
  const frictionFrom = at(b.friction);
  const findidFrom = at(b.findid);
  const ctaFrom = at(b.cta);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR10Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.demo > 0 && (
        <Sequence from={demoFrom} durationInFrames={f(b.demo)}>
          <Demo seconds={b.demo} />
        </Sequence>
      )}

      {b.friction > 0 && (
        <Sequence from={frictionFrom} durationInFrames={f(b.friction)}>
          <Friction seconds={b.friction} />
        </Sequence>
      )}

      {b.findid > 0 && (
        <Sequence from={findidFrom} durationInFrames={f(b.findid)}>
          <FindId />
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
