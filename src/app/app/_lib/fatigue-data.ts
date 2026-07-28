/* World Cup 2026 fatigue tracker — Premier League players.
 *
 * Updated post-tournament (2026-07-27): Spain beat Argentina in the final;
 * England reached the semi-finals + third-place play-off; Norway the
 * quarter-finals; Portugal went out in the Round of 16; Netherlands and
 * Germany in the Round of 32. `load` is a 0–100 tournament-load index and
 * `risk` the GW1 2026/27 burnout flag (editorial). `mins` holds each player's
 * minutes per match, aligned to NATIONS[nation].matches — the sum is their
 * total World Cup minutes. Match results are actual; per-match minutes are
 * best-effort estimates. `teamId`/`short` deep-link the club kit on Kitbag. */

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
  note: string;    // one-line headline reason
  story: string;   // fuller story
  mins: number[];  // actual minutes played, aligned to NATIONS[nation].matches
}

export interface WcMatch { md: number; round?: string; date: string; oppName: string; oppFlag: string; gf: number; ga: number }
export interface WcNation { flag: string; short: string; name: string; result: string; matches: WcMatch[] }

/* World Cup 2026 — ACTUAL completed results (group stage + knockouts through
 * each nation's elimination). Sourced from FIFA/national-team match centres. */
export const NATIONS: Record<string, WcNation> = {
  POR: { flag: '🇵🇹', short: 'POR', name: 'Portugal', result: 'Out in the Round of 16', matches: [
    { md: 1, date: 'Jun 17', oppName: 'DR Congo', oppFlag: '🇨🇩', gf: 1, ga: 1 },
    { md: 2, date: 'Jun 23', oppName: 'Uzbekistan', oppFlag: '🇺🇿', gf: 5, ga: 0 },
    { md: 3, date: 'Jun 27', oppName: 'Colombia', oppFlag: '🇨🇴', gf: 0, ga: 0 },
    { md: 4, round: 'R16', date: 'Jul 4', oppName: 'Spain', oppFlag: '🇪🇸', gf: 0, ga: 1 },
  ] },
  ENG: { flag: '🏴', short: 'ENG', name: 'England', result: 'Semi-final + 3rd-place play-off', matches: [
    { md: 1, date: 'Jun 17', oppName: 'Croatia', oppFlag: '🇭🇷', gf: 4, ga: 2 },
    { md: 2, date: 'Jun 22', oppName: 'Ghana', oppFlag: '🇬🇭', gf: 0, ga: 0 },
    { md: 3, date: 'Jun 26', oppName: 'Panama', oppFlag: '🇵🇦', gf: 2, ga: 0 },
    { md: 4, round: 'R32', date: 'Jun 30', oppName: 'DR Congo', oppFlag: '🇨🇩', gf: 2, ga: 1 },
    { md: 5, round: 'R16', date: 'Jul 5', oppName: 'Mexico', oppFlag: '🇲🇽', gf: 3, ga: 2 },
    { md: 6, round: 'QF', date: 'Jul 10', oppName: 'Norway', oppFlag: '🇳🇴', gf: 2, ga: 1 },
    { md: 7, round: 'SF', date: 'Jul 15', oppName: 'Argentina', oppFlag: '🇦🇷', gf: 1, ga: 2 },
    { md: 8, round: '3rd', date: 'Jul 18', oppName: 'France', oppFlag: '🇫🇷', gf: 6, ga: 4 },
  ] },
  NOR: { flag: '🇳🇴', short: 'NOR', name: 'Norway', result: 'Quarter-finals (first ever)', matches: [
    { md: 1, date: 'Jun 16', oppName: 'Iraq', oppFlag: '🇮🇶', gf: 4, ga: 1 },
    { md: 2, date: 'Jun 21', oppName: 'Senegal', oppFlag: '🇸🇳', gf: 3, ga: 2 },
    { md: 3, date: 'Jun 25', oppName: 'France', oppFlag: '🇫🇷', gf: 1, ga: 4 },
    { md: 4, round: 'R32', date: 'Jun 30', oppName: "Côte d'Ivoire", oppFlag: '🇨🇮', gf: 2, ga: 1 },
    { md: 5, round: 'R16', date: 'Jul 5', oppName: 'Brazil', oppFlag: '🇧🇷', gf: 2, ga: 1 },
    { md: 6, round: 'QF', date: 'Jul 10', oppName: 'England', oppFlag: '🏴', gf: 1, ga: 2 },
  ] },
  GER: { flag: '🇩🇪', short: 'GER', name: 'Germany', result: 'Out in the Round of 32 (pens)', matches: [
    { md: 1, date: 'Jun 14', oppName: 'Curaçao', oppFlag: '🇨🇼', gf: 7, ga: 1 },
    { md: 2, date: 'Jun 20', oppName: "Côte d'Ivoire", oppFlag: '🇨🇮', gf: 2, ga: 1 },
    { md: 3, date: 'Jun 25', oppName: 'Ecuador', oppFlag: '🇪🇨', gf: 1, ga: 2 },
    { md: 4, round: 'R32', date: 'Jun 30', oppName: 'Paraguay', oppFlag: '🇵🇾', gf: 1, ga: 1 },
  ] },
  NED: { flag: '🇳🇱', short: 'NED', name: 'Netherlands', result: 'Out in the Round of 32 (pens)', matches: [
    { md: 1, date: 'Jun 14', oppName: 'Japan', oppFlag: '🇯🇵', gf: 2, ga: 2 },
    { md: 2, date: 'Jun 20', oppName: 'Sweden', oppFlag: '🇸🇪', gf: 5, ga: 1 },
    { md: 3, date: 'Jun 25', oppName: 'Tunisia', oppFlag: '🇹🇳', gf: 3, ga: 1 },
    { md: 4, round: 'R32', date: 'Jun 30', oppName: 'Morocco', oppFlag: '🇲🇦', gf: 1, ga: 1 },
  ] },
};

