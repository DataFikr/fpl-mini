import { defineConfig, devices } from '@playwright/test';

/**
 * Performance-Optimized Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where tests are located
  testDir: './tests/e2e',

  // Directory for test output files (screenshots, traces, etc.)
  outputDir: './tests/test-results',

  // 🚀 PERFORMANCE OPTIMIZATION: Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // 🔄 RELIABILITY: Enhanced retry configuration
  retries: process.env.CI ? 3 : 1, // More retries on CI, 1 locally for faster feedback

  // 🏃 PERFORMANCE: Optimized worker configuration - reduce to prevent conflicts
  workers: process.env.CI ? 2 : 1, // Reduced workers to prevent Jest worker conflicts

  // 📊 TEST SHARDING: Support for test sharding in CI
  shard: process.env.CI && process.env.SHARD
    ? { current: parseInt(process.env.SHARD_INDEX || '1'), total: parseInt(process.env.SHARD_TOTAL || '1') }
    : undefined,

  // 📊 ENHANCED REPORTING: Multiple output formats with performance monitoring
  reporter: [
    ['html', {
      outputFolder: './tests/reports/html',
      open: 'never',
      attachmentsBaseURL: process.env.CI ? process.env.ARTIFACTS_URL : undefined
    }],
    ['json', { outputFile: './tests/reports/json/results.json' }],
    ['junit', { outputFile: './tests/reports/junit/results.xml' }],
    ['blob', { outputDir: './tests/reports/blob' }], // For trace merging
    process.env.CI ? ['github'] : ['list'], // GitHub Actions integration
    ['./tests/utils/performance-reporter.ts'], // Custom performance reporter
  ],

  // 🔧 OPTIMIZED SHARED SETTINGS: Enhanced performance and reliability
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3002',

    // 🎯 PERFORMANCE: Optimized trace collection
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

    // 📸 RELIABILITY: Smart screenshot strategy
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },

    // 🎥 VIDEO: Conditional video recording
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // ⏱️ PERFORMANCE: Increased timeouts to handle slow server responses
    actionTimeout: 30000, // Increased to handle slow API responses
    navigationTimeout: 60000, // Increased for slow initial loads

    // 🌐 NETWORK: Performance optimizations
    ignoreHTTPSErrors: true,
    bypassCSP: true, // Bypass Content Security Policy for testing

    // 🎭 BROWSER: Performance settings
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    }
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable trace for debugging
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },

    // Tablet devices
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },

    // Edge browser (if needed)
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    port: 3002,
    reuseExistingServer: true, // Always reuse existing server to prevent conflicts
    timeout: 180 * 1000, // 3 minutes for slow initial startup
    stdout: 'ignore', // Reduce noise in test output
    stderr: 'pipe',
  },

  // ⏱️ PERFORMANCE: Increased test timeouts to handle slow API responses
  timeout: process.env.CI ? 120 * 1000 : 90 * 1000, // Increased for slow FPL API calls

  // 🔍 RELIABILITY: Smart expect timeout
  expect: {
    timeout: 8 * 1000, // Reduced from 10s for faster feedback
    toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 100 },
    toMatchSnapshot: { threshold: 0.2 }
  },

  // 🔄 PERFORMANCE: Test metadata and tags
  metadata: {
    testType: 'e2e',
    environment: process.env.NODE_ENV || 'development',
    browser: 'multi',
    platform: process.platform
  }
});