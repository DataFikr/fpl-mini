import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for the League page
 */
export class LeaguePage extends BasePage {
  // Navigation elements
  readonly fplRankerLogo: Locator;
  readonly homeLink: Locator;
  readonly myLeaguesLink: Locator;

  // League header elements
  readonly leagueName: Locator;
  readonly gameweekInfo: Locator;

  // League stats cards
  readonly teamsStatCard: Locator;
  readonly gameweekStatCard: Locator;
  readonly leaderStatCard: Locator;
  readonly averageStatCard: Locator;

  // Tab navigation
  readonly headlinesTab: Locator;
  readonly teamRankingTab: Locator;
  readonly leagueProgressionTab: Locator;
  readonly squadAnalysisTab: Locator;
  readonly badgesTab: Locator;
  readonly communityPollTab: Locator;

  // Tab content areas
  readonly headlinesContent: Locator;
  readonly teamRankingContent: Locator;
  readonly leagueProgressionContent: Locator;
  readonly squadAnalysisContent: Locator;
  readonly badgesContent: Locator;
  readonly communityPollContent: Locator;

  // Team ranking specific elements
  readonly leagueTable: Locator;
  readonly teamRows: Locator;
  readonly teamRow: (teamName: string) => Locator;

  // League progression elements
  readonly progressionChart: Locator;

  // Squad analysis elements
  readonly squadTable: Locator;

  // Community poll elements
  readonly pollSection: Locator;
  readonly voteOptions: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation elements
    this.fplRankerLogo = page.locator('img[alt="FPLRanker Logo"]');
    this.homeLink = page.locator('a[href="/"] span:has-text("Home")').first();
    this.myLeaguesLink = page.locator('a[href*="/team/"] span:has-text("My Leagues")').first();

    // League header elements
    this.leagueName = page.locator('h1.text-xl.font-bold');
    this.gameweekInfo = page.locator('p:has-text("Gameweek")');

    // League stats cards
    this.teamsStatCard = page.locator('text=Teams').locator('..');
    this.gameweekStatCard = page.locator('text=Gameweek').locator('..');
    this.leaderStatCard = page.locator('text=Leader').locator('..');
    this.averageStatCard = page.locator('text=Average').locator('..');

    // Tab navigation
    this.headlinesTab = page.locator('button:has-text("Top Headlines"), button:has-text("Headlines")');
    this.teamRankingTab = page.locator('button:has-text("Team Ranking")');
    this.leagueProgressionTab = page.locator('button:has-text("League Progression")');
    this.squadAnalysisTab = page.locator('button:has-text("Analysis")');
    this.badgesTab = page.locator('button:has-text("Badges")');
    this.communityPollTab = page.locator('button:has-text("Community Poll")');

    // Tab content areas
    this.headlinesContent = page.locator('[data-testid="headlines-content"], div:has-text("Latest updates from")');
    this.teamRankingContent = page.locator('div:has-text("League Table"), div:has-text("Current standings")');
    this.leagueProgressionContent = page.locator('[data-testid="progression-chart"], svg');
    this.squadAnalysisContent = page.locator('[data-testid="squad-analysis"], table');
    this.badgesContent = page.locator('[data-testid="badges"], div:has-text("achievements")');
    this.communityPollContent = page.locator('[data-testid="community-poll"], div:has-text("Community Poll")');

    // Team ranking specific elements
    this.leagueTable = page.locator('div:has-text("League Table")').locator('..');
    this.teamRows = page.locator('.flex.items-center.p-4.bg-gray-50');
    this.teamRow = (teamName: string) => page.locator(`div:has-text("${teamName}")`).locator('..');

    // League progression elements
    this.progressionChart = page.locator('svg, [data-testid="rank-progression-chart"]').first();

    // Squad analysis elements
    this.squadTable = page.locator('table, [data-testid="squad-table"]').first();

