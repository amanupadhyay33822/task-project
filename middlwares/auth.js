const jwt = require("jsonwebtoken");
const User = require("../models/User");
const redis = require("../utils/redis");

exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 1️⃣ Check Redis cache for user
    const cachedUser = await redis.get(`user:${userId}`);
    let user;

    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      // Fetch from DB if not in cache
      user = await User.findById(userId);
      if (!user) return res.status(401).json({ message: "User not found" });

      await redis.set(`user:${userId}`, JSON.stringify(user), "EX", 3600);
    }

    // 4️⃣ Check token issuance vs last logout
    const tokenIssuedAt = decoded.iat * 1000; // convert sec → ms
    const lastLogoutTime = new Date(user.lastLogoutAt || 0).getTime();

    if (tokenIssuedAt < lastLogoutTime) {
      return res.status(401).json({
        message: "Token expired due to logout. Please login again.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Same role middleware (no change)
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
