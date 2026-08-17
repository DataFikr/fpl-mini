import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C, F } from '../theme';
import { chipTextColor, type Story } from '../headlines';

/**
 * An ESPN-style headline card, matching the `.hl-hero` / `.hl-item` markup on
 * the league Headlines tab — white card, coloured tag chip with the Sportify
 * tab-cut, oversized display headline.
 *
 * The tag chip snaps in a beat *after* the card lands. That half-beat is the
 * whole hook: the card arrives, then the accusation.
 *
 * Never renders `detail.manager` — see video/src/data/README.md.
 */
const tabCut = 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)';

export const HeadlineCard: React.FC<{
  story: Story;
  delay?: number;
  compact?: boolean;
  showStat?: boolean;
}> = ({ story, delay = 0, compact = false, showStat = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  const chip = spring({ frame: frame - delay - 7, fps, config: { damping: 13, mass: 0.5 } });

  const s = compact
    ? { pad: 26, title: 46, chip: 22, bar: 7 }
    : { pad: 38, title: 66, chip: 28, bar: 10 };

  return (
    <div
      style={{
        background: C.bg,
        boxShadow: '0 30px 90px rgba(0,0,0,.6)',
        opacity: card,
        transform: `translateY(${interpolate(card, [0, 1], [40, 0])}px)`,
        marginBottom: compact ? 22 : 0,
      }}
    >
      <div style={{ height: s.bar, background: story.tone }} />
      <div style={{ padding: s.pad }}>
        <span
          style={{
            display: 'inline-block',
            clipPath: tabCut,
            background: story.tone,
            color: chipTextColor(story.tone),
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: s.chip,
            letterSpacing: '.14em',
            padding: `${s.chip * 0.42}px ${s.chip * 1.5}px ${s.chip * 0.42}px ${s.chip * 0.7}px`,
            opacity: chip,
            transform: `scale(${interpolate(chip, [0, 1], [1.35, 1])})`,
            transformOrigin: 'left center',
          }}
        >
          {story.tag}
        </span>

        <h3
          style={{
            fontFamily: F.display,
            fontWeight: 400,
            fontSize: s.title,
            lineHeight: 0.98,
            color: C.ink,
            margin: `${s.pad * 0.55}px 0 0`,
          }}
        >
          {story.title}
        </h3>

        {showStat && story.detail && (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginTop: s.pad * 0.7,
              paddingTop: s.pad * 0.6,
              borderTop: `2px solid ${C.ink}14`,
            }}
          >
            <span
              style={{
                fontFamily: F.display,
                fontSize: s.title * 1.5,
                lineHeight: 0.82,
                color: story.tone === '#150000' ? C.ink : story.tone,
              }}
            >
              {story.detail.stat}
            </span>
            <span
              style={{
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: s.chip * 0.95,
                letterSpacing: '.1em',
                color: '#5A4C4C',
                textTransform: 'uppercase',
              }}
            >
              {story.detail.statLabel}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: s.chip * 0.95,
                color: '#5A4C4C',
              }}
            >
              {story.detail.team}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
