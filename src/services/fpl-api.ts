import {
  FPLBootstrapData,
  FPLLeagueStandings,
  FPLManagerHistory,
  FPLManagerPicks,
  FPLLiveData,
  FPLManagerEntry
} from '@/types/fpl';
import redis from '@/lib/redis';
import { isDemoMode, resolveDemo } from '@/lib/demo/fpl-demo';

/**
 * The FPL API answered 404 — the manager/league/entry genuinely does not exist.
 *
 * Distinct from a network or 5xx failure: callers must not paper over this with
 * placeholder data, because a wrong team ID would then render as a real team.
 */
export class FplNotFoundError extends Error {
  constructor(public readonly url: string) {
    super(`FPL API 404: ${url}`);
    this.name = 'FplNotFoundError';
  }
}

export const isFplNotFound = (e: unknown): e is FplNotFoundError => e instanceof FplNotFoundError;

export class FPLApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';
  }

  private async fetchWithCache<T>(
    url: string,
    cacheKey: string,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // 2025/26 demo season: serve real snapshots + a synthesized league instead of
    // the live API (which has rolled past 2025/26). Gated by FPL_DEMO_SEASON.
    if (isDemoMode()) {
      const demo = resolveDemo(url);
      if (demo !== undefined) return demo as T;
    }

    // For league 150789, bypass cache completely for now to get live data
    if (cacheKey.includes('fpl:league:150789:standings')) {
      console.log('BYPASSING CACHE COMPLETELY for league 150789');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FPL-League-Hub/1.0'
        }
      });

      if (response.status === 404) throw new FplNotFoundError(url);
      if (!response.ok) {
        throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis cache read failed (continuing without cache):', error);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FPL-League-Hub/1.0'
      }
    });

    if (response.status === 404) throw new FplNotFoundError(url);
    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    try {
      await redis.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.warn('Redis cache write failed:', error);
    }

    return data;
  }

  async getBootstrapData(): Promise<FPLBootstrapData> {
    return this.fetchWithCache(
      `${this.baseUrl}/bootstrap-static/`,
      'fpl:bootstrap',
      21600 // 6 hours
    );
  }

  async getLeagueStandings(leagueId: number, page: number = 1, forceFresh: boolean = false): Promise<FPLLeagueStandings> {
    const cacheKey = `fpl:league:${leagueId}:standings:${page}`;
    
    // Clear cache if forcing fresh data
    if (forceFresh) {
      console.log('FORCING FRESH DATA - Clearing cache key:', cacheKey);
      try {
        const result = await redis.del?.(cacheKey);
        console.log('Cache clear result:', result);
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
    
    return this.fetchWithCache(
      `${this.baseUrl}/leagues-classic/${leagueId}/standings/?page_standings=${page}`,
      cacheKey,
      300 // 5 minutes - get fresh data more frequently
    );
  }

  // NOTE: `getManagerHistory` lives further down (it was declared twice; the
  // later definition — which returns an empty season on failure rather than
  // randomised mock gameweeks — is the one JS actually used).

  async getManagerPicks(managerId: number, gameweek: number): Promise<FPLManagerPicks> {
    return this.fetchWithCache(
      `${this.baseUrl}/entry/${managerId}/event/${gameweek}/picks/`,
      `fpl:manager:${managerId}:picks:${gameweek}`,
      1800 // 30 minutes
    );
  }

  async getLiveGameweekData(gameweek: number): Promise<FPLLiveData> {
    return this.fetchWithCache(
      `${this.baseUrl}/event/${gameweek}/live/`,
      `fpl:gameweek:${gameweek}:live`,
      1800 // 30 minutes during matches
    );
  }

  /**
   * A manager's entry — the authoritative "does this team ID exist?" check.
   *
   * Deliberately has no fallback: a 404 throws `FplNotFoundError` so callers can
   * render a team-not-found path, and any other failure propagates as an error.
   * (It used to fall back to a hardcoded roster, which meant a wrong ID rendered
   * as a real-looking team.)
   */
  async getManagerEntry(managerId: number): Promise<FPLManagerEntry> {
    return this.fetchWithCache(
      `${this.baseUrl}/entry/${managerId}/`,
      `fpl:manager:${managerId}:live`,
      900 // 15 minutes cache for live data
    );
  }

  async findTeamByName(teamName: string): Promise<FPLManagerEntry[]> {
    // Use mock data for search (temporarily disabled real API calls to fix hanging)
    // TODO: Re-enable real API calls once FPL API stability improves
    
    // Include teams from real leagues that link to FPL ID 5093819's leagues
    const mockTeams = [
      // Primary team (FPL ID 5093819)
      {
        id: 5093819,
        name: "Jogha Bonito", // Primary team name across leagues
        player_first_name: "Imaad",
        player_last_name: "Zaki",
        summary_overall_points: 160,
        summary_overall_rank: 45123,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Arsenal",
        kit: "home",
        last_deadline_bank: 5,
        last_deadline_value: 1000,
        last_deadline_total_transfers: 2
      },
      // Team 2611652 - Redhu Malek (fallback data based on real API)
      {
        id: 2611652,
        name: "Redhu Malek Team",
        player_first_name: "Redhu",
        player_last_name: "Malek",
        summary_overall_points: 258,
        summary_overall_rank: 2579895,
        joined_time: "2025-07-28T14:05:42.278659Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Liverpool",
        kit: "home",
        last_deadline_bank: 5,
        last_deadline_value: 1000,
        last_deadline_total_transfers: 2
      },
      // Teams from Best Man League (150789) - league mates
      {
        id: 5100818,
        name: "kejoryobkejor",
        player_first_name: "Azmil",
        player_last_name: "Zahimi Abdul Kadir",
        summary_overall_points: 183,
        summary_overall_rank: 12543,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Liverpool",
        kit: "home",
        last_deadline_bank: 5,
        last_deadline_value: 1000,
        last_deadline_total_transfers: 2
      },
      {
        id: 6463870,
        name: "KakiBangkuFC",
        player_first_name: "Razman",
        player_last_name: "Affendi",
        summary_overall_points: 160,
        summary_overall_rank: 25431,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Manchester City",
        kit: "away",
        last_deadline_bank: 3,
        last_deadline_value: 995,
        last_deadline_total_transfers: 4
      },
      {
        id: 6454003,
        name: "Meriam Pak Maon",
        player_first_name: "Tyson",
        player_last_name: "001",
        summary_overall_points: 180,
        summary_overall_rank: 8765,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Chelsea",
        kit: "home",
        last_deadline_bank: 8,
        last_deadline_value: 1020,
        last_deadline_total_transfers: 1
      },
      {
        id: 6356669,
        name: "Kickin' FC",
        player_first_name: "Nabeyl",
        player_last_name: "Salleh",
        summary_overall_points: 178,
        summary_overall_rank: 34567,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Manchester United",
        kit: "third",
        last_deadline_bank: 2,
        last_deadline_value: 980,
        last_deadline_total_transfers: 6
      },
      {
        id: 852361,
        name: "Hot Days Ahead FC",
        player_first_name: "Cruz",
        player_last_name: "Reds",
        summary_overall_points: 163,
        summary_overall_rank: 67890,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Tottenham",
        kit: "home",
        last_deadline_bank: 1,
        last_deadline_value: 965,
        last_deadline_total_transfers: 8
      },
      // Teams from Geng Irshad 2k (496202) - league mates
      {
        id: 2611652,
        name: "Tapirus Indicus",
        player_first_name: "Redhu",
        player_last_name: "Malek",
        summary_overall_points: 166,
        summary_overall_rank: 23456,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        kit: "away",
        last_deadline_bank: 4,
        last_deadline_value: 985,
        last_deadline_total_transfers: 3
      },
      {
        id: 5010897,
        name: "ARSENGAL",
        player_first_name: "Sir ASYRAFVIN",
        player_last_name: "Haha",
        summary_overall_points: 183,
        summary_overall_rank: 15678,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        kit: "home",
        last_deadline_bank: 6,
        last_deadline_value: 1005,
        last_deadline_total_transfers: 1
      },
      {
        id: 5307771,
        name: "RRbby",
        player_first_name: "Encik",
        player_last_name: "Bergkamp",
        summary_overall_points: 153,
        summary_overall_rank: 56789,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Newcastle",
        kit: "third",
        last_deadline_bank: 3,
        last_deadline_value: 975,
        last_deadline_total_transfers: 5
      },
      // Additional managers for complete league coverage
      {
        id: 7136303,
        name: "Kipas Lipas",
        player_first_name: "Ahmad",
        player_last_name: "Rahman",
        summary_overall_points: 170,
        summary_overall_rank: 45000,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Brighton",
        kit: "home",
        last_deadline_bank: 4,
        last_deadline_value: 990,
        last_deadline_total_transfers: 3
      },
      {
        id: 5698298,
        name: "Interval",
        player_first_name: "John",
        player_last_name: "Doe",
        summary_overall_points: 155,
        summary_overall_rank: 60000,
        joined_time: "2024-08-01T00:00:00Z",
        started_event: 1,
        player_region_name: "Malaysia",
        player_region_iso_code_short: "MY",
        player_region_iso_code_long: "MYS",
        favourite_team: "Aston Villa",
        kit: "away",
        last_deadline_bank: 2,
        last_deadline_value: 970,
        last_deadline_total_transfers: 7
      }
    ];

    // Filter teams based on search query
    const searchLower = teamName.toLowerCase();
    const filtered = mockTeams.filter(team => 
      team.name.toLowerCase().includes(searchLower) ||
      `${team.player_first_name} ${team.player_last_name}`.toLowerCase().includes(searchLower)
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return filtered;
  }

  async getFixtures(): Promise<any[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/fixtures/`,
      'fpl:fixtures',
      21600 // 6 hours
    );
  }

  async getCurrentGameweek(): Promise<number> {
    try {
      const bootstrap = await this.getBootstrapData();
      const currentEvent = bootstrap.events.find(event => event.is_current);
      return currentEvent ? currentEvent.id : 1;
    } catch (error) {
      console.warn('Failed to fetch current gameweek from bootstrap, using fallback:', error);
      // Fallback to hardcoded value only if API fails
      return 6;
    }
  }

  async getManagerTransfers(managerId: number): Promise<any[]> {
    try {
      return await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/transfers/`,
        `fpl:manager:${managerId}:transfers`,
        1800 // 30 minutes
      );
    } catch (error) {
      console.warn(`Failed to fetch transfers for manager ${managerId}:`, error);
      return [];
    }
  }

  async getElementSummary(playerId: number): Promise<any> {
    return this.fetchWithCache(
      `${this.baseUrl}/element-summary/${playerId}/`,
      `fpl:element:${playerId}:summary`,
      3600 // 1 hour
    );
  }

  async getLeagueStandingsByPhase(leagueId: number, phaseId: number): Promise<any> {
    return this.fetchWithCache(
      `${this.baseUrl}/leagues-classic/${leagueId}/standings/?phase=${phaseId}`,
      `fpl:league:${leagueId}:standings:phase:${phaseId}`,
      1800 // 30 minutes
    );
  }

  async getManagerLeagues(managerId: number): Promise<any> {
    console.log(`Fetching live leagues data for manager ${managerId}`);

    try {
      // Use live FPL API data for leagues with shorter cache
      const response = await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/`,
        `fpl:manager:${managerId}:leagues:live`,
        600 // 10 minutes cache for leagues
      );

      console.log(`Successfully fetched leagues for manager ${managerId}:`, {
        classicLeagues: response.leagues?.classic?.length || 0,
        h2hLeagues: response.leagues?.h2h?.length || 0
      });

      return response;

    } catch (error) {
      // A 404 means the manager does not exist — callers render a not-found
      // path rather than an empty (but real-looking) league list.
      if (isFplNotFound(error)) throw error;
      console.warn(`Failed to fetch leagues for manager ${managerId}:`, error);
      // Return empty leagues structure when API fails
      return {
        leagues: {
          classic: [],
          h2h: [],
          cup: {}
        }
      };
    }
  }

  async getManagerHistory(managerId: number): Promise<any> {
    console.log(`Fetching live history data for manager ${managerId}`);

    try {
      const response = await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/history/`,
        `fpl:manager:${managerId}:history:live`,
        300 // 5 minutes cache for history (most dynamic data)
      );

      console.log(`Successfully fetched history for manager ${managerId}:`, {
        currentGameweeks: response.current?.length || 0,
        latestGW: response.current?.[response.current.length - 1]?.event || 'N/A'
      });

      return response;

    } catch (error) {
      console.warn(`Failed to fetch history for manager ${managerId}:`, error);
      return {
        current: [],
        past: [],
        chips: []
      };
    }
  }
}