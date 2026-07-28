// Shared types for the ported prediction engine (workstream C).
// Mirrors the validated standalone engine in scripts/fpl-predictor (v2).

/** A row of live per-GW stats for one player (from FPL event/{gw}/live). */
export interface PlayerGwStats {
  points: number;
  minutes: number;
  starts: number;
  xgi: number;   // expected goal involvements
  xgc: number;   // expected goals conceded
  bps: number;
  saves: number;
  defcon: number; // defensive contribution
}

/** History keyed by gameweek → (playerFplId → stats). */
export type HistoryByGw = Map<number, Map<number, PlayerGwStats>>;

/** Minimal shape of a bootstrap `elements` entry we rely on (loosely typed elsewhere). */
export interface BootstrapElement {
  id: number;
  element_type: number; // 1 GK, 2 DEF, 3 MID, 4 FWD
  team: number;
  now_cost: number;
  cost_change_start: number;
  web_name?: string;
}

/** A fixture row (subset of FPL fixtures we use). */
export interface Fixture {
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  team_h_score: number | null;
  team_a_score: number | null;
  finished: boolean;
}

/** Per-team fixture entry for a given GW. */
export interface FixtureEntry {
  home: boolean;
  difficulty: number;
  opponent: number;
}

/** A feature row produced for one player for a target GW. */
export interface FeatureRow {
  id: number;
  pos: number;
  team: number;
  price: number; // tenths of a million (start price)
  f: number[];   // feature vector, order = FEATURE_NAMES
  hasFixture: number;
  startRate: number;
  xMins: number;
}

/** A training/scoring sample: features + resolved actual points. */
export interface Sample {
  pos: number;
  f: number[];
  actual: number;
}
