import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { Caption } from '../components/Caption';
import { HeadlineCard } from '../components/HeadlineCard';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR01Cover } from './FR01Cover';
import { C, F, V } from '../theme';
import { stories, allTags, heroStory, positiveStory, chipTextColor } from '../headlines';

export const fr01Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  voice: z.string().optional(),
  music: z.string().optional(),
  /** Frames of static cover held at 0:00 so YouTube can lift it as the thumbnail. */
  coverFrames: z.number().optional(),
});
export type FR01Props = z.infer<typeof fr01Schema>;

/**
 * FR-01 — "Your mini-league has a villain."
 *
 * Every headline on screen is real output from
 * `GET /api/leagues/[id]/headlines`, captured into src/data/fr01-headlines.json.
 * Every tag in the roll-call is extracted from the engine's source, so the video
 * cannot show a category the product doesn't actually emit.
 *
 * Team names only, never `detail.manager` — see src/data/README.md.
 */
const BEATS = {
  master: { hook: 3, scroll: 12, tags: 15, zoom: 15, flip: 10, end: 5 },
  shorts: { hook: 3, scroll: 9, tags: 0, zoom: 12, flip: 9, end: 7 },
  loop: { hook: 4, scroll: 0, tags: 4, zoom: 0, flip: 0, end: 2 },
} as const;

export const fr01Duration = (variant: FR01Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.scroll + b.tags + b.zoom + b.flip + b.end) * fps;
};

const Strip: React.FC<{ text: string }> = ({ text }) => (
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
      color: C.amber,
    }}
  >
    {text}
  </div>
);

/** Beat 1 — the accusation lands before anything is explained. */
const Hook: React.FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 60px 140px' }}>
    <Strip text="YOUR MINI-LEAGUE · WRITTEN BY A ROBOT" />
    <HeadlineCard story={heroStory} showStat />
    {/* "him" would be wrong — the subject is a team name, not a person. */}
    <Caption text="IT FOUND YOUR VILLAIN." accent="YOUR VILLAIN." delay={12} />
  </AbsoluteFill>
);

/** Beat 2 — a feed, not a one-off. Cards drift up continuously. */
const Scroll: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = seconds * fps;
  // Drift the stack so the eye reads it as an endless feed rather than a slide.
  const y = interpolate(frame, [0, total], [80, -760], { easing: Easing.inOut(Easing.ease) });

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 55px ${V.safeBottom + 140}px`, overflow: 'hidden' }}>
      <Strip text="EVERY GAMEWEEK · EVERY MANAGER" />
      <div style={{ transform: `translateY(${y}px)` }}>
        {stories.map((s, i) => (
          <HeadlineCard key={s.tag + i} story={s} delay={i * 6} compact />
        ))}
      </div>
      <Caption text="THIS IS AUTOMATIC." accent="AUTOMATIC." delay={16} />
    </AbsoluteFill>
  );
};

/** Beat 3 — the roll-call. Ten real categories, accumulating. */
const Tags: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Spread the ten arrivals across the first ~70% of the beat, then hold on the
  // full set — the hold is the payoff, not the animation.
  const step = (seconds * fps * 0.7) / allTags.length;

  return (
    <AbsoluteFill
      style={{
        padding: `${V.safeTop}px 60px ${V.safeBottom + 140}px`,
        justifyContent: 'center',
      }}
    >
      <Strip text="TEN WAYS TO GET EXPOSED" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {allTags.map((t, i) => {
          const s = spring({ frame: frame - i * step, fps, config: { damping: 14, mass: 0.5 } });
          return (
            <div
              key={t.tag}
              style={{
                background: t.tone,
                color: chipTextColor(t.tone),
                fontFamily: F.display,
                fontSize: 74,
                lineHeight: 1,
                letterSpacing: '.02em',
                padding: '16px 42px',
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`,
                border: t.tone === '#150000' ? `2px solid ${C.dimmer}` : 'none',
                boxShadow: `0 14px 50px ${t.tone}44`,
              }}
            >
              {t.tag}
            </div>
          );
        })}
      </div>
      <Caption text="TEN WAYS TO GET EXPOSED." accent="EXPOSED." delay={Math.round(seconds * fps * 0.72)} />
    </AbsoluteFill>
  );
};

/** Beat 4 — the receipts. Real team, real number, from the real feed. */
const Zoom: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = seconds * fps;
  // Slow push in — the card grows into the claim rather than sitting still.
  const scale = interpolate(frame, [0, total], [0.96, 1.04], { easing: Easing.inOut(Easing.ease) });
  const captain = stories.find((s) => s.tag === 'CAPTAIN CALAMITY') ?? stories[1] ?? heroStory;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 60px 140px' }}>
      <Strip text="STRAIGHT FROM THE FPL API" />
      <div style={{ transform: `scale(${scale})`, width: '100%' }}>
        <HeadlineCard story={captain} showStat />
      </div>
      <Caption text="REAL TEAMS. REAL NUMBERS." accent="REAL NUMBERS." delay={18} />
    </AbsoluteFill>
  );
};

/** Beat 5 — the tone flip. Red all the way, then green: it can make you the hero. */
const Flip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 60px 140px' }}>
      {/* The strip, the sub-line and the caption were all saying the same thing.
          The strip now carries the turn; the caption lands it. */}
      <Strip text="FOUR OF THE TEN TAGS ARE GOOD NEWS" />
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.18em',
          color: C.green,
          marginBottom: 30,
          opacity: t,
        }}
      >
        SOMETIMES YOU&rsquo;RE THE STORY
      </div>
      <HeadlineCard story={positiveStory} showStat delay={6} />
      <Caption
        text="OR IT MAKES YOU THE HERO."
        accent="THE HERO."
        accentColor={C.green}
        delay={20}
      />
    </AbsoluteFill>
  );
};

export const FR01Headlines: React.FC<FR01Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const scrollFrom = at(b.scroll);
  const tagsFrom = at(b.tags);
  const zoomFrom = at(b.zoom);
  const flipFrom = at(b.flip);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR01Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook />
      </Sequence>

      {b.scroll > 0 && (
        <Sequence from={scrollFrom} durationInFrames={f(b.scroll)}>
          <Scroll seconds={b.scroll} />
        </Sequence>
      )}

      {b.tags > 0 && (
        <Sequence from={tagsFrom} durationInFrames={f(b.tags)}>
          <Tags seconds={b.tags} />
        </Sequence>
      )}

      {b.zoom > 0 && (
        <Sequence from={zoomFrom} durationInFrames={f(b.zoom)}>
          <Zoom seconds={b.zoom} />
        </Sequence>
      )}

      {b.flip > 0 && (
        <Sequence from={flipFrom} durationInFrames={f(b.flip)}>
          <Flip />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard destination="FPLRANKER.COM" />
      </Sequence>
    </AbsoluteFill>
  );
};
