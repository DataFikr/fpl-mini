import type { Reporter, TestCase, TestResult, TestStep, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 📊 Custom Performance Reporter
 * Tracks test execution times, memory usage, and performance metrics
 */
class PerformanceReporter implements Reporter {
  private testResults: Array<{
    testId: string;
    title: string;
    duration: number;
    status: string;
    retries: number;
    project: string;
    browser: string;
    startTime: number;
    endTime: number;
    memoryUsage?: NodeJS.MemoryUsage;
    steps: Array<{
      title: string;
      duration: number;
      category: string;
    }>;
  }> = [];

  private startTime = Date.now();
  private slowTestThreshold = 30000; // 30 seconds
  private memoryThreshold = 100 * 1024 * 1024; // 100MB

  onTestBegin(test: TestCase): void {
    // Record memory usage at test start
    const memoryUsage = process.memoryUsage();

    // Store initial test data
    this.testResults.push({
      testId: test.id,
      title: test.title,
      duration: 0,
      status: 'running',
      retries: test.results.length,
      project: test.parent.project()?.name || 'unknown',
      browser: this.extractBrowser(test.parent.project()?.name || ''),
      startTime: Date.now(),
      endTime: 0,
      memoryUsage,
      steps: []
    });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testData = this.testResults.find(t => t.testId === test.id);
    if (!testData) return;

    // Update test completion data
    testData.duration = result.duration;
    testData.status = result.status;
    testData.endTime = Date.now();
    testData.retries = test.results.length - 1;

    // Track slow tests
    if (result.duration > this.slowTestThreshold) {
      console.warn(`⚠️  Slow test detected: ${test.title} (${result.duration}ms)`);
    }

    // Track memory usage
    const currentMemory = process.memoryUsage();
    if (currentMemory.heapUsed > this.memoryThreshold) {
      console.warn(`🧠 High memory usage: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB`);
    }
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    const testData = this.testResults.find(t => t.testId === test.id);
    if (!testData) return;

    // Track step performance
    testData.steps.push({
      title: step.title,
      duration: 0,
      category: step.category
    });
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    const testData = this.testResults.find(t => t.testId === test.id);
    if (!testData) return;

    // Update step duration
    const stepData = testData.steps.find(s => s.title === step.title);
    if (stepData) {
      stepData.duration = step.duration;
    }
  }

  onEnd(result: FullResult): void {
    const totalDuration = Date.now() - this.startTime;
    const reportData = this.generatePerformanceReport(totalDuration);

    // Save performance report
    this.saveReport(reportData);

    // Log summary to console
    this.logPerformanceSummary(reportData);
  }

  private extractBrowser(projectName: string): string {
    const browserMap: Record<string, string> = {
      'chromium': 'Chrome',
      'firefox': 'Firefox',
      'webkit': 'Safari',
      'Mobile Chrome': 'Chrome Mobile',
      'Mobile Safari': 'Safari Mobile',
      'Microsoft Edge': 'Edge'
    };

    return browserMap[projectName] || projectName;
  }

  private generatePerformanceReport(totalDuration: number) {
    const passedTests = this.testResults.filter(t => t.status === 'passed');
    const failedTests = this.testResults.filter(t => t.status === 'failed');
    const slowTests = this.testResults.filter(t => t.duration > this.slowTestThreshold);

    const averageDuration = this.testResults.length > 0
      ? this.testResults.reduce((sum, t) => sum + t.duration, 0) / this.testResults.length
      : 0;

    const browserStats = this.calculateBrowserStats();
    const retryStats = this.calculateRetryStats();

    return {
      summary: {
        totalTests: this.testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        skipped: this.testResults.filter(t => t.status === 'skipped').length,
        flaky: this.testResults.filter(t => t.retries > 0 && t.status === 'passed').length,
        totalDuration,
        averageDuration: Math.round(averageDuration),
        slowTests: slowTests.length
      },
      performance: {
        slowTests: slowTests.map(t => ({
          title: t.title,
          duration: t.duration,
          browser: t.browser,
          project: t.project
        })),
        averageDurationByBrowser: browserStats,
        retryAnalysis: retryStats
      },
      testDetails: this.testResults.map(t => ({
        title: t.title,
        duration: t.duration,
        status: t.status,
        browser: t.browser,
        retries: t.retries,
        steps: t.steps.filter(s => s.duration > 1000) // Only show slow steps
      })),
      timestamp: new Date().toISOString()
    };
  }

  private calculateBrowserStats() {
    const browserGroups = this.testResults.reduce((acc, test) => {
      if (!acc[test.browser]) {
        acc[test.browser] = [];
      }
      acc[test.browser].push(test.duration);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(browserGroups).map(([browser, durations]) => ({
      browser,
      averageDuration: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      testCount: durations.length,
      slowestTest: Math.max(...durations),
      fastestTest: Math.min(...durations)
    }));
  }

  private calculateRetryStats() {
    const totalRetries = this.testResults.reduce((sum, t) => sum + t.retries, 0);
    const testsWithRetries = this.testResults.filter(t => t.retries > 0);

    return {
      totalRetries,
      testsWithRetries: testsWithRetries.length,
      retryRate: this.testResults.length > 0 ? (testsWithRetries.length / this.testResults.length) * 100 : 0,
      flakyTests: testsWithRetries.filter(t => t.status === 'passed').map(t => ({
        title: t.title,
        retries: t.retries,
        browser: t.browser
      }))
    };
  }

  private saveReport(reportData: any): void {
    const reportsDir = path.join(process.cwd(), 'tests', 'reports', 'performance');

    // Ensure directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save JSON report
    const jsonPath = path.join(reportsDir, 'performance-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(reportData);
    const htmlPath = path.join(reportsDir, 'performance-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
  }

  private generateHtmlReport(data: any): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .slow-test { color: #d32f2f; }
        .fast-test { color: #388e3c; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .chart { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🎭 Playwright Performance Report</h1>

    <div class="summary">
        <h2>📊 Test Summary</h2>
        <div class="metric"><strong>Total Tests:</strong> ${data.summary.totalTests}</div>
        <div class="metric"><strong>Passed:</strong> ${data.summary.passed}</div>
        <div class="metric"><strong>Failed:</strong> ${data.summary.failed}</div>
        <div class="metric"><strong>Flaky:</strong> ${data.summary.flaky}</div>
        <div class="metric"><strong>Total Duration:</strong> ${Math.round(data.summary.totalDuration / 1000)}s</div>
        <div class="metric"><strong>Average Test:</strong> ${data.summary.averageDuration}ms</div>
    </div>

    <h2>🐌 Slow Tests (>${this.slowTestThreshold / 1000}s)</h2>
    <table>
        <tr><th>Test</th><th>Duration</th><th>Browser</th></tr>
        ${data.performance.slowTests.map((test: any) => `
            <tr class="slow-test">
                <td>${test.title}</td>
                <td>${test.duration}ms</td>
                <td>${test.browser}</td>
            </tr>
        `).join('')}
    </table>

    <h2>🌐 Browser Performance</h2>
    <table>
        <tr><th>Browser</th><th>Avg Duration</th><th>Test Count</th><th>Slowest</th><th>Fastest</th></tr>
        ${data.performance.averageDurationByBrowser.map((browser: any) => `
            <tr>
                <td>${browser.browser}</td>
                <td>${browser.averageDuration}ms</td>
                <td>${browser.testCount}</td>
                <td>${browser.slowestTest}ms</td>
                <td>${browser.fastestTest}ms</td>
            </tr>
        `).join('')}
    </table>

    <h2>🔄 Retry Analysis</h2>
    <div class="summary">
        <div class="metric"><strong>Total Retries:</strong> ${data.performance.retryAnalysis.totalRetries}</div>
        <div class="metric"><strong>Tests with Retries:</strong> ${data.performance.retryAnalysis.testsWithRetries}</div>
        <div class="metric"><strong>Retry Rate:</strong> ${data.performance.retryAnalysis.retryRate.toFixed(1)}%</div>
    </div>

    <p><small>Generated: ${data.timestamp}</small></p>
</body>
</html>`;
  }

  private logPerformanceSummary(data: any): void {
    console.log('\n📊 Performance Summary:');
    console.log(`   Total Tests: ${data.summary.totalTests}`);
    console.log(`   Average Duration: ${data.summary.averageDuration}ms`);
    console.log(`   Slow Tests: ${data.summary.slowTests}`);
    console.log(`   Flaky Tests: ${data.summary.flaky}`);
    console.log(`   Retry Rate: ${data.performance.retryAnalysis.retryRate.toFixed(1)}%`);
    console.log(`   Total Runtime: ${Math.round(data.summary.totalDuration / 1000)}s\n`);
  }
}

export default PerformanceReporter;