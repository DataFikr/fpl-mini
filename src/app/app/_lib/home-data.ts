/* Home screen data — the signed-in manager's own hub.
 *
 * Home used to be a static shell pointed at one hardcoded demo league, so every
 * visitor landed on somebody else's mini-league. This builds the screen from the
 * visitor's actual team id instead: their entry, the mini-leagues that entry has
 * joined, and a six-story feed drawn from across those leagues.
 *
 * Cost matters here — Home is the post-login landing screen. The feed is built
 * from league *standings* alone (one cached request per league, capped at
 * `MAX_HEADLINE_LEAGUES`), not from per-manager picks. The richer picks-based
 * engine behind the league Headlines tab fetches up to 30 squads per league;
 * running that across four leagues on first paint would cost ~120 requests.
 */

import { FPLApiService, isFplNotFound } from '@/services/fpl-api';
import { TeamNotFoundError } from './squad-data';

export { TeamNotFoundError };

/** Six stories: enough to feel like a feed, few enough to stay above the fold on desktop. */
export const HEADLINE_COUNT = 6;
/** Leagues scanned for stories. One standings request each, in parallel. */
const MAX_HEADLINE_LEAGUES = 4;

const TONE = {
  bad: '#FF5050',
  good: '#009C54',
  hype: '#150000',
  gossip: '#FFD100',
} as const;

/**
 * Positive, negative and exciting — the three moods the feed balances. `hype`
 * is neither good nor bad news for the reader (a title race, a dead heat); it
 * shares the positive photo pool because a devastated manager over "the race is
 * on" reads as a bug.
 */
export type Mood = 'pos' | 'neg' | 'hype';

export interface HomeHeadline {
  /** Short category chip. */
  tag: string;
  tone: string;
  mood: Mood;
  /** Drives the celebrating/dejected manager photo. */
  sentiment: 'pos' | 'neg';
  title: string;
  /** Narrative paragraph for the click-through modal. */
  body: string;
  leagueId: number;
  leagueName: string;
  team: string;
  manager: string;
  stat: number;
  statLabel: string;
}

export interface HomeLeague {
  id: number;
  name: string;
  size: number;
  rank: number;   // the visitor's rank (0 before the first gameweek is scored)
  move: number;   // places gained since last gameweek (negative = slipped)
}

export interface HomeData {
  manager: {
    teamId: number;
    team: string;
    name: string;
    gwPoints: number;
    totalPoints: number;
    overallRank: number;
  };
  gw: number;
  leagues: HomeLeague[];
  /** The league the visitor is doing best in — the hub's hero tile. */
  topLeague?: HomeLeague;
  headlines: HomeHeadline[];
}

/* ---------------- helpers ---------------- */

