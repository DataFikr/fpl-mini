/**
 * The single import boundary between the video workspace and the app.
 *
 * Every number on screen comes from here, which is what makes the skill's
 * "every number is real and current" gate enforceable rather than aspirational
 * — correcting src/app/app/_lib/fatigue-data.ts corrects the video on the next
 * render, with no re-edit.
 */
export {
  WC_FATIGUE,
  NATIONS,
  type WcFatiguePlayer,
  type WcNation,
  type WcMatch,
} from '../../src/app/app/_lib/fatigue-data';

import { WC_FATIGUE, NATIONS } from '../../src/app/app/_lib/fatigue-data';

/** Total World Cup minutes for a player. */
export const totalMins = (p: { mins: number[] }) => p.mins.reduce((a, b) => a + b, 0);

/** Matches actually played (a 0 slot is an unused substitute). */
export const appearances = (p: { mins: number[] }) => p.mins.filter((m) => m > 0).length;

/** Fatigue list, heaviest load first. */
export const byLoad = [...WC_FATIGUE].sort((a, b) => totalMins(b) - totalMins(a));

export const highRisk = byLoad.filter((p) => p.risk === 'hi');
export const lowRisk = byLoad.filter((p) => p.risk === 'lo');

/** The headline player — the heaviest tournament load in the dataset. */
export const heaviest = byLoad[0];

/** The inversion — the freshest player, the payoff at 45s. */
export const freshest = byLoad[byLoad.length - 1];

/** Per-match rows for the expand beat, skipping matches the player sat out. */
export const playedMatches = (p: { nation: string; mins: number[] }) =>
  NATIONS[p.nation].matches
    .map((m, i) => ({ ...m, mins: p.mins[i] }))
    .filter((m) => m.mins > 0);
