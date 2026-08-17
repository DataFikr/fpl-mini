import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { Backdrop } from '../components/Backdrop';
import { NationChip } from '../components/NationChip';
import { Caption } from '../components/Caption';
import { CounterRoll } from '../components/CounterRoll';
import { RiskBar } from '../components/RiskBar';
import { PlayerRow } from '../components/PlayerRow';
import { MatchBreakdown } from '../components/MatchBreakdown';
import { EndCard } from '../components/EndCard';
import { Soundtrack } from '../components/Soundtrack';
import { FR08Cover } from './FR08Cover';
import { C, F, V } from '../theme';
import { byLoad, heaviest, freshest, highRisk, totalMins, appearances, playedMatches, NATIONS } from '../data';

export const fr08Schema = z.object({
  variant: z.enum(['master', 'shorts', 'loop']),
  /** Filenames in video/public/. Omit for a silent render — captions carry it. */
  voice: z.string().optional(),
  music: z.string().optional(),
  /** Frames of static cover held at 0:00 so YouTube can lift it as the thumbnail. */
  coverFrames: z.number().optional(),
});
export type FR08Props = z.infer<typeof fr08Schema>;

/**
 * Beat durations in seconds, per variant.
 *
 * The brief's retention scaffold is a payoff every ~15s, so the master runs
 * six beats across 60s. The Shorts cut drops the expand beat entirely — Shorts
 * counts a partial view as a negative signal, so a shorter, denser cut is the
 * safer shape there. The loop is the silent 10s outreach GIF.
 */
const BEATS = {
  master: { hook: 3, list: 12, expand: 15, high: 15, low: 10, end: 5 },
  shorts: { hook: 3, list: 9, expand: 0, high: 12, low: 9, end: 7 },
  loop: { hook: 4, list: 0, expand: 0, high: 4, low: 0, end: 2 },
} as const;

export const fr08Duration = (variant: FR08Props['variant'], fps = V.fps) => {
  const b = BEATS[variant];
  return (b.hook + b.list + b.expand + b.high + b.low + b.end) * fps;
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

/** Beat 1 — the hook. A number that arrives, and a flag that snaps red. */
const Hook: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { fps } = useVideoConfig();
  const mins = totalMins(heaviest);
  const nation = NATIONS[heaviest.nation];

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
      <Strip text="WORLD CUP 2026 · GW1 BURNOUT RISK" />
      {/* Roll fast and hold. TikTok builds its cover from a video frame, and a
          slow count means the first ~1.5s reads "0'" — a dead cover and a weak
          freeze-frame at exactly the moment the swipe decision is made. Landing
          by ~0.6s keeps the motion but makes the number legible almost at once. */}
      <CounterRoll to={mins} durationInFrames={Math.round(seconds * fps * 0.2)} />
      <div
        style={{
          fontFamily: F.display,
          fontSize: 84,
          color: C.white,
          marginTop: 10,
          letterSpacing: '.01em',
        }}
      >
        {heaviest.surname.toUpperCase()}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 12,
          marginBottom: 40,
        }}
      >
        <NationChip nation={heaviest.nation} size={20} />
        <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 30, color: C.dim }}>
          {heaviest.club} · {nation.name} · {appearances(heaviest)} matches
        </span>
      </div>
      <RiskBar load={heaviest.load} risk={heaviest.risk} delay={Math.round(seconds * fps * 0.3)} />
      <Caption text={`${mins} MINUTES. IN ONE SUMMER.`} accent={`${mins} MINUTES.`} delay={6} />
    </AbsoluteFill>
  );
};

/** Beat 2 — the whole list. Establishes that this is a dataset, not a take. */
const List: React.FC = () => (
  <AbsoluteFill style={{ padding: `${V.safeTop}px 60px ${V.safeBottom + 150}px` }}>
    <Strip text="EVERY PL PLAYER · REAL TOURNAMENT MINUTES" />
    <div style={{ marginTop: 10 }}>
      {byLoad.map((p, i) => (
        <PlayerRow key={p.surname} player={p} minutes={totalMins(p)} index={i} highlight={i === 0} compact />
      ))}
    </div>
    <Caption text="REAL MINUTES. REAL RISK." accent="REAL RISK." delay={14} />
  </AbsoluteFill>
);

