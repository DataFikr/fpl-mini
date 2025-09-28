import { Page, Locator, expect } from '@playwright/test';

/**
 * 🚀 Enhanced Base Page Class
 * Contains reliability improvements, error handling, and performance optimizations
 */
export class BasePage {
  readonly page: Page;
  private errorLog: string[] = [];
  private performanceMetrics: any = {};

  constructor(page: Page) {
    this.page = page;
    this.setupErrorTracking();
    this.setupPerformanceTracking();
  }

  /**
   * 🔧 Setup error tracking for better debugging
   */
  private setupErrorTracking(): void {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errorLog.push(`Console Error: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', error => {
      this.errorLog.push(`Page Error: ${error.message}`);
    });

    this.page.on('requestfailed', request => {
      this.errorLog.push(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
  }

  /**
   * 📊 Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        const timing = {
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        };
        if (!this.performanceMetrics.apiCalls) {
          this.performanceMetrics.apiCalls = [];
        }
        this.performanceMetrics.apiCalls.push(timing);
      }
    });
  }

  /**
   * 🚀 Enhanced navigation with retry and error handling
   */
  async goto(url: string, options: {
    retries?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    timeout?: number;
  } = {}): Promise<void> {
    const { retries = 3, waitUntil = 'domcontentloaded', timeout = 90000 } = options; // Changed to domcontentloaded for faster loading

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 Navigating to ${url} (attempt ${attempt}/${retries})`);

        await this.page.goto(url, {
          waitUntil,
          timeout,
          referer: 'https://google.com' // Help with anti-bot measures
        });

        // Wait for basic content to load, then verify
        await this.page.waitForLoadState('domcontentloaded');

        // For slow API responses, wait a bit more for initial content
        if (url.includes('league') || url.includes('team')) {
          await this.page.waitForTimeout(2000); // Brief wait for API data
        }

        await this.verifyPageLoaded();
        console.log(`✅ Successfully loaded ${url}`);
        return;

      } catch (error) {
        console.error(`❌ Navigation attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          throw new Error(`Failed to navigate to ${url} after ${retries} attempts: ${error}`);
        }

        // Progressive delay between retries
        const delay = Math.min(1000 * attempt, 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await this.page.waitForTimeout(delay);
      }
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `tests/screenshots/${name}.png`,
      fullPage: true
    });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * 🎯 Smart click with enhanced retry logic and error recovery
   */
  async clickWithRetry(locator: Locator, options: {
    retries?: number;
    forceClick?: boolean;
    scrollFirst?: boolean;
    timeout?: number;
  } = {}): Promise<void> {
    const { retries = 3, forceClick = false, scrollFirst = true, timeout = 10000 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🎯 Clicking element (attempt ${attempt}/${retries})`);

        // Scroll element into view first
        if (scrollFirst) {
          await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
        }

        // Wait for element to be actionable
        await locator.waitFor({ state: 'visible', timeout: 5000 });

        // Try regular click first
        if (forceClick || attempt > 1) {
          await locator.click({ force: true, timeout });
        } else {
          await locator.click({ timeout });
        }

        console.log(`✅ Successfully clicked element`);
        return;

      } catch (error) {
        console.error(`❌ Click attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          // Take screenshot before failing
          await this.takeDebugScreenshot(`click-failure-${Date.now()}`);
          throw new Error(`Failed to click element after ${retries} attempts: ${error}`);
        }

        // Progressive recovery strategies
        const delay = 500 * attempt;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await this.page.waitForTimeout(delay);

        // Try different strategies on each retry
        if (attempt === 2) {
          console.log(`🔄 Retry strategy: Waiting for network idle`);
          await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        }
      }
    }
  }

  /**
   * Fill input with validation
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
    await expect(locator).toHaveValue(value);
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element exists
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(action: () => Promise<void>): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      action()
    ]);
  }

  /**
   * Check if page is responsive on mobile
   */
  async verifyMobileResponsiveness(): Promise<void> {
    // Check viewport is set correctly
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width <= 768) {
      // Verify no horizontal scroll
      const scrollWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await this.page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small tolerance
    }
  }

  /**
   * 🔍 Verify page loaded successfully
   */
  private async verifyPageLoaded(): Promise<void> {
    // Wait for basic DOM elements
    await this.page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });

    // Check for common error states
    const has404 = await this.page.locator('text=404').isVisible().catch(() => false);
    const has500 = await this.page.locator('text=500').isVisible().catch(() => false);
    const hasError = await this.page.locator('[data-testid="error"]').isVisible().catch(() => false);

    if (has404 || has500 || hasError) {
      throw new Error('Page loaded with error state');
    }
  }

  /**
   * 📸 Take debug screenshot with timestamp
   */
  async takeDebugScreenshot(name: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `debug-${name}-${timestamp}`;
      await this.page.screenshot({
        path: `tests/screenshots/debug/${filename}.png`,
        fullPage: true
      });
      console.log(`📸 Debug screenshot saved: ${filename}.png`);
    } catch (error) {
      console.error('Failed to take debug screenshot:', error);
    }
  }

  /**
   * 🔍 Enhanced element checking with better error handling
   */
  async waitForElementSafely(
    locator: Locator,
    options: {
      state?: 'attached' | 'detached' | 'visible' | 'hidden';
      timeout?: number;
      throwOnFailure?: boolean;
    } = {}
  ): Promise<boolean> {
    const { state = 'visible', timeout = 10000, throwOnFailure = false } = options;

    try {
      await locator.waitFor({ state, timeout });
      return true;
    } catch (error) {
      if (throwOnFailure) {
        await this.takeDebugScreenshot(`element-wait-failure-${Date.now()}`);
        throw error;
      }
      return false;
    }
  }

  /**
   * 🌐 Smart wait for network with fallback
   */
  async waitForNetworkIdleWithFallback(timeout = 30000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.warn('Network idle timeout, using fallback strategy');
      // Fallback: wait for no network activity for shorter period
      await this.page.waitForTimeout(2000);

      // Check if page is still loading
      const isLoading = await this.page.evaluate(() => {
        return document.readyState === 'loading' ||
               document.querySelector('.loading, [data-loading]') !== null;
      });

      if (isLoading) {
        console.warn('Page still loading after fallback, continuing anyway');
      }
    }
  }

  /**
   * 🧠 Get comprehensive error report
   */
  getErrorReport(): {
    errors: string[];
    performance: any;
    url: string;
    timestamp: string;
  } {
    return {
      errors: [...this.errorLog],
      performance: { ...this.performanceMetrics },
      url: this.page.url(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🔄 Smart retry wrapper for any async operation
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      retries?: number;
      delay?: number;
      exponentialBackoff?: boolean;
      condition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      retries = 3,
      delay = 1000,
      exponentialBackoff = true,
      condition = () => true
    } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`🔄 Operation attempt ${attempt} failed:`, error);

        if (attempt === retries || !condition(error)) {
          throw error;
        }

        const waitTime = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await this.page.waitForTimeout(waitTime);
      }
    }

    throw new Error('Should not reach here');
  }

  /**
   * 🎯 Enhanced element interaction with smart waiting
   */
  async interactWithElement(
    locator: Locator,
    action: 'click' | 'fill' | 'hover' | 'focus',
    value?: string,
    options: { retries?: number; timeout?: number } = {}
  ): Promise<void> {
    const { retries = 3, timeout = 10000 } = options;

    await this.retryOperation(async () => {
      // Ensure element is ready for interaction
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.scrollIntoViewIfNeeded();

      // Perform the action
      switch (action) {
        case 'click':
          await locator.click({ timeout });
          break;
        case 'fill':
          if (!value) throw new Error('Value required for fill action');
          await locator.clear();
          await locator.fill(value);
          break;
        case 'hover':
          await locator.hover({ timeout });
          break;
        case 'focus':
          await locator.focus({ timeout });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }, { retries, delay: 500, exponentialBackoff: true });
  }

  /**
   * 🧹 Cleanup method to call at end of tests
   */
  async cleanup(): Promise<void> {
    // Log any accumulated errors
    if (this.errorLog.length > 0) {
      console.warn(`⚠️  Test completed with ${this.errorLog.length} errors:`, this.errorLog);
    }

    // Log performance metrics
    if (this.performanceMetrics.apiCalls?.length > 0) {
      const avgResponseTime = this.performanceMetrics.apiCalls.length > 0
        ? this.performanceMetrics.apiCalls.reduce((sum: number, call: any) => sum + call.timing, 0) / this.performanceMetrics.apiCalls.length
        : 0;
      console.log(`📊 API Performance: ${this.performanceMetrics.apiCalls.length} calls, avg response: ${avgResponseTime.toFixed(2)}ms`);
    }

    // Clear logs for next test
    this.errorLog = [];
    this.performanceMetrics = {};
  }
}