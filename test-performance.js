#!/usr/bin/env node

/**
 * 🚀 Performance Testing Script
 * Tests the optimized performance improvements against baseline metrics
 */

const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const TEST_RESULTS_FILE = 'performance-test-results.json';

// Test configuration
const TESTS = [
  {
    name: 'Home Page Load',
    url: '/',
    method: 'GET',
    expectedTime: 3000, // 3 seconds
    description: 'Landing page should load quickly'
  },
  {
    name: 'Team Page Load',
    url: '/team/5100818',
    method: 'GET',
    expectedTime: 4000, // 4 seconds
    description: 'Team page with data should load efficiently'
  },
  {
    name: 'League Page Load',
    url: '/league/150789',
    method: 'GET',
    expectedTime: 5000, // 5 seconds
    description: 'League page with complex data should load reasonably'
  },
  {
    name: 'Crest API - Single',
    url: '/api/crests?teamName=TestTeam',
    method: 'GET',
    expectedTime: 1000, // 1 second
    description: 'Single crest generation should be fast'
  },
  {
    name: 'Crest API - Batch',
    url: '/api/crests',
    method: 'POST',
    data: {
      teamNames: ['Team1', 'Team2', 'Team3', 'Team4', 'Team5']
    },
    expectedTime: 2000, // 2 seconds
    description: 'Batch crest generation should be optimized'
  },
  {
    name: 'Performance Status',
    url: '/api/performance?action=status',
    method: 'GET',
    expectedTime: 1000, // 1 second
    description: 'Performance monitoring should be responsive'
  },
  {
    name: 'Health Check',
    url: '/api/performance?action=health',
    method: 'GET',
    expectedTime: 500, // 500ms
    description: 'Health check should be very fast'
  }
];

/**
 * 🏃 Run a single performance test
 */
async function runTest(test, attempt = 1) {
  const startTime = Date.now();
  let success = false;
  let error = null;
  let responseData = null;

  try {
    console.log(`\n🧪 Testing: ${test.name} (attempt ${attempt})...`);

    const config = {
      method: test.method,
      url: `${BASE_URL}${test.url}`,
      timeout: test.expectedTime * 2, // Double the expected time as timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Performance-Test-Script/1.0'
      }
    };

    if (test.data) {
      config.data = test.data;
    }

    const response = await axios(config);
    const duration = Date.now() - startTime;

    success = response.status >= 200 && response.status < 300;
    responseData = {
      status: response.status,
      headers: response.headers,
      dataSize: JSON.stringify(response.data).length
    };

    // Performance evaluation
    const isWithinExpectedTime = duration <= test.expectedTime;
    const performanceGrade = getPerformanceGrade(duration, test.expectedTime);

    console.log(`   ⏱️  Duration: ${duration}ms (expected: <${test.expectedTime}ms)`);
    console.log(`   📊 Grade: ${performanceGrade}`);
    console.log(`   ✅ Status: ${response.status}`);

    if (!isWithinExpectedTime) {
      console.log(`   ⚠️  Performance warning: Exceeded expected time by ${duration - test.expectedTime}ms`);
    }

    return {
      name: test.name,
      success,
      duration,
      expectedTime: test.expectedTime,
      withinExpectedTime: isWithinExpectedTime,
      performanceGrade,
      response: responseData,
      error: null,
      attempt
    };

  } catch (err) {
    const duration = Date.now() - startTime;
    error = err.message;

    console.log(`   ❌ Failed: ${error}`);
    console.log(`   ⏱️  Duration: ${duration}ms (before failure)`);

    return {
      name: test.name,
      success: false,
      duration,
      expectedTime: test.expectedTime,
      withinExpectedTime: false,
      performanceGrade: 'F',
      response: null,
      error,
      attempt
    };
  }
}

/**
 * 📊 Get performance grade based on duration vs expected time
 */
function getPerformanceGrade(duration, expectedTime) {
  const ratio = duration / expectedTime;

  if (ratio <= 0.5) return 'A+'; // Excellent: 50% or less of expected time
  if (ratio <= 0.7) return 'A';  // Very good: 70% or less
  if (ratio <= 1.0) return 'B';  // Good: Within expected time
  if (ratio <= 1.5) return 'C';  // Acceptable: 50% over expected
  if (ratio <= 2.0) return 'D';  // Poor: Double expected time
  return 'F';                    // Fail: More than double expected time
}

/**
 * 🔄 Run all performance tests
 */