/** Beat 3 — the expand. Dropped in the Shorts cut. */
const Expand: React.FC = () => {
  const nation = NATIONS[heaviest.nation];
  const matches = playedMatches(heaviest);

  return (
    <AbsoluteFill style={{ padding: `${V.safeTop}px 60px ${V.safeBottom + 130}px` }}>
      <Strip text={`${heaviest.surname.toUpperCase()} · ${nation.result.toUpperCase()}`} />
      <div style={{ marginTop: 20 }}>
        <MatchBreakdown matches={matches} />
      </div>
      <div
        style={{
          marginTop: 26,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'flex-end',
          gap: 18,
          paddingRight: 24,
        }}
      >
        <span style={{ fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: '.16em', color: C.dim }}>
          TOTAL
        </span>
        <span style={{ fontFamily: F.display, fontSize: 110, lineHeight: 0.85, color: C.red }}>
          {totalMins(heaviest)}
          <span style={{ fontSize: 48, color: C.dimmer }}>&apos;</span>
        </span>
      </div>
      <Caption text="EVERY MATCH. EVERY MINUTE." accent="EVERY MINUTE." delay={16} />
    </AbsoluteFill>
  );
};

/** Beat 4 — the landmines. The list collapses to the players you should fear. */
const HighRisk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        padding: `${V.safeTop}px 60px ${V.safeBottom + 150}px`,
        justifyContent: 'center',
      }}
    >
      <Strip text="HIGH RISK · GW1 LANDMINES" />
      <div style={{ opacity: t }}>
        {highRisk.map((p, i) => (
          <div key={p.surname} style={{ marginBottom: 34 }}>
            <PlayerRow player={p} minutes={totalMins(p)} index={i} highlight />
            <div style={{ padding: '0 28px', marginTop: -4 }}>
              <RiskBar load={p.load} risk={p.risk} width={880} height={16} showLabel={false} delay={i * 6} />
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 600,
                fontSize: 25,
                color: C.dim,
                padding: '12px 28px 0',
              }}
            >
              {p.note}
            </div>
          </div>
        ))}
      </div>
      <Caption text="THESE ARE YOUR GW1 LANDMINES." accent="LANDMINES." delay={18} />
    </AbsoluteFill>
  );
};

/** Beat 5 — the inversion. The warning becomes an edge, which is what earns the click. */
const LowRisk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mins = totalMins(freshest);
  const apps = appearances(freshest);
  const nation = NATIONS[freshest.nation];
  const t = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
      <Strip text="AND THIS ONE BARELY PLAYED" />
      {/* Naming the nation's run here, not the player's — he was carried through
          England's deepest tournament in years without playing, which is the
          whole point of the beat. Showing the bare result read as his own. */}
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: '.18em',
          color: C.green,
          opacity: t,
          textAlign: 'center',
        }}
      >
        {`${nation.name.toUpperCase()} PLAYED ${nation.matches.length} · HE SAT OUT ${
          nation.matches.length - apps
        }`}
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 300,
          lineHeight: 0.82,
          color: C.green,
          marginTop: 24,
          textShadow: `0 0 90px ${C.green}44`,
          transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
        }}
      >
        {mins}
        <span style={{ fontSize: 126, color: C.white }}>&apos;</span>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 84, color: C.white, marginTop: 14 }}>
        {freshest.surname.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 30,
          color: C.dim,
          marginTop: 10,
          marginBottom: 40,
        }}
      >
        {freshest.club} · {apps} appearances in {NATIONS[freshest.nation].matches.length} matches
      </div>
      <RiskBar load={freshest.load} risk={freshest.risk} delay={12} />
      <Caption
        text={`${apps} APPEARANCES. FRESH LEGS.`}
        accent="FRESH LEGS."
        accentColor={C.green}
        delay={18}
      />
    </AbsoluteFill>
  );
};

export const FR08Fatigue: React.FC<FR08Props> = ({ variant, voice, music, coverFrames = 0 }) => {
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
  const listFrom = at(b.list);
  const expandFrom = at(b.expand);
  const highFrom = at(b.high);
  const lowFrom = at(b.low);
  const endFrom = at(b.end);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop />
      <Soundtrack voice={voice} music={music} />

      {coverFrames > 0 && (
        <Sequence durationInFrames={coverFrames}>
          <FR08Cover />
        </Sequence>
      )}

      <Sequence from={hookFrom} durationInFrames={f(b.hook)}>
        <Hook seconds={b.hook} />
      </Sequence>

      {b.list > 0 && (
        <Sequence from={listFrom} durationInFrames={f(b.list)}>
          <List />
        </Sequence>
      )}

      {b.expand > 0 && (
        <Sequence from={expandFrom} durationInFrames={f(b.expand)}>
          <Expand />
        </Sequence>
      )}

      {b.high > 0 && (
        <Sequence from={highFrom} durationInFrames={f(b.high)}>
          <HighRisk />
        </Sequence>
      )}

      {b.low > 0 && (
        <Sequence from={lowFrom} durationInFrames={f(b.low)}>
          <LowRisk />
        </Sequence>
      )}

      <Sequence from={endFrom} durationInFrames={f(b.end)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
