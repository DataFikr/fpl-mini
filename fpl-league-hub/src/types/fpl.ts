export interface FPLBootstrapData {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLPlayer[];
}

export interface FPLEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
}

export interface FPLPlayer {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
}

export interface FPLManagerEntry {
  id: number;
  joined_time: string;
  started_event: number;
  player_first_name: string;
  player_last_name: string;
  player_region_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  name: string;
  kit: string;
  last_deadline_bank: number;
  last_deadline_value: number;
  last_deadline_total_transfers: number;
  favourite_team?: string;
  player_region_iso_code_short?: string;
  player_region_iso_code_long?: string;
}

export interface FPLLeagueStandings {
  league: {
    id: number;
    name: string;
    created: string;
    closed: boolean;
    max_entries: number;
    league_type: string;
    scoring: string;
    admin_entry: number;
    start_event: number;
  };
  standings: {
    has_next: boolean;
    page: number;
    results: FPLStandingEntry[];
  };
}

export interface FPLStandingEntry {
  id: number;
  event_total: number;
  player_name: string;
  rank: number;
  last_rank: number;
  rank_sort: number;
  total: number;
  entry: number;
  entry_name: string;
}

export interface FPLManagerHistory {
  current: FPLGameweekHistory[];
  past: FPLSeasonHistory[];
  chips: FPLChipHistory[];
}

export interface FPLGameweekHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
  overall_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface FPLSeasonHistory {
  season_name: string;
  total_points: number;
  rank: number;
}

export interface FPLChipHistory {
  name: string;
  time: string;
  event: number;
}

export interface FPLManagerPicks {
  active_chip: string | null;
  automatic_subs: FPLAutomaticSub[];
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: FPLPick[];
}

export interface FPLPick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface FPLAutomaticSub {
  entry: number;
  element_in: number;
  element_out: number;
  event: number;
}

export interface FPLLiveData {
  elements: FPLLiveElement[];
}

export interface FPLLiveElement {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
  };
}

export interface TeamData {
  id: number;
  name: string;
  managerName: string;
  crestUrl?: string;
  lastUpdated: Date;
}

export interface LeagueData {
  id: number;
  name: string;
  teams: TeamData[];
  currentGameweek: number;
  standings: StandingData[];
}

export interface StandingData {
  teamId: number;
  rank: number;
  points: number;
  teamName: string;
  managerName: string;
  lastWeekRank?: number;
  favourite_team?: string;
  player_region_name?: string;
  player_region_iso_code_short?: string;
  player_region_iso_code_long?: string;
  id?: number;
  name?: string;
}

export interface GameweekData {
  teamId: number;
  gameweek: number;
  points: number;
  rank: number;
  totalPoints: number;
  squad: PlayerSquadData[];
  movementFromLastWeek?: number;
  managerName?: string;
  playerName?: string;
}

export interface PlayerSquadData {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  player: FPLPlayer;
  points: number;
}