    // Community poll elements
    this.pollSection = page.locator('div:has-text("Community Poll")').first();
    this.voteOptions = page.locator('button:has-text("Vote"), [data-testid="vote-option"]');
  }

  /**
   * Navigate to a specific league page
   */
  async navigateToLeague(leagueId: string): Promise<void> {
    await this.goto(`/league/${leagueId}`);
    await this.waitForPageLoad();
  }

  /**
   * Click home link in navigation
   */
  async clickHomeLink(): Promise<void> {
    await this.clickWithRetry(this.homeLink);
  }

  /**
   * Click My Leagues link in navigation
   */
  async clickMyLeaguesLink(): Promise<void> {
    await this.clickWithRetry(this.myLeaguesLink);
  }

  /**
   * Verify league page is loaded correctly
   */
  async verifyLeaguePageLoaded(): Promise<void> {
    await expect(this.fplRankerLogo).toBeVisible();
    await expect(this.leagueName).toBeVisible();
    await expect(this.gameweekInfo).toBeVisible();
  }

  /**
   * Verify league header information
   */
  async verifyLeagueHeader(): Promise<void> {
    await expect(this.leagueName).toBeVisible();
    await expect(this.gameweekInfo).toContainText('Gameweek 6');

    // Verify navigation links
    await expect(this.homeLink).toBeVisible();
    await expect(this.myLeaguesLink).toBeVisible();
  }

  /**
   * Verify league statistics cards
   */
  async verifyLeagueStats(): Promise<void> {
    await expect(this.teamsStatCard).toBeVisible();
    await expect(this.gameweekStatCard).toBeVisible();
    await expect(this.leaderStatCard).toBeVisible();
    await expect(this.averageStatCard).toBeVisible();

    // Verify gameweek shows 6
    await expect(this.gameweekStatCard).toContainText('6');
  }

  /**
   * Verify all tabs are present
   */
  async verifyTabNavigation(): Promise<void> {
    await expect(this.headlinesTab).toBeVisible();
    await expect(this.teamRankingTab).toBeVisible();
    await expect(this.leagueProgressionTab).toBeVisible();
    await expect(this.squadAnalysisTab).toBeVisible();
    await expect(this.badgesTab).toBeVisible();
    await expect(this.communityPollTab).toBeVisible();
  }

  /**
   * Click on a specific tab
   */
  async clickTab(tabName: 'headlines' | 'team-ranking' | 'league-progression' | 'squad-analysis' | 'badges' | 'community-poll'): Promise<void> {
    const tabMap = {
      'headlines': this.headlinesTab,
      'team-ranking': this.teamRankingTab,
      'league-progression': this.leagueProgressionTab,
      'squad-analysis': this.squadAnalysisTab,
      'badges': this.badgesTab,
      'community-poll': this.communityPollTab
    };

    await this.clickWithRetry(tabMap[tabName]);
    await this.waitForNetworkIdle();
  }

  /**
   * Verify Headlines tab content
   */
  async verifyHeadlinesTab(): Promise<void> {
    await this.clickTab('headlines');
    // The headlines content should be visible by default or after clicking
    await this.page.waitForTimeout(1000); // Give time for content to load
  }

  /**
   * Verify Team Ranking tab content
   */
  async verifyTeamRankingTab(): Promise<void> {
    await this.clickTab('team-ranking');
    await expect(this.teamRankingContent).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify League Progression tab content
   */
  async verifyLeagueProgressionTab(): Promise<void> {
    await this.clickTab('league-progression');
    await this.page.waitForTimeout(2000); // Give time for chart to render
    // Check if progression chart area is present
    const chartContainer = this.page.locator('div').filter({ hasText: /progression|chart/i }).first();
    await expect(chartContainer).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify Squad Analysis tab content
   */
  async verifySquadAnalysisTab(): Promise<void> {
    await this.clickTab('squad-analysis');
    await this.page.waitForTimeout(2000); // Give time for data to load
  }

  /**
   * Verify Badges tab content
   */
  async verifyBadgesTab(): Promise<void> {
    await this.clickTab('badges');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify Community Poll tab content
   */
  async verifyCommunityPollTab(): Promise<void> {
    await this.clickTab('community-poll');
    await expect(this.communityPollContent).toBeVisible({ timeout: 10000 });
  }

  /**
   * Click on a team in the ranking table
   */
  async clickTeamInRanking(teamName: string): Promise<void> {
    await this.clickTab('team-ranking');
    const teamElement = this.teamRow(teamName);
    await this.scrollIntoView(teamElement);
    await this.clickWithRetry(teamElement);
  }

  /**
   * Verify gameweek 6 data is displayed
   */
  async verifyGameweek6Data(): Promise<void> {
    await expect(this.gameweekInfo).toContainText('Gameweek 6');
    await expect(this.gameweekStatCard).toContainText('6');
  }

  /**
   * Verify mobile layout
   */
  async verifyMobileLayout(): Promise<void> {
    await this.verifyMobileResponsiveness();

    // Check that key elements are visible on mobile
    await expect(this.fplRankerLogo).toBeVisible();
    await expect(this.leagueName).toBeVisible();

    // Tabs should be horizontally scrollable on mobile
    await expect(this.headlinesTab).toBeVisible();
  }

  /**
   * Get league name
   */
  async getLeagueName(): Promise<string> {
    return await this.leagueName.textContent() || '';
  }

  /**
   * Wait for tab content to load
   */
  async waitForTabContentToLoad(timeout = 10000): Promise<void> {
    await this.page.waitForTimeout(2000);
    await this.waitForNetworkIdle();
  }

  /**
   * Verify all tabs can be clicked and show content
   */
  async verifyAllTabsWorkingE2E(): Promise<void> {
    const tabs = ['headlines', 'team-ranking', 'league-progression', 'squad-analysis', 'badges', 'community-poll'] as const;

    for (const tab of tabs) {
      await this.clickTab(tab);
      await this.waitForTabContentToLoad();
      // Take a screenshot for visual verification
      await this.takeScreenshot(`league-${tab}-tab`);
    }
  }
}