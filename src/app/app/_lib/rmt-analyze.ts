/* Squad verdict — "Rank My Team".
 *
 * Derives a data-driven verdict (score /10 + summary + insight bullets) from a
 * squad's starting XI, grounded in the player's FULL 2025/26 season record
 * (total points, season points-per-game, minutes) from the FPL bootstrap feed.
 * Pure and token-free — runs on live data already fetched for the pitch. */

import type { PredictionData } from './prediction';

export interface RmtInsight { k: 'good' | 'warn' | 'bad'; n: string; d: string }
export interface SquadVerdict {
  score: number;
  tag: string;
  summary: string;
  insights: RmtInsight[];
  seasonTotal: number; // XI combined points over the full season
  seasonPpg: number;   // XI average points per gameweek over the season
}

function round1(n: number) { return Math.round(n * 10) / 10; }
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
function tagFor(score: number) {
  if (score >= 8) return 'Elite shape';
  if (score >= 6.5) return 'Strong team';
  if (score >= 5) return 'Top-half team';
  if (score >= 3.5) return 'Work to do';
  return 'Rebuild needed';
}

/**
 * @param starterEls the 11 starting bootstrap elements (full-season aggregates)
 * @param prediction the squad's best-XI projection (for the upside figure)
 */
export function computeVerdict(starterEls: any[], prediction: PredictionData): SquadVerdict {
  const season = starterEls.map((el) => ({
    el,
    pts: el.total_points || 0,
    ppg: parseFloat(el.points_per_game) || 0,
    mins: el.minutes || 0,
  }));

  const seasonTotal = season.reduce((a, s) => a + s.pts, 0);
  const seasonPpg = round1(season.reduce((a, s) => a + s.ppg, 0)); // XI points/GW across the season
  const topScorer = season.slice().sort((a, b) => b.pts - a.pts)[0];
  const topPpg = season.slice().sort((a, b) => b.ppg - a.ppg)[0];
  const premiumDef = starterEls.filter((el) => el.element_type === 2 && el.now_cost >= 55).length;
  const riskCount = season.filter((s) => s.mins < 1500).length; // < ~half a season of minutes
  const upside = prediction.opt - prediction.cur;

  const base = clamp((seasonPpg - 32) / 3, 1, 9.3);
  const captaincyBonus = topPpg.ppg >= 6 ? 0.6 : topPpg.ppg >= 5 ? 0.3 : 0;
  const riskPenalty = Math.min(riskCount * 0.2, 1);
  const score = clamp(round1(base + captaincyBonus - riskPenalty), 1, 9.9);
  const tag = tagFor(score);

  const insights: RmtInsight[] = [];
  insights.push(topPpg.ppg >= 6
    ? { k: 'good', n: 'Elite captaincy anchor', d: `${topPpg.el.web_name} averaged ${round1(topPpg.ppg)} pts/GW across 2025/26 — a top-end armband.` }
    : { k: 'warn', n: 'No standout captain', d: `Your best season scorer (${topPpg.el.web_name}, ${round1(topPpg.ppg)}/GW) gives only a capped ceiling.` });
  insights.push(premiumDef >= 2
    ? { k: 'good', n: 'Solid defensive base', d: `${premiumDef} premium defenders gave you clean-sheet upside all season.` }
    : { k: 'warn', n: 'Thin at the back', d: `Only ${premiumDef} premium defender${premiumDef === 1 ? '' : 's'} — clean sheets were left on the table.` });
  if (riskCount >= 2) insights.push({ k: 'bad', n: 'Minutes risk in the XI', d: `${riskCount} starters logged under half a season of minutes — rotation/injury hurt their returns.` });
  insights.push(upside >= 6
    ? { k: 'warn', n: `+${upside} pts on the table`, d: `The model's best XI projects ${upside} more pts over the run — see the Prediction tab.` }
    : { k: 'good', n: 'Top scorer', d: `${topScorer.el.web_name} led the XI with ${topScorer.pts} points this season.` });

  const ceiling = topPpg.ppg >= 6 ? 'elite' : topPpg.ppg >= 5 ? 'solid' : 'limited';
  const defPhrase = premiumDef >= 2 ? 'the defence was well covered' : 'the defence looked thin';
  const riskPhrase = riskCount >= 2 ? 'and minutes risk capped some returns' : 'and minutes were secure';
  const summary = `Over the full 2025/26 season your XI averaged ${seasonPpg} pts/GW (${seasonTotal} total). Your captaincy ceiling is ${ceiling}, ${defPhrase}, ${riskPhrase}.`;

  return { score, tag, summary, insights: insights.slice(0, 4), seasonTotal, seasonPpg };
}
