/* Mock content for the secondary app screens, ported faithfully from the
   handoff prototype (app-data.js + app-mobile-v2.js). The primary flow
   (Landing + League detail) is live-wired; these screens are presentational
   demos in the new theme and can be wired to FPL data later. */

export const DEMO_LEAGUE = '150789';
// Default team shown on My Squad so the pitch loads immediately (no ID prompt),
// matching the handoff design. Overridden by ?teamId= (e.g. tapping a manager).
export const DEMO_TEAM = 6454003;

export interface Player { n: string; p: number; kit?: string; c?: boolean }
export const SQUAD: { gk: Player[]; def: Player[]; mid: Player[]; fwd: Player[]; bench: Player[] } = {
  gk: [{ n: 'Raya', p: 6, kit: 'gk' }],
  def: [{ n: 'Gabriel', p: 8, kit: 'arsenal' }, { n: 'Saliba', p: 2, kit: 'arsenal' }, { n: 'Gvardiol', p: 9, kit: 'mancity' }],
  mid: [{ n: 'Saka', p: 11, kit: 'arsenal' }, { n: 'Palmer', p: 14, kit: 'chelsea', c: true }, { n: 'Mbeumo', p: 5, kit: 'manutd' }, { n: 'Rogers', p: 7, kit: 'avilla' }],
  fwd: [{ n: 'Haaland', p: 4, kit: 'mancity' }, { n: 'Isak', p: 8, kit: 'newcastle' }],
  bench: [{ n: 'Sels', p: 2 }, { n: 'Hall', p: 3 }, { n: 'Anderson', p: 1 }, { n: 'Wood', p: 6 }],
};

export interface AppLeague { id: string; code: string; name: string; type: string; size: number; you: number; move: number; bg: string }
export const LEAGUES: AppLeague[] = [
  { id: 'meriam', code: 'MX', name: "Meriam's XI", type: 'Classic', size: 18, you: 1, move: 2, bg: '#FF5050' },
  { id: 'office', code: 'OI', name: 'Office Invincibles', type: 'Classic', size: 12, you: 3, move: -1, bg: '#12233F' },
  { id: 'kakis', code: 'KK', name: 'KL Fantasy Kakis', type: 'Classic', size: 9, you: 2, move: 1, bg: '#009C54' },
  { id: 'h2h', code: 'SH', name: 'Snapdragon H2H', type: 'Head-to-head', size: 6, you: 4, move: 0, bg: '#322D2D' },
];

export interface TpMove { io: 'in' | 'out'; n: string; pr: string; d: string; dir: 'up' | 'dn' }
export const TPLAN: { bank: string; ft: number; gwStart: number; cols: { moves: TpMove[]; proj: number }[] } = {
  bank: '£1.3m', ft: 1, gwStart: 6,
  cols: [
    { moves: [{ io: 'in', n: 'Mbeumo', pr: '£7.0', d: '▲0.1', dir: 'up' }, { io: 'out', n: 'Rogers', pr: '£5.5', d: '▼0.1', dir: 'dn' }], proj: 68 },
    { moves: [{ io: 'in', n: 'Gordon', pr: '£7.4', d: '▲0.2', dir: 'up' }], proj: 71 },
    { moves: [{ io: 'in', n: 'Wirtz', pr: '£8.6', d: '▲0.3', dir: 'up' }, { io: 'out', n: 'Saka', pr: '£10.1', d: '▼0.2', dir: 'dn' }], proj: 74 },
  ],
};

