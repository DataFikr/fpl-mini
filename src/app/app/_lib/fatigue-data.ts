/* World Cup 2026 fatigue tracker — Premier League players.
 *
 * Updated post-tournament (2026-07-27): Spain beat Argentina in the final;
 * England reached the semi-finals + third-place play-off; Norway the
 * quarter-finals; Portugal went out in the Round of 16; Netherlands and
 * Germany in the Round of 32.
 *
 * MINUTES AUDIT (2026-08-15): the per-match minutes were previously
 * best-effort estimates and were materially wrong for seven of nine players —
 * they assumed squad members played every match their nation did. Every `mins`
 * array below is now the published per-match record, cross-checked against
 * worldcuplocaltime.com player pages (and ESPN for Watkins' bench role) on
 * 2026-08-15. Two structural fixes came out of the same audit:
 *   - Portugal's fixture list was missing the R32 win over Croatia (Jul 2).
 *   - Haaland and Ødegaard were both rested for Norway's group loss to France.
 * The corrections move Saka from 2nd-heaviest load to 8th and Watkins from
 * 198' to 51', which inverts the editorial call on both.
 *
 * `load` is a 0–100 tournament-load index, scaled proportionally to total
 * minutes against Rice (649' = 92). `risk` is the GW1 2026/27 burnout flag,
 * banded from load (hi >= 60, md 40–59, lo < 40) so it always tracks the data.
 * `mins` is aligned index-for-index to NATIONS[nation].matches; the sum is the
 * player's total World Cup minutes, and 0 means an unused substitute.
 * `teamId`/`short` deep-link the club kit on Kitbag. */

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
  mins: number[];  // minutes played per match, aligned to NATIONS[nation].matches (0 = unused sub)
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
    { md: 4, round: 'R32', date: 'Jul 2', oppName: 'Croatia', oppFlag: '🇭🇷', gf: 2, ga: 1 },
    { md: 5, round: 'R16', date: 'Jul 6', oppName: 'Spain', oppFlag: '🇪🇸', gf: 0, ga: 1 },
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
  { surname: 'Rice', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'hi', load: 92, teamId: 1, note: '649 minutes — the heaviest load of any Premier League player.', story: 'Rice started all eight of England’s matches on the run to the semi-final and third-place play-off, and only twice came off early — 649 minutes, comfortably the heaviest tournament load on this list and nearly 200 more than anyone else. The saving grace is a freakish physical base that shrugs off heavy schedules, and a set-piece threat that keeps him FPL-relevant even if Arteta manages his early minutes. Monitor, don’t panic-sell.', mins: [72, 90, 90, 90, 90, 45, 82, 90] },
  { surname: 'Ødegaard', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'NOR', pos: 'MID', risk: 'hi', load: 67, teamId: 1, note: 'Rested once, then 120 minutes in the quarter-final.', story: 'Norway’s creative heartbeat started five of the six matches on their run to the quarter-finals — rested for the dead-rubber loss to France, then made to play the full 120 minutes of extra time against England. He is also coming off a club season disrupted by ankle trouble. His value is built on rhythm and chance creation, so a short turnaround is a red flag — expect Arteta to build his minutes carefully in August.', mins: [81, 90, 0, 90, 90, 120] },
  { surname: 'Haaland', club: 'Manchester City', short: 'MCI', color: '#6CABDD', fg: '#0a2240', nation: 'NOR', pos: 'FWD', risk: 'hi', load: 66, teamId: 13, note: 'Seven goals in five starts, then 106 minutes in the quarter-final.', story: 'Norway’s fairytale run to the quarter-finals — knocking out Brazil on the way — leaned entirely on Haaland, who scored seven in five starts before England ended it in extra time. He was rested for the France group game, so the load is lighter than the headlines suggest. Layer a compressed pre-season onto his first City season without Guardiola and he is still the classic slow-starter profile. Default captain, but watch City team news.', mins: [90, 90, 0, 90, 90, 106] },
  { surname: 'Bruno Fernandes', club: 'Manchester United', short: 'MUN', color: '#DA291C', nation: 'POR', pos: 'MID', risk: 'hi', load: 60, teamId: 14, note: 'Started all five for Portugal, out in the Round of 16.', story: 'Portugal beat Croatia in the Round of 32 before falling to Spain in the Round of 16, and Bruno started all five — 423 minutes, withdrawn early only once. An earlier exit than the England and Norway contingent, and with Manchester United handed a soft opener against promoted Hull and Ipswich, he is one of the more backable “fatigued” premiums.', mins: [90, 90, 90, 63, 90] },
  { surname: 'Van Dijk', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'DEF', risk: 'md', load: 55, teamId: 12, note: 'Every available minute for the Dutch, but out in the Round of 32.', story: 'The Netherlands captain played every minute he could — including extra time in the shootout defeat to Morocco — but an exit in the Round of 32 means far fewer games in the legs than the England and Norway contingent. A lighter summer than feared makes him a steadier GW1 hold.', mins: [90, 90, 90, 120] },
  { surname: 'Gakpo', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'NED', pos: 'MID', risk: 'md', load: 53, teamId: 12, note: 'Started all four for the Dutch, including extra time.', story: 'Gakpo started every Netherlands match and played 372 minutes including extra time against Morocco — more than the rotation narrative suggested — but the Dutch went out in the Round of 32, so his exposure stays moderate. For FPL the bigger question is Liverpool’s congested attack, not the World Cup.', mins: [85, 90, 84, 113] },
  { surname: 'Wirtz', club: 'Liverpool', short: 'LIV', color: '#C8102E', nation: 'GER', pos: 'MID', risk: 'md', load: 51, teamId: 12, note: 'Germany bowed out in the Round of 32 — moderate load.', story: 'Germany’s surprise exit on penalties in the Round of 32 spared Wirtz the deepest grind, though he did play 110 minutes of it. No longer a brand-new arrival, he has a season of Premier League rhythm behind him — a very different picture to a first-summer settle-in. A monitor rather than a fade.', mins: [90, 90, 73, 110] },
  { surname: 'Saka', club: 'Arsenal', short: 'ARS', color: '#EF0107', nation: 'ENG', pos: 'MID', risk: 'md', load: 51, teamId: 1, note: 'Only three starts and 357 minutes — far fresher than the run suggests.', story: 'The deep England run makes Saka look like a fade candidate, but the minutes say otherwise: seven appearances, only three starts, 357 minutes, and he missed the semi-final against Argentina entirely. That is roughly half Rice’s load despite the same tournament. Given the hamstring history Arteta will still ease him in, but the burnout case against him is much weaker than the headlines imply.', mins: [18, 25, 63, 29, 57, 75, 0, 90] },
  { surname: 'Watkins', club: 'Aston Villa', short: 'AVL', color: '#670E36', nation: 'ENG', pos: 'FWD', risk: 'lo', load: 7, teamId: 2, note: '51 minutes all summer — the freshest premium forward in the league.', story: 'Watkins travelled through England’s deepest run in a generation and barely played: two substitute appearances, six minutes against Panama and 45 in the third-place play-off, 51 minutes in total. He sat out six of the eight matches unused. A full tournament of rest while his rivals racked up 400–650 minutes makes him arguably the freshest premium forward in the league for GW1, at a friendlier price than the fatigued headline names.', mins: [0, 0, 6, 0, 0, 0, 0, 45] },
];
