import * as Redis from 'redis';

/**
 * 🚀 High-Performance Caching System
 * Supports Redis with intelligent fallback to memory cache
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  useCompression?: boolean;
  fallbackToMemory?: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  totalOperations: number;
}

/**
 * 📊 Cache performance monitoring
 */
class CacheMonitor {
  private static metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalOperations: 0
  };

  static recordHit(): void {
    this.metrics.hits++;
    this.metrics.totalOperations++;
  }

  static recordMiss(): void {
    this.metrics.misses++;
    this.metrics.totalOperations++;
  }

  static recordError(): void {
    this.metrics.errors++;
    this.metrics.totalOperations++;
  }

  static getMetrics(): CacheMetrics & { hitRate: number } {
    const hitRate = this.metrics.totalOperations > 0
      ? (this.metrics.hits / this.metrics.totalOperations) * 100
      : 0;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  static reset(): void {
    this.metrics = { hits: 0, misses: 0, errors: 0, totalOperations: 0 };
  }
}

/**
 * 🧠 Memory cache fallback
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly maxSize = 1000; // Maximum number of items

  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

/**
 * 🔄 Enhanced Cache Manager
 */
export class EnhancedCache {
  private redisClient: Redis.RedisClientType | null = null;
  private memoryCache = new MemoryCache();
  private isRedisConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 3;

  constructor() {
    this.initializeRedis();
  }

  /**
   * 🔧 Initialize Redis connection with retry logic
   */
  private async initializeRedis(): Promise<void> {
    if (!process.env.REDIS_URL) {
      console.log('📝 Redis URL not configured, using memory cache only');
      return;
    }

    try {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) return false;
            return Math.min(retries * 500, 2000);
          }
        }
      });

      this.redisClient.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isRedisConnected = false;
        CacheMonitor.recordError();
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isRedisConnected = true;
        this.connectionRetries = 0;
      });

      this.redisClient.on('ready', () => {
        console.log('🚀 Redis client ready');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.connectionRetries++;
      this.isRedisConnected = false;
    }
  }

  /**
   * 📥 Get value from cache with intelligent fallback
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        try {
          const value = await this.redisClient.get(key);
          if (value !== null) {
            CacheMonitor.recordHit();
            return JSON.parse(value);
          }
        } catch (error) {
          console.warn(`⚠️ Redis get failed for key ${key}, falling back to memory:`, error);
          CacheMonitor.recordError();
        }
      }

      // Fallback to memory cache
      const memoryValue = this.memoryCache.get(key);
      if (memoryValue !== null) {
        CacheMonitor.recordHit();
        return memoryValue;
      }

      CacheMonitor.recordMiss();
      return null;

    } catch (error) {
      console.error(`❌ Cache get error for key ${key}:`, error);
      CacheMonitor.recordError();
      return null;
    }
  }

  /**
   * 📤 Set value in cache with automatic JSON serialization
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, useCompression = false, fallbackToMemory = true } = options;

    try {
      const serializedValue = JSON.stringify(value);

      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        try {
          await this.redisClient.setEx(key, ttl, serializedValue);
          return;
        } catch (error) {
          console.warn(`⚠️ Redis set failed for key ${key}, falling back to memory:`, error);
          CacheMonitor.recordError();
        }
      }

      // Fallback to memory cache
      if (fallbackToMemory) {
        this.memoryCache.set(key, value, ttl);
      }

    } catch (error) {
      console.error(`❌ Cache set error for key ${key}:`, error);
      CacheMonitor.recordError();
    }
  }

  /**
   * 🗑️ Delete key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from Redis
      if (this.isRedisConnected && this.redisClient) {
        try {
          await this.redisClient.del(key);
        } catch (error) {
          console.warn(`⚠️ Redis delete failed for key ${key}:`, error);
        }
      }

      // Delete from memory cache
      this.memoryCache.delete(key);

    } catch (error) {
      console.error(`❌ Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * 🧹 Clear all cache
   */
  async clear(): Promise<void> {
    try {
      // Clear Redis
      if (this.isRedisConnected && this.redisClient) {
        try {
          await this.redisClient.flushDb();
        } catch (error) {
          console.warn('⚠️ Redis clear failed:', error);
        }
      }

      // Clear memory cache
      this.memoryCache.clear();

    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * 🎯 Cache-or-fetch pattern with automatic retry
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data with retry logic
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const freshData = await fetchFunction();

        // Cache the result
        await this.set(key, freshData, options);

        return freshData;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.warn(`🔄 Fetch failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * 📊 Get cache performance statistics
   */
  getStats(): {
    redis: { connected: boolean; retries: number };
    memory: { size: number; maxSize: number };
    performance: CacheMetrics & { hitRate: number };
  } {
    return {
      redis: {
        connected: this.isRedisConnected,
        retries: this.connectionRetries
      },
      memory: this.memoryCache.getStats(),
      performance: CacheMonitor.getMetrics()
    };
  }

  /**
   * 🏥 Health check for cache system
   */
  async healthCheck(): Promise<{
    redis: { healthy: boolean; latency?: number };
    memory: { healthy: boolean };
    overall: boolean;
  }> {
    const result = {
      redis: { healthy: false, latency: undefined as number | undefined },
      memory: { healthy: true },
      overall: false
    };

    // Test Redis
    if (this.isRedisConnected && this.redisClient) {
      try {
        const start = Date.now();
        await this.redisClient.ping();
        const latency = Date.now() - start;

        result.redis = { healthy: true, latency };
      } catch (error) {
        console.error('❌ Redis health check failed:', error);
      }
    }

    // Memory cache is always healthy if we reach this point
    result.overall = result.memory.healthy;

    return result;
  }

  /**
   * 🔌 Graceful shutdown
   */
  async disconnect(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis client disconnected gracefully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error);
    }
  }
}

// Singleton instance
export const enhancedCache = new EnhancedCache();

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => enhancedCache.disconnect());
  process.on('SIGINT', () => enhancedCache.disconnect());
  process.on('SIGTERM', () => enhancedCache.disconnect());
}