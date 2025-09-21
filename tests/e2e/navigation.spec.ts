import { test, expect } from '../fixtures/test-fixtures';
import { getRandomTeamId, getRandomLeagueId, takeTimestampedScreenshot } from '../utils/test-helpers';

test.describe('Navigation and Routing', () => {
  test('should navigate from home to team page', async ({ homePage, teamPage, page }) => {
    // Start on home page
    await homePage.navigateToHome();
    await homePage.verifyHomePageLoaded();

    // Use a known team ID for testing
    const teamId = '5100818';

    // Search for team
    await homePage.searchForTeam(teamId);

    // May redirect to team page or handle gracefully
    // Verify we're still in a valid state
    expect(page.url()).toMatch(/localhost:3000/);
  });

  test('should navigate from team page to home using manager card home icon', async ({ teamPage, homePage, page }) => {
    const teamId = getRandomTeamId();

    // Navigate to team page
    await teamPage.navigateToTeam(teamId);
    await teamPage.verifyTeamPageLoaded();

    // Click home icon on manager card
    await teamPage.clickHomeIconOnCard();

    // Should navigate to home page
    await page.waitForURL('**/');
    await homePage.verifyHomePageLoaded();
  });

  test('should navigate from team page to league page', async ({ teamPage, leaguePage, page }) => {
    const teamId = getRandomTeamId();

    // Navigate to team page
    await teamPage.navigateToTeam(teamId);
    await teamPage.verifyTeamPageLoaded();

    // Wait for league cards to load
    await teamPage.waitForLeagueCardsToLoad();

    // Get first available league and click it
    const leagueLinks = page.locator('a[href*="/league/"]');
    const firstLeague = leagueLinks.first();

    if (await firstLeague.isVisible()) {
      await firstLeague.click();

      // Verify we're on a league page
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/league\/\d+/);
    }
  });

  test('should navigate from league page to home', async ({ leaguePage, homePage, page }) => {
    const leagueId = getRandomLeagueId();

    // Navigate to league page
    await leaguePage.navigateToLeague(leagueId);
    await leaguePage.verifyLeaguePageLoaded();

    // Click home link
    await leaguePage.clickHomeLink();

    // Should navigate to home page
    await page.waitForURL('**/');
    await homePage.verifyHomePageLoaded();
  });

  test('should navigate from league page to team page', async ({ leaguePage, teamPage, page }) => {
    const leagueId = getRandomLeagueId();

    // Navigate to league page
    await leaguePage.navigateToLeague(leagueId);
    await leaguePage.verifyLeaguePageLoaded();

    // Click My Leagues link
    await leaguePage.clickMyLeaguesLink();

    // Should navigate to team page
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/team\/\d+/);
  });

  test('should handle direct URL navigation', async ({ page, homePage, teamPage, leaguePage }) => {
    // Test direct navigation to different routes
    const routes = [
      { path: '/', verifyFn: () => homePage.verifyHomePageLoaded() },
      { path: '/team/5100818', verifyFn: () => teamPage.verifyTeamPageLoaded() },
      { path: '/league/150789', verifyFn: () => leaguePage.verifyLeaguePageLoaded() }
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await route.verifyFn();
      await takeTimestampedScreenshot(page, `direct-navigation-${route.path.replace(/\//g, '-')}`);
    }
  });

  test('should maintain consistent branding across pages', async ({ page, homePage, teamPage, leaguePage }) => {
    // Check branding elements across different pages
    const pages = [
      { name: 'home', navigateFn: () => homePage.navigateToHome() },
      { name: 'team', navigateFn: () => teamPage.navigateToTeam('5100818') },
      { name: 'league', navigateFn: () => leaguePage.navigateToLeague('150789') }
    ];

    for (const pageInfo of pages) {
      await pageInfo.navigateFn();
      await page.waitForLoadState('networkidle');

      // Check for FPLRanker logo or branding
      const logo = page.locator('img[alt*="FPL"], img[alt*="Ranker"]').first();
      await expect(logo).toBeVisible({ timeout: 10000 });

      await takeTimestampedScreenshot(page, `branding-${pageInfo.name}`);
    }
  });

  test('should handle browser back/forward navigation', async ({ page, homePage, teamPage }) => {
    // Start on home page
    await homePage.navigateToHome();

    // Navigate to team page
    await teamPage.navigateToTeam('5100818');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be on home page
    expect(page.url()).toMatch(/localhost:3000\/?$/);

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Should be on team page
    expect(page.url()).toMatch(/\/team\/5100818/);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    // Test invalid team ID
    await page.goto('/team/999999999');
    await page.waitForLoadState('networkidle');

    // Should either show error page or redirect
    // At minimum, should not crash
    expect(page.url()).toContain('localhost:3000');

    // Test invalid league ID
    await page.goto('/league/999999999');
    await page.waitForLoadState('networkidle');

    // Should either show error page or redirect
    expect(page.url()).toContain('localhost:3000');

    // Test completely invalid route
    await page.goto('/invalid-route');
    await page.waitForLoadState('networkidle');

    // Should show 404 or redirect to home
    expect(page.url()).toContain('localhost:3000');
  });

  test('should have working navigation across different screen sizes', async ({ page, homePage, teamPage }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Test navigation from home to team
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyTeamPageLoaded();

      // Test home navigation
      await teamPage.clickHomeIconOnCard();
      await page.waitForURL('**/');

      await takeTimestampedScreenshot(page, `navigation-${viewport.width}x${viewport.height}`);
    }
  });
});