import { test, expect } from '../fixtures/test-fixtures';
import { takeTimestampedScreenshot } from '../utils/test-helpers';

/**
 * Example test file demonstrating Playwright testing patterns
 * Use this as a template for creating new tests
 */

test.describe('Example Test Patterns', () => {
  test.describe('Basic Testing Patterns', () => {
    test('should demonstrate basic page testing', async ({ homePage }) => {
      // Navigate to page
      await homePage.navigateToHome();

      // Verify page loads correctly
      await homePage.verifyHomePageLoaded();

      // Check specific elements
      await expect(homePage.logo).toBeVisible();
      await expect(homePage.mainHeading).toContainText('FPLRanker');

      // Take a screenshot for documentation
      await takeTimestampedScreenshot(homePage.page, 'example-basic-test');
    });

    test('should demonstrate user interaction testing', async ({ homePage }) => {
      await homePage.navigateToHome();

      // Test form interaction
      await homePage.teamSearchInput.fill('Test Team');
      await expect(homePage.teamSearchInput).toHaveValue('Test Team');

      // Test navigation elements
      await expect(homePage.logo).toBeVisible();

      // Clear the input
      await homePage.teamSearchInput.clear();
      await expect(homePage.teamSearchInput).toHaveValue('');
    });
  });

  test.describe('Page Object Model Examples', () => {
    test('should demonstrate cross-page navigation', async ({ homePage, teamPage, page }) => {
      // Start on home page
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      // Navigate to team page
      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyTeamPageLoaded();

      // Use page object methods
      const teamName = await teamPage.getTeamName();
      expect(teamName).toBeTruthy();

      // Navigate back using page object
      await teamPage.clickHomeIconOnCard();
      await page.waitForURL('**/');
      await homePage.verifyHomePageLoaded();
    });
  });

  test.describe('Mobile Testing Examples', () => {
    test('should demonstrate mobile testing', async ({ homePage, page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await homePage.navigateToHome();

      // Verify mobile-specific behavior
      await homePage.verifyMobileLayout();

      // Check responsive elements
      await expect(homePage.logo).toBeVisible();
      await expect(homePage.teamSearchInput).toBeVisible();

      // Take mobile screenshot
      await takeTimestampedScreenshot(page, 'example-mobile-test');
    });
  });

  test.describe('API Mocking Examples', () => {
    test('should demonstrate API mocking', async ({ page }) => {
      // Mock API response
      await page.route('**/api/teams/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 5100818,
            name: 'Example Team',
            manager: 'Example Manager',
            points: 325,
            rank: 1
          })
        });
      });

      // Navigate to page that uses the API
      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Verify mocked data is used
      await expect(page.locator('h1')).toContainText('Example Team');
    });

    test('should demonstrate error handling', async ({ page }) => {
      // Mock API error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      });

      await page.goto('/team/5100818');
      await page.waitForLoadState('networkidle');

      // Verify graceful error handling
      expect(page.url()).toContain('/team/5100818');
    });
  });

  test.describe('Visual Testing Examples', () => {
    test('should demonstrate visual regression testing', async ({ homePage }) => {
      await homePage.navigateToHome();
      await homePage.page.waitForTimeout(2000); // Wait for animations

      // Full page screenshot
      await expect(homePage.page).toHaveScreenshot('example-full-page.png', {
        fullPage: true,
        threshold: 0.3
      });

      // Component screenshot
      await expect(homePage.logo).toHaveScreenshot('example-logo.png');
    });
  });

  test.describe('Performance Testing Examples', () => {
    test('should demonstrate performance testing', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Assert reasonable load time
      expect(loadTime).toBeLessThan(10000); // 10 seconds max for tests

      console.log(`Page loaded in ${loadTime}ms`);
    });
  });

  test.describe('Error Scenario Examples', () => {
    test('should handle invalid URLs gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');

      // Should not crash - verify we're still on a valid page
      expect(page.url()).toContain('localhost:3000');
    });

    test('should handle network failures', async ({ page }) => {
      // Simulate network failure
      await page.route('**/*', route => route.abort('failed'));

      try {
        await page.goto('/team/5100818');
        await page.waitForLoadState('networkidle');
      } catch (error) {
        // Expected to fail, verify graceful handling
        expect(error.message).toContain('failed');
      }
    });
  });

  test.describe('Data Validation Examples', () => {
    test('should verify gameweek 6 data', async ({ teamPage }) => {
      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyGameweek6Data();

      // Verify current gameweek displays correctly
      await expect(teamPage.currentGameweekCard).toContainText('6');
    });

    test('should verify realistic point values', async ({ teamPage }) => {
      await teamPage.navigateToTeam('5100818');

      // Check that points are realistic for gameweek 6
      const overallPointsElement = teamPage.overallPointsCard;
      const pointsText = await overallPointsElement.textContent();
      const pointsMatch = pointsText?.match(/(\d+)/);

      if (pointsMatch) {
        const points = parseInt(pointsMatch[1]);
        expect(points).toBeGreaterThan(200); // Reasonable for GW6
        expect(points).toBeLessThan(500); // Not unrealistic
      }
    });
  });

  test.describe('Accessibility Examples', () => {
    test('should verify basic accessibility', async ({ page }) => {
      await page.goto('/');

      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');

        if (src && !src.includes('data:image')) {
          expect(alt).toBeTruthy();
        }
      }

      // Check heading hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1); // Should have exactly one h1
    });
  });

  test.describe('Cross-browser Examples', () => {
    test('should work consistently across browsers', async ({ homePage, page }) => {
      // This test will run across all configured browsers
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      // Verify core functionality works in all browsers
      await expect(homePage.logo).toBeVisible();
      await expect(homePage.teamSearchInput).toBeEditable();

      // Browser-specific screenshot
      const browserName = page.context().browser()?.browserType().name() || 'unknown';
      await takeTimestampedScreenshot(page, `cross-browser-${browserName}`);
    });
  });
});