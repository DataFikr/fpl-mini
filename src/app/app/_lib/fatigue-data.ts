/* World Cup 2026 fatigue tracker — Premier League players.
 *
 * Curated from the FPL Ranker editorial analysis (see
 * src/app/blog/world-cup-fatigue). `load` is a 0–100 projected tournament-load
 * index; `risk` is the GW1 2026/27 burnout flag. `teamId` is the FPL team id,
 * used to deep-link each player's club kit on Kitbag. */

export interface WcFatiguePlayer {
  surname: string;
  club: string;
  short: string;   // club badge code
  color: string;   // club colour
  fg?: string;     // badge text colour when the club colour is light
  nation: string;  // 3-letter
  pos: 'GK' | 'DEF' | 'MID' | 'FWD';
  risk: 'hi' | 'md';
  load: number;
  teamId: number;
  note: string;
}

// Ordered by projected load (highest risk first).
export const WC_FATIGUE: WcFatiguePlayer[] = [
  { surname: 'Bruno Fernandes', club: 'Manchester United', short: 'MUN', color: '#DA291C', nation: 'POR', pos: 'MID', risk: 'hi', load: 92, teamId: 14, note: 'Never substituted — maximum minutes if Portugal go deep into the heat.' },
  { surname: 'Saka', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'hi', load: 90, teamId: 1, note: 'England deep run plus a hamstring history — Arteta will ease him in through August.' },
  { surname: 'Haaland', club: 'Manchester City', short: 'MCI', color: '#6CABDD', fg: '#0a2240', nation: 'NOR', pos: 'FWD', risk: 'hi', load: 88, teamId: 13, note: "Norway's focal point, and his first City season without Guardiola to manage the load." },
  { surname: 'Wirtz', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'GER', pos: 'MID', risk: 'hi', load: 87, teamId: 12, note: 'Central to Germany, with no real pre-season in his first Premier League year.' },
  { surname: 'Ødegaard', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'NOR', pos: 'MID', risk: 'hi', load: 86, teamId: 1, note: "Norway's creative heartbeat — plays every minute if they advance, off an ankle-hit season." },
  { surname: 'Van Dijk', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'DEF', risk: 'hi', load: 84, teamId: 12, note: 'Marshals the Netherlands defence with no rest — and now into his thirties.' },
  { surname: 'Rice', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'md', load: 72, teamId: 1, note: "England's engine, but a freak physical base shrugs off heavy schedules. Set-piece floor." },
  { surname: 'Gakpo', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'MID', risk: 'md', load: 58, teamId: 12, note: 'Rotation-heavy Dutch front line softens his exposure — minutes not guaranteed each tie.' },
  { surname: 'Watkins', club: 'Aston Villa', short: 'AVL', color: '#670E36', nation: 'ENG', pos: 'FWD', risk: 'md', load: 45, teamId: 2, note: 'An impact sub for England — banks rest on the bench and could be the freshest premium forward.' },
];
