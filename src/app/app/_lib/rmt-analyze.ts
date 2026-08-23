/* Squad verdict — "Rank My Team".
 *
 * Derives a data-driven verdict (score /10 + summary + insight bullets) from a
 * squad's starting XI, grounded in the live FPL bootstrap feed. Pure and
 * token-free — runs on data already fetched for the pitch.
 *
 * Everything here is season-stage aware. The season label, how many gameweeks
 * of evidence exist, and which of the XI have actually kicked off are all
 * derived from the feed rather than written into the copy: a verdict that says
 * "over the full season" after one gameweek is not merely stale, it also
 * misreads its own inputs — season totals and season minutes mean something
 * completely different at GW1 than at GW38.
 */

import type { PredictionData } from './prediction';
import { seasonLabelFromEvents } from '@/lib/season';

export interface RmtInsight { k: 'good' | 'warn' | 'bad'; n: string; d: string }

/** Who in the XI cannot be trusted to play, and what has yet to happen this GW. */
export interface SquadAvailability {
  /** Ruled out: injured, suspended or otherwise unavailable. */
  out: { name: string; label: string }[];
  /** Flagged but not ruled out — a chance-of-playing under 100%. */
  doubtful: { name: string; label: string }[];
  /** Starters whose gameweek fixture has not kicked off yet. */
  toPlay: number;
  /** Starters in a match that is under way (or awaiting bonus confirmation). */
  live: number;
  /** Starters with no fixture at all this gameweek. */
  blanks: number;
}

export interface SquadVerdict {
  score: number;
  tag: string;
  summary: string;
  insights: RmtInsight[];
  seasonTotal: number; // XI combined points so far this season
  seasonPpg: number;   // XI points per gameweek so far this season
  /**
   * The full-XI rate the score is built on, extrapolated from the starters who
   * have actually played. Equals `seasonPpg` once the whole XI has evidence.
   */
  pacePpg: number;
  /** Mono strapline above the summary — states the season and the sample size. */
  scopeLabel: string;
  /** Fewer than four gameweeks of evidence: the verdict is provisional. */
  earlySeason: boolean;
  availability: SquadAvailability;
}

/** Bootstrap context the verdict needs to know where in the season it is. */
export interface VerdictContext {
  /** The gameweek being viewed. */
  gw: number;
  /** `bootstrap.events`. */
  events: any[];
  /** The full fixture list (`/fixtures/`). */
  fixtures: any[];
}

function round1(n: number) { return Math.round(n * 10) / 10; }
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

function tagFor(score: number) {
  if (score >= 8) return 'Elite shape';
  if (score >= 6.5) return 'Strong team';
  if (score >= 5) return 'Top-half team';
  if (score >= 3.5) return 'Work to do';
  return 'Rebuild needed';
}

/** Status codes the FPL feed uses for a player who will not feature. */
const OUT_STATUS: Record<string, string> = { i: 'injured', s: 'suspended', u: 'unavailable', n: 'on loan' };

interface AvailabilityRead {
  availability: SquadAvailability;
  /** Element ids whose gameweek fixture has not finished — no evidence yet. */
  pending: Set<number>;
}

/** Read the XI's availability and this gameweek's fixture state off the feed. */
function readAvailability(starterEls: any[], ctx: VerdictContext): AvailabilityRead {
  const out: SquadAvailability['out'] = [];
  const doubtful: SquadAvailability['doubtful'] = [];

  for (const el of starterEls) {
    const name = el.web_name ?? 'Unknown';
    const chance = el.chance_of_playing_next_round;
    const reason = OUT_STATUS[el.status];
    if (reason || chance === 0) {
      out.push({ name, label: reason ?? 'ruled out' });
    } else if (el.status === 'd' || (typeof chance === 'number' && chance < 100)) {
      doubtful.push({ name, label: typeof chance === 'number' ? `${chance}% to play` : 'doubtful' });
    }
  }

  // A club can have no fixture (blank) or two (double) in a gameweek, so the
  // per-team fixture list decides a starter's state, not a single match.
  const byTeam = new Map<number, any[]>();
  for (const f of ctx.fixtures || []) {
    if (f.event !== ctx.gw) continue;
    for (const t of [f.team_h, f.team_a]) {
      if (!byTeam.has(t)) byTeam.set(t, []);
      byTeam.get(t)!.push(f);
    }
  }

  let toPlay = 0, live = 0, blanks = 0;
  const pending = new Set<number>();
  for (const el of starterEls) {
    const fx = byTeam.get(el.team) || [];
    if (fx.length === 0) { blanks += 1; continue; }
    // `finished_provisional` is the honest "the match is over" flag — `finished`
    // stays false for hours afterwards while bonus points are confirmed.
    if (fx.some((f) => !f.started)) { toPlay += 1; pending.add(el.id); }
    else if (fx.some((f) => !f.finished_provisional)) { live += 1; pending.add(el.id); }
  }

  return { availability: { out, doubtful, toPlay, live, blanks }, pending };
}

