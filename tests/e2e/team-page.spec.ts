import { test, expect } from '../fixtures/test-fixtures';
import { getRandomTeamId, takeTimestampedScreenshot, checkBasicAccessibility } from '../utils/test-helpers';

test.describe('Team Page', () => {
  const testTeamId = '5100818';

  test.beforeEach(async ({ teamPage }) => {
    await teamPage.navigateToTeam(testTeamId);
  });

  test('should load team page correctly', async ({ teamPage }) => {
    // Verify basic page loading
    await teamPage.verifyTeamPageLoaded();

    // Verify manager information
    await teamPage.verifyManagerInfo();

    // Take screenshot
    await takeTimestampedScreenshot(teamPage.page, 'team-page-loaded');
  });

  test('should display correct team information', async ({ teamPage }) => {
    // Verify team name and manager name are displayed
    const teamName = await teamPage.getTeamName();
    const managerName = await teamPage.getManagerName();

    expect(teamName).toBeTruthy();
    expect(managerName).toBeTruthy();
    expect(teamName.length).toBeGreaterThan(0);
    expect(managerName.length).toBeGreaterThan(0);

    // Verify FPL Ranker logo is present
    await expect(teamPage.fplRankerLogo).toBeVisible();
  });

  test('should display home icon on manager card', async ({ teamPage }) => {
    // Verify home icon exists on manager card
    await expect(teamPage.homeIconOnCard).toBeVisible();

    // Verify it's clickable
    await expect(teamPage.homeIconOnCard).toBeEnabled();
  });

  test('should display statistics cards correctly', async ({ teamPage }) => {
    // Verify all statistics cards
    await teamPage.verifyStatisticsCards();

    // Verify gameweek 6 data
    await teamPage.verifyGameweek6Data();
  });

  test('should display mini leagues section', async ({ teamPage }) => {
    // Verify mini leagues section
    await teamPage.verifyMiniLeaguesSection();

    // Wait for league cards to load
    await teamPage.waitForLeagueCardsToLoad();

    // Verify at least some leagues are displayed
    const leagueCount = await teamPage.getNumberOfLeagues();
    expect(leagueCount).toBeGreaterThan(0);
  });

  test('should navigate to home when home icon is clicked', async ({ teamPage, homePage, page }) => {
    // Click home icon on manager card
    await teamPage.clickHomeIconOnCard();

    // Should navigate to home page
    await page.waitForURL('**/');
    await homePage.verifyHomePageLoaded();
  });

  test('should navigate to league when league card is clicked', async ({ teamPage, page }) => {
    // Wait for league cards to load
    await teamPage.waitForLeagueCardsToLoad();

    // Find and click first league card
    const leagueLinks = page.locator('a[href*="/league/"]');
    const firstLeague = leagueLinks.first();

    if (await firstLeague.isVisible()) {
      const href = await firstLeague.getAttribute('href');
      await firstLeague.click();

      // Should navigate to league page
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/league\/\d+/);
    }
  });

  test('should be mobile responsive', async ({ teamPage }) => {
    // Set mobile viewport
    await teamPage.page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to adjust
    await teamPage.page.waitForTimeout(1000);

    // Verify mobile layout
    await teamPage.verifyMobileLayout();

    // Take mobile screenshot
    await takeTimestampedScreenshot(teamPage.page, 'team-page-mobile');
  });

  test('should be accessible', async ({ teamPage }) => {
    // Check basic accessibility
    await checkBasicAccessibility(teamPage.page);

    // Verify important elements have proper attributes
    await expect(teamPage.fplRankerLogo).toHaveAttribute('alt');
    await expect(teamPage.homeIconOnCard).toBeVisible();
  });

  test('should handle different team IDs', async ({ teamPage }) => {
    const testTeamIds = ['5100818', '5093819', '6463870'];

    for (const teamId of testTeamIds) {
      await teamPage.navigateToTeam(teamId);
      await teamPage.verifyTeamPageLoaded();

      // Take screenshot for each team
      await takeTimestampedScreenshot(teamPage.page, `team-${teamId}`);

      // Verify basic elements are present
      await expect(teamPage.teamName).toBeVisible();
      await expect(teamPage.managerName).toBeVisible();
    }
  });

  test('should display manager details correctly', async ({ teamPage, page }) => {
    // Check for manager information elements
    const managerInfoElements = [
      teamPage.teamName,
      teamPage.managerName,
      teamPage.lastUpdated
    ];

    for (const element of managerInfoElements) {
      await expect(element).toBeVisible();
    }

    // Check if favourite team info is displayed (when available)
    if (await teamPage.favouriteTeam.isVisible()) {
      await expect(teamPage.favouriteTeam).toContainText('Favourite Team');
    }

    // Check if region info is displayed (when available)
    if (await teamPage.regionInfo.isVisible()) {
      await expect(teamPage.regionInfo).toContainText('Region');
    }
  });

  test('should have correct page structure', async ({ teamPage, page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/FPL.*Hub|Team/);

    // Verify URL structure
    expect(page.url()).toMatch(/\/team\/\d+/);

    // Verify main sections are present
    await expect(teamPage.managerCard).toBeVisible();
    await expect(teamPage.miniLeaguesSection).toBeVisible();
  });

  test('should load without critical errors', async ({ teamPage, page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to fully load
    await teamPage.page.waitForTimeout(3000);

    // Filter out expected errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('NetworkError') &&
      !error.toLowerCase().includes('connection') &&
      !error.includes('PostgreSQL') &&
      !error.includes('database')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should display gameweek 6 statistics', async ({ teamPage }) => {
    // Verify current gameweek shows 6
    await expect(teamPage.currentGameweekCard).toContainText('6');

    // Verify overall points are reasonable for GW6
    const overallPointsElement = teamPage.overallPointsCard;
    await expect(overallPointsElement).toBeVisible();

    // Verify gameweek points are displayed
    const gwPointsElement = teamPage.gameweekPointsCard;
    await expect(gwPointsElement).toBeVisible();
  });

  test('should handle team crest display', async ({ teamPage }) => {
    // Team crest should be visible or have a fallback
    if (await teamPage.teamCrest.isVisible()) {
      await expect(teamPage.teamCrest).toBeVisible();
    }

    // If crest fails to load, page should still be functional
    await expect(teamPage.teamName).toBeVisible();
    await expect(teamPage.managerName).toBeVisible();
  });
});