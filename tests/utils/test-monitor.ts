import type { TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 📊 Comprehensive Test Monitoring and Analytics System
 * Tracks test execution patterns, performance trends, and reliability metrics
 */

export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  averageDuration: number;
  totalDuration: number;
  slowTests: TestExecutionData[];
  failurePatterns: FailurePattern[];
  browserMetrics: BrowserMetric[];
  environmentInfo: EnvironmentInfo;
  timestamp: string;
}

export interface TestExecutionData {
  testId: string;
  title: string;
  duration: number;
  status: string;
  browser: string;
  retries: number;
  error?: string;
  file: string;
}

export interface FailurePattern {
  pattern: string;
  count: number;
  tests: string[];
  lastSeen: string;
}

export interface BrowserMetric {
  browser: string;
  totalTests: number;
  passRate: number;
  avgDuration: number;
  failureCount: number;
  uniqueFailures: string[];
}

export interface EnvironmentInfo {
  os: string;
  nodeVersion: string;
  playwrightVersion: string;
  isCI: boolean;
  branch?: string;
  commit?: string;
  timestamp: string;
}

export interface PerformanceTrend {
  date: string;
  averageDuration: number;
  totalTests: number;
  passRate: number;
  flakyRate: number;
}

/**
 * 🔍 Test Analytics Engine
 */
export class TestAnalytics {
  private metricsHistory: TestMetrics[] = [];
  private performanceTrends: PerformanceTrend[] = [];
  private alertThresholds = {
    passRate: 95, // Alert if pass rate drops below 95%
    avgDuration: 30000, // Alert if average test time exceeds 30s
    flakyRate: 10, // Alert if flaky rate exceeds 10%
    slowTestThreshold: 45000 // Tests taking longer than 45s
  };

  constructor() {
    this.loadHistoricalData();
  }

