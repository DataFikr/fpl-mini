import React from 'react';
import { C, F } from '../theme';

/**
 * Nation identity as a text chip, not a flag emoji.
 *
 * Headless Chrome on Windows has no colour emoji font, so 🇳🇴 renders as
 * letterboxes and 🏴󠁧󠁢󠁥󠁮󠁧󠁿 (England, a subdivision tag sequence) degrades to a
 * generic grey flag. Every emoji in a render is a silent failure risk, and it
 * also matches how the app shows clubs — a short code on a colour, never an
 * image asset.
 */
const NATION_COLOR: Record<string, string> = {
  ENG: '#FFFFFF',
  NOR: '#BA0C2F',
  NED: '#F36C21',
  GER: '#111111',
  POR: '#046A38',
};

export const NationChip: React.FC<{ nation: string; size?: number }> = ({ nation, size = 22 }) => {
  const bg = NATION_COLOR[nation] ?? C.dimmer;
  const fg = nation === 'ENG' ? C.ink : C.white;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color: fg,
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '.1em',
        padding: `${size * 0.28}px ${size * 0.6}px`,
        lineHeight: 1,
        border: nation === 'GER' ? `1px solid ${C.dimmer}` : 'none',
      }}
    >
      {nation}
    </span>
  );
};