export interface PredRow { pos: string; cur: string; tm: string; cxp: number; pick: string; pxp: number; act: 'keep' | 'monitor' | 'transfer'; why: string }
export const PREDICT: { horizon: string; cur: number; opt: number; rows: PredRow[] } = {
  horizon: 'Next 3 GWs', cur: 160, opt: 171,
  rows: [
    { pos: 'GK', cur: 'Raya', tm: 'ARS', cxp: 14, pick: 'Raya', pxp: 14, act: 'keep', why: 'Raya — already the optimal pick, kind fixtures.' },
    { pos: 'DEF', cur: 'Gabriel', tm: 'ARS', cxp: 16, pick: 'Gabriel', pxp: 16, act: 'keep', why: 'Gabriel — elite set-piece threat, hold.' },
    { pos: 'DEF', cur: 'Saliba', tm: 'ARS', cxp: 9, pick: 'Saliba', pxp: 9, act: 'monitor', why: 'Saliba — form dip; hold one more GW before acting.' },
    { pos: 'DEF', cur: 'Gvardiol', tm: 'MCI', cxp: 15, pick: 'Gvardiol', pxp: 15, act: 'keep', why: 'Gvardiol — attacking returns, hold.' },
    { pos: 'MID', cur: 'Saka', tm: 'ARS', cxp: 19, pick: 'Wirtz', pxp: 23, act: 'monitor', why: 'Saka — high WC-fatigue load; Wirtz is the projected upgrade.' },
    { pos: 'MID', cur: 'Palmer', tm: 'CHE', cxp: 24, pick: 'Palmer', pxp: 24, act: 'keep', why: 'Palmer — your captain & top projected scorer.' },
    { pos: 'MID', cur: 'Mbeumo', tm: 'MUN', cxp: 15, pick: 'Mbeumo', pxp: 15, act: 'keep', why: 'Mbeumo — fresh transfer in, fixtures turning.' },
    { pos: 'MID', cur: 'Rogers', tm: 'AVL', cxp: 10, pick: 'Gordon', pxp: 17, act: 'transfer', why: 'Rogers → Gordon: +7 projected pts over the run.' },
    { pos: 'FWD', cur: 'Haaland', tm: 'MCI', cxp: 22, pick: 'Haaland', pxp: 22, act: 'keep', why: 'Haaland — never not captain material, hold.' },
    { pos: 'FWD', cur: 'Isak', tm: 'NEW', cxp: 16, pick: 'Isak', pxp: 16, act: 'keep', why: 'Isak — nailed & in form, hold.' },
  ],
};
export const ACT: Record<string, [string, string]> = { keep: ['Keep', 'act-keep'], monitor: ['Monitor', 'act-mon'], transfer: ['Transfer', 'act-out'] };

