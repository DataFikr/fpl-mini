#!/usr/bin/env node

/**
 * 🎯 Test Orchestrator - Smart Test Execution Manager
 * Optimizes test execution based on changes, performance, and reliability metrics
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { testAnalytics, TestMetrics } from './test-monitor';

interface TestSuite {
  name: string;
  command: string;
  priority: number;
  dependencies: string[];
  estimatedDuration: number;
  browsers?: string[];
  tags?: string[];
}

interface ChangeAnalysis {
  hasCodeChanges: boolean;
  hasTestChanges: boolean;
  hasConfigChanges: boolean;
  changedFiles: string[];
  affectedAreas: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class TestOrchestrator {
  private testSuites: TestSuite[] = [
    {
      name: 'smoke',
      command: 'npm run test:smoke',
      priority: 1,
      dependencies: [],
      estimatedDuration: 30000, // 30 seconds
      browsers: ['chromium'],
      tags: ['fast', 'critical']
    },
    {
      name: 'unit',
      command: 'npm run test:unit', // When you add unit tests
      priority: 2,
      dependencies: [],
      estimatedDuration: 15000,
      tags: ['fast', 'unit']
    },
    {
      name: 'integration',
      command: 'npm run test',
      priority: 3,
      dependencies: ['smoke'],
      estimatedDuration: 180000, // 3 minutes
      browsers: ['chromium', 'firefox', 'webkit'],
      tags: ['integration']
    },
    {
      name: 'mobile',
      command: 'npm run test:mobile',
      priority: 4,
      dependencies: ['integration'],
      estimatedDuration: 120000, // 2 minutes
      browsers: ['Mobile Chrome', 'Mobile Safari'],
      tags: ['mobile']
    },
    {
      name: 'accessibility',
      command: 'npm run test:accessibility',
      priority: 5,
      dependencies: ['integration'],
      estimatedDuration: 60000, // 1 minute
      browsers: ['chromium'],
      tags: ['accessibility', 'compliance']
    },
    {
      name: 'visual',
      command: 'npm run test:visual',
      priority: 6,
      dependencies: ['integration'],
      estimatedDuration: 90000, // 1.5 minutes
      browsers: ['chromium'],
      tags: ['visual', 'regression']
    },
    {
      name: 'performance',
      command: 'npm run test:performance',
      priority: 7,
      dependencies: ['integration'],
      estimatedDuration: 240000, // 4 minutes
      browsers: ['chromium'],
      tags: ['performance']
    }
  ];

  private executionHistory: Array<{
    suite: string;
    duration: number;
    success: boolean;
    timestamp: string;
  }> = [];

  /**
   * 🎯 Main orchestration method
   */
  async orchestrate(options: {
    mode?: 'full' | 'smart' | 'fast' | 'affected';
    branch?: string;
    files?: string[];
    maxDuration?: number;
    skipSlow?: boolean;
    parallel?: boolean;
  } = {}): Promise<void> {
    const {
      mode = 'smart',
      maxDuration = 600000, // 10 minutes default
      skipSlow = false,
      parallel = true
    } = options;

    console.log(`🎯 Starting test orchestration in ${mode} mode`);
    console.log(`⏱️  Maximum duration: ${maxDuration / 1000}s`);

    // Analyze changes to determine test strategy
    const changeAnalysis = await this.analyzeChanges();
    console.log(`📊 Change analysis:`, changeAnalysis);

    // Determine which tests to run
    const testPlan = this.createTestPlan(mode, changeAnalysis, maxDuration, skipSlow);
    console.log(`📋 Test plan: ${testPlan.map(t => t.name).join(', ')}`);

    // Execute tests
    const results = await this.executeTests(testPlan, parallel);

    // Analyze and report results
    await this.analyzeResults(results);

    // Update learning for future runs
    this.updateExecutionHistory(results);

    console.log(`✅ Test orchestration completed`);
  }

  /**
   * 🔍 Analyze code changes to determine test strategy
   */
  private async analyzeChanges(): Promise<ChangeAnalysis> {
    try {
      // Get changed files from git
      const changedFiles = execSync('git diff --name-only HEAD~1 HEAD || echo ""', { encoding: 'utf-8' })
        .split('\n')
        .filter(file => file.trim())
        .filter(file => !file.startsWith('.github/') && !file.endsWith('.md'));

      console.log(`📁 Changed files: ${changedFiles.length}`);

      const hasCodeChanges = changedFiles.some(file =>
        file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')
      );

      const hasTestChanges = changedFiles.some(file =>
        file.includes('test') || file.includes('spec') || file.includes('playwright')
      );

      const hasConfigChanges = changedFiles.some(file =>
        file.includes('package.json') || file.includes('playwright.config') || file.includes('next.config')
      );

      // Determine affected areas
      const affectedAreas = this.determineAffectedAreas(changedFiles);

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(changedFiles, hasCodeChanges, hasConfigChanges);

      return {
        hasCodeChanges,
        hasTestChanges,
        hasConfigChanges,
        changedFiles,
        affectedAreas,
        riskLevel
      };
    } catch (error) {
      console.warn('Could not analyze changes, assuming medium risk:', error);
      return {
        hasCodeChanges: true,
        hasTestChanges: false,
        hasConfigChanges: false,
        changedFiles: [],
        affectedAreas: ['unknown'],
        riskLevel: 'medium'
      };
    }
  }

  /**
   * 🎯 Determine which areas of the app are affected by changes
   */
  private determineAffectedAreas(changedFiles: string[]): string[] {
    const areas: string[] = [];

    if (changedFiles.some(f => f.includes('home') || f.includes('landing'))) {
      areas.push('home');
    }
    if (changedFiles.some(f => f.includes('team'))) {
      areas.push('team');
    }
    if (changedFiles.some(f => f.includes('league'))) {
      areas.push('league');
    }
    if (changedFiles.some(f => f.includes('api') || f.includes('server'))) {
      areas.push('api');
    }
    if (changedFiles.some(f => f.includes('component') || f.includes('ui'))) {
      areas.push('ui');
    }
    if (changedFiles.some(f => f.includes('style') || f.includes('css') || f.includes('tailwind'))) {
      areas.push('visual');
    }

    return areas.length > 0 ? areas : ['general'];
  }

  /**
   * ⚠️ Calculate risk level based on changes
   */
  private calculateRiskLevel(changedFiles: string[], hasCodeChanges: boolean, hasConfigChanges: boolean): 'low' | 'medium' | 'high' {
    if (hasConfigChanges) return 'high';
    if (changedFiles.length > 10) return 'high';
    if (changedFiles.some(f => f.includes('api') || f.includes('database'))) return 'high';
    if (hasCodeChanges && changedFiles.length > 5) return 'medium';
    if (hasCodeChanges) return 'medium';
    return 'low';
  }

  /**
   * 📋 Create optimized test execution plan
   */
  private createTestPlan(
    mode: string,
    changeAnalysis: ChangeAnalysis,
    maxDuration: number,
    skipSlow: boolean
  ): TestSuite[] {
    let plan: TestSuite[] = [];

    switch (mode) {
      case 'fast':
        plan = this.testSuites.filter(suite => suite.tags?.includes('fast'));
        break;

      case 'affected':
        plan = this.getAffectedTests(changeAnalysis);
        break;

      case 'full':
        plan = [...this.testSuites];
        break;

      case 'smart':
      default:
        plan = this.createSmartPlan(changeAnalysis);
        break;
    }

    // Apply time constraints
    if (maxDuration > 0) {
      plan = this.optimizeForTime(plan, maxDuration);
    }

    // Skip slow tests if requested
    if (skipSlow) {
      plan = plan.filter(suite => suite.estimatedDuration < 120000); // Under 2 minutes
    }

    // Sort by priority and dependencies
    return this.resolveDependencies(plan);
  }

  /**
   * 🎯 Get tests affected by specific changes
   */
  private getAffectedTests(changeAnalysis: ChangeAnalysis): TestSuite[] {
    const affectedTests: TestSuite[] = [];

    // Always run smoke tests
    affectedTests.push(...this.testSuites.filter(s => s.name === 'smoke'));

    // Add tests based on affected areas
    if (changeAnalysis.affectedAreas.includes('visual') || changeAnalysis.hasConfigChanges) {
      affectedTests.push(...this.testSuites.filter(s => s.tags?.includes('visual')));
    }

    if (changeAnalysis.affectedAreas.includes('api')) {
      affectedTests.push(...this.testSuites.filter(s => s.tags?.includes('integration')));
    }

    if (changeAnalysis.affectedAreas.includes('ui')) {
      affectedTests.push(...this.testSuites.filter(s => s.tags?.includes('accessibility')));
    }

    // Always include integration tests for code changes
    if (changeAnalysis.hasCodeChanges) {
      affectedTests.push(...this.testSuites.filter(s => s.name === 'integration'));
    }

    return [...new Set(affectedTests)]; // Remove duplicates
  }

  /**
   * 🧠 Create smart test plan based on historical data and risk
   */
  private createSmartPlan(changeAnalysis: ChangeAnalysis): TestSuite[] {
    const plan: TestSuite[] = [];

    // Always start with smoke tests
    plan.push(...this.testSuites.filter(s => s.name === 'smoke'));

    switch (changeAnalysis.riskLevel) {
      case 'high':
        // Run comprehensive tests for high-risk changes
        plan.push(...this.testSuites.filter(s => s.priority <= 6));
        break;

      case 'medium':
        // Run core tests for medium-risk changes
        plan.push(...this.testSuites.filter(s => s.priority <= 4));
        break;

      case 'low':
        // Run minimal tests for low-risk changes
        plan.push(...this.testSuites.filter(s => s.priority <= 3));
        break;
    }

    return [...new Set(plan)];
  }

  /**
   * ⏱️ Optimize test plan for time constraints
   */
  private optimizeForTime(plan: TestSuite[], maxDuration: number): TestSuite[] {
    let totalEstimatedTime = 0;
    const optimizedPlan: TestSuite[] = [];

    // Sort by priority (most important first)
    const sortedPlan = plan.sort((a, b) => a.priority - b.priority);

    for (const suite of sortedPlan) {
      if (totalEstimatedTime + suite.estimatedDuration <= maxDuration) {
        optimizedPlan.push(suite);
        totalEstimatedTime += suite.estimatedDuration;
      } else {
        console.log(`⏰ Skipping ${suite.name} due to time constraints (${suite.estimatedDuration / 1000}s)`);
      }
    }

    console.log(`📊 Estimated execution time: ${totalEstimatedTime / 1000}s`);
    return optimizedPlan;
  }

  /**
   * 🔗 Resolve test dependencies and order execution
   */
  private resolveDependencies(plan: TestSuite[]): TestSuite[] {
    const resolved: TestSuite[] = [];
    const resolving = new Set<string>();

    function resolve(suite: TestSuite): void {
      if (resolved.includes(suite)) return;
      if (resolving.has(suite.name)) {
        throw new Error(`Circular dependency detected: ${suite.name}`);
      }

      resolving.add(suite.name);

      for (const depName of suite.dependencies) {
        const dependency = plan.find(s => s.name === depName);
        if (dependency) {
          resolve(dependency);
        }
      }

      resolving.delete(suite.name);
      resolved.push(suite);
    }

    for (const suite of plan) {
      resolve(suite);
    }

    return resolved;
  }

  /**
   * 🏃 Execute test plan
   */
  private async executeTests(plan: TestSuite[], parallel: boolean): Promise<Array<{
    suite: TestSuite;
    success: boolean;
    duration: number;
    output: string;
  }>> {
    const results: Array<{
      suite: TestSuite;
      success: boolean;
      duration: number;
      output: string;
    }> = [];

    if (parallel) {
      // Execute independent tests in parallel
      const parallelGroups = this.groupForParallelExecution(plan);

      for (const group of parallelGroups) {
        console.log(`🚀 Executing parallel group: ${group.map(s => s.name).join(', ')}`);

        const groupPromises = group.map(suite => this.executeSuite(suite));
        const groupResults = await Promise.all(groupPromises);
        results.push(...groupResults);

        // Stop if any critical test fails
        if (groupResults.some(r => !r.success && r.suite.tags?.includes('critical'))) {
          console.error('❌ Critical test failed, stopping execution');
          break;
        }
      }
    } else {
      // Execute tests sequentially
      for (const suite of plan) {
        console.log(`🏃 Executing: ${suite.name}`);
        const result = await this.executeSuite(suite);
        results.push(result);

        // Stop on failure if critical
        if (!result.success && suite.tags?.includes('critical')) {
          console.error('❌ Critical test failed, stopping execution');
          break;
        }
      }
    }

    return results;
  }

  /**
   * 📊 Group tests for parallel execution based on dependencies
   */
  private groupForParallelExecution(plan: TestSuite[]): TestSuite[][] {
    const groups: TestSuite[][] = [];
    const processed = new Set<string>();

    // Group tests by dependency level
    let currentLevel = plan.filter(s => s.dependencies.length === 0);

    while (currentLevel.length > 0) {
      groups.push(currentLevel);
      currentLevel.forEach(s => processed.add(s.name));

      // Find next level
      currentLevel = plan.filter(s =>
        !processed.has(s.name) &&
        s.dependencies.every(dep => processed.has(dep))
      );
    }

    return groups;
  }

  /**
   * 🎯 Execute individual test suite
   */
  private async executeSuite(suite: TestSuite): Promise<{
    suite: TestSuite;
    success: boolean;
    duration: number;
    output: string;
  }> {
    const startTime = Date.now();

    try {
      console.log(`▶️  Starting ${suite.name} (estimated: ${suite.estimatedDuration / 1000}s)`);

      const output = execSync(suite.command, {
        encoding: 'utf-8',
        timeout: suite.estimatedDuration * 2, // 2x estimated time as timeout
        env: { ...process.env, CI: 'true' }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ ${suite.name} completed in ${duration / 1000}s`);

      return {
        suite,
        success: true,
        duration,
        output
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${suite.name} failed after ${duration / 1000}s`);

      return {
        suite,
        success: false,
        duration,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 📊 Analyze test results and generate insights
   */
  private async analyzeResults(results: Array<{
    suite: TestSuite;
    success: boolean;
    duration: number;
    output: string;
  }>): Promise<void> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 Execution Summary:');
    console.log(`   Total Suites: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Total Time: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`   Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Performance analysis
    const slowSuites = results.filter(r => r.duration > r.suite.estimatedDuration * 1.5);
    if (slowSuites.length > 0) {
      console.log('\n⏰ Slow Test Suites:');
      slowSuites.forEach(r => {
        const slowness = ((r.duration / r.suite.estimatedDuration) * 100).toFixed(0);
        console.log(`   ${r.suite.name}: ${slowness}% of estimated time`);
      });
    }

    // Failure analysis
    const failedSuites = results.filter(r => !r.success);
    if (failedSuites.length > 0) {
      console.log('\n❌ Failed Test Suites:');
      failedSuites.forEach(r => {
        console.log(`   ${r.suite.name}: ${r.output.split('\n')[0]}`);
      });
    }
  }

  /**
   * 📈 Update execution history for learning
   */
  private updateExecutionHistory(results: Array<{
    suite: TestSuite;
    success: boolean;
    duration: number;
    output: string;
  }>): void {
    const timestamp = new Date().toISOString();

    results.forEach(result => {
      this.executionHistory.push({
        suite: result.suite.name,
        duration: result.duration,
        success: result.success,
        timestamp
      });
    });

    // Keep only last 100 executions per suite
    this.executionHistory = this.executionHistory.slice(-1000);

    // Update estimated durations based on actual performance
    this.updateEstimatedDurations();

    // Save history
    this.saveExecutionHistory();
  }

  /**
   * 📊 Update estimated durations based on historical data
   */
  private updateEstimatedDurations(): void {
    this.testSuites.forEach(suite => {
      const recentRuns = this.executionHistory
        .filter(h => h.suite === suite.name && h.success)
        .slice(-10); // Last 10 successful runs

      if (recentRuns.length >= 3) {
        const avgDuration = recentRuns.reduce((sum, run) => sum + run.duration, 0) / recentRuns.length;
        suite.estimatedDuration = Math.round(avgDuration * 1.2); // Add 20% buffer
      }
    });
  }

  /**
   * 💾 Save execution history
   */
  private saveExecutionHistory(): void {
    const historyDir = path.join(process.cwd(), 'tests', 'reports', 'orchestration');
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const historyPath = path.join(historyDir, 'execution-history.json');
    fs.writeFileSync(historyPath, JSON.stringify(this.executionHistory, null, 2));
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const orchestrator = new TestOrchestrator();

  const options: any = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
        options.mode = args[++i];
        break;
      case '--max-duration':
        options.maxDuration = parseInt(args[++i]) * 1000;
        break;
      case '--skip-slow':
        options.skipSlow = true;
        break;
      case '--no-parallel':
        options.parallel = false;
        break;
    }
  }

  orchestrator.orchestrate(options).catch(error => {
    console.error('❌ Test orchestration failed:', error);
    process.exit(1);
  });
}

export { TestOrchestrator };