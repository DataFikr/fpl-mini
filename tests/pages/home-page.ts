import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for the FPL Ranker home/landing page
 */
export class HomePage extends BasePage {
  // Header elements
  readonly logo: Locator;
  readonly mainHeading: Locator;
  readonly websiteUrl: Locator;
  readonly heroDescription: Locator;

  // Search functionality
  readonly teamSearchInput: Locator;
  readonly searchButton: Locator;
  readonly searchSuggestions: Locator;

  // Hero section badges
  readonly liveFplDataBadge: Locator;
  readonly instantAnalyticsBadge: Locator;
  readonly freeBadge: Locator;

  // Question cards section
  readonly questionsSection: Locator;
  readonly questionCards: Locator;
  readonly questionHeading: Locator;

  // CTA section
  readonly ctaSection: Locator;
  readonly ctaHeading: Locator;
  readonly ctaDescription: Locator;
  readonly ctaGetStartedBanner: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.logo = page.locator('img[alt="FPL Ranker Logo"]');
    this.mainHeading = page.locator('h1:has-text("FPLRanker")');
    this.websiteUrl = page.locator('text=fplranker.com');
    this.heroDescription = page.locator('p:has-text("Your ultimate Fantasy Premier League analytics platform")');

    // Search functionality
    this.teamSearchInput = page.locator('input[placeholder*="team name"], input[placeholder*="Manager ID"]');
    this.searchButton = page.locator('button:has-text("Search"), button[type="submit"]');
    this.searchSuggestions = page.locator('[data-testid="search-suggestions"], .search-suggestions');

    // Hero section badges
    this.liveFplDataBadge = page.locator('text=Live FPL Data');
    this.instantAnalyticsBadge = page.locator('text=Instant Analytics');
    this.freeBadge = page.locator('text=100% Free');

    // Question cards section
    this.questionsSection = page.locator('section:has-text("Ever Wondered About Your League?")');
    this.questionCards = page.locator('[data-testid="question-card"], .question-card, div:has(h3:text("Wonder which team"))').first();
    this.questionHeading = page.locator('h2:has-text("Ever Wondered About Your League?")');

    // CTA section
    this.ctaSection = page.locator('section:has-text("Ready to Elevate Your FPL Game?")');
    this.ctaHeading = page.locator('h2:has-text("Ready to Elevate Your FPL Game?")');
    this.ctaDescription = page.locator('text=Join thousands of managers who use FPLRanker.com');
    this.ctaGetStartedBanner = page.locator('text=All answers are just one search away!');
  }

  /**
   * Navigate to the home page
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Search for a team by name
   */
  async searchForTeam(teamName: string): Promise<void> {
    await this.fillInput(this.teamSearchInput, teamName);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Click search button
   */
  async clickSearchButton(): Promise<void> {
    await this.clickWithRetry(this.searchButton);
  }

  /**
   * Verify home page is loaded correctly
   */
  async verifyHomePageLoaded(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.mainHeading).toBeVisible();
    await expect(this.websiteUrl).toBeVisible();
    await expect(this.heroDescription).toBeVisible();
  }

  /**
   * Verify hero section elements
   */
  async verifyHeroSection(): Promise<void> {
    await expect(this.mainHeading).toContainText('FPLRanker');
    await expect(this.websiteUrl).toContainText('fplranker.com');
    await expect(this.heroDescription).toContainText('Your ultimate Fantasy Premier League analytics platform');

    // Verify badges
    await expect(this.liveFplDataBadge).toBeVisible();
    await expect(this.instantAnalyticsBadge).toBeVisible();
    await expect(this.freeBadge).toBeVisible();
  }

  /**
   * Verify search functionality is present
   */
  async verifySearchFunctionality(): Promise<void> {
    await expect(this.teamSearchInput).toBeVisible();
    await expect(this.teamSearchInput).toBeEditable();
  }

  /**
   * Verify questions section
   */
  async verifyQuestionsSection(): Promise<void> {
    await expect(this.questionHeading).toBeVisible();
    await expect(this.questionHeading).toContainText('Ever Wondered About Your League?');

    // Scroll to questions section to ensure it's in view
    await this.scrollIntoView(this.questionsSection);
    await expect(this.questionsSection).toBeVisible();
  }

  /**
   * Verify CTA section
   */
  async verifyCTASection(): Promise<void> {
    await this.scrollIntoView(this.ctaSection);
    await expect(this.ctaSection).toBeVisible();
    await expect(this.ctaHeading).toContainText('Ready to Elevate Your FPL Game?');
    await expect(this.ctaDescription).toContainText('FPLRanker.com');
    await expect(this.ctaGetStartedBanner).toBeVisible();
  }

  /**
   * Verify page is mobile responsive
   */
  async verifyMobileLayout(): Promise<void> {
    await this.verifyMobileResponsiveness();

    // Check that logo is still visible on mobile
    await expect(this.logo).toBeVisible();

    // Check that main heading adapts to mobile
    await expect(this.mainHeading).toBeVisible();

    // Check search input is accessible on mobile
    await expect(this.teamSearchInput).toBeVisible();
  }

  /**
   * Get all question cards
   */
  async getQuestionCards(): Promise<Locator[]> {
    const cards = await this.page.locator('div:has(h3:text("Wonder which team")), div:has(h3:text("Which manager")), div:has(h3:text("How has your team")), div:has(h3:text("Want your vote")), div:has(h3:text("Ready to gain"))').all();
    return cards;
  }

  /**
   * Verify all question cards are present
   */
  async verifyQuestionCards(): Promise<void> {
    const cards = await this.getQuestionCards();
    expect(cards.length).toBeGreaterThan(0);

    // Verify specific question cards exist
    const expectedQuestions = [
      'Wonder which team in your mini league has progressed the most?',
      'Which manager made the smartest move using their chip?',
      'Which manager picked the captain with the most points?',
      'How has your team progressed throughout the gameweeks?',
      'Want your vote to count in the community poll?',
      'Ready to gain an edge over your rivals?'
    ];

    for (const question of expectedQuestions) {
      const questionElement = this.page.locator(`text=${question}`);
      await this.scrollIntoView(questionElement);
      await expect(questionElement).toBeVisible({ timeout: 10000 });
    }
  }
}