async function runAllTests() {
  console.log('🚀 Starting Performance Test Suite...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📊 Total Tests: ${TESTS.length}`);

  const startTime = Date.now();
  const results = [];

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/`, { timeout: 5000 });
    console.log('✅ Server is running and accessible');
  } catch (error) {
    console.error('❌ Server is not accessible. Please ensure the application is running.');
    console.error('   Run: npm run dev');
    process.exit(1);
  }

  // Run each test with retry logic
  for (const test of TESTS) {
    let result = null;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      result = await runTest(test, attempt);

      // If successful or not a network error, break
      if (result.success || !result.error?.includes('timeout')) {
        break;
      }

      if (attempt < maxAttempts) {
        console.log(`   🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const totalDuration = Date.now() - startTime;

  // Generate report
  const report = generateReport(results, totalDuration);

  // Save results
  saveResults(report);

  // Display summary
  displaySummary(report);

  return report;
}

/**
 * 📋 Generate comprehensive report
 */
function generateReport(results, totalDuration) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const withinExpectedTime = results.filter(r => r.withinExpectedTime);

  const averageDuration = results.length > 0
    ? results.reduce((sum, r) => sum + r.duration, 0) / results.length
    : 0;

  const gradeDistribution = results.reduce((dist, result) => {
    dist[result.performanceGrade] = (dist[result.performanceGrade] || 0) + 1;
    return dist;
  }, {});

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      successful: successful.length,
      failed: failed.length,
      withinExpectedTime: withinExpectedTime.length,
      successRate: (successful.length / results.length) * 100,
      performanceRate: (withinExpectedTime.length / results.length) * 100,
      averageDuration: Math.round(averageDuration),
      totalDuration
    },
    gradeDistribution,
    results,
    recommendations: generateRecommendations(results)
  };
}

/**
 * 💡 Generate performance recommendations
 */
function generateRecommendations(results) {
  const recommendations = [];

  const slowTests = results.filter(r => !r.withinExpectedTime);
  const failedTests = results.filter(r => !r.success);

  if (failedTests.length > 0) {
    recommendations.push('🔴 Fix failed tests first - they indicate critical issues');
  }

  if (slowTests.length > results.length * 0.5) {
    recommendations.push('⏱️ Many tests are slower than expected - consider database optimization');
  }

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  if (avgDuration > 3000) {
    recommendations.push('🐌 Overall performance is slow - review caching strategy');
  }

  const crestTests = results.filter(r => r.name.includes('Crest'));
  if (crestTests.some(t => !t.withinExpectedTime)) {
    recommendations.push('🎨 Crest generation is slow - verify optimized service is being used');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Performance looks good! All tests are within acceptable ranges');
  }

  return recommendations;
}

/**
 * 💾 Save results to file
 */
function saveResults(report) {
  try {
    const resultsPath = path.join(__dirname, TEST_RESULTS_FILE);
    fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
  } catch (error) {
    console.error('❌ Failed to save results:', error.message);
  }
}

/**
 * 📊 Display summary
 */
function displaySummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${report.summary.totalTests}`);
  console.log(`   Successful: ${report.summary.successful} (${report.summary.successRate.toFixed(1)}%)`);
  console.log(`   Within Expected Time: ${report.summary.withinExpectedTime} (${report.summary.performanceRate.toFixed(1)}%)`);
  console.log(`   Average Duration: ${report.summary.averageDuration}ms`);
  console.log(`   Total Test Time: ${(report.summary.totalDuration / 1000).toFixed(1)}s`);

  console.log(`\n📈 Performance Grades:`);
  Object.entries(report.gradeDistribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([grade, count]) => {
      console.log(`   ${grade}: ${count} test(s)`);
    });

  if (report.results.some(r => !r.success)) {
    console.log(`\n❌ Failed Tests:`);
    report.results
      .filter(r => !r.success)
      .forEach(result => {
        console.log(`   • ${result.name}: ${result.error}`);
      });
  }

  if (report.results.some(r => !r.withinExpectedTime && r.success)) {
    console.log(`\n⏱️ Slow Tests (but successful):`);
    report.results
      .filter(r => !r.withinExpectedTime && r.success)
      .forEach(result => {
        const overtime = result.duration - result.expectedTime;
        console.log(`   • ${result.name}: ${result.duration}ms (+${overtime}ms over expected)`);
      });
  }

  console.log(`\n💡 Recommendations:`);
  report.recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });

  console.log('\n' + '='.repeat(60));
}

/**
 * 🏁 Main execution
 */
async function main() {
  try {
    const report = await runAllTests();

    // Exit with error code if tests failed
    if (report.summary.successRate < 100) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Performance test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runTest };