import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisPub: Redis | undefined;
  redisSub: Redis | undefined;
};

function createRedisClient(name: string): Redis {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectionName: `ward-chat-${name}`,
  });

  client.on("error", (err) => {
    console.error(`Redis ${name} error:`, err.message);
  });

  client.on("connect", () => {
    console.log(`Redis ${name} connected`);
  });

  return client;
}

/** Main Redis client for general operations */
export const redis = globalForRedis.redis ?? createRedisClient("main");

/** Redis client for publishing events */
export const redisPub = globalForRedis.redisPub ?? createRedisClient("pub");

/** Redis client for subscribing to events */
export const redisSub = globalForRedis.redisSub ?? createRedisClient("sub");

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
  globalForRedis.redisSub = redisSub;
}
