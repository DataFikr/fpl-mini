import { defineConfig, devices } from '@playwright/test';

/**
 * Capture config — app B-roll and timing measurements for the fpl-content videos.
 *
 * Deliberately separate from playwright.config.ts: that one runs the e2e suite
 * across seven browser projects with video off, which is the opposite of what a
 * screen recording needs. Run with:
 *
 *   npx playwright test --config=playwright.capture.config.ts
 *
 * Requires FPL_DEMO_SEASON=2025-26 (already in .env.local, which `next dev`
 * loads) so the 2025/26 snapshots back the flow.
 */
export default defineConfig({
  testDir: './tests/capture',
  outputDir: './tests/capture/out',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 120_000,

  use: {
    baseURL: process.env.CAPTURE_BASE_URL || 'http://localhost:3000',
    // A real phone viewport — the footage is destined for a 1080x1920 frame.
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    video: { mode: 'on', size: { width: 1170, height: 2532 } },
    trace: 'off',
    screenshot: 'off',
  },

  projects: [{ name: 'capture', use: { ...devices['iPhone 13 Pro'] } }],

  webServer: {
    command: 'npx next dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
