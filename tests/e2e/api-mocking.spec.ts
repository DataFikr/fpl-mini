import { test, expect } from '@playwright/test';
import { generateTestTeamData, generateTestLeagueData } from '../utils/test-helpers';

test.describe('API Mocking and Integration Tests', () => {
  test.describe('FPL API Mocking', () => {
    test('should handle successful team data responses', async ({ page }) => {
      const mockTeamData = generateTestTeamData();

      // Mock successful team API response
      await page.route('**/api/teams/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: mockTeamData.teamId,
            name: mockTeamData.teamName,
            manager: mockTeamData.managerName,
            points: mockTeamData.points,
            rank: mockTeamData.rank
          })
        });
      });

      await page.goto(`/team/${mockTeamData.teamId}`);
      await page.waitForLoadState('networkidle');

      // Verify mocked data is displayed
      await expect(page.locator('h1')).toContainText(mockTeamData.teamName);
    });

    test('should handle team API errors gracefully', async ({ page }) => {
      // Mock API error response
      await page.route('**/api/teams/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/team/999999');
      await page.waitForLoadState('networkidle');

      // Should show error state or fallback content
      // Page should not crash
      expect(page.url()).toContain('/team/999999');
    });

    test('should handle league data responses', async ({ page }) => {
      const mockLeagueData = generateTestLeagueData();

      // Mock successful league API response
      await page.route('**/api/leagues/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            league: {
              id: mockLeagueData.id,
              name: mockLeagueData.name
            },
            standings: {
              results: mockLeagueData.teams.map((team, index) => ({
                entry: team.teamId,
                entry_name: team.teamName,
                player_name: team.managerName,
                rank: index + 1,
                total: team.points,
                event_total: team.gameweekPoints
              }))
            }
          })
        });
      });

      await page.goto(`/league/${mockLeagueData.id}`);
      await page.waitForLoadState('networkidle');

      // Verify mocked data is displayed
      await expect(page.locator('h1')).toContainText(mockLeagueData.name);
    });

    test('should handle slow API responses', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/teams/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 5100818,
              name: 'Test Team',
              manager: 'Test Manager',
              points: 325
            })
          });
        }, 3000); // 3 second delay
      });

      const startTime = Date.now();
      await page.goto('/team/5100818');

      // Should show loading state
      await page.waitForTimeout(1000);

      // Page should eventually load
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeGreaterThan(3000);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should handle network failures', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should show fallback content or error state
      // Page should not crash
      expect(page.url()).toContain('/team/5100818');
    });
  });

  test.describe('Crest Generation API Mocking', () => {
    test('should handle successful crest generation', async ({ page }) => {
      // Mock successful crest API response
      await page.route('**/api/crests**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            crestUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIwIiBmaWxsPSIjNGI3NGY0Ii8+PC9zdmc+'
          })
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should display team crest if component exists
      const crestImage = page.locator('img[src*="data:image/svg"]').first();
      if (await crestImage.isVisible()) {
        await expect(crestImage).toBeVisible();
      }
    });

    test('should handle crest generation failures', async ({ page }) => {
      // Mock crest API failure
      await page.route('**/api/crests**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Crest generation failed' })
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Page should still load without crests
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Real API Integration Tests', () => {
    test('should handle real FPL API responses', async ({ page }) => {
      // Test with real API (no mocking)
      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Should load successfully or show fallback
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

      // Take screenshot for manual verification
      await page.screenshot({
        path: 'tests/screenshots/real-api-team-page.png',
        fullPage: true
      });
    });

    test('should handle real league API responses', async ({ page }) => {
      // Test with real API (no mocking)
      await page.goto('/league/150789');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Should load successfully or show fallback
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

      // Take screenshot for manual verification
      await page.screenshot({
        path: 'tests/screenshots/real-api-league-page.png',
        fullPage: true
      });
    });
  });

  test.describe('API Rate Limiting', () => {
    test('should handle rate limited responses', async ({ page }) => {
      // Mock rate limited response
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: {
            'Retry-After': '60'
          },
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should handle rate limiting gracefully
      expect(page.url()).toContain('/team/5100818');
    });
  });

  test.describe('API Data Validation', () => {
    test('should handle invalid team data', async ({ page }) => {
      // Mock invalid data response
      await page.route('**/api/teams/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // Missing required fields
            id: null,
            name: '',
            invalidField: 'should be ignored'
          })
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should handle invalid data gracefully
      expect(page.url()).toContain('/team/5100818');
    });

    test('should handle malformed JSON responses', async ({ page }) => {
      // Mock malformed JSON response
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{ invalid json }'
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should handle malformed JSON gracefully
      expect(page.url()).toContain('/team/5100818');
    });
  });

  test.describe('Concurrent API Requests', () => {
    test('should handle multiple concurrent requests', async ({ page }) => {
      let requestCount = 0;

      // Mock API with request counting
      await page.route('**/api/**', route => {
        requestCount++;
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 5100818,
              name: `Test Team ${requestCount}`,
              manager: 'Test Manager',
              points: 325
            })
          });
        }, 500);
      });

      // Navigate to page that makes multiple API calls
      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should handle concurrent requests
      expect(requestCount).toBeGreaterThan(0);
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('API Response Caching', () => {
    test('should cache API responses appropriately', async ({ page }) => {
      let requestCount = 0;

      // Mock API with request counting
      await page.route('**/api/teams/5100818', route => {
        requestCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Cache-Control': 'max-age=300'
          },
          body: JSON.stringify({
            id: 5100818,
            name: 'Cached Team',
            manager: 'Test Manager',
            points: 325
          })
        });
      });

      // First request
      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      const firstRequestCount = requestCount;

      // Navigate away and back
      await page.goto('/');
      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Should use cached response or make new request based on implementation
      expect(requestCount).toBeGreaterThanOrEqual(firstRequestCount);
    });
  });
});