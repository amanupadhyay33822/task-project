const { createClient } = require("redis");
require("dotenv").config(); // make sure dotenv is loaded

const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Connected to Redis"));

(async () => {
  await redis.connect();
})();

module.exports = redis;
