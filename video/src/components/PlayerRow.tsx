import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C, F, riskColor, riskLabel } from '../theme';
import { NationChip } from './NationChip';
import type { WcFatiguePlayer } from '../data';

/**
 * One fatigue row — club badge, name, nation, total minutes, risk flag.
 *
 * Styled after the .np-row markup on /app/fatigue so a viewer who clicks
 * through recognises the page they land on. Club identity is a colour + short
 * code, never a crest image and never a player photo (Jul 2026 legal review).
 */
/**
 * `compact` is what lets all nine rows fit above the caption safe area in the
 * list beat; the high-risk beat uses the full size because it only shows four.
 */
export const PlayerRow: React.FC<{
  player: WcFatiguePlayer;
  minutes: number;
  index: number;
  highlight?: boolean;
  dim?: boolean;
  compact?: boolean;
}> = ({ player, minutes, index, highlight = false, dim = false, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const col = riskColor(player.risk);

  const s = compact
    ? { badge: 62, name: 48, club: 21, mins: 58, flag: 17, pad: '13px 24px', gap: 20, mb: 8 }
    : { badge: 76, name: 58, club: 25, mins: 72, flag: 19, pad: '20px 28px', gap: 26, mb: 14 };

  const t = spring({
    frame: frame - index * 4,
    fps,
    config: { damping: 200, mass: 0.7 },
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.pad,
        marginBottom: s.mb,
        background: highlight ? 'rgba(255,80,80,.14)' : 'rgba(250,250,250,.05)',
        borderLeft: `6px solid ${highlight ? col : 'transparent'}`,
        opacity: dim ? 0.26 * t : t,
        transform: `translateX(${interpolate(t, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          width: s.badge,
          height: s.badge,
          background: player.color,
          color: player.fg ?? C.white,
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: s.badge * 0.29,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {player.short}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: F.display,
            fontSize: s.name,
            lineHeight: 0.95,
            color: C.white,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.surname}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: compact ? 5 : 8,
          }}
        >
          <NationChip nation={player.nation} size={s.flag} />
          <span
            style={{
              fontFamily: F.body,
              fontWeight: 600,
              fontSize: s.club,
              color: C.dim,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {player.club}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: F.display,
            fontSize: s.mins,
            lineHeight: 0.85,
            color: col,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {minutes}
          <span style={{ fontSize: s.mins * 0.47, color: C.dimmer }}>&apos;</span>
        </div>
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: compact ? 17 : 20,
            letterSpacing: '.14em',
            color: col,
            marginTop: 2,
          }}
        >
          {riskLabel(player.risk)}
        </div>
      </div>
    </div>
  );
};
