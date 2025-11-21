const Redis = require("ioredis");

// Use IPv4 explicitly to avoid ::1 issues (especially on Windows)
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// Handle connection errors gracefully
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis successfully");
});

module.exports = redis;
