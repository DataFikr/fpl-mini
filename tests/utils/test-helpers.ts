import { Page, expect } from '@playwright/test';

/**
 * Common test utilities and helper functions
 */

/**
 * Wait for a specific condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout = 10000,
  interval = 500
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Generate test data for FPL teams
 */
export function generateTestTeamData() {
  return {
    teamId: Math.floor(Math.random() * 9000000) + 1000000,
    teamName: `Test Team ${Math.floor(Math.random() * 1000)}`,
    managerName: `Test Manager ${Math.floor(Math.random() * 1000)}`,
    points: Math.floor(Math.random() * 200) + 200, // GW6 realistic points
    gameweekPoints: Math.floor(Math.random() * 40) + 40,
    rank: Math.floor(Math.random() * 20) + 1
  };
}

/**
 * Generate test league data
 */
export function generateTestLeagueData() {
  return {
    id: Math.floor(Math.random() * 900000) + 100000,
    name: `Test League ${Math.floor(Math.random() * 1000)}`,
    currentGameweek: 6,
    teams: Array.from({ length: 12 }, () => generateTestTeamData())
  };
}

/**
 * Mock FPL API responses
 */
export async function mockFPLApiResponses(page: Page) {
  // Mock manager entry API
  await page.route('**/api/managers/*', route => {
    const url = route.request().url();
    const managerId = url.split('/').pop();

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: managerId,
        name: `Test Team ${managerId}`,
        player_first_name: 'Test',
        player_last_name: 'Manager',
        summary_overall_points: 325,
        summary_overall_rank: 50000,
        favourite_team: 'Liverpool',
        player_region_name: 'Malaysia'
      })
    });
  });

  // Mock league standings API
  await page.route('**/api/leagues/*/standings', route => {
    const leagueData = generateTestLeagueData();

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        league: {
          id: leagueData.id,
          name: leagueData.name
        },
        standings: {
          results: leagueData.teams.map((team, index) => ({
            entry: team.teamId,
            entry_name: team.teamName,
            player_name: team.managerName,
            rank: index + 1,
            total: team.points,
            event_total: team.gameweekPoints
          }))
        }
      })
    });
  });

  // Mock crest generation API
  await page.route('**/api/crests**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        crestUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Yjc0ZjQiLz4KPHN2Zz4='
      })
    });
  });
}

/**
 * Check for JavaScript errors on the page
 */
export async function checkPageForErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Verify page accessibility basics
 */
export async function checkBasicAccessibility(page: Page): Promise<void> {
  // Check for alt text on images
  const images = page.locator('img');
  const imageCount = await images.count();

  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    const src = await img.getAttribute('src');

    if (src && !src.includes('data:image') && (!alt || alt.trim() === '')) {
      throw new Error(`Image missing alt text: ${src}`);
    }
  }

  // Check for proper heading structure
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThanOrEqual(1);
  expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1 per page
}

/**
 * Verify responsive design
 */
export async function checkResponsiveDesign(page: Page): Promise<void> {
  const viewports = [
    { width: 320, height: 568 }, // iPhone SE
    { width: 375, height: 667 }, // iPhone 8
    { width: 768, height: 1024 }, // iPad
    { width: 1024, height: 768 }, // iPad Landscape
    { width: 1920, height: 1080 } // Desktop
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForLoadState('networkidle');

    // Check for horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20); // Allow small tolerance
  }
}

/**
 * Test form validation
 */
export async function testFormValidation(
  page: Page,
  formSelector: string,
  requiredFields: string[]
): Promise<void> {
  const form = page.locator(formSelector);
  await expect(form).toBeVisible();

  // Try submitting empty form
  const submitButton = form.locator('button[type="submit"], input[type="submit"]');
  await submitButton.click();

  // Check that required fields show validation messages
  for (const fieldSelector of requiredFields) {
    const field = form.locator(fieldSelector);
    const isInvalid = await field.evaluate(el => !(el as HTMLInputElement).validity.valid);
    expect(isInvalid).toBeTruthy();
  }
}

/**
 * Simulate network conditions
 */
export async function simulateSlowNetwork(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024, // 50kb/s
    uploadThroughput: 50 * 1024,
    latency: 2000 // 2 second latency
  });
}

/**
 * Performance testing helper
 */
export async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const endTime = Date.now();

  return endTime - startTime;
}

/**
 * Take full page screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true
  });
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(page: Page, urlPattern: string): Promise<void> {
  await page.waitForResponse(response =>
    response.url().includes(urlPattern) && response.status() === 200
  );
}

/**
 * Verify URL structure
 */
export function verifyUrlStructure(url: string, expectedPattern: RegExp): void {
  expect(url).toMatch(expectedPattern);
}

/**
 * Get random team ID from test data
 */
export function getRandomTeamId(): string {
  const testTeamIds = ['5100818', '5093819', '6463870', '6454003', '6356669'];
  return testTeamIds[Math.floor(Math.random() * testTeamIds.length)];
}

/**
 * Get random league ID from test data
 */
export function getRandomLeagueId(): string {
  const testLeagueIds = ['150789', '150788', '523651', '611676', '617491'];
  return testLeagueIds[Math.floor(Math.random() * testLeagueIds.length)];
}