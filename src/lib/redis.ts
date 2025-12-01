import { createClient } from "redis";

const globalForRedis = global as unknown as { redis: ReturnType<typeof createClient> };

const redisClient =
    globalForRedis.redis ||
    createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
    });

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err.message);
});

if (!redisClient.isOpen) {
    redisClient.connect().catch(() => {
        console.log("Redis connection failed (this is expected during build step)");
    });
}

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisClient;

export default redisClient;