  /**
   * 📈 Analyze test results and generate insights
   */
  analyzeTestResults(results: TestExecutionData[]): TestMetrics {
    const totalTests = results.length;
    const passedTests = results.filter(t => t.status === 'passed').length;
    const failedTests = results.filter(t => t.status === 'failed').length;
    const skippedTests = results.filter(t => t.status === 'skipped').length;
    const flakyTests = results.filter(t => t.retries > 0 && t.status === 'passed').length;

    const totalDuration = results.reduce((sum, t) => sum + t.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    const slowTests = results
      .filter(t => t.duration > this.alertThresholds.slowTestThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10); // Top 10 slowest tests

    const failurePatterns = this.analyzeFailurePatterns(results.filter(t => t.status === 'failed'));
    const browserMetrics = this.analyzeBrowserMetrics(results);
    const environmentInfo = this.getEnvironmentInfo();

    const metrics: TestMetrics = {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      flakyTests,
      averageDuration,
      totalDuration,
      slowTests,
      failurePatterns,
      browserMetrics,
      environmentInfo,
      timestamp: new Date().toISOString()
    };

    this.saveMetrics(metrics);
    this.updatePerformanceTrends(metrics);
    this.checkAlerts(metrics);

    return metrics;
  }

  /**
   * 🔍 Analyze failure patterns to identify common issues
   */
  private analyzeFailurePatterns(failedTests: TestExecutionData[]): FailurePattern[] {
    const patterns = new Map<string, { count: number; tests: string[]; lastSeen: string }>();

    failedTests.forEach(test => {
      if (!test.error) return;

      // Extract key error patterns
      const errorPatterns = [
        'TimeoutError',
        'NetworkError',
        'ElementNotFound',
        'AssertionError',
        'Page crashed',
        'Navigation timeout'
      ];

      errorPatterns.forEach(pattern => {
        if (test.error!.includes(pattern)) {
          const existing = patterns.get(pattern) || { count: 0, tests: [], lastSeen: '' };
          existing.count++;
          existing.tests.push(test.title);
          existing.lastSeen = new Date().toISOString();
          patterns.set(pattern, existing);
        }
      });
    });

    return Array.from(patterns.entries()).map(([pattern, data]) => ({
      pattern,
      count: data.count,
      tests: [...new Set(data.tests)], // Remove duplicates
      lastSeen: data.lastSeen
    }));
  }

  /**
   * 🌐 Analyze browser-specific metrics
   */
  private analyzeBrowserMetrics(results: TestExecutionData[]): BrowserMetric[] {
    const browserGroups = results.reduce((acc, test) => {
      if (!acc[test.browser]) {
        acc[test.browser] = [];
      }
      acc[test.browser].push(test);
      return acc;
    }, {} as Record<string, TestExecutionData[]>);

    return Object.entries(browserGroups).map(([browser, tests]) => {
      const passedCount = tests.filter(t => t.status === 'passed').length;
      const failedTests = tests.filter(t => t.status === 'failed');
      const avgDuration = tests.reduce((sum, t) => sum + t.duration, 0) / tests.length;

      return {
        browser,
        totalTests: tests.length,
        passRate: (passedCount / tests.length) * 100,
        avgDuration,
        failureCount: failedTests.length,
        uniqueFailures: [...new Set(failedTests.map(t => t.error || 'Unknown'))]
      };
    });
  }

  /**
   * 🔧 Get environment information
   */
  private getEnvironmentInfo(): EnvironmentInfo {
    return {
      os: process.platform,
      nodeVersion: process.version,
      playwrightVersion: require('@playwright/test/package.json').version,
      isCI: !!process.env.CI,
      branch: process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME,
      commit: process.env.GITHUB_SHA || process.env.COMMIT_SHA,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 📊 Update performance trends
   */
  private updatePerformanceTrends(metrics: TestMetrics): void {
    const today = new Date().toISOString().split('T')[0];
    const passRate = (metrics.passedTests / metrics.totalTests) * 100;
    const flakyRate = (metrics.flakyTests / metrics.totalTests) * 100;

    const trend: PerformanceTrend = {
      date: today,
      averageDuration: metrics.averageDuration,
      totalTests: metrics.totalTests,
      passRate,
      flakyRate
    };

    // Remove existing entry for today and add new one
    this.performanceTrends = this.performanceTrends.filter(t => t.date !== today);
    this.performanceTrends.push(trend);

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.performanceTrends = this.performanceTrends.filter(t => new Date(t.date) >= thirtyDaysAgo);
  }

  /**
   * 🚨 Check for alerts and notifications
   */
  private checkAlerts(metrics: TestMetrics): void {
    const alerts: string[] = [];
    const passRate = (metrics.passedTests / metrics.totalTests) * 100;
    const flakyRate = (metrics.flakyTests / metrics.totalTests) * 100;

    // Pass rate alert
    if (passRate < this.alertThresholds.passRate) {
      alerts.push(`🚨 Pass rate dropped to ${passRate.toFixed(1)}% (threshold: ${this.alertThresholds.passRate}%)`);
    }

    // Average duration alert
    if (metrics.averageDuration > this.alertThresholds.avgDuration) {
      alerts.push(`⏰ Average test duration increased to ${(metrics.averageDuration / 1000).toFixed(1)}s (threshold: ${this.alertThresholds.avgDuration / 1000}s)`);
    }

    // Flaky rate alert
    if (flakyRate > this.alertThresholds.flakyRate) {
      alerts.push(`🔄 Flaky test rate increased to ${flakyRate.toFixed(1)}% (threshold: ${this.alertThresholds.flakyRate}%)`);
    }

    // Slow tests alert
    if (metrics.slowTests.length > 0) {
      alerts.push(`🐌 ${metrics.slowTests.length} slow tests detected (>${this.alertThresholds.slowTestThreshold / 1000}s)`);
    }

    if (alerts.length > 0) {
      console.warn('\n🚨 Test Quality Alerts:');
      alerts.forEach(alert => console.warn(`   ${alert}`));
      console.warn('');

      // Save alerts for reporting
      this.saveAlerts(alerts, metrics.timestamp);
    }
  }

  /**
   * 💾 Save metrics to file
   */
  private saveMetrics(metrics: TestMetrics): void {
    const metricsDir = path.join(process.cwd(), 'tests', 'reports', 'metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    // Save latest metrics
    const latestPath = path.join(metricsDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(metrics, null, 2));

    // Save historical metrics
    const historicalPath = path.join(metricsDir, 'historical.json');
    this.metricsHistory.push(metrics);

    // Keep only last 100 entries
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }

    fs.writeFileSync(historicalPath, JSON.stringify(this.metricsHistory, null, 2));

    // Save performance trends
    const trendsPath = path.join(metricsDir, 'trends.json');
    fs.writeFileSync(trendsPath, JSON.stringify(this.performanceTrends, null, 2));
  }

  /**
   * 🚨 Save alerts for monitoring
   */
  private saveAlerts(alerts: string[], timestamp: string): void {
    const alertsDir = path.join(process.cwd(), 'tests', 'reports', 'alerts');
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true });
    }

    const alertData = {
      timestamp,
      alerts,
      environment: this.getEnvironmentInfo()
    };

    const alertsPath = path.join(alertsDir, `alerts-${timestamp.split('T')[0]}.json`);
    fs.writeFileSync(alertsPath, JSON.stringify(alertData, null, 2));
  }

