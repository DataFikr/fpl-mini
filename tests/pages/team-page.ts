import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for the Team page
 */
export class TeamPage extends BasePage {
  // Navigation elements
  readonly homeIcon: Locator;
  readonly fplRankerLogo: Locator;

  // Manager card elements
  readonly managerCard: Locator;
  readonly teamName: Locator;
  readonly managerName: Locator;
  readonly teamCrest: Locator;
  readonly homeIconOnCard: Locator;

  // Manager info elements
  readonly favouriteTeam: Locator;
  readonly regionInfo: Locator;
  readonly managerId: Locator;
  readonly lastUpdated: Locator;

  // Statistics cards
  readonly activeLeaguesCard: Locator;
  readonly bestRankCard: Locator;
  readonly currentGameweekCard: Locator;
  readonly overallPointsCard: Locator;
  readonly gameweekPointsCard: Locator;

  // Mini leagues section
  readonly miniLeaguesSection: Locator;
  readonly leagueCards: Locator;
  readonly leagueCard: (leagueId: string) => Locator;

  constructor(page: Page) {
    super(page);

    // Navigation elements
    this.homeIcon = page.locator('a[href="/"] svg, a[href="/"] *:has-text("Home")').first();
    this.fplRankerLogo = page.locator('img[alt="FPLRanker Logo"]');

    // Manager card elements
    this.managerCard = page.locator('.bg-white.rounded-3xl.shadow-2xl').first();
    this.teamName = page.locator('h1 span.bg-gradient-to-r');
    this.managerName = page.locator('text=/Managed by/');
    this.teamCrest = page.locator('[data-testid="team-crest"], .team-crest').first();
    this.homeIconOnCard = this.managerCard.locator('a[href="/"]');

    // Manager info elements
    this.favouriteTeam = page.locator('text=Favourite Team').locator('..');
    this.regionInfo = page.locator('text=Region').locator('..');
    this.managerId = page.locator('text=Manager ID').locator('..');
    this.lastUpdated = page.locator('text=Last updated');

    // Statistics cards
    this.activeLeaguesCard = page.locator('text=Active Leagues').locator('..');
    this.bestRankCard = page.locator('text=Best Rank').locator('..');
    this.currentGameweekCard = page.locator('text=Current GW').locator('..');
    this.overallPointsCard = page.locator('text=Overall Points').locator('..');
    this.gameweekPointsCard = page.locator('text=GW Points').locator('..');

    // Mini leagues section
    this.miniLeaguesSection = page.locator('section:has-text("Your Mini-Leagues")');
    this.leagueCards = page.locator('[data-testid="league-card"], .league-card').first();
    this.leagueCard = (leagueId: string) => page.locator(`[data-league-id="${leagueId}"], a[href*="/league/${leagueId}"]`);
  }

  /**
   * Navigate to a specific team page
   */
  async navigateToTeam(teamId: string): Promise<void> {
    await this.goto(`/team/${teamId}`);
    await this.waitForPageLoad();
  }

  /**
   * Click home icon on manager card
   */
  async clickHomeIconOnCard(): Promise<void> {
    await this.clickWithRetry(this.homeIconOnCard);
  }

  /**
   * Verify team page is loaded correctly
   */
  async verifyTeamPageLoaded(): Promise<void> {
    await expect(this.managerCard).toBeVisible();
    await expect(this.teamName).toBeVisible();
    await expect(this.managerName).toBeVisible();
    await expect(this.fplRankerLogo).toBeVisible();
  }

  /**
   * Verify manager information section
   */
  async verifyManagerInfo(): Promise<void> {
    await expect(this.teamName).toBeVisible();
    await expect(this.managerName).toBeVisible();
    await expect(this.lastUpdated).toBeVisible();

    // Verify the home icon is present on the manager card
    await expect(this.homeIconOnCard).toBeVisible();
  }

  /**
   * Verify statistics cards
   */
  async verifyStatisticsCards(): Promise<void> {
    await expect(this.activeLeaguesCard).toBeVisible();
    await expect(this.bestRankCard).toBeVisible();
    await expect(this.currentGameweekCard).toBeVisible();
    await expect(this.overallPointsCard).toBeVisible();
    await expect(this.gameweekPointsCard).toBeVisible();

    // Verify current gameweek shows 6
    await expect(this.currentGameweekCard).toContainText('6');
  }

  /**
   * Verify mini leagues section
   */
  async verifyMiniLeaguesSection(): Promise<void> {
    await this.scrollIntoView(this.miniLeaguesSection);
    await expect(this.miniLeaguesSection).toBeVisible();

    const sectionHeading = this.miniLeaguesSection.locator('h2:has-text("Your Mini-Leagues")');
    await expect(sectionHeading).toBeVisible();
  }

  /**
   * Click on a specific league card
   */
  async clickLeagueCard(leagueId: string): Promise<void> {
    const card = this.leagueCard(leagueId);
    await this.scrollIntoView(card);
    await this.clickWithRetry(card);
  }

  /**
   * Get team name text
   */
  async getTeamName(): Promise<string> {
    return await this.teamName.textContent() || '';
  }

  /**
   * Get manager name text
   */
  async getManagerName(): Promise<string> {
    const fullText = await this.managerName.textContent() || '';
    return fullText.replace('Managed by ', '');
  }

  /**
   * Verify page shows correct gameweek data (GW6)
   */
  async verifyGameweek6Data(): Promise<void> {
    // Verify current gameweek shows 6
    await expect(this.currentGameweekCard).toContainText('6');

    // Verify that points are reasonable for gameweek 6 (should be higher than early gameweeks)
    const overallPointsText = await this.overallPointsCard.textContent();
    const pointsMatch = overallPointsText?.match(/(\d+)/);
    if (pointsMatch) {
      const points = parseInt(pointsMatch[1]);
      expect(points).toBeGreaterThan(200); // Should be substantial points by GW6
    }
  }

  /**
   * Verify mobile layout
   */
  async verifyMobileLayout(): Promise<void> {
    await this.verifyMobileResponsiveness();

    // Check that manager card is visible and properly laid out on mobile
    await expect(this.managerCard).toBeVisible();
    await expect(this.teamName).toBeVisible();
    await expect(this.homeIconOnCard).toBeVisible();

    // Statistics cards should be visible in mobile layout
    await expect(this.activeLeaguesCard).toBeVisible();
    await expect(this.currentGameweekCard).toBeVisible();
  }

  /**
   * Wait for league cards to load
   */
  async waitForLeagueCardsToLoad(): Promise<void> {
    // Wait for at least one league card to be visible
    await this.waitForElement(this.leagueCards);
  }

  /**
   * Get number of leagues displayed
   */
  async getNumberOfLeagues(): Promise<number> {
    const cards = await this.page.locator('a[href*="/league/"]').count();
    return cards;
  }
}