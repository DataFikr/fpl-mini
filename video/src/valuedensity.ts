import raw from './data/fr17-valuedensity.json';

/**
 * FR-17's data — the app's own `projectPlayer()` output for the upcoming
 * gameweek, captured by scripts/capture-fr17.mts.
 *
 * Captured rather than imported live because Remotion renders offline and a
 * mid-render fetch would let two beats disagree with each other. The capture
 * script carries the guards: it refuses to write if Haaland is no longer the
 * top projection (which would break the hook) or if the swap stops clearing his
 * price (which would break beat 4).
 *
 * Points-per-million is derived here and in the capture, never typed. The
 * source outline's "£15.5m Trifecta" was £25.0m of players; arithmetic that
 * only ever runs in code is how that class of error stays out of a render.
 */
export interface VdPlayer {
  name: string;
  team: string;
  pos: string;
  price: number;
  xPts: number;
  owned: number;
  /** xPts ÷ price — the measure the whole video turns on. */
  ppm: number;
  /** Opponent and venue for the projected gameweek, e.g. "BOU (H)". */
  fixture: string;
}

const payload = raw as unknown as {
  gw: number;
  deadline: string;
  captured: string;
  filter: { minXpts: number; minOwned: number };
  poolSize: number;
  hero: VdPlayer;
  topXpts: VdPlayer[];
  bestValue: VdPlayer[];
  swap: { out: VdPlayer; in: VdPlayer[]; cost: number; xPts: number; change: number; gain: number };
  valueMultiple: number;
};

export const gw = payload.gw;
export const captured = payload.captured;
export const poolSize = payload.poolSize;
export const hero = payload.hero;
export const topXpts = payload.topXpts;
export const bestValue = payload.bestValue;
export const swap = payload.swap;
export const valueMultiple = payload.valueMultiple;

/** Share of a £100.0m budget the hero eats — the outline's "15%", derived. */
export const budgetShare = Math.round((hero.price / 100) * 1000) / 10;

/** Deadline as "FRI 21 AUG", for the urgency strip. */
export const deadlineLabel = new Date(payload.deadline)
  .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
  .toUpperCase()
  .replace(',', '');

/** The bar chart in beat 3: hero last, so the eye lands on the short bar. */
export const valueBars = [...bestValue, hero];
export const maxPpm = Math.max(...valueBars.map((p) => p.ppm));
