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

/**
 * Total wall-clock budget for one logical FPL read, retries included.
 *
 * A serverless function has its own ceiling (10s on Vercel Hobby), and blowing
 * past it turns a slow upstream into a hard 504 with nothing rendered. Every
 * attempt is bounded by whatever is left of this budget, so the retry loop can
 * never outlive the function that is waiting on it.
 */
const FETCH_BUDGET_MS = Number(process.env.FPL_FETCH_BUDGET_MS || 8000);
/** Ceiling for any single attempt — keeps one slow response from eating the lot. */
const ATTEMPT_TIMEOUT_MS = 3500;
const MAX_ATTEMPTS = 3;
/**
 * How long a copy is kept purely to be served when the API is unreachable.
 * Much longer than the live TTL: yesterday's standings beat an error card.
 */
const STALE_TTL_SECONDS = 60 * 60 * 24;
const staleKey = (cacheKey: string) => `${cacheKey}:stale`;

/** 5xx and 429 are worth another go; 4xx (bar 429) will fail identically. */
const isRetryableStatus = (s: number) => s === 429 || (s >= 500 && s < 600);

/**
 * A non-retryable upstream status (403, 400, …).
 *
 * Needs to be its own type so the retry loop's `catch` can tell it apart from a
 * transient failure and re-throw. Throwing a plain Error inside the `try` would
 * be caught by that same handler and treated as retryable — which is precisely
 * the bug this class exists to prevent: a 403 burning all three attempts and
 * the whole time budget before failing exactly as it would have first time.
 */
class FplNonRetryableError extends Error {}

export class FPLApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';
  }

  /** One attempt, aborted after `timeoutMs`. */
  private async fetchOnce(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        headers: { 'User-Agent': 'FPL-League-Hub/1.0' },
        signal: controller.signal,
        // These responses are cached by us in Redis; letting the platform cache
        // them too would make the stale-fallback TTLs meaningless.
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch with a bounded retry loop and exponential backoff.
   *
   * Before this, `fetch` was called bare: no timeout, no retry, no abort. One
   * slow response from the FPL API therefore hung until the platform killed the
   * function, and the page rendered "the FPL API did not answer in time" — which
   * is exactly what production was doing while the same code served fine from a
   * residential IP. The API throttles datacenter egress, so a single attempt was
   * never a safe assumption from Vercel.
   *
   * A 404 throws immediately and is never retried: the manager or league simply
   * does not exist, and retrying only burns the budget.
   */
  private async fetchWithRetry(url: string): Promise<Response> {
    const deadline = Date.now() + FETCH_BUDGET_MS;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 400) break; // not enough left to be worth trying

      try {
        const res = await this.fetchOnce(url, Math.min(ATTEMPT_TIMEOUT_MS, remaining));

        if (res.status === 404) throw new FplNotFoundError(url);
        if (res.ok) return res;

        if (!isRetryableStatus(res.status)) {
          throw new FplNonRetryableError(`FPL API error: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`FPL API error: ${res.status} ${res.statusText}`);
      } catch (error) {
        // Both of these are settled answers — retrying changes nothing.
        if (error instanceof FplNotFoundError || error instanceof FplNonRetryableError) throw error;
        lastError = error;
      }

      // Exponential backoff with jitter, clipped to the remaining budget so the
      // sleep itself can never push us past the deadline.
      if (attempt < MAX_ATTEMPTS) {
        const backoff = Math.min(200 * 2 ** (attempt - 1) + Math.random() * 150, Math.max(0, deadline - Date.now() - 400));
        if (backoff <= 0) break;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw lastError instanceof Error ? lastError : new Error(`FPL API unreachable: ${url}`);
  }

  /** Last-good copy for `cacheKey`, or null if we have never stored one. */
  private async readStale<T>(cacheKey: string): Promise<T | null> {
    try {
      const raw = await redis.get(staleKey(cacheKey));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
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
      const response = await this.fetchWithRetry(url);
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

    let data: T;
    try {
      const response = await this.fetchWithRetry(url);
      data = await response.json();
    } catch (error) {
      // A 404 is a real answer — the team/league does not exist — so it must
      // surface rather than be masked by whatever we happen to hold.
      if (error instanceof FplNotFoundError) throw error;

      // Every attempt failed. Serve the last good copy rather than an error
      // card: slightly stale standings are worth far more to a visitor than
      // "something went wrong", and this is the whole difference between the
      // FPL API degrading the site and taking it down.
      const stale = await this.readStale<T>(cacheKey);
      if (stale !== null) {
        console.warn(`FPL API unreachable, serving stale cache for ${cacheKey}:`, error);
        return stale;
      }
      throw error;
    }

    try {
      await redis.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
      // Second, longer-lived copy — the only thing standing between an upstream
      // outage and the error card.
      await redis.setEx(staleKey(cacheKey), STALE_TTL_SECONDS, JSON.stringify(data));
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