export type ArticleBody = (string | { q: string })[];
export interface Article { id: string; cat: string; tag: string; tone: string; feat?: boolean; title: string; excerpt: string; author: string; init: string; date: string; read: string; body: ArticleBody }
export const BLOG_CATS = ['All', 'Tips', 'Analysis', 'News'];
export const BLOG: Article[] = [
  { id: 'wc-fatigue', cat: 'Analysis', tag: 'ANALYSIS', tone: '#12233F', feat: true,
    title: 'The World Cup fatigue trap — who to fade in GW1',
    excerpt: 'Three of the most-owned midfielders are deep into the tournament. The minutes data says think twice before you splash on them.',
    author: 'Meriam A.', init: 'MA', date: '12 Jun 2026', read: '5 min',
    body: [
      'World Cup years break the usual FPL rhythm. Players who go deep into the tournament come back late, under-trained and a yellow card away from a rest — and the GW1 price you pay rarely reflects that risk.',
      'Our fatigue tracker has Saka and Palmer both in the red: 420 and 360 tournament minutes respectively, with England projected to reach at least the quarter-finals. Mbeumo (Cameroon) sits amber. Haaland and Isak, whose nations are out or absent, are the fresh-legs exceptions.',
      { q: 'Fade the stars whose first three fixtures are tough AND whose minutes are sky-high. That overlap is where the red arrows live.' },
      'The play is not to ban every World Cup name — it is to be selective. Pair the fatigue read with the fixture ticker and you have a shortlist of premiums worth delaying by a gameweek or two.',
    ] },
  { id: 'gordon', cat: 'Tips', tag: 'TRANSFER TIP', tone: '#009C54',
    title: 'Why Gordon is the form pick over Rogers',
    excerpt: 'A kinder fixture run and a rising xGI make the Newcastle winger the standout sub-£8m midfielder right now.',
    author: 'Idris K.', init: 'IK', date: '11 Jun 2026', read: '3 min',
    body: [
      'Rogers has been a willing points-scorer, but the underlying numbers have cooled and Villa’s fixture swing is unkind. Gordon offers the opposite: a softening run and an xGI trending up four weeks straight.',
      'At a near-identical price, the model projects +7 points over the next three gameweeks for the swap — enough to clear a −4 hit twice over if you are not sitting on a free transfer.',
      'If you can wait for the free transfer, do; the edge holds. But this is the rare move that grades out positive even on a hit.',
    ] },
  { id: 'captaincy', cat: 'Tips', tag: 'CAPTAINCY', tone: '#150000',
    title: 'Captaincy index: Palmer vs Haaland for GW6',
    excerpt: 'Floor versus ceiling. The index leans one way this week — and it is closer than the ownership suggests.',
    author: 'Sofia L.', init: 'SL', date: '10 Jun 2026', read: '4 min',
    body: [
      'Palmer’s penalty and set-piece share give him the higher floor; Haaland the higher ceiling against a leaky back line. For GW6 the index leans Palmer by a whisker — 24 projected to 22 — almost entirely on fixture certainty.',
      'If your mini-league rivals are all on Haaland, Palmer becomes a low-risk differential captain: similar expected return, but a points swing in your favour the week City are kept quiet.',
      'Either is defensible. The mistake is captaining the third name on your sheet to be clever — the ceiling gap is real.',
    ] },
  { id: 'promoted', cat: 'Analysis', tag: 'DEEP DIVE', tone: '#12233F',
    title: 'Promoted-team watch: the nailed cheap defenders',
    excerpt: 'Every season the bargains hide in the newly-promoted back lines. Here are the three most likely to start all season.',
    author: 'Aiman R.', init: 'AR', date: '8 Jun 2026', read: '6 min',
    body: [
      'The cheapest route to a balanced squad runs through promoted defences. The trick is separating the nailed-on starters from the rotation risks before prices rise.',
      'Our confidence model flags three names above 80%: a ball-playing centre-back on set pieces, an overlapping full-back with early attacking returns, and a keeper behind a side that defends deep — clean-sheet odds better than the price implies.',
      'Lock them in early. Promoted bargains are the engine that funds your premium midfield.',
    ] },
  { id: 'chip-rules', cat: 'News', tag: 'NEWS', tone: '#FF5050',
    title: 'The 2025/26 chip rules — what actually changed',
    excerpt: 'Two of each chip, split across the season. We break down the timing windows that matter for mini-leaguers.',
    author: 'Hafiz Z.', init: 'HZ', date: '5 Jun 2026', read: '3 min',
    body: [
      'You now get two of each chip, with one set locked to the first half of the season and one to the second. The headline effect: no more hoarding a Wildcard until GW34.',
      'For mini-league players that rewards planning. Map your Bench Boost to a double gameweek early, and keep a Free Hit in reserve for the first big blank.',
      'The teams who win tight leagues will be the ones who spend chips on schedule, not the ones who save them for a rainy day that never comes.',
    ] },
  { id: 'comeback', cat: 'Tips', tag: 'STRATEGY', tone: '#150000',
    title: 'How to win your mini-league from 4th place',
    excerpt: 'Chasing is a different game to leading. A simple framework for turning a mid-table start into a title run.',
    author: 'Faiz M.', init: 'FM', date: '2 Jun 2026', read: '5 min',
    body: [
      'Leaders protect; chasers attack. If you are 4th, copying the top team’s template just locks in the gap — you need controlled differentials, not contrarianism for its own sake.',
      'Pick one premium your rivals do not own, captain bravely in the weeks they play safe, and bank your chips for the fixtures where variance is highest. Three good differential weeks close most gaps.',
      'Track the rank race, not the raw points. Knowing exactly who you need to overtake — and when they blank — is the whole edge.',
    ] },
];
export const article = (id: string) => BLOG.find((a) => a.id === id) || BLOG[0];
