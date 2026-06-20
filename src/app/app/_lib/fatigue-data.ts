/* World Cup 2026 fatigue tracker — Premier League players.
 *
 * Curated from the FPL Ranker editorial analysis (see
 * src/app/blog/world-cup-fatigue). `load` is a 0–100 projected tournament-load
 * index; `risk` is the GW1 2026/27 burnout flag. `teamId`/`short` deep-link the
 * player's club kit on Kitbag. `nation` keys into the WC group-stage results. */

export interface WcFatiguePlayer {
  surname: string;
  club: string;
  short: string;   // club badge code
  color: string;   // club colour
  fg?: string;     // badge text colour when the club colour is light
  nation: string;  // 3-letter, keys NATIONS
  pos: 'GK' | 'DEF' | 'MID' | 'FWD';
  risk: 'hi' | 'md' | 'lo';
  load: number;
  teamId: number;
  photo: string;
  note: string;    // one-line headline reason
  story: string;   // fuller story
}

export interface WcMatch { md: number; opp: string; gf: number; ga: number }
export interface WcNation { flag: string; name: string; matches: WcMatch[] }

// World Cup 2026 group stage (illustrative) — used to show each player's
// matchday involvement: flag + scoreline.
export const NATIONS: Record<string, WcNation> = {
  POR: { flag: '🇵🇹', name: 'Portugal', matches: [{ md: 1, opp: 'GHA', gf: 3, ga: 1 }, { md: 2, opp: 'URU', gf: 2, ga: 0 }, { md: 3, opp: 'KOR', gf: 1, ga: 1 }] },
  ENG: { flag: '🏴', name: 'England', matches: [{ md: 1, opp: 'IRN', gf: 2, ga: 0 }, { md: 2, opp: 'USA', gf: 1, ga: 1 }, { md: 3, opp: 'WAL', gf: 3, ga: 0 }] },
  NOR: { flag: '🇳🇴', name: 'Norway', matches: [{ md: 1, opp: 'JPN', gf: 2, ga: 1 }, { md: 2, opp: 'MEX', gf: 1, ga: 1 }, { md: 3, opp: 'AUS', gf: 3, ga: 1 }] },
  GER: { flag: '🇩🇪', name: 'Germany', matches: [{ md: 1, opp: 'ECU', gf: 2, ga: 0 }, { md: 2, opp: 'SEN', gf: 1, ga: 1 }, { md: 3, opp: 'POL', gf: 2, ga: 1 }] },
  NED: { flag: '🇳🇱', name: 'Netherlands', matches: [{ md: 1, opp: 'QAT', gf: 3, ga: 0 }, { md: 2, opp: 'CRC', gf: 2, ga: 0 }, { md: 3, opp: 'CMR', gf: 1, ga: 1 }] },
};

const P = (f: string) => `/images/blog/players/${f}`;

// Ordered by projected load (highest risk first).
export const WC_FATIGUE: WcFatiguePlayer[] = [
  { surname: 'Bruno Fernandes', club: 'Manchester United', short: 'MUN', color: '#DA291C', nation: 'POR', pos: 'MID', risk: 'hi', load: 92, teamId: 14, photo: P('bruno.jpg'), note: 'Never substituted — maximum minutes if Portugal go deep.', story: 'Portugal are perennial contenders and Bruno is the most reliable 90-minute man on this list. A deep run means maximum minutes in the heat — penalties and set pieces keep him relevant, but United may ease him in.' },
  { surname: 'Saka', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'hi', load: 90, teamId: 1, photo: P('saka.webp'), note: 'England deep run + hamstring history; Arteta will ease him in.', story: 'England fancy a deep run and Saka is the first name on the sheet. He has carried niggling muscle issues, and Arteta protects him at the best of times — a semi-final or final likely means a late, eased-in start to the league season.' },
  { surname: 'Haaland', club: 'Manchester City', short: 'MCI', color: '#6CABDD', fg: '#0a2240', nation: 'NOR', pos: 'FWD', risk: 'hi', load: 88, teamId: 13, photo: P('haaland.jpg'), note: "Norway's focal point + first City season post-Guardiola.", story: "Norway's first World Cup since 1998, and Haaland is the focal point — expect every minute he is fit for. Layer that onto his first City season without Guardiola and the early-season rhythm is a genuine question." },
  { surname: 'Wirtz', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'GER', pos: 'MID', risk: 'hi', load: 87, teamId: 12, photo: P('wirtz.jpg'), note: 'New league, no pre-season, central to Germany.', story: 'Germany expect to go far and Wirtz is central to everything they do. In his first full season adapting to the Premier League, a draining summer is the worst possible preparation for an explosive GW1.' },
  { surname: 'Ødegaard', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'NOR', pos: 'MID', risk: 'hi', load: 86, teamId: 1, photo: P('odegaard.jpg'), note: 'Plays every minute if Norway advance; ankle history.', story: "Norway's creative heartbeat alongside Haaland. If they go deep, Ødegaard plays the full 90 every round — and he is coming off a season already disrupted by ankle trouble. His value is built on rhythm." },
  { surname: 'Van Dijk', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'DEF', risk: 'hi', load: 84, teamId: 12, photo: P('vandijk.jpg'), note: 'Marshals the NL defence with no rest; into his thirties.', story: 'The Netherlands captain plays every minute and marshals the whole defence — no rest, maximum responsibility, now into his thirties. Fatigue rarely shows as a missed game, but it dents the attacking threat that justifies his price.' },
  { surname: 'Rice', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'md', load: 72, teamId: 1, photo: P('rice.jpg'), note: "England's engine, but a freak physical base. Set-piece floor.", story: "Rice is England's engine and almost undroppable — minutes pile up. The flip side is a freakish physical base that shrugs off heavy schedules better than most, and his set-piece threat keeps him FPL-relevant even at 80%." },
  { surname: 'Gakpo', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'MID', risk: 'md', load: 58, teamId: 12, photo: P('gakpo.jpg'), note: 'Rotation-heavy Dutch front line softens his exposure.', story: 'Gakpo is a Netherlands regular but operates in a rotation-heavy front line — minutes are not guaranteed across every knockout tie. That uncertainty actually softens his fatigue exposure for GW1.' },
  { surname: 'Watkins', club: 'Aston Villa', short: 'AVL', color: '#670E36', nation: 'ENG', pos: 'FWD', risk: 'lo', load: 45, teamId: 2, photo: P('watkins.jpg'), note: 'Impact sub for England — banks rest on the bench.', story: 'Watkins is in the England squad but realistically as an impact sub. That rotation is a gift for FPL — tournament involvement without the 90-minute grind. He could be the freshest premium forward in the league come GW1.' },
];
