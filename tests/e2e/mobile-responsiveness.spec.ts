import { test, expect } from '../fixtures/test-fixtures';
import { checkResponsiveDesign, takeTimestampedScreenshot } from '../utils/test-helpers';

test.describe('Mobile Responsiveness', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ];

  for (const device of devices) {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
      });

      test('home page should be responsive', async ({ homePage }) => {
        await homePage.navigateToHome();
        await homePage.verifyHomePageLoaded();

        // Verify mobile layout
        await homePage.verifyMobileLayout();

        // Check for horizontal scroll
        await homePage.verifyMobileResponsiveness();

        // Verify key elements are accessible
        await expect(homePage.logo).toBeVisible();
        await expect(homePage.mainHeading).toBeVisible();
        await expect(homePage.teamSearchInput).toBeVisible();

        // Take screenshot
        await takeTimestampedScreenshot(homePage.page, `home-${device.name.replace(/\s+/g, '-')}`);
      });

      test('team page should be responsive', async ({ teamPage }) => {
        await teamPage.navigateToTeam('5100818');
        await teamPage.verifyTeamPageLoaded();

        // Verify mobile layout
        await teamPage.verifyMobileLayout();

        // Verify key elements are accessible on mobile
        await expect(teamPage.teamName).toBeVisible();
        await expect(teamPage.managerName).toBeVisible();
        await expect(teamPage.homeIconOnCard).toBeVisible();

        // Statistics cards should be visible and properly laid out
        await expect(teamPage.activeLeaguesCard).toBeVisible();
        await expect(teamPage.currentGameweekCard).toBeVisible();

        // Take screenshot
        await takeTimestampedScreenshot(teamPage.page, `team-${device.name.replace(/\s+/g, '-')}`);
      });

      test('league page should be responsive', async ({ leaguePage }) => {
        await leaguePage.navigateToLeague('150789');
        await leaguePage.verifyLeaguePageLoaded();

        // Verify mobile layout
        await leaguePage.verifyMobileLayout();

        // Verify key elements are accessible on mobile
        await expect(leaguePage.leagueName).toBeVisible();
        await expect(leaguePage.fplRankerLogo).toBeVisible();

        // Tab navigation should work on mobile
        await leaguePage.clickTab('team-ranking');
        await leaguePage.waitForTabContentToLoad();

        await leaguePage.clickTab('community-poll');
        await leaguePage.waitForTabContentToLoad();

        // Take screenshot
        await takeTimestampedScreenshot(leaguePage.page, `league-${device.name.replace(/\s+/g, '-')}`);
      });

      test('search functionality should work on mobile', async ({ homePage }) => {
        await homePage.navigateToHome();

        // Verify search input is accessible
        await expect(homePage.teamSearchInput).toBeVisible();
        await expect(homePage.teamSearchInput).toBeEditable();

        // Test search interaction
        await homePage.teamSearchInput.fill('5100818');
        await expect(homePage.teamSearchInput).toHaveValue('5100818');

        // Clear search
        await homePage.teamSearchInput.clear();
        await expect(homePage.teamSearchInput).toHaveValue('');
      });

      test('navigation should work on mobile', async ({ homePage, teamPage, leaguePage, page }) => {
        // Test navigation flow on mobile
        await homePage.navigateToHome();
        await homePage.verifyHomePageLoaded();

        // Navigate to team page
        await teamPage.navigateToTeam('5100818');
        await teamPage.verifyTeamPageLoaded();

        // Use home icon to go back
        await teamPage.clickHomeIconOnCard();
        await page.waitForURL('**/');

        // Navigate to league page
        await leaguePage.navigateToLeague('150789');
        await leaguePage.verifyLeaguePageLoaded();

        // Use home link to go back
        await leaguePage.clickHomeLink();
        await page.waitForURL('**/');
      });
    });
  }

  test('should handle orientation changes', async ({ page, homePage }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigateToHome();
    await homePage.verifyMobileLayout();
    await takeTimestampedScreenshot(page, 'portrait-mode');

    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000); // Allow layout to adjust
    await homePage.verifyMobileResponsiveness();
    await takeTimestampedScreenshot(page, 'landscape-mode');
  });

  test('should have proper touch targets', async ({ page, homePage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigateToHome();

    // Check touch target sizes (should be at least 44px)
    const touchTargets = [
      homePage.teamSearchInput,
      homePage.logo,
    ];

    for (const target of touchTargets) {
      if (await target.isVisible()) {
        const box = await target.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Minimum touch target
        }
      }
    }
  });

  test('should handle mobile-specific interactions', async ({ page, homePage, teamPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test touch scrolling
    await homePage.navigateToHome();

    // Scroll to questions section
    await homePage.questionsSection.scrollIntoViewIfNeeded();
    await expect(homePage.questionsSection).toBeVisible();

    // Test team page scrolling
    await teamPage.navigateToTeam('5100818');
    await teamPage.miniLeaguesSection.scrollIntoViewIfNeeded();
    await expect(teamPage.miniLeaguesSection).toBeVisible();
  });

  test('should not have horizontal scroll', async ({ page, homePage, teamPage, leaguePage }) => {
    const mobileViewport = { width: 375, height: 667 };
    await page.setViewportSize(mobileViewport);

    const pages = [
      { name: 'home', navigateFn: () => homePage.navigateToHome() },
      { name: 'team', navigateFn: () => teamPage.navigateToTeam('5100818') },
      { name: 'league', navigateFn: () => leaguePage.navigateToLeague('150789') }
    ];

    for (const pageInfo of pages) {
      await pageInfo.navigateFn();
      await page.waitForLoadState('networkidle');

      // Check for horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small tolerance

      await takeTimestampedScreenshot(page, `no-horizontal-scroll-${pageInfo.name}`);
    }
  });

  test('should have readable text on mobile', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigateToHome();

    // Check text elements are readable (minimum 16px font size recommended)
    const textElements = [
      homePage.mainHeading,
      homePage.heroDescription,
      homePage.questionHeading
    ];

    for (const element of textElements) {
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        const fontSizeNum = parseInt(fontSize.replace('px', ''));
        expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable size
      }
    }
  });

  test('should handle viewport meta tag correctly', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag exists
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
    expect(viewportMeta).toContain('initial-scale=1');
  });
});