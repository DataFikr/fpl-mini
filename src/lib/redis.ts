import { createClient } from 'redis';

// Simple in-memory cache fallback for testing
const memoryCache = new Map<string, { data: string; expiry: number }>();

const mockRedis = {
  isOpen: true,
  connect: async () => {},
  get: async (key: string) => {
    const item = memoryCache.get(key);
    if (!item || item.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.data;
  },
  setEx: async (key: string, ttl: number, value: string) => {
    memoryCache.set(key, {
      data: value,
      expiry: Date.now() + (ttl * 1000)
    });
  },
  del: async (key: string) => {
    memoryCache.delete(key);
    return 1;
  }
};

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | typeof mockRedis | undefined;
};

// Use real Redis if URL is provided, otherwise use memory cache
export const redis = globalForRedis.redis ?? (() => {
  const redisUrl = process.env.REDIS_URL;

  // Check if Redis URL is valid and not a placeholder
  if (redisUrl && redisUrl !== '' && !redisUrl.includes('placeholder')) {
    try {
      const client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        }
      });

      client.on('error', (err) => {
        console.warn('Redis Client Error:', err);
      });

      if (!client.isOpen) {
        client.connect().catch((err) => {
          console.warn('Redis connection failed, using memory cache:', err);
        });
      }
      return client;
    } catch (error) {
      console.warn('Failed to create Redis client, using memory cache:', error);
      return mockRedis;
    }
  }

  console.log('Using memory cache (Redis not configured or invalid URL)');
  return mockRedis;
})();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;