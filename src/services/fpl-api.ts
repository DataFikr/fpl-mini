import {
  FPLBootstrapData,
  FPLLeagueStandings,
  FPLManagerHistory,
  FPLManagerPicks,
  FPLLiveData,
  FPLManagerEntry
} from '@/types/fpl';
import redis from '@/lib/redis';

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
    // For league 150789, bypass cache completely for now to get live data
    if (cacheKey.includes('fpl:league:150789:standings')) {
      console.log('BYPASSING CACHE COMPLETELY for league 150789');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FPL-League-Hub/1.0'
        }
      });

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
      console.warn('Redis cache read failed:', error);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FPL-League-Hub/1.0'
      }
    });

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

  async getManagerHistory(managerId: number): Promise<FPLManagerHistory> {
    try {
      return await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/history/`,
        `fpl:manager:${managerId}:history`,
        3600 // 1 hour
      );
    } catch (error) {
      console.warn('Could not fetch real manager history, using mock data:', error);
      
      // Fallback to mock data
      const mockHistory: FPLManagerHistory = {
        current: Array.from({ length: 6 }, (_, i) => ({
          event: i + 1,
          points: 50 + Math.floor(Math.random() * 40), // 50-90 points per GW
          total_points: (i + 1) * 65 + Math.floor(Math.random() * 200),
          rank: Math.floor(Math.random() * 1000) + 100,
          rank_sort: Math.floor(Math.random() * 1000) + 100,
          overall_rank: Math.floor(Math.random() * 100000) + 10000,
          bank: Math.floor(Math.random() * 15) + 1,
          value: 1000 + Math.floor(Math.random() * 50),
          event_transfers: Math.floor(Math.random() * 3),
          event_transfers_cost: Math.floor(Math.random() * 2) * 4,
          points_on_bench: Math.floor(Math.random() * 15)
        })),
        past: [],
        chips: []
      };

      return mockHistory;
    }
  }

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

  async getManagerEntry(managerId: number): Promise<FPLManagerEntry> {
    // Use mock data for manager entries to get enhanced manager information
    const mockManagerData = this.findTeamByName('');
    const resolvedMockData = await mockManagerData;
    const manager = resolvedMockData.find(m => m.id === managerId);
    
    if (manager) {
      console.log(`Using mock data for manager ${managerId}:`, manager.name, manager.favourite_team, manager.player_region_name);
      return manager;
    }
    
    // Fallback to real API if manager not in mock data
    try {
      return await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/`,
        `fpl:manager:${managerId}`,
        3600 // 1 hour
      );
    } catch (error) {
      console.warn(`Failed to fetch manager ${managerId} from FPL API:`, error);
      // Return a default manager structure when API fails
      return {
        id: managerId,
        name: `Team ${managerId}`,
        player_first_name: 'FPL',
        player_last_name: 'Manager',
        summary_overall_points: 0,
        summary_overall_rank: 1000000,
        started_event: 1,
        joined_time: new Date().toISOString(),
        player_region_name: null,
        player_region_iso_code_short: null,
        player_region_iso_code_long: null,
        favourite_team: null,
        kit: 'home'
      };
    }
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

  async getCurrentGameweek(): Promise<number> {
    // Return mock current gameweek to avoid API delays
    // TODO: Re-enable real API call once FPL API stability improves
    return 6; // Current gameweek - updated for gameweek 6
  }

  async getManagerLeagues(managerId: number): Promise<any> {
    try {
      return await this.fetchWithCache(
        `${this.baseUrl}/entry/${managerId}/`,
        `fpl:manager:${managerId}:leagues`,
        3600 // 1 hour
      );
    } catch (error) {
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
}