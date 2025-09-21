import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { TeamPage } from '../pages/team-page';
import { LeaguePage } from '../pages/league-page';
import { mockFPLApiResponses } from '../utils/test-helpers';

/**
 * Extended test fixtures with page objects and common setup
 */
type TestFixtures = {
  homePage: HomePage;
  teamPage: TeamPage;
  leaguePage: LeaguePage;
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    // Setup API mocking for consistent test environment
    await mockFPLApiResponses(page);

    const homePage = new HomePage(page);
    await use(homePage);
  },

  teamPage: async ({ page }, use) => {
    // Setup API mocking for consistent test environment
    await mockFPLApiResponses(page);

    const teamPage = new TeamPage(page);
    await use(teamPage);
  },

  leaguePage: async ({ page }, use) => {
    // Setup API mocking for consistent test environment
    await mockFPLApiResponses(page);

    const leaguePage = new LeaguePage(page);
    await use(leaguePage);
  }
});

export { expect } from '@playwright/test';