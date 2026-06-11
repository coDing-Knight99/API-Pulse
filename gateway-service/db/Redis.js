import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => {
    console.log('Redis connected');
});

redis.on('ready', () => {
    console.log('Redis ready');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

redis.on('close', () => {
    console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
    console.log('Redis reconnecting...');
});

export default redis;