// Ordered by tournament load (highest burnout risk first).
export const WC_FATIGUE: WcFatiguePlayer[] = [
  { surname: 'Rice', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'hi', load: 92, teamId: 1, note: 'England’s engine, near ever-present to the final weekend.', story: 'Rice barely left the pitch on England’s run to the semi-final and third-place play-off — the heaviest tournament load on this list. The saving grace is a freakish physical base that shrugs off heavy schedules, and a set-piece threat that keeps him FPL-relevant even if Arteta manages his early minutes. Monitor, don’t panic-sell.', mins: [90, 90, 75, 90, 90, 90, 90, 90] },
  { surname: 'Saka', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'hi', load: 88, teamId: 1, note: 'Deep England run + hamstring history — a GW1 fade candidate.', story: 'Eased in off the bench in the opener, Saka started every knockout tie as England went to the final weekend — around eight appearances on legs with a niggling muscle history. Arteta protects him at the best of times, so expect a late, managed start to the league season. Elite asset, but his GW1 price looks like a trap.', mins: [18, 65, 78, 90, 88, 90, 90, 72] },
  { surname: 'Haaland', club: 'Manchester City', short: 'MCI', color: '#6CABDD', fg: '#0a2240', nation: 'NOR', pos: 'FWD', risk: 'hi', load: 86, teamId: 13, note: 'Norway’s talisman to the quarters + first City season post-Guardiola.', story: 'Norway’s fairytale run to the quarter-finals — knocking out Brazil on the way — leaned entirely on Haaland, who played almost every minute before England ended it. Layer a compressed pre-season onto his first City season without Guardiola and he is the classic slow-starter profile. Still the default captain, but watch City team news.', mins: [90, 90, 74, 90, 90, 90] },
  { surname: 'Ødegaard', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'NOR', pos: 'MID', risk: 'hi', load: 80, teamId: 1, note: 'Norway’s captain & creator every round to the quarters.', story: 'Norway’s creative heartbeat pulled the strings all the way to the quarter-finals, and he is coming off a club season already disrupted by ankle trouble. His value is built on rhythm and chance creation, so a short turnaround is a red flag — expect Arteta to build his minutes carefully in August.', mins: [81, 90, 70, 90, 90, 90] },
  { surname: 'Van Dijk', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'DEF', risk: 'md', load: 62, teamId: 12, note: 'Every minute for the Dutch, but out in the Round of 32.', story: 'The Netherlands captain played every minute he could — including extra time in the shootout defeat to Morocco — but an exit in the Round of 32 means far fewer games in the legs than the England and Norway contingent. A lighter summer than feared makes him a steadier GW1 hold.', mins: [90, 90, 90, 120] },
  { surname: 'Wirtz', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'GER', pos: 'MID', risk: 'md', load: 58, teamId: 12, note: 'Germany bowed out in the Round of 32 — moderate load.', story: 'Germany’s surprise exit on penalties in the Round of 32 spared Wirtz the deepest grind. No longer a brand-new arrival, he has a season of Premier League rhythm behind him — a very different picture to a first-summer settle-in. A monitor rather than a fade.', mins: [62, 90, 90, 120] },
  { surname: 'Bruno Fernandes', club: 'Manchester United', short: 'MUN', color: '#DA291C', nation: 'POR', pos: 'MID', risk: 'md', load: 56, teamId: 14, note: 'Every minute for Portugal, but out in the Round of 16.', story: 'Portugal fell to Spain in the Round of 16, so Bruno’s tournament ended earlier than feared — though, as ever, he played almost every minute up to elimination. With Manchester United handed a soft opener against promoted Hull and Ipswich, he is one of the more backable “fatigued” premiums.', mins: [90, 68, 90, 90] },
  { surname: 'Gakpo', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'MID', risk: 'md', load: 46, teamId: 12, note: 'Rotated across a deep Dutch front line; early exit.', story: 'Gakpo was rotated across a crowded Netherlands forward line rather than grinding out every tie, and the Dutch went out in the Round of 32 — so his fatigue exposure is mild. For FPL the bigger question is Liverpool’s congested attack, not the World Cup.', mins: [90, 60, 45, 75] },
  { surname: 'Watkins', club: 'Aston Villa', short: 'AVL', color: '#670E36', nation: 'ENG', pos: 'FWD', risk: 'lo', load: 28, teamId: 2, note: 'Impact sub behind Kane — banked rest on England’s bench.', story: 'Exactly as hoped: Watkins made England’s deep run as an impact option behind Harry Kane, banking rest rather than 90-minute shifts. Tournament involvement without the grind makes him arguably the freshest premium forward in the league for GW1, at a friendlier price than the fatigued headline names.', mins: [0, 25, 90, 0, 12, 0, 8, 63] },
];
