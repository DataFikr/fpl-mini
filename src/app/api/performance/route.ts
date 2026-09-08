import { NextRequest, NextResponse } from 'next/server';
import { enhancedCache } from '@/lib/cache-enhanced';
import { optimizedCrestService } from '@/services/crest-service-optimized';
import { optimizedFPLApi } from '@/services/fpl-api-optimized';
import { checkDatabaseHealth, DatabaseMonitor } from '@/lib/database';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * 📊 Performance Monitoring API
 * Provides real-time performance metrics and health checks
 *
 * Admin-only, all verbs. Until the 2026-09-07 security review this route was
 * fully public, which meant two distinct problems:
 *
 *  1. `?action=clear-cache` let anyone flush the Redis, crest and FPL caches
 *     with a plain GET. Repeated, that is a cache-stampede amplifier: every
 *     subsequent request falls through to the FPL API and Postgres. Because it
 *     was a GET it did not even need an attacker — a link prefetcher or
 *     security scanner following URLs would trip it.
 *  2. `?action=database` / `?action=cache` handed out DB health and cache
 *     internals to anonymous callers.
 *
 * `clear-cache` has also moved to POST, alongside the other state-changing
 * actions. Destructive operations behind GET are reachable by anything that
 * follows a URL, which is what made (1) exploitable by accident.
 */

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  try {
    switch (action) {
      case 'status':
        return await getPerformanceStatus();
      case 'cache':
        return await getCacheMetrics();
      case 'database':
        return await getDatabaseMetrics();
      case 'health':
        return await getHealthCheck();
      case 'clear-cache':
        return NextResponse.json(
          { error: 'clear-cache has moved to POST /api/performance with body {"action":"clear-cache"}.' },
          { status: 405, headers: { Allow: 'POST' } }
        );
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, cache, database, health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}

/**
 * 📊 Get comprehensive performance status
 */
async function getPerformanceStatus(): Promise<NextResponse> {
  const startTime = Date.now();

  // Gather metrics from all services
  const [
    cacheStats,
    databaseHealth,
    crestMetrics,
    fplMetrics
  ] = await Promise.all([
    enhancedCache.getStats(),
    checkDatabaseHealth(),
    optimizedCrestService.getMetrics(),
    optimizedFPLApi.getMetrics()
  ]);

  const dbMetrics = DatabaseMonitor.getMetrics();

  const performanceReport = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    responseTime: Date.now() - startTime,

    // Cache performance
    cache: {
      hitRate: cacheStats.performance.hitRate,
      totalOperations: cacheStats.performance.totalOperations,
      redis: cacheStats.redis,
      memory: cacheStats.memory
    },

    // Database performance
    database: {
      isHealthy: databaseHealth.isHealthy,
      latency: databaseHealth.latency,
      averageQueryTime: dbMetrics.averageQueryTime,
      slowQueries: dbMetrics.slowQueries,
      connectionCount: dbMetrics.connectionCount,
      error: databaseHealth.error
    },

    // Service-specific metrics
    services: {
      crest: {
        databaseCrests: crestMetrics.databaseCrests,
        cacheStats: crestMetrics.cacheStats
      },
      fplApi: {
        apiHealth: fplMetrics.apiHealth,
        cacheStats: fplMetrics.cacheStats
      }
    },

    // Performance recommendations
    recommendations: generatePerformanceRecommendations({
      cacheStats,
      databaseHealth,
      dbMetrics
    })
  };

  // Determine overall health status
  if (!databaseHealth.isHealthy) {
    performanceReport.status = 'degraded';
  } else if (cacheStats.performance.hitRate < 50) {
    performanceReport.status = 'warning';
  }

  return NextResponse.json(performanceReport);
}

/**
 * 📈 Get detailed cache metrics
 */
async function getCacheMetrics(): Promise<NextResponse> {
  const cacheHealth = await enhancedCache.healthCheck();
  const cacheStats = enhancedCache.getStats();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    cache: {
      health: cacheHealth,
      stats: cacheStats,
      recommendations: {
        redis: !cacheHealth.redis.healthy ? 'Redis is not connected. Consider starting Redis for better performance.' : 'Redis is healthy',
        hitRate: cacheStats.performance.hitRate < 50 ? 'Low cache hit rate. Consider increasing TTL or warming cache.' : 'Good cache hit rate',
        memory: cacheStats.memory.size > cacheStats.memory.maxSize * 0.8 ? 'Memory cache is nearly full. Consider clearing old entries.' : 'Memory usage is healthy'
      }
    }
  });
}

/**
 * 🗄️ Get database performance metrics
 */
async function getDatabaseMetrics(): Promise<NextResponse> {
  const databaseHealth = await checkDatabaseHealth();
  const dbMetrics = DatabaseMonitor.getMetrics();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    database: {
      health: databaseHealth,
      metrics: dbMetrics,
      recommendations: {
        connection: !databaseHealth.isHealthy ? 'Database is not accessible. Check connection settings.' : 'Database connection is healthy',
        performance: dbMetrics.averageQueryTime > 1000 ? 'Average query time is high. Consider optimizing queries or adding indexes.' : 'Query performance is good',
        slowQueries: dbMetrics.slowQueries > 10 ? 'Many slow queries detected. Review and optimize database queries.' : 'No significant slow queries detected'
      }
    }
  });
}

