import { test, expect } from '../fixtures/test-fixtures';
import { PerformanceUtils, testDataManager } from '../utils/test-data-manager';

/**
 * 🚀 Performance Testing Suite
 * Comprehensive performance validation for FPL Ranker application
 */

test.describe('🚀 Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('home page should load within performance thresholds', async ({ page, homePage }) => {
      const startTime = Date.now();

      // Measure navigation performance
      const metrics = await PerformanceUtils.measurePageLoad(page);

      console.log('📊 Performance Metrics:', {
        navigationTime: `${metrics.navigationTime}ms`,
        domContentLoaded: `${metrics.domContentLoaded}ms`,
        firstContentfulPaint: `${metrics.firstContentfulPaint}ms`
      });

      // Performance assertions
      expect(metrics.navigationTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(1500); // 1.5 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(1200); // 1.2 seconds

      // Verify page is functional
      await homePage.verifyHomePageLoaded();
      await expect(homePage.logo).toBeVisible();
    });

    test('team page should load efficiently with data', async ({ page, teamPage }) => {
      // Pre-warm with test data
      const testTeam = await testDataManager.getTestTeam('5100818');

      const startTime = Date.now();
      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyTeamPageLoaded();
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      console.log(`📊 Team page load time: ${loadTime}ms`);

      // Performance thresholds
      expect(loadTime).toBeLessThan(4000); // 4 seconds max

      // Verify all essential elements loaded
      await expect(teamPage.managerCard).toBeVisible();
      await expect(teamPage.overallPointsCard).toBeVisible();
      await expect(teamPage.currentGameweekCard).toBeVisible();
    });

    test('league page should handle large datasets efficiently', async ({ page, leaguePage }) => {
      const startTime = Date.now();

      await leaguePage.navigateToLeague('150789');
      await leaguePage.verifyLeaguePageLoaded();

      // Wait for all tabs to be available
      await leaguePage.waitForAllTabsLoaded();

      const loadTime = Date.now() - startTime;
      console.log(`📊 League page load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(5000); // 5 seconds for complex page

      // Verify interactive elements work
      await leaguePage.clickTab('Rankings');
      await expect(leaguePage.rankingsTab).toBeVisible();
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not exceed memory thresholds during navigation', async ({ page, homePage, teamPage }) => {
      // Monitor memory throughout test
      const initialMemory = await PerformanceUtils.monitorMemory(page);

      // Perform intensive navigation
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      const homeMemory = await PerformanceUtils.monitorMemory(page);

      await teamPage.navigateToTeam('5100818');
      await teamPage.verifyTeamPageLoaded();

      const teamMemory = await PerformanceUtils.monitorMemory(page);

      // Check memory usage (if available)
      if (teamMemory && initialMemory) {
        const memoryIncrease = teamMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        console.log(`🧠 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

        // Should not increase by more than 50MB during normal navigation
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });

    test('should handle rapid navigation without performance degradation', async ({ page, homePage, teamPage, leaguePage }) => {
      const navigationTimes: number[] = [];

      // Perform rapid navigation 5 times
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();

        await homePage.navigateToHome();
        await teamPage.navigateToTeam('5100818');
        await leaguePage.navigateToLeague('150789');

        const endTime = Date.now();
        navigationTimes.push(endTime - startTime);

        console.log(`🔄 Navigation cycle ${i + 1}: ${endTime - startTime}ms`);
      }

      // Check that performance doesn't degrade significantly
      const firstTime = navigationTimes[0];
      const lastTime = navigationTimes[navigationTimes.length - 1];
      const degradation = ((lastTime - firstTime) / firstTime) * 100;

      console.log(`📊 Performance degradation: ${degradation.toFixed(1)}%`);

      // Should not degrade by more than 50%
      expect(degradation).toBeLessThan(50);
    });
  });

  test.describe('Network Performance', () => {
    test('should perform well under slow network conditions', async ({ page, homePage }) => {
      // Simulate slow 3G
      await PerformanceUtils.simulateNetworkConditions(page, 'slow3g');

      const startTime = Date.now();
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();
      const loadTime = Date.now() - startTime;

      console.log(`🐌 Slow 3G load time: ${loadTime}ms`);

      // Should still be usable on slow connections (within 10 seconds)
      expect(loadTime).toBeLessThan(10000);

      // Verify critical elements are visible
      await expect(homePage.logo).toBeVisible();
      await expect(homePage.mainHeading).toBeVisible();
    });

    test('should handle API response delays gracefully', async ({ page, teamPage }) => {
      // Mock slow API responses
      await page.route('**/api/**', async route => {
        // Add 2 second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const testTeam = await testDataManager.getTestTeam();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testTeam)
        });
      });

      const startTime = Date.now();
      await teamPage.navigateToTeam('5100818');

      // Should show loading states appropriately
      // (This depends on your app's loading implementation)

      await teamPage.verifyTeamPageLoaded();
      const loadTime = Date.now() - startTime;

      console.log(`⏰ Slow API load time: ${loadTime}ms`);

      // Should handle slow APIs within reasonable time
      expect(loadTime).toBeLessThan(8000);
    });

    test('should optimize resource loading', async ({ page, homePage }) => {
      // Track network requests
      const requests = new Map<string, number>();
      let totalSize = 0;

      page.on('response', response => {
        const url = response.url();
        const size = parseInt(response.headers()['content-length'] || '0');

        requests.set(url, size);
        totalSize += size;
      });

      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      // Wait for all resources to load
      await page.waitForLoadState('networkidle');

      console.log(`📡 Total requests: ${requests.size}`);
      console.log(`📦 Total transfer size: ${(totalSize / 1024).toFixed(2)}KB`);

      // Performance guidelines
      expect(requests.size).toBeLessThan(50); // Not too many requests
      expect(totalSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB total

      // Check for common performance issues
      const imageRequests = Array.from(requests.keys()).filter(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url));
      const jsRequests = Array.from(requests.keys()).filter(url => /\.js$/i.test(url));

      console.log(`🖼️ Image requests: ${imageRequests.length}`);
      console.log(`📜 JavaScript requests: ${jsRequests.length}`);

      // Reasonable limits
      expect(imageRequests.length).toBeLessThan(20);
      expect(jsRequests.length).toBeLessThan(15);
    });
  });

  test.describe('Interactive Performance', () => {
    test('search functionality should be responsive', async ({ page, homePage }) => {
      await homePage.navigateToHome();
      await homePage.verifyHomePageLoaded();

      const searchInput = homePage.teamSearchInput;

      // Measure input responsiveness
      const inputTimes: number[] = [];
      const testQueries = ['5100818', 'team', 'manager', 'phoenix'];

      for (const query of testQueries) {
        const startTime = Date.now();

        await searchInput.clear();
        await searchInput.fill(query);

        // Wait for any search suggestions or filtering
        await page.waitForTimeout(100);

        const responseTime = Date.now() - startTime;
        inputTimes.push(responseTime);

        console.log(`⌨️ Input response for "${query}": ${responseTime}ms`);
      }

      const avgResponseTime = inputTimes.reduce((sum, time) => sum + time, 0) / inputTimes.length;
      console.log(`📊 Average input response: ${avgResponseTime.toFixed(1)}ms`);

      // Should feel responsive (under 100ms)
      expect(avgResponseTime).toBeLessThan(100);
    });

    test('tab switching should be immediate', async ({ page, leaguePage }) => {
      await leaguePage.navigateToLeague('150789');
      await leaguePage.verifyLeaguePageLoaded();

      const tabs = ['Rankings', 'Progression', 'Analysis'];
      const switchTimes: number[] = [];

      for (const tab of tabs) {
        const startTime = Date.now();

        await leaguePage.clickTab(tab);
        await leaguePage.verifyTabContent(tab);

        const switchTime = Date.now() - startTime;
        switchTimes.push(switchTime);

        console.log(`🔄 Tab switch to ${tab}: ${switchTime}ms`);
      }

      const avgSwitchTime = switchTimes.reduce((sum, time) => sum + time, 0) / switchTimes.length;
      console.log(`📊 Average tab switch: ${avgSwitchTime.toFixed(1)}ms`);

      // Tab switching should be near-instant (under 500ms)
      expect(avgSwitchTime).toBeLessThan(500);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should collect and validate Web Vitals', async ({ page, homePage }) => {
      await homePage.navigateToHome();

      // Collect Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = {};

          // First Contentful Paint
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
            }
          }).observe({ entryTypes: ['paint'] });

          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          new PerformanceObserver((list) => {
            let cls = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
            vitals.cls = cls;
          }).observe({ entryTypes: ['layout-shift'] });

          // Give time to collect metrics
          setTimeout(() => resolve(vitals), 3000);
        });
      });

      console.log('🎯 Web Vitals:', webVitals);

      // Core Web Vitals thresholds
      if (webVitals.fcp) expect(webVitals.fcp).toBeLessThan(1800); // FCP < 1.8s
      if (webVitals.lcp) expect(webVitals.lcp).toBeLessThan(2500); // LCP < 2.5s
      if (webVitals.cls) expect(webVitals.cls).toBeLessThan(0.1);   // CLS < 0.1
    });

    test('should track performance regression over time', async ({ page, homePage }) => {
      // This would integrate with your performance monitoring system
      const performanceData = {
        timestamp: new Date().toISOString(),
        url: page.url(),
        metrics: await PerformanceUtils.measurePageLoad(page),
        userAgent: await page.evaluate(() => navigator.userAgent)
      };

      console.log('📊 Performance tracking data:', performanceData);

      // In a real implementation, you'd store this data for trend analysis
      // expect(performanceData.metrics.navigationTime).toBeLessThan(baseline + tolerance);
    });
  });
});