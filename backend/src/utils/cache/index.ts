import Redis from 'ioredis';
import envvars from '@/config/envvars';
import { logger } from './logger';
import { CacheKeyEntry } from './types';


const redis = new Redis({
    host: envvars.redis.host,
    port: envvars.redis.port,
    password: envvars.redis.password,
    maxRetriesPerRequest: null,
});


redis.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);

    const connectionErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH'];
    const isConnectionError = connectionErrors.some(errCode => err.message.includes(errCode));

    if (isConnectionError) {
        logger.error('Critical: Unable to connect to Redis. Application will exit.');
        process.exit(1);
    }
});

const subscriber = new Redis({
    host: envvars.redis.host,
    port: envvars.redis.port,
    password: envvars.redis.password,
});


subscriber.on('error', (err) => {
    logger.error(`Redis subscriber connection error: ${err.message}`);

    const connectionErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH'];
    const isConnectionError = connectionErrors.some(errCode => err.message.includes(errCode));

    if (isConnectionError) {
        logger.error('Critical: Unable to connect to Redis subscriber. Application will exit.');
        process.exit(1);
    }
});

const DEFAULT_EXPIRATION = envvars.redis.defaultExpiration;

subscriber.subscribe('invalidate-cache');

subscriber.on('message', async (channel, key) => {
    if (channel === 'invalidate-cache') {
        await redis.del(key);
        logger.info(`Cache invalidated across instances: ${key}`);
    }
});

export const cache = {

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (data) {
                logger.info(`Cache hit: ${key}`);
                return JSON.parse(data);
            } else {
                logger.info(`Cache miss: ${key}`);
                return null;
            }
        } catch (err) {
            logger.error(`Cache get error: ${err}`);
            return null;
        }
    },


    async set<T>(key: string, value: T, expiration = DEFAULT_EXPIRATION): Promise<void> {
        try {
            await redis.set(key, JSON.stringify(value), 'EX', expiration);
            logger.info(`Cache set: ${key} (expires in ${expiration}s)`);
        } catch (err) {
            logger.error(`Cache set error: ${err}`);
        }
    },

    async deleteSmart<KeyParam, PrefixParam>(
        cache: CacheKeyEntry<KeyParam, PrefixParam>,
        param?: KeyParam | PrefixParam
    ): Promise<void> {
        try {
            if (!param) {
                const prefix = cache.key({ page: '*', limit: '*' } as any)
                    .replace(/page=\*.*$/, '');

                const keys = await redis.keys(`${prefix}*`);

                if (keys.length > 0) {
                    await redis.del(...keys);

                    for (const key of keys) {
                        await redis.publish('invalidate-cache', key);
                    }
                }

                logger.info(`All cache cleared for prefix: ${prefix}`);
                return;
            }

            const key = cache.key(param as KeyParam);
            await redis.del(key);
            await redis.publish('invalidate-cache', key);

            logger.info(`Cache deleted: ${key}`);
        } catch (err) {
            logger.error(`Cache delete error: ${err}`);
        }
    }

};

export default redis;