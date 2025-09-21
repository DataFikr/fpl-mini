import { test, expect } from '../fixtures/test-fixtures';

test.describe('Visual Regression Testing', () => {
  test.describe('Desktop Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Set consistent desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('home page should match visual baseline', async ({ homePage }) => {
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      // Wait for animations and dynamic content to settle
      await homePage.page.waitForTimeout(2000);

      // Take full page screenshot
      await expect(homePage.page).toHaveScreenshot('home-page-desktop.png', {
        fullPage: true,
        threshold: 0.3 // Allow 30% pixel difference for dynamic content
      });
    });

    test('team page should match visual baseline', async ({ teamPage }) => {
      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyTeamPageLoaded();

      // Wait for league cards to load
      await teamPage.waitForLeagueCardsToLoad();
      await teamPage.page.waitForTimeout(2000);

      await expect(teamPage.page).toHaveScreenshot('team-page-desktop.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('league page should match visual baseline', async ({ leaguePage }) => {
      await leaguePage.navigateToLeague('150789');
      await leaguePage.verifyLeaguePageLoaded();

      // Test different tabs
      const tabs = ['headlines', 'team-ranking', 'league-progression'] as const;

      for (const tab of tabs) {
        await leaguePage.clickTab(tab);
        await leaguePage.waitForTabContentToLoad();

        await expect(leaguePage.page).toHaveScreenshot(`league-${tab}-desktop.png`, {
          threshold: 0.3
        });
      }
    });
  });

  test.describe('Mobile Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Set consistent mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('home page mobile should match visual baseline', async ({ homePage }) => {
      await homePage.navigateToHome();
      await homePage.verifyMobileLayout();

      await homePage.page.waitForTimeout(2000);

      await expect(homePage.page).toHaveScreenshot('home-page-mobile.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('team page mobile should match visual baseline', async ({ teamPage }) => {
      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyMobileLayout();

      await teamPage.page.waitForTimeout(2000);

      await expect(teamPage.page).toHaveScreenshot('team-page-mobile.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('league page mobile should match visual baseline', async ({ leaguePage }) => {
      await leaguePage.navigateToLeague('150789');
      await leaguePage.verifyMobileLayout();

      await leaguePage.page.waitForTimeout(2000);

      await expect(leaguePage.page).toHaveScreenshot('league-page-mobile.png', {
        threshold: 0.3
      });
    });
  });

  test.describe('Component Visual Tests', () => {
    test('home page hero section should be consistent', async ({ homePage }) => {
      await homePage.navigateToHome();

      // Focus on hero section only
      const heroSection = homePage.page.locator('section').first();
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        threshold: 0.2
      });
    });

    test('question cards section should be consistent', async ({ homePage }) => {
      await homePage.navigateToHome();

      // Scroll to questions section
      await homePage.scrollIntoView(homePage.questionsSection);
      await homePage.page.waitForTimeout(1000);

      await expect(homePage.questionsSection).toHaveScreenshot('questions-section.png', {
        threshold: 0.2
      });
    });

    test('team statistics cards should be consistent', async ({ teamPage }) => {
      await teamPage.navigateToTeam('5100818');

      // Focus on statistics cards
      const statsSection = teamPage.page.locator('.grid.md\\:grid-cols-5').first();
      await expect(statsSection).toHaveScreenshot('team-stats-cards.png', {
        threshold: 0.2
      });
    });

    test('league tab navigation should be consistent', async ({ leaguePage }) => {
      await leaguePage.navigateToLeague('150789');

      // Focus on tab navigation
      const tabNavigation = leaguePage.page.locator('.flex.space-x-1.overflow-x-auto');
      await expect(tabNavigation).toHaveScreenshot('league-tab-navigation.png', {
        threshold: 0.1
      });
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Simulate dark mode if supported
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('home page should handle dark mode gracefully', async ({ homePage }) => {
      await homePage.navigateToHome();
      await homePage.page.waitForTimeout(2000);

      await expect(homePage.page).toHaveScreenshot('home-page-dark-mode.png', {
        fullPage: true,
        threshold: 0.4
      });
    });
  });

  test.describe('Print Styles Visual Tests', () => {
    test('home page should have proper print styles', async ({ homePage }) => {
      await homePage.navigateToHome();

      // Emulate print media
      await homePage.page.emulateMedia({ media: 'print' });
      await homePage.page.waitForTimeout(1000);

      await expect(homePage.page).toHaveScreenshot('home-page-print.png', {
        fullPage: true,
        threshold: 0.5
      });
    });
  });

  test.describe('Loading States Visual Tests', () => {
    test('team page loading state should be consistent', async ({ teamPage, page }) => {
      // Simulate slow network to capture loading states
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 1000);
      });

      const navigationPromise = teamPage.navigateToTeam('5100818');

      // Capture loading state
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('team-page-loading.png', {
        threshold: 0.4
      });

      await navigationPromise;
    });
  });

  test.describe('Error States Visual Tests', () => {
    test('should handle 404 page gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('404-page.png', {
        threshold: 0.3
      });
    });

    test('should handle invalid team ID gracefully', async ({ page }) => {
      await page.goto('/team/999999999');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('invalid-team-page.png', {
        threshold: 0.3
      });
    });
  });

  test.describe('Interactive States Visual Tests', () => {
    test('buttons should have consistent hover states', async ({ homePage }) => {
      await homePage.navigateToHome();

      // Hover over search input
      await homePage.teamSearchInput.hover();
      await homePage.page.waitForTimeout(500);

      await expect(homePage.teamSearchInput).toHaveScreenshot('search-input-hover.png', {
        threshold: 0.1
      });
    });

    test('league tabs should have consistent active states', async ({ leaguePage }) => {
      await leaguePage.navigateToLeague('150789');

      // Click team ranking tab
      await leaguePage.clickTab('team-ranking');
      await leaguePage.page.waitForTimeout(500);

      const activeTab = leaguePage.teamRankingTab;
      await expect(activeTab).toHaveScreenshot('active-tab-state.png', {
        threshold: 0.1
      });
    });
  });
});