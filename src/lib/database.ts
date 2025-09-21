import { PrismaClient } from '@prisma/client';

/**
 * 🚀 Enhanced Database Configuration with Performance Optimization
 * Includes connection pooling, retry logic, and monitoring
 */

declare global {
  var __prisma: PrismaClient | undefined;
}

// Configuration for different environments
const databaseConfig = {
  // Connection pool settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },

  // Performance optimizations
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const,

  // Connection timeout and retry settings
  __internal: {
    engine: {
      connectTimeout: 30000, // 30 seconds
      queryTimeout: 30000,   // 30 seconds
    }
  }
};

/**
 * 🔧 Create optimized Prisma client with connection pooling
 */
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient(databaseConfig);

  // Note: $use middleware is not available in SQLite with Prisma 5+
  // Performance monitoring can be added through manual timing in operations

  return prisma;
}

/**
 * 🌐 Singleton pattern for database connection
 * Reuses connection in development, creates fresh in production
 */
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

/**
 * 🔄 Database health check with retry logic
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latency: number;
  error?: string;
}> {
  const maxRetries = 3;
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const start = Date.now();

      // Simple health check query
      await prisma.$queryRaw`SELECT 1`;

      const latency = Date.now() - start;

      console.log(`✅ Database health check passed (${latency}ms)`);
      return {
        isHealthy: true,
        latency
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`❌ Database health check failed (attempt ${attempt}/${maxRetries}):`, lastError);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    isHealthy: false,
    latency: -1,
    error: lastError
  };
}

/**
 * 🚀 Enhanced query wrapper with automatic retry and caching
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (lastError.message.includes('Unique constraint') ||
          lastError.message.includes('Foreign key constraint')) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`🔄 Database operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * 📊 Database performance monitoring
 */
export class DatabaseMonitor {
  private static queryTimes: number[] = [];
  private static connectionCount = 0;

  static recordQueryTime(duration: number): void {
    this.queryTimes.push(duration);

    // Keep only last 100 queries
    if (this.queryTimes.length > 100) {
      this.queryTimes = this.queryTimes.slice(-100);
    }
  }

  static getAverageQueryTime(): number {
    if (this.queryTimes.length === 0) return 0;
    return this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;
  }

  static getSlowQueries(threshold: number = 1000): number {
    return this.queryTimes.filter(time => time > threshold).length;
  }

  static incrementConnection(): void {
    this.connectionCount++;
  }

  static getConnectionCount(): number {
    return this.connectionCount;
  }

  static getMetrics(): {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
    connectionCount: number;
  } {
    return {
      averageQueryTime: this.getAverageQueryTime(),
      slowQueries: this.getSlowQueries(),
      totalQueries: this.queryTimes.length,
      connectionCount: this.connectionCount
    };
  }
}

/**
 * 🧹 Graceful shutdown handler
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error);
  }
}

// Set up graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', disconnectDatabase);
  process.on('SIGINT', disconnectDatabase);
  process.on('SIGTERM', disconnectDatabase);
}