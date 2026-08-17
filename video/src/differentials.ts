import raw from './data/fr09-differentials.json';

/**
 * FR-09's data — real 2025/26 ownership and returns from the predictor cache's
 * bootstrap snapshot.
 *
 * The brief wanted a forward-looking pick ("three green fixtures"). That isn't
 * available pre-season: 2026/27 GW1 hasn't been played and there are no
 * fixtures or ownership figures for it yet. Inventing a differential for a
 * season that hasn't started would be exactly the fabrication this pipeline
 * exists to avoid, so the video runs on last season's finished record instead —
 * checkable, and genuinely useful as a pre-season argument for differentials.
 *
 * Recapture: see the node snippet in data/README.md.
 */
export interface Player {
  name: string;
  team: string;
  pos: string;
  /** selected_by_percent at season end. */
  owned: number;
  price: number;
  points: number;
  /** Points per £m — the value measure the comparison beat turns on. */
  ppm: number;
}

const payload = raw as unknown as {
  season: string;
  hero: Player;
  mostOwned: Player;
  heroPpmRank: number;
  poolSize: number;
  differentials: Player[];
};

export const season = payload.season;
export const hero = payload.hero;
export const mostOwned = payload.mostOwned;
export const heroPpmRank = payload.heroPpmRank;
export const poolSize = payload.poolSize;
export const differentials = payload.differentials;

/** How many times more owners the template pick had. */
export const ownershipMultiple = Math.round(mostOwned.owned / hero.owned);

/** How much more value per million the differential returned. */
export const valueMultiple = +(hero.ppm / mostOwned.ppm).toFixed(1);

export const priceGap = +(mostOwned.price - hero.price).toFixed(1);