/**
 * 🏥 Comprehensive health check
 */
async function getHealthCheck(): Promise<NextResponse> {
  const checks = await Promise.allSettled([
    checkDatabaseHealth(),
    enhancedCache.healthCheck(),
    optimizedFPLApi.getMetrics()
  ]);

  const healthReport = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: {
      database: checks[0].status === 'fulfilled' ? checks[0].value : { isHealthy: false, error: 'Health check failed' },
      cache: checks[1].status === 'fulfilled' ? checks[1].value : { overall: false, error: 'Health check failed' },
      fplApi: checks[2].status === 'fulfilled' ? { healthy: checks[2].value.apiHealth } : { healthy: false, error: 'Health check failed' }
    }
  };

  // Determine overall health
  const dbHealthy = healthReport.checks.database.isHealthy;
  const cacheHealthy = healthReport.checks.cache.overall;
  const apiHealthy = healthReport.checks.fplApi.healthy;

  if (!dbHealthy || !apiHealthy) {
    healthReport.overall = 'unhealthy';
  } else if (!cacheHealthy) {
    healthReport.overall = 'degraded';
  }

  const statusCode = healthReport.overall === 'healthy' ? 200 : 503;

  return NextResponse.json(healthReport, { status: statusCode });
}

/**
 * 🧹 Clear performance cache
 */
async function clearPerformanceCache(): Promise<NextResponse> {
  try {
    await enhancedCache.clear();
    await optimizedCrestService.clearCache();
    await optimizedFPLApi.clearCache('all');

    return NextResponse.json({
      message: 'Performance cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error },
      { status: 500 }
    );
  }
}

/**
 * 💡 Generate performance recommendations
 */
function generatePerformanceRecommendations(metrics: {
  cacheStats: any;
  databaseHealth: any;
  dbMetrics: any;
}): string[] {
  const recommendations: string[] = [];

  // Cache recommendations
  if (metrics.cacheStats.performance.hitRate < 30) {
    recommendations.push('🔄 Cache hit rate is very low. Consider preloading common data or increasing TTL values.');
  }

  if (!metrics.cacheStats.redis.connected) {
    recommendations.push('🔴 Redis is not connected. Start Redis service for better caching performance.');
  }

  // Database recommendations
  if (!metrics.databaseHealth.isHealthy) {
    recommendations.push('🗄️ Database is not accessible. Check PostgreSQL service and connection string.');
  }

  if (metrics.databaseHealth.latency > 100) {
    recommendations.push('⏱️ Database latency is high. Consider connection pooling or database optimization.');
  }

  if (metrics.dbMetrics.averageQueryTime > 500) {
    recommendations.push('🐌 Average query time is high. Review slow queries and consider adding database indexes.');
  }

  // Memory recommendations
  if (metrics.cacheStats.memory.size > metrics.cacheStats.memory.maxSize * 0.9) {
    recommendations.push('🧠 Memory cache is nearly full. Consider clearing old entries or increasing cache size.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All systems are performing well! No immediate optimizations needed.');
  }

  return recommendations;
}

/**
 * 🔄 POST endpoint for performance actions
 */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'warm-cache':
        return await warmCache();
      case 'optimize-database':
        return await optimizeDatabase();
      case 'preload-data':
        return await preloadCommonData();
      case 'clear-cache':
        return await clearPerformanceCache();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: warm-cache, optimize-database, preload-data, clear-cache' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Performance action failed', details: error },
      { status: 500 }
    );
  }
}

/**
 * 🔥 Warm up the cache with common data
 */
async function warmCache(): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Preload FPL data
    await optimizedFPLApi.preloadCommonData();

    // Preload common team crests
    const commonTeams = [
      'Meriam Pak Maon', 'kejoryobkejor', "Kickin' FC",
      'SampanKosong', 'Northen Rovers FC', 'syok pod'
    ];

    await optimizedCrestService.generateCrestsForAllTeams(commonTeams);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      message: 'Cache warmed successfully',
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to warm cache', details: error },
      { status: 500 }
    );
  }
}

/**
 * 🗄️ Database optimization suggestions
 */
async function optimizeDatabase(): Promise<NextResponse> {
  // This would run ANALYZE and other optimization commands
  // For now, return optimization suggestions

  return NextResponse.json({
    message: 'Database optimization analysis completed',
    suggestions: [
      'Run ANALYZE on frequently queried tables',
      'Consider adding indexes on commonly filtered columns',
      'Review and optimize slow queries',
      'Configure connection pooling if not already enabled'
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * 📚 Preload common data
 */
async function preloadCommonData(): Promise<NextResponse> {
  try {
    await optimizedFPLApi.preloadCommonData();

    return NextResponse.json({
      message: 'Common data preloaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to preload data', details: error },
      { status: 500 }
    );
  }
}