  /**
   * 📖 Load historical data
   */
  private loadHistoricalData(): void {
    try {
      const historicalPath = path.join(process.cwd(), 'tests', 'reports', 'metrics', 'historical.json');
      if (fs.existsSync(historicalPath)) {
        this.metricsHistory = JSON.parse(fs.readFileSync(historicalPath, 'utf-8'));
      }

      const trendsPath = path.join(process.cwd(), 'tests', 'reports', 'metrics', 'trends.json');
      if (fs.existsSync(trendsPath)) {
        this.performanceTrends = JSON.parse(fs.readFileSync(trendsPath, 'utf-8'));
      }
    } catch (error) {
      console.warn('Could not load historical data:', error);
    }
  }

  /**
   * 📊 Generate comprehensive report
   */
  generateReport(metrics: TestMetrics): string {
    const passRate = (metrics.passedTests / metrics.totalTests) * 100;
    const flakyRate = (metrics.flakyTests / metrics.totalTests) * 100;

    // Get trend comparison if available
    const previousMetrics = this.metricsHistory[this.metricsHistory.length - 2];
    const trendIndicators = previousMetrics ? this.getTrendIndicators(metrics, previousMetrics) : {};

    return `
# 📊 Test Execution Report

## 📈 Summary
- **Total Tests**: ${metrics.totalTests}
- **Pass Rate**: ${passRate.toFixed(1)}% ${trendIndicators.passRate || ''}
- **Failed**: ${metrics.failedTests}
- **Flaky**: ${metrics.flakyTests} (${flakyRate.toFixed(1)}%)
- **Average Duration**: ${(metrics.averageDuration / 1000).toFixed(1)}s ${trendIndicators.duration || ''}
- **Total Runtime**: ${(metrics.totalDuration / 1000 / 60).toFixed(1)} minutes

## 🌐 Browser Performance
${metrics.browserMetrics.map(browser => `
- **${browser.browser}**: ${browser.passRate.toFixed(1)}% pass rate, ${(browser.avgDuration / 1000).toFixed(1)}s avg`).join('')}

## 🐌 Slow Tests (${metrics.slowTests.length})
${metrics.slowTests.slice(0, 5).map(test => `
- ${test.title}: ${(test.duration / 1000).toFixed(1)}s (${test.browser})`).join('')}

## 🚨 Failure Patterns
${metrics.failurePatterns.map(pattern => `
- **${pattern.pattern}**: ${pattern.count} occurrences`).join('')}

## 📊 Historical Trends (Last 7 Days)
${this.generateTrendChart()}

---
Generated: ${new Date(metrics.timestamp).toLocaleString()}
Environment: ${metrics.environmentInfo.isCI ? 'CI' : 'Local'} | ${metrics.environmentInfo.os}
`;
  }