/**
 * @param starterEls the 11 starting bootstrap elements
 * @param prediction the squad's best-XI projection (for the upside figure)
 * @param ctx        where in the season this verdict is being taken
 */
export function computeVerdict(
  starterEls: any[],
  prediction: PredictionData,
  ctx: VerdictContext
): SquadVerdict {
  const season = seasonLabelFromEvents(ctx.events);
  // Gameweeks whose deadline has passed — the sample the season aggregates are
  // drawn from. Distinct from `completedGws`, which excludes a live one.
  const now = Date.now();
  const playedGws = Math.max(1, (ctx.events || []).filter((e) => Date.parse(e.deadline_time) <= now).length);
  const completedGws = (ctx.events || []).filter((e) => e.finished).length;
  const earlySeason = playedGws <= 3;
  const { availability, pending } = readAvailability(starterEls, ctx);

  const rows = starterEls.map((el) => ({
    el,
    pts: el.total_points || 0,
    ppg: parseFloat(el.points_per_game) || 0,
    mins: el.minutes || 0,
  }));

  const seasonTotal = rows.reduce((a, s) => a + s.pts, 0);
  const seasonPpg = round1(rows.reduce((a, s) => a + s.ppg, 0)); // XI points/GW so far
  const topScorer = rows.slice().sort((a, b) => b.pts - a.pts)[0];
  const topPpg = rows.slice().sort((a, b) => b.ppg - a.ppg)[0];
  const premiumDef = starterEls.filter((el) => el.element_type === 2 && el.now_cost >= 55).length;

  /* Only starters with evidence feed the score: they have minutes, or their
     fixture has finished and they genuinely did not play. A starter whose match
     has not kicked off contributes a structural zero — mid-gameweek, six
     unplayed fixtures would otherwise score every squad in the game as a
     rebuild, no matter how good it is. The rate is extrapolated back to a full
     XI so the benchmark below stays a full-gameweek benchmark. */
  const rated = rows.filter((s) => s.mins > 0 || !pending.has(s.el.id));
  const pacePpg = rated.length
    ? round1((rated.reduce((a, s) => a + s.ppg, 0) / rated.length) * rows.length)
    : seasonPpg;
  const partial = rated.length < rows.length;

  // Minutes risk scales with the season so far: "under half a season" is
  // meaningless at GW1, where half of what has been available is 45 minutes.
  // Only rated starters can be judged on it — the rest have not had the chance.
  const minutesFloor = playedGws * 90 * 0.55;
  const rotationRisk = rated.filter((s) => s.mins < minutesFloor);
  const upside = prediction.opt - prediction.cur;

  const base = clamp((pacePpg - 32) / 3, 1, 9.3);
  const captaincyBonus = topPpg.ppg >= 6 ? 0.6 : topPpg.ppg >= 5 ? 0.3 : 0;
  const rotationPenalty = Math.min(rotationRisk.length * 0.15, 0.9);
  // An unavailable starter is a guaranteed zero, so it outweighs any form read.
  const availabilityPenalty = Math.min(availability.out.length * 0.5 + availability.doubtful.length * 0.15, 1.6);
  const score = clamp(round1(base + captaincyBonus - rotationPenalty - availabilityPenalty), 1, 9.9);
  const tag = tagFor(score);

  const sampleNote = earlySeason ? `over ${playedGws} ${plural(playedGws, 'gameweek')}` : `over ${playedGws} gameweeks`;

  const insights: RmtInsight[] = [];

  // 1. Availability first — a flagged starter is the only thing here the user
  //    can still act on before the deadline.
  if (availability.out.length) {
    const n = availability.out.length;
    const names = availability.out.map((p) => `${p.name} (${p.label})`).join(', ');
    insights.push({
      k: 'bad',
      n: `${n} ${plural(n, 'starter')} ruled out`,
      d: `${names} — ${n === 1 ? 'a guaranteed blank' : 'guaranteed blanks'} unless ${plural(n, 'he is', 'they are')} moved out before the deadline.`,
    });
  } else if (availability.doubtful.length) {
    const n = availability.doubtful.length;
    const names = availability.doubtful.map((p) => `${p.name} (${p.label})`).join(', ');
    insights.push({
      k: 'warn',
      n: `${n} fitness ${plural(n, 'doubt')} in the XI`,
      d: `${names} — flagged but not ruled out. Check the press conference before the deadline.`,
    });
  } else {
    insights.push({ k: 'good', n: 'A clean bill of health', d: 'Every one of your XI is fully available — no flags, no suspensions.' });
  }

  // 2. What has actually happened yet this gameweek: the verdict may be reading
  //    a scoreline that is still half-written.
  if (availability.toPlay > 0 || availability.live > 0) {
    const parts: string[] = [];
    if (availability.toPlay) parts.push(`${availability.toPlay} ${plural(availability.toPlay, 'is', 'are')} yet to kick off`);
    if (availability.live) parts.push(`${availability.live} ${plural(availability.live, 'is', 'are')} still on the pitch`);
    insights.push({
      k: 'warn',
      n: `GW${ctx.gw} is not settled`,
      d: `${parts.join(' and ')}, so this verdict is provisional — it moves as those matches finish.`,
    });
  }
  if (availability.blanks > 0) {
    const n = availability.blanks;
    insights.push({
      k: 'bad',
      n: `${n} ${plural(n, 'blank')} in the XI`,
      d: `${n} ${plural(n, 'starter has', 'starters have')} no GW${ctx.gw} fixture at all — ${n === 1 ? 'a certain zero' : 'certain zeroes'}.`,
    });
  }

  // 3. Squad shape.
  insights.push(topPpg.ppg >= 6
    ? { k: 'good', n: 'Elite captaincy anchor', d: `${topPpg.el.web_name} is averaging ${round1(topPpg.ppg)} pts/GW this season — a top-end armband.` }
    : { k: 'warn', n: 'No standout captain', d: `Your best scorer so far (${topPpg.el.web_name}, ${round1(topPpg.ppg)}/GW) gives only a capped ceiling.` });
  insights.push(premiumDef >= 2
    ? { k: 'good', n: 'Solid defensive base', d: `${premiumDef} premium defenders give you clean-sheet upside week to week.` }
    : { k: 'warn', n: 'Thin at the back', d: `Only ${premiumDef} premium defender${premiumDef === 1 ? '' : 's'} — clean sheets are being left on the table.` });
  if (rotationRisk.length >= 2 && playedGws >= 2) {
    insights.push({
      k: 'warn',
      n: 'Minutes risk in the XI',
      d: `${rotationRisk.length} starters have played under half the minutes available to them ${sampleNote} — rotation is eating their returns.`,
    });
  }
  insights.push(upside >= 6
    ? { k: 'warn', n: `+${upside} pts on the table`, d: `The model's best XI projects ${upside} more pts over the run — see the Prediction tab.` }
    : { k: 'good', n: 'Top scorer', d: `${topScorer.el.web_name} leads the XI with ${topScorer.pts} points this season.` });

  // Summary — the sample size is stated up front, because at GW1 these numbers
  // carry a fraction of the weight they do in May.
  const ceiling = topPpg.ppg >= 6 ? 'elite' : topPpg.ppg >= 5 ? 'solid' : 'limited';
  const defPhrase = premiumDef >= 2 ? 'the defence is well covered' : 'the defence looks thin';
  const availPhrase = availability.out.length
    ? `${availability.out.length} ${plural(availability.out.length, 'starter is', 'starters are')} unavailable`
    : availability.doubtful.length
      ? `${availability.doubtful.length} ${plural(availability.doubtful.length, 'starter carries a fitness flag', 'starters carry fitness flags')}`
      : 'everyone is fit';
  const unfinished = availability.toPlay + availability.live;
  const pendingPhrase = unfinished
    ? ` ${unfinished} of the XI ${plural(unfinished, 'has', 'have')} not finished GW${ctx.gw}, so treat this as provisional.`
    : '';
  const opener = earlySeason
    ? `${playedGws} ${plural(playedGws, 'gameweek')} into ${season}`
    : `Across ${playedGws} gameweeks of ${season}`;
  const ratePhrase = partial
    ? `the ${rated.length} of your XI who have played have banked ${seasonTotal} points, a full-XI pace of ${pacePpg} pts/GW`
    : `your XI is averaging ${seasonPpg} pts/GW (${seasonTotal} total)`;
  const summary = `${opener}, ${ratePhrase}. Your captaincy ceiling is ${ceiling}, ${defPhrase}, and ${availPhrase}.${pendingPhrase}`;

  const settled = completedGws >= playedGws;
  const scopeLabel = partial
    ? `${season} · GW${ctx.gw} in play · ${seasonTotal} pts so far · ${pacePpg}/GW XI pace`
    : `${season} · ${playedGws} GW${playedGws === 1 ? '' : 's'} ${settled ? 'played' : 'in play'} · ${seasonTotal} pts · ${seasonPpg}/GW avg`;

  return { score, tag, summary, insights: insights.slice(0, 5), seasonTotal, seasonPpg, pacePpg, scopeLabel, earlySeason, availability };
}