/** Drop replacement chars / orphan variation selectors left by broken emoji in FPL names. */
function clean(s: string): string {
  let out = '';
  for (const ch of s || '') {
    const c = ch.codePointAt(0)!;
    if (c === 0xfffd || c === 0xfe0f) continue;
    out += ch;
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

/** The subset of a standings row the feed needs. */
interface Row {
  entry: number;
  team: string;
  manager: string;
  gwPts: number;
  total: number;
  rank: number;
  lastRank: number;
}

interface Candidate extends HomeHeadline {
  /** Drama ranking within its league — higher floats to the top. */
  score: number;
  /** Dedupe key, so one league never contributes the same story twice. */
  kind: string;
}

/* ---------------- story generation ---------------- */

/**
 * Every story this league can offer, best first.
 *
 * Deliberately standings-only. `me` is the visitor's row when they appear in
 * the fetched page; their rank is passed separately because a large league
 * pages at 50 and the entry feed knows their position either way.
 */
function storiesFor(
  league: HomeLeague,
  rows: Row[],
  me: Row | undefined,
  gw: number
): Candidate[] {
  const out: Candidate[] = [];
  if (rows.length === 0) return out;

  const name = league.name;
  const base = { leagueId: league.id, leagueName: name };
  const push = (c: Omit<Candidate, 'leagueId' | 'leagueName' | 'sentiment'>) =>
    out.push({ ...base, ...c, sentiment: c.mood === 'neg' ? 'neg' : 'pos' });

  const byTotal = [...rows].sort((a, b) => b.total - a.total);
  const leader = byTotal[0];
  const tail = byTotal[byTotal.length - 1];
  const topGw = [...rows].sort((a, b) => b.gwPts - a.gwPts)[0];
  const avg = Math.round(rows.reduce((a, r) => a + r.gwPts, 0) / rows.length);
  const scored = rows.some((r) => r.total > 0);

  // Nothing has been scored yet: the roster is real, every number is a zero.
  if (!scored) {
    push({
      tag: 'ON THE GRID', tone: TONE.hype, mood: 'hype', score: 30,
      title: `${name} is locked in for ${gw === 1 ? 'the season opener' : `GW${gw}`} — ${league.size} ${plural(league.size, 'manager')}, nothing on the board yet`,
      body: `${league.size} ${plural(league.size, 'manager has', 'managers have')} joined ${name} and not one point has been scored. Everyone is level, every armband is still a clean sheet of paper, and whoever gets GW${gw} right takes the first lead of the season.`,
      team: name, manager: `${league.size} ${plural(league.size, 'manager')}`, stat: league.size, statLabel: 'managers',
      kind: 'preseason',
    });
    return out;
  }

  /* --- the visitor's own week: the stories they came here for --- */
  if (me) {
    const gap = leader.total - me.total;
    const above = byTotal[byTotal.indexOf(me) - 1];
    const below = byTotal[byTotal.indexOf(me) + 1];

    if (me.rank === 1) {
      push({
        tag: 'TOP OF THE PILE', tone: TONE.good, mood: 'pos', score: 100,
        title: `You lead ${name} on ${me.total} points — the view from the top is yours`,
        body: `${me.team} sits top of ${name} on ${me.total} points after GW${gw}. The hardest job in fantasy football is not getting here, it is staying here — and ${!below ? 'the chasing pack is already recalculating' : me.total === below.total ? `${below.team} is level with you on points` : `${below.team} is only ${me.total - below.total} ${plural(me.total - below.total, 'point')} back`}.`,
        team: me.team, manager: me.manager, stat: me.total, statLabel: 'total pts',
        kind: 'you-lead',
      });
    }

    if (me.lastRank > 0 && me.lastRank > me.rank) {
      const up = me.lastRank - me.rank;
      push({
        tag: 'GREEN ARROW', tone: TONE.good, mood: 'pos', score: 92,
        title: `You climb ${up} ${plural(up, 'place')} to ${ordinal(me.rank)} in ${name}`,
        body: `GW${gw} moved ${me.team} ${up} ${plural(up, 'place')} up ${name}, from ${ordinal(me.lastRank)} to ${ordinal(me.rank)}. Momentum in a mini-league is quiet and cumulative — a couple more weeks like this and the managers above you start looking over their shoulders.`,
        team: me.team, manager: me.manager, stat: up, statLabel: 'places up',
        kind: 'you-move',
      });
    } else if (me.lastRank > 0 && me.rank > me.lastRank) {
      const down = me.rank - me.lastRank;
      push({
        tag: 'RED ARROW', tone: TONE.bad, mood: 'neg', score: 92,
        title: `You slip ${down} ${plural(down, 'place')} to ${ordinal(me.rank)} in ${name}`,
        body: `${me.team} lost ${down} ${plural(down, 'place')} in ${name} this gameweek, sliding to ${ordinal(me.rank)}. One bad week is noise; two is a pattern. ${above ? `${above.team} is ${above.total - me.total} ${plural(above.total - me.total, 'point')} ahead — that is the gap to close first.` : 'The route back starts with the captaincy.'}`,
        team: me.team, manager: me.manager, stat: down, statLabel: 'places lost',
        kind: 'you-move',
      });
    }

    if (me.rank > 1 && gap > 0) {
      push({
        tag: 'THE CHASE', tone: TONE.hype, mood: 'hype', score: 80,
        title: `${gap} ${plural(gap, 'point')} separate you from ${leader.team} at the top of ${name}`,
        body: `${leader.team} leads ${name} on ${leader.total}; you are on ${me.total}. ${gap} ${plural(gap, 'point')} is ${gap <= 15 ? 'one good captaincy call' : gap <= 60 ? 'a month of steady green arrows' : 'a long road, but the season is longer'}. This is the number to keep an eye on every week.`,
        team: leader.team, manager: leader.manager, stat: gap, statLabel: 'pts behind',
        kind: 'chase',
      });
    }

    if (above && above.total - me.total <= 10) {
      const d = above.total - me.total;
      push({
        tag: d === 0 ? 'DEAD LEVEL' : 'WITHIN REACH', tone: TONE.hype, mood: 'hype', score: 84,
        title: d === 0
          ? `You are dead level with ${above.team} on ${me.total} points in ${name}`
          : `Just ${d} ${plural(d, 'point')} between you and ${above.team} in ${name}`,
        body: `${above.team} sits ${ordinal(above.rank)} in ${name}, ${d === 0 ? `level with ${me.team} on ${me.total} and ahead only on the tiebreak` : `${d} ${plural(d, 'point')} above ${me.team}`}. A gap that small is settled by a single differential or one brave armband — and it can flip in either direction this week.`,
        team: above.team, manager: above.manager, stat: d, statLabel: 'pt gap',
        kind: 'duel',
      });
    } else if (below && me.total - below.total <= 10) {
      const d = me.total - below.total;
      push({
        tag: d === 0 ? 'DEAD LEVEL' : 'ON YOUR HEELS', tone: TONE.bad, mood: 'neg', score: 82,
        title: d === 0
          ? `${below.team} has drawn dead level with you on ${me.total} points in ${name}`
          : `${below.team} is only ${d} ${plural(d, 'point')} behind you in ${name}`,
        body: `${below.team} has ${d === 0 ? `pulled level with ${me.team} on ${me.total} points` : `closed to within ${d} ${plural(d, 'point')} of ${me.team}`} in ${name}. There is no comfort in ${ordinal(me.rank)} when the manager behind you is this close — one blank gameweek and the places swap.`,
        team: below.team, manager: below.manager, stat: d, statLabel: 'pt gap',
        kind: 'duel',
      });
    }

    const vsAvg = me.gwPts - avg;
    if (vsAvg >= 8) {
      push({
        tag: 'BIG WEEK', tone: TONE.good, mood: 'pos', score: 76,
        title: `Your ${me.gwPts} in GW${gw} beat the ${name} average by ${vsAvg}`,
        body: `${me.team} banked ${me.gwPts} points in GW${gw} while ${name} averaged ${avg}. Gameweeks like this are how mini-leagues are won — not with one heroic week, but by being ${vsAvg} clear of the room while everyone else takes hits.`,
        team: me.team, manager: me.manager, stat: me.gwPts, statLabel: 'points',
        kind: 'you-week',
      });
    } else if (vsAvg <= -8) {
      push({
        tag: 'ROUGH WEEK', tone: TONE.bad, mood: 'neg', score: 76,
        title: `Your ${me.gwPts} in GW${gw} trailed the ${name} average by ${-vsAvg}`,
        body: `${name} averaged ${avg} in GW${gw}. ${me.team} managed ${me.gwPts} — ${-vsAvg} short of the room. Falling behind the average is the quiet way to lose a mini-league, because it costs nothing dramatic and it costs it every single week.`,
        team: me.team, manager: me.manager, stat: me.gwPts, statLabel: 'points',
        kind: 'you-week',
      });
    }
  }

  /* --- the rest of the league --- */
  if (!me || leader.entry !== me.entry) {
    push({
      tag: 'FRONT RUNNER', tone: TONE.hype, mood: 'hype', score: 52,
      title: `${leader.team} leads ${name} after GW${gw} on ${leader.total} points`,
      body: `${leader.manager}'s ${leader.team} sits top of ${name} on ${leader.total} points after GW${gw}. Someone has to be caught, and right now this is the team everyone else is measuring themselves against.`,
      team: leader.team, manager: leader.manager, stat: leader.total, statLabel: 'total pts',
      kind: 'leader',
    });
  }

  if (topGw && (!me || topGw.entry !== me.entry)) {
    const clear = topGw.gwPts - avg;
    push({
      tag: 'HIGH SCORE', tone: TONE.good, mood: 'pos', score: 58 + Math.max(0, clear),
      title: `${topGw.team} posts the GW${gw} high score in ${name} — ${topGw.gwPts} points`,
      body: `${topGw.manager} took the GW${gw} bragging rights in ${name} with ${topGw.gwPts} points, ${clear > 0 ? `${clear} clear of the league average` : 'the best of a tough week for everybody'}. In the group chat, this is the only number that matters until Saturday.`,
      team: topGw.team, manager: topGw.manager, stat: topGw.gwPts, statLabel: 'points',
      kind: 'high-score',
    });
  }

  const riser = rows.filter((r) => r.lastRank > 0 && r.lastRank - r.rank > 0 && (!me || r.entry !== me.entry))
    .sort((a, b) => (b.lastRank - b.rank) - (a.lastRank - a.rank))[0];
  if (riser) {
    const up = riser.lastRank - riser.rank;
    push({
      tag: 'ON THE CHARGE', tone: TONE.good, mood: 'pos', score: 50 + up * 2,
      title: `${riser.team} surges ${up} ${plural(up, 'place')} to ${ordinal(riser.rank)} in ${name}`,
      body: `${riser.manager}'s ${riser.team} is the fastest-moving team in ${name}, up ${up} ${plural(up, 'place')} to ${ordinal(riser.rank)} in GW${gw}. Whatever they are doing with the armband, it is working — and it is worth watching before they do it again.`,
      team: riser.team, manager: riser.manager, stat: up, statLabel: 'places up',
      kind: 'riser',
    });
  }

  const faller = rows.filter((r) => r.lastRank > 0 && r.rank - r.lastRank > 0 && (!me || r.entry !== me.entry))
    .sort((a, b) => (b.rank - b.lastRank) - (a.rank - a.lastRank))[0];
  if (faller) {
    const down = faller.rank - faller.lastRank;
    push({
      tag: 'FREEFALL', tone: TONE.bad, mood: 'neg', score: 50 + down * 2,
      title: `${faller.team} tumbles ${down} ${plural(down, 'place')} to ${ordinal(faller.rank)} in ${name}`,
      body: `${faller.manager}'s ${faller.team} has dropped ${down} ${plural(down, 'place')} in ${name}, down to ${ordinal(faller.rank)}. Mini-league slides are rarely one disaster — they are a captaincy that misfires, a bench that hauls, and a hit that never pays. All three, apparently.`,
      team: faller.team, manager: faller.manager, stat: down, statLabel: 'places lost',
      kind: 'faller',
    });
  }

  // Tightest gap anywhere in the table — the duel worth following.
  if (byTotal.length >= 2) {
    let tightest = { a: byTotal[0], b: byTotal[1], gap: byTotal[0].total - byTotal[1].total };
    for (let i = 2; i < byTotal.length; i++) {
      const gap = byTotal[i - 1].total - byTotal[i].total;
      if (gap < tightest.gap) tightest = { a: byTotal[i - 1], b: byTotal[i], gap };
    }
    if (tightest.gap <= 3 && (!me || (tightest.a.entry !== me.entry && tightest.b.entry !== me.entry))) {
      push({
        tag: 'DEAD HEAT', tone: TONE.gossip, mood: 'hype', score: 56,
        title: tightest.gap === 0
          ? `${tightest.a.team} and ${tightest.b.team} are dead level in ${name} on ${tightest.a.total}`
          : `${tightest.a.team} and ${tightest.b.team} are split by ${tightest.gap} ${plural(tightest.gap, 'point')} in ${name}`,
        body: `${tightest.a.team} and ${tightest.b.team} are locked together in ${name}, ${tightest.gap === 0 ? 'level on' : `${tightest.gap} ${plural(tightest.gap, 'point')} apart at`} ${tightest.a.total}. Every transfer and every armband between these two swings a place — and neither of them can afford to blink.`,
        team: tightest.a.team, manager: tightest.a.manager, stat: tightest.gap, statLabel: 'pt gap',
        kind: 'dead-heat',
      });
    }
  }

  if (tail && rows.length >= 4 && (!me || tail.entry !== me.entry)) {
    push({
      tag: 'BASEMENT', tone: TONE.bad, mood: 'neg', score: 40,
      title: `${tail.team} props up ${name} on ${tail.total} points`,
      body: `Somebody has to be last, and in ${name} it is ${tail.manager}'s ${tail.team} on ${tail.total} points. The good news: it is a long season, the wildcard is still in the pocket, and nobody remembers GW${gw} in May.`,
      team: tail.team, manager: tail.manager, stat: tail.total, statLabel: 'total pts',
      kind: 'basement',
    });
  }

  return out.sort((a, b) => b.score - a.score);
}

/**
 * Six stories spread across the visitor's leagues, mixing good news, bad news
 * and a race worth watching.
 *
 * Round-robin over the leagues so no single one monopolises the feed, and each
 * turn prefers a story *type* the feed has not run yet. Both passes are needed:
 * per-league dedupe alone produced six near-identical cards, because every
 * league's most dramatic story tends to be the same kind of story.
 *
 * A final mood pass trades the weakest pick for whichever mood is missing —
 * six green arrows is not a feed, it is a compliment.
 */
function pickHeadlines(byLeague: Candidate[][], want = HEADLINE_COUNT): HomeHeadline[] {
  const picked: Candidate[] = [];
  const takenPerLeague = byLeague.map(() => new Set<string>());
  const takenOverall = new Set<string>();

  let progressed = true;
  while (picked.length < want && progressed) {
    progressed = false;
    for (let i = 0; i < byLeague.length && picked.length < want; i++) {
      const pool = byLeague[i].filter((c) => !takenPerLeague[i].has(c.kind));
      // Already sorted by score, so the first match is the best available.
      const next = pool.find((c) => !takenOverall.has(c.kind)) ?? pool[0];
      if (!next) continue;
      takenPerLeague[i].add(next.kind);
      takenOverall.add(next.kind);
      picked.push(next);
      progressed = true;
    }
  }

  /* Mood balance: no mood may take more than half the feed while another mood
     has a story going spare. Runs until the split is legal or nothing is left
     to trade — and never touches picked[0], the visitor's most relevant story. */
  const cap = Math.ceil(want / 2);
  const remaining = byLeague.flat().filter((c) => !picked.includes(c)).sort((a, b) => b.score - a.score);
  const tally = () => picked.reduce<Record<Mood, number>>(
    (a, c) => ((a[c.mood] += 1), a), { pos: 0, neg: 0, hype: 0 }
  );

  for (let guard = 0; guard < want; guard++) {
    const counts = tally();
    const moods: Mood[] = ['pos', 'neg', 'hype'];
    const over = moods.filter((m) => counts[m] > cap).sort((a, b) => counts[b] - counts[a])[0];
    if (!over) break;
    const under = moods.filter((m) => counts[m] < cap).sort((a, b) => counts[a] - counts[b]);
    const pickedKinds = new Set(picked.map((c) => c.kind));
    const eligible = remaining.filter((c) => under.includes(c.mood));
    const replacement = eligible.find((c) => !pickedKinds.has(c.kind)) ?? eligible[0];
    if (!replacement) break;

    // Drop the weakest story of the dominant mood, never the lead.
    let victim = -1;
    for (let i = 1; i < picked.length; i++) {
      if (picked[i].mood === over && (victim < 0 || picked[i].score < picked[victim].score)) victim = i;
    }
    if (victim < 0) break;
    picked[victim] = replacement;
    remaining.splice(remaining.indexOf(replacement), 1);
  }

  return picked.map(({ score, kind, ...story }) => story);
}

/* ---------------- entry point ---------------- */

export async function getHomeData(teamId: number): Promise<HomeData> {
  const fpl = new FPLApiService();
  // `getManagerEntry` is the authoritative existence check — it throws
  // FplNotFoundError on a 404 rather than returning an empty-but-real shape.
  const [entry, gw] = await Promise.all([
    fpl.getManagerEntry(teamId).catch((e) => {
      throw isFplNotFound(e) ? new TeamNotFoundError(teamId) : e;
    }),
    fpl.getCurrentGameweek().catch(() => 1),
  ]);

  const classic: any[] = (entry as any)?.leagues?.classic || [];
  const leagues: HomeLeague[] = classic
    .filter((l) => l.league_type === 'x') // private mini-leagues only — no global, no H2H
    .sort((a, b) => (a.rank_count || 0) - (b.rank_count || 0))
    .map((l) => ({
      id: l.id,
      name: clean(l.name),
      size: l.rank_count || 0,
      rank: l.entry_rank || 0,
      move: (l.entry_last_rank || l.entry_rank || 0) - (l.entry_rank || 0),
    }));

  // "Top league" is where they are doing best, by finishing position rather than
  // raw rank — 4th of 12 is a better week than 6th of 200. Unranked leagues
  // (pre-season) fall back to the smallest, which is the most personal.
  const ranked = leagues.filter((l) => l.rank > 0 && l.size > 0);
  const topLeague = ranked.length
    ? [...ranked].sort((a, b) => (a.rank / a.size) - (b.rank / b.size) || a.size - b.size)[0]
    : leagues[0];

  // Scan the leagues most likely to matter: the hero first, then the smallest.
  const scan = [topLeague, ...leagues.filter((l) => l.id !== topLeague?.id)]
    .filter((l): l is HomeLeague => !!l)
    .slice(0, MAX_HEADLINE_LEAGUES);

  const standings = await Promise.allSettled(scan.map((l) => fpl.getLeagueStandings(l.id)));

  const byLeague: Candidate[][] = [];
  standings.forEach((res, i) => {
    if (res.status !== 'fulfilled') return;
    const s: any = res.value;
    const results: any[] = s?.standings?.results || [];
    // Until a gameweek has been scored FPL returns an empty `results` and lists
    // members under `new_entries` instead — see league-data.ts.
    const roster: Row[] = results.length
      ? results.map((r) => ({
          entry: r.entry,
          team: clean(r.entry_name),
          manager: clean(r.player_name),
          gwPts: r.event_total || 0,
          total: r.total || 0,
          rank: r.rank || 0,
          lastRank: r.last_rank || 0,
        }))
      : ((s?.new_entries?.results || []) as any[]).map((n) => ({
          entry: n.entry,
          team: clean(n.entry_name),
          manager: clean(`${n.player_first_name ?? ''} ${n.player_last_name ?? ''}`),
          gwPts: 0, total: 0, rank: 0, lastRank: 0,
        }));

    const stories = storiesFor(scan[i], roster, roster.find((r) => r.entry === teamId), gw);
    if (stories.length) byLeague.push(stories);
  });

  return {
    manager: {
      teamId,
      team: clean((entry as any)?.name) || `Team ${teamId}`,
      name: clean(`${(entry as any)?.player_first_name ?? ''} ${(entry as any)?.player_last_name ?? ''}`),
      gwPoints: (entry as any)?.summary_event_points ?? 0,
      totalPoints: (entry as any)?.summary_overall_points ?? 0,
      overallRank: (entry as any)?.summary_overall_rank ?? 0,
    },
    gw,
    leagues,
    topLeague,
    headlines: pickHeadlines(byLeague),
  };
}