  /**
   * 📈 Get trend indicators
   */
  private getTrendIndicators(current: TestMetrics, previous: TestMetrics): Record<string, string> {
    const currentPassRate = (current.passedTests / current.totalTests) * 100;
    const previousPassRate = (previous.passedTests / previous.totalTests) * 100;
    const passRateDiff = currentPassRate - previousPassRate;

    const durationDiff = current.averageDuration - previous.averageDuration;

    return {
      passRate: passRateDiff > 0 ? '📈' : passRateDiff < 0 ? '📉' : '➡️',
      duration: durationDiff > 1000 ? '📈' : durationDiff < -1000 ? '📉' : '➡️'
    };
  }

  /**
   * 📊 Generate ASCII trend chart
   */
  private generateTrendChart(): string {
    const recent = this.performanceTrends.slice(-7);
    if (recent.length < 2) return 'Insufficient data for trends';

    const maxPassRate = Math.max(...recent.map(t => t.passRate));
    const minPassRate = Math.min(...recent.map(t => t.passRate));

    return recent.map(trend => {
      const normalizedRate = (trend.passRate - minPassRate) / (maxPassRate - minPassRate) || 0;
      const barLength = Math.floor(normalizedRate * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      return `${trend.date}: ${bar} ${trend.passRate.toFixed(1)}%`;
    }).join('\n');
  }
}

/**
 * 📨 Notification System
 */
export class NotificationManager {
  static async sendSlackNotification(webhook: string, metrics: TestMetrics): Promise<void> {
    if (!webhook) return;

    const passRate = (metrics.passedTests / metrics.totalTests) * 100;
    const color = passRate >= 95 ? 'good' : passRate >= 85 ? 'warning' : 'danger';

    const payload = {
      attachments: [{
        color,
        title: '🎭 Playwright Test Results',
        fields: [
          { title: 'Pass Rate', value: `${passRate.toFixed(1)}%`, short: true },
          { title: 'Total Tests', value: metrics.totalTests.toString(), short: true },
          { title: 'Failed', value: metrics.failedTests.toString(), short: true },
          { title: 'Flaky', value: metrics.flakyTests.toString(), short: true },
          { title: 'Duration', value: `${(metrics.totalDuration / 1000 / 60).toFixed(1)}m`, short: true },
          { title: 'Environment', value: metrics.environmentInfo.isCI ? 'CI' : 'Local', short: true }
        ],
        footer: 'Playwright Test Monitor',
        ts: Math.floor(new Date(metrics.timestamp).getTime() / 1000)
      }]
    };

    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  static async sendTeamsNotification(webhook: string, metrics: TestMetrics): Promise<void> {
    if (!webhook) return;

    const passRate = (metrics.passedTests / metrics.totalTests) * 100;
    const themeColor = passRate >= 95 ? '00FF00' : passRate >= 85 ? 'FFA500' : 'FF0000';

    const payload = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: 'Playwright Test Results',
      themeColor,
      sections: [{
        activityTitle: '🎭 Playwright Test Results',
        activitySubtitle: `Pass Rate: ${passRate.toFixed(1)}%`,
        facts: [
          { name: 'Total Tests', value: metrics.totalTests.toString() },
          { name: 'Passed', value: metrics.passedTests.toString() },
          { name: 'Failed', value: metrics.failedTests.toString() },
          { name: 'Flaky', value: metrics.flakyTests.toString() },
          { name: 'Duration', value: `${(metrics.totalDuration / 1000 / 60).toFixed(1)} minutes` },
          { name: 'Environment', value: metrics.environmentInfo.isCI ? 'CI' : 'Local' }
        ]
      }]
    };

    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
    }
  }
}

// Export singleton instance
export const testAnalytics = new TestAnalytics();