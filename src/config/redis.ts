import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy() {
    // Don't retry - fail fast
    return null;
  },
  lazyConnect: true,
});

let hasLoggedWarning = false;

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', () => {
  // Silently ignore errors - we'll handle this in connect()
});

// Try to connect once, show single warning if it fails
redis.connect().catch(() => {
  if (!hasLoggedWarning) {
    logger.warn('⚠️  Redis unavailable - running without cache (optional)');
    hasLoggedWarning = true;
  }
});

export default redis;
