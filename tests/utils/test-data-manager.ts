import type { Page } from '@playwright/test';

/**
 * 🗃️ Efficient Test Data Management System
 * Provides optimized test data loading and caching for better performance
 */

export interface TestTeamData {
  id: string;
  name: string;
  manager: string;
  points: number;
  rank: number;
  gameweek: number;
  leagues: TestLeagueData[];
}

export interface TestLeagueData {
  id: string;
  name: string;
  type: 'classic' | 'h2h';
  size: number;
  teams: number;
}

/**
 * 🚀 Test Data Cache for Performance
 */
class TestDataCache {
  private static instance: TestDataCache;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TestDataCache {
    if (!TestDataCache.instance) {
      TestDataCache.instance = new TestDataCache();
    }
    return TestDataCache.instance;
  }

  set(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.TTL);
  }

  get(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  clear(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  has(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      return false;
    }
    return this.cache.has(key);
  }
}

/**
 * 📊 Test Data Manager
 */
export class TestDataManager {
  private cache = TestDataCache.getInstance();

  /**
   * 🏃 Get optimized test team data with caching
   */
  async getTestTeam(teamId: string = '5100818'): Promise<TestTeamData> {
    const cacheKey = `team:${teamId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const teamData = this.generateTestTeamData(teamId);
    this.cache.set(cacheKey, teamData);
    return teamData;
  }

  /**
   * 🏆 Get optimized test league data with caching
   */
  async getTestLeague(leagueId: string = '150789'): Promise<TestLeagueData> {
    const cacheKey = `league:${leagueId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const leagueData = this.generateTestLeagueData(leagueId);
    this.cache.set(cacheKey, leagueData);
    return leagueData;
  }

  /**
   * 🎯 Get performance-optimized team dataset
   */
  async getTestDataSet(size: 'small' | 'medium' | 'large' = 'small'): Promise<TestTeamData[]> {
    const cacheKey = `dataset:${size}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const teamCounts = { small: 5, medium: 25, large: 100 };
    const count = teamCounts[size];

    const dataset = Array.from({ length: count }, (_, i) =>
      this.generateTestTeamData(`510${String(i).padStart(4, '0')}`)
    );

    this.cache.set(cacheKey, dataset);
    return dataset;
  }

  /**
   * 🏠 Generate realistic team data for Gameweek 6
   */
  private generateTestTeamData(teamId: string): TestTeamData {
    const teamNames = [
      'Phoenix Rising', 'Thunder Bolts', 'Galaxy Guardians', 'Storm Chasers',
      'Fire Eagles', 'Ice Dragons', 'Shadow Warriors', 'Lightning Strikes',
      'Cosmic Crusaders', 'Mystic Legends', 'Royal Knights', 'Wild Wolves'
    ];

    const managerNames = [
      'Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis',
      'James Rodriguez', 'Lisa Thompson', 'David Kim', 'Rachel Green',
      'Tom Anderson', 'Katie Brown', 'Chris Lee', 'Amy Taylor'
    ];

    // Realistic GW6 data ranges
    const basePoints = 250 + Math.floor(Math.random() * 100); // 250-350 points by GW6
    const rank = Math.floor(Math.random() * 9000000) + 100000; // Realistic FPL ranks

    return {
      id: teamId,
      name: teamNames[Math.floor(Math.random() * teamNames.length)],
      manager: managerNames[Math.floor(Math.random() * managerNames.length)],
      points: basePoints,
      rank: rank,
      gameweek: 6,
      leagues: [
        this.generateTestLeagueData('150789'),
        this.generateTestLeagueData('523651')
      ]
    };
  }

  /**
   * 🏆 Generate realistic league data
   */
  private generateTestLeagueData(leagueId: string): TestLeagueData {
    const leagueNames = [
      'Best Man League', 'Work Colleagues', 'Family & Friends',
      'University Alumni', 'Local Football Club', 'Toon Army Malaysia',
      'Premier Predictions', 'Weekend Warriors', 'The Invincibles',
      'Fantasy Heroes'
    ];

    return {
      id: leagueId,
      name: leagueNames[Math.floor(Math.random() * leagueNames.length)],
      type: Math.random() > 0.8 ? 'h2h' : 'classic',
      size: Math.floor(Math.random() * 50) + 10, // 10-60 teams
      teams: Math.floor(Math.random() * 50) + 10
    };
  }

  /**
   * 🔄 Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 📊 Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys())
    };
  }
}

/**
 * 🎭 Advanced API Mocking System
 */
export class APIMockManager {
  private static activeMocks = new Map<string, any>();

  /**
   * 🚀 Setup comprehensive API mocking for consistent tests
   */
  static async setupMocks(page: Page, scenario: 'success' | 'error' | 'slow' | 'mixed' = 'success'): Promise<void> {
    const dataManager = new TestDataManager();

    switch (scenario) {
      case 'success':
        await this.setupSuccessMocks(page, dataManager);
        break;
      case 'error':
        await this.setupErrorMocks(page);
        break;
      case 'slow':
        await this.setupSlowMocks(page, dataManager);
        break;
      case 'mixed':
        await this.setupMixedMocks(page, dataManager);
        break;
    }
  }

  /**
   * ✅ Success scenario mocks
   */
  private static async setupSuccessMocks(page: Page, dataManager: TestDataManager): Promise<void> {
    // Team data mock
    await page.route('**/api/teams/**', async route => {
      const url = route.request().url();
      const teamId = url.split('/').pop() || '5100818';
      const teamData = await dataManager.getTestTeam(teamId);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData),
        headers: {
          'cache-control': 'max-age=300',
          'x-test-mock': 'success'
        }
      });
    });

    // League data mock
    await page.route('**/api/leagues/**', async route => {
      const url = route.request().url();
      const leagueId = url.split('/').pop() || '150789';
      const leagueData = await dataManager.getTestLeague(leagueId);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(leagueData),
        headers: {
          'cache-control': 'max-age=300',
          'x-test-mock': 'success'
        }
      });
    });

    // Search API mock
    await page.route('**/api/search**', async route => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get('q') || '';
      const dataset = await dataManager.getTestDataSet('small');

      const results = dataset.filter(team =>
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.manager.toLowerCase().includes(query.toLowerCase()) ||
        team.id.includes(query)
      ).slice(0, 10);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results, total: results.length })
      });
    });
  }

  /**
   * ❌ Error scenario mocks
   */
  private static async setupErrorMocks(page: Page): Promise<void> {
    await page.route('**/api/**', route => {
      const errorResponses = [
        { status: 500, error: 'Internal Server Error' },
        { status: 404, error: 'Not Found' },
        { status: 429, error: 'Rate Limit Exceeded' },
        { status: 503, error: 'Service Unavailable' }
      ];

      const response = errorResponses[Math.floor(Math.random() * errorResponses.length)];

      route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response),
        headers: { 'x-test-mock': 'error' }
      });
    });
  }

  /**
   * 🐌 Slow response mocks
   */
  private static async setupSlowMocks(page: Page, dataManager: TestDataManager): Promise<void> {
    await page.route('**/api/**', async route => {
      // Simulate slow response (2-5 seconds)
      const delay = 2000 + Math.random() * 3000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Then fulfill with success data
      const teamData = await dataManager.getTestTeam();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData),
        headers: { 'x-test-mock': 'slow' }
      });
    });
  }

  /**
   * 🎲 Mixed scenario mocks (realistic)
   */
  private static async setupMixedMocks(page: Page, dataManager: TestDataManager): Promise<void> {
    await page.route('**/api/**', async route => {
      const scenario = Math.random();

      if (scenario < 0.7) {
        // 70% success
        const teamData = await dataManager.getTestTeam();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(teamData)
        });
      } else if (scenario < 0.9) {
        // 20% slow response
        await new Promise(resolve => setTimeout(resolve, 1500));
        const teamData = await dataManager.getTestTeam();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(teamData)
        });
      } else {
        // 10% error
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Temporary server error' })
        });
      }
    });
  }

  /**
   * 🧹 Clear all active mocks
   */
  static clearMocks(): void {
    this.activeMocks.clear();
  }
}

/**
 * 🔧 Performance Test Utilities
 */
export class PerformanceUtils {
  /**
   * ⏱️ Measure page load performance
   */
  static async measurePageLoad(page: Page): Promise<{
    navigationTime: number;
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  }> {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        navigationTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0 // Will be measured separately
      };
    });

    return {
      ...metrics,
      navigationTime: Date.now() - startTime
    };
  }

  /**
   * 🧠 Monitor memory usage during test
   */
  static async monitorMemory(page: Page): Promise<any> {
    return await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  }

  /**
   * 🌐 Test network conditions
   */
  static async simulateNetworkConditions(
    page: Page,
    preset: 'fast3g' | 'slow3g' | 'offline' = 'fast3g'
  ): Promise<void> {
    const conditions = {
      fast3g: { downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 150 },
      slow3g: { downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
      offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    };

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', conditions[preset]);
  }
}

// Export singleton instance
export const testDataManager = new TestDataManager();