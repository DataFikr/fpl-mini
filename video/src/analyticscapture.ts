/**
 * FR-16's data — transcribed from `fplranker_analytics.mp4` (recorded
 * 2026-07-12, end of 2025/26), the League HQ half of the same real account the
 * FR-05/FR-06 capture came from. See `squadcapture.ts` for why these figures are
 * read off the recording rather than imported from the app.
 *
 * Privacy: this capture is the one flagged in video-briefs.md for carrying six
 * real manager names on its Manager-of-the-Month cards. FR-16 patches every one
 * that falls inside its two clips, and names no manager in its native beats —
 * the winner is identified by points and gameweek range only.
 */

export const LEAGUE = {
  managers: 9,
  season: '2025/26',
  /** The window the position chart covers. */
  chartFrom: 19,
  chartTo: 38,
} as const;

/* ── The sawtooth ───────────────────────────────────────────────────────── */

/**
 * The tracked team's season, as the Analytics tab reports it.
 *
 * `bestRank`, `avgPerGw` and `climbs` are the app's own stat tiles; `finalRank`
 * and `totalPoints` are the GW38 row. The point of the beat is the gap between
 * `bestRank` and `finalRank` — the league table only ever shows the second one.
 */
export const season = {
  team: 'Tokern FC',
  bestRank: 2,
  finalRank: 3,
  avgPerGw: 61,
  climbs: 4,
  totalPoints: 2302,
  finalGwPoints: 57,
} as const;

/**
 * Gameweeks the recording's scrub actually lands on, with the figures the page
 * showed at each. These are the read-outs that change live as the chart is
 * scrubbed — the thing the footage beat exists to demonstrate.
 */
export const scrubStops = [
  { gw: 33, rank: 3, gwPoints: 118, total: 1985 },
  { gw: 36, rank: 2, gwPoints: 89, total: 2194 },
  { gw: 38, rank: 3, gwPoints: 57, total: 2302 },
] as const;

/** The season-best gameweek, and the tallest bar in the GW-points chart. */
export const bestGw = scrubStops.find((s) => s.gwPoints === 118)!;

/* ── Manager of the Month ───────────────────────────────────────────────── */

/**
 * May's winner. Deliberately unnamed: the team name carries a character Bebas
 * Neue has no glyph for, and the manager name is one of the six this capture
 * must not surface. Points and gameweek range identify it unambiguously anyway.
 */
export const motm = {
  month: 'MAY',
  points: 296,
  fromGw: 35,
  toGw: 38,
} as const;

export interface Storyline {
  title: string;
  detail: string;
  /** The single figure the beat should land on. */
  figure: string;
}

/** The three storylines the MOTM card lists, verbatim from the capture. */
export const storylines: Storyline[] = [
  {
    title: 'Captaincy Masterclass',
    detail: 'Captains delivered 54 pts across 4 GWs with 3 double-digit hauls. Best pick: Haaland, 22 pts on GW36.',
    figure: '54',
  },
  {
    title: 'Defensive Grind',
    detail: 'Squad earned 31 bonus points and 8 clean sheets across the month. Best return: Virgil, 14 pts on GW37.',
    figure: '31',
  },
  {
    title: 'Differential Punt',
    detail: 'Anderson, owned by 9.4%, delivered 10 pts on GW36 - a bold pick that paid off.',
    figure: '9.4%',
  },
];
