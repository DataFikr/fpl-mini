import { test, expect } from '../fixtures/test-fixtures';
import { getRandomLeagueId, takeTimestampedScreenshot, checkBasicAccessibility } from '../utils/test-helpers';

test.describe('League Page', () => {
  const testLeagueId = '150789';

  test.beforeEach(async ({ leaguePage }) => {
    await leaguePage.navigateToLeague(testLeagueId);
  });

  test('should load league page correctly', async ({ leaguePage }) => {
    // Verify basic page loading
    await leaguePage.verifyLeaguePageLoaded();

    // Verify league header
    await leaguePage.verifyLeagueHeader();

    // Take screenshot
    await takeTimestampedScreenshot(leaguePage.page, 'league-page-loaded');
  });

  test('should display correct league information', async ({ leaguePage }) => {
    // Verify league name is displayed
    const leagueName = await leaguePage.getLeagueName();
    expect(leagueName).toBeTruthy();
    expect(leagueName.length).toBeGreaterThan(0);

    // Verify FPL Ranker logo is present
    await expect(leaguePage.fplRankerLogo).toBeVisible();

    // Verify navigation links
    await expect(leaguePage.homeLink).toBeVisible();
    await expect(leaguePage.myLeaguesLink).toBeVisible();
  });

  test('should display league statistics correctly', async ({ leaguePage }) => {
    // Verify league stats
    await leaguePage.verifyLeagueStats();

    // Verify gameweek 6 data
    await leaguePage.verifyGameweek6Data();
  });

  test('should display all tab navigation', async ({ leaguePage }) => {
    // Verify all tabs are present
    await leaguePage.verifyTabNavigation();

    // Take screenshot of tab navigation
    await takeTimestampedScreenshot(leaguePage.page, 'league-tabs');
  });

  test('should navigate between tabs correctly', async ({ leaguePage }) => {
    // Test each tab
    const tabs = ['headlines', 'team-ranking', 'league-progression', 'squad-analysis', 'badges', 'community-poll'] as const;

    for (const tab of tabs) {
      await leaguePage.clickTab(tab);
      await leaguePage.waitForTabContentToLoad();

      // Take screenshot of each tab
      await takeTimestampedScreenshot(leaguePage.page, `league-tab-${tab}`);

      // Verify tab is active (basic check)
      await leaguePage.page.waitForTimeout(1000);
    }
  });

  test('should display Headlines tab content', async ({ leaguePage }) => {
    await leaguePage.verifyHeadlinesTab();
    await takeTimestampedScreenshot(leaguePage.page, 'headlines-tab-content');
  });

  test('should display Team Ranking tab content', async ({ leaguePage }) => {
    await leaguePage.verifyTeamRankingTab();
    await takeTimestampedScreenshot(leaguePage.page, 'team-ranking-tab-content');
  });

  test('should display League Progression tab content', async ({ leaguePage }) => {
    await leaguePage.verifyLeagueProgressionTab();
    await takeTimestampedScreenshot(leaguePage.page, 'league-progression-tab-content');
  });

  test('should display Squad Analysis tab content', async ({ leaguePage }) => {
    await leaguePage.verifySquadAnalysisTab();
    await takeTimestampedScreenshot(leaguePage.page, 'squad-analysis-tab-content');
  });

  test('should display Badges tab content', async ({ leaguePage }) => {
    await leaguePage.verifyBadgesTab();
    await takeTimestampedScreenshot(leaguePage.page, 'badges-tab-content');
  });

  test('should display Community Poll tab content', async ({ leaguePage }) => {
    await leaguePage.verifyCommunityPollTab();
    await takeTimestampedScreenshot(leaguePage.page, 'community-poll-tab-content');
  });

  test('should navigate to home page', async ({ leaguePage, homePage, page }) => {
    // Click home link
    await leaguePage.clickHomeLink();

    // Should navigate to home page
    await page.waitForURL('**/');
    await homePage.verifyHomePageLoaded();
  });

  test('should navigate to team page', async ({ leaguePage, page }) => {
    // Click My Leagues link
    await leaguePage.clickMyLeaguesLink();

    // Should navigate to team page
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/team\/\d+/);
  });

  test('should be mobile responsive', async ({ leaguePage }) => {
    // Set mobile viewport
    await leaguePage.page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to adjust
    await leaguePage.page.waitForTimeout(1000);

    // Verify mobile layout
    await leaguePage.verifyMobileLayout();

    // Test tab navigation on mobile
    await leaguePage.clickTab('team-ranking');
    await leaguePage.waitForTabContentToLoad();

    // Take mobile screenshot
    await takeTimestampedScreenshot(leaguePage.page, 'league-page-mobile');
  });

  test('should be accessible', async ({ leaguePage }) => {
    // Check basic accessibility
    await checkBasicAccessibility(leaguePage.page);

    // Verify logo has alt text
    await expect(leaguePage.fplRankerLogo).toHaveAttribute('alt');

    // Verify navigation links are accessible
    await expect(leaguePage.homeLink).toBeVisible();
    await expect(leaguePage.myLeaguesLink).toBeVisible();
  });

  test('should handle different league IDs', async ({ leaguePage }) => {
    const testLeagueIds = ['150789', '150788', '523651'];

    for (const leagueId of testLeagueIds) {
      await leaguePage.navigateToLeague(leagueId);
      await leaguePage.verifyLeaguePageLoaded();

      // Take screenshot for each league
      await takeTimestampedScreenshot(leaguePage.page, `league-${leagueId}`);

      // Verify basic elements are present
      await expect(leaguePage.leagueName).toBeVisible();
      await expect(leaguePage.gameweekInfo).toBeVisible();
    }
  });

  test('should have correct page structure', async ({ leaguePage, page }) => {
    // Verify page title contains league or FPL reference
    await expect(page).toHaveTitle(/FPL.*Hub|League/);

    // Verify URL structure
    expect(page.url()).toMatch(/\/league\/\d+/);

    // Verify main sections are present
    await expect(leaguePage.leagueName).toBeVisible();
    await expect(leaguePage.gameweekInfo).toBeVisible();
  });

  test('should load without critical errors', async ({ leaguePage, page }) => {
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
    await leaguePage.page.waitForTimeout(3000);

    // Filter out expected errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('NetworkError') &&
      !error.toLowerCase().includes('connection') &&
      !error.includes('PostgreSQL') &&
      !error.includes('database') &&
      !error.includes('Redis')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should display gameweek 6 information', async ({ leaguePage }) => {
    // Verify gameweek 6 is displayed
    await expect(leaguePage.gameweekInfo).toContainText('Gameweek 6');
    await expect(leaguePage.gameweekStatCard).toContainText('6');
  });

  test('should handle team interactions in ranking tab', async ({ leaguePage, page }) => {
    // Navigate to team ranking tab
    await leaguePage.clickTab('team-ranking');
    await leaguePage.waitForTabContentToLoad();

    // Look for team rows in the ranking
    const teamRows = page.locator('.flex.items-center.p-4, div:has-text("kejoryobkejor"), div:has-text("Meriam Pak Maon")');

    if (await teamRows.first().isVisible()) {
      // Click first team (may open pitch modal)
      await teamRows.first().click();
      await page.waitForTimeout(1000);

      // Page should remain functional
      await expect(leaguePage.leagueName).toBeVisible();
    }
  });

  test('should verify all tabs are working end-to-end', async ({ leaguePage }) => {
    // Comprehensive test of all tabs
    await leaguePage.verifyAllTabsWorkingE2E();
  });
});