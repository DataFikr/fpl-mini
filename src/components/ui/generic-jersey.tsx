// Copyright-clean replacements for FPL kit/badge/player images.
// Uses only team colors + 3-letter club abbreviations — no licensed designs or likenesses.

export const TEAM_COLORS_BY_SHORT: Record<string, string> = {
  ARS: '#EF0107',
  AVL: '#670E36',
  BOU: '#DA291C',
  BRE: '#E30613',
  BHA: '#0057B8',
  BUR: '#6C1D45',
  CHE: '#034694',
  COV: '#6CB4EE',
  CRY: '#1B458F',
  EVE: '#003399',
  FUL: '#CC0000',
  HUL: '#F18A00',
  IPS: '#0044A0',
  LEE: '#FFCD00',
  LEI: '#003090',
  LIV: '#C8102E',
  MCI: '#6CABDD',
  MUN: '#DA291C',
  NEW: '#241F20',
  NFO: '#DD0000',
  NOR: '#00A650',
  SOU: '#D71920',
  SUN: '#EB172B',
  TOT: '#132257',
  WHU: '#7A263A',
  WOL: '#FDB913',
};

const LIGHT_BG = new Set(['#FFCD00', '#FDB913', '#6CABDD', '#6CB4EE', '#F18A00']);

export function getTeamColor(shortName: string): string {
  return TEAM_COLORS_BY_SHORT[shortName?.toUpperCase()] ?? '#37003c';
}

function fg(bg: string) {
  return LIGHT_BG.has(bg) ? '#1a1a2e' : '#ffffff';
}

interface Props {
  shortName: string;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Generic football shirt SVG with 3-letter club abbreviation.
 * Drop-in replacement for FPL kit shirt images.
 */
export function GenericJersey({ shortName, color, size = 40, className }: Props) {
  const bg = color ?? getTeamColor(shortName);
  const label = (shortName ?? '???').slice(0, 3).toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${label} shirt`}
    >
      {/* Shirt silhouette — same path as the nav icon */}
      <path
        d="M6 2 3 6l3 2v12h12V8l3-2-3-4-4 2a4 4 0 0 1-8 0z"
        fill={bg}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.5"
      />
      {/* 3-letter abbreviation, centered on the shirt body */}
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fg(bg)}
        fontSize="3.5"
        fontWeight="bold"
        fontFamily="system-ui,-apple-system,sans-serif"
        letterSpacing="0.3"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="0.3"
        paintOrder="stroke fill"
      >
        {label}
      </text>
    </svg>
  );
}

/**
 * Small colored circle badge with 3-letter abbreviation.
 * Drop-in replacement for club crest images (badges).
 */
export function GenericBadge({ shortName, color, size = 20, className }: Props) {
  const bg = color ?? getTeamColor(shortName);
  const label = (shortName ?? '???').slice(0, 3).toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${label} badge`}
    >
      <circle cx="10" cy="10" r="9" fill={bg} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <text
        x="10"
        y="10"
        textAnchor="middle"
        dominantBaseline="central"
        fill={fg(bg)}
        fontSize="5.5"
        fontWeight="bold"
        fontFamily="system-ui,-apple-system,sans-serif"
        letterSpacing="0.3"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="0.3"
        paintOrder="stroke fill"
      >
        {label}
      </text>
    </svg>
  );
}
