const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redisClient.connect();

redisClient.on("connect", () => {
  console.log("Redis connected");
});

module.exports = redisClient;
