const { default: Redis } = require("ioredis");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email.match(/^\S+@\S+\.\S+$/))
      return res.status(400).json({ message: "Invalid email" });
    if (password.length < 8)
      return res.status(400).json({ message: "Password too short" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      message: "Server error fetching profile",
    });
  }
};
exports.logout = async (req, res) => {
  try {
    // req.user is already attached in authenticate middleware
    const userId = req.user._id;

    // Update lastLogoutAt in DB
    await User.findByIdAndUpdate(userId, {
      lastLogoutAt: new Date(),
    });
    await Redis.del(`user:${userId}`);
    return res.status(200).json({
      message: "Logged out successfully. Token is now invalid.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Server error during logout",
    });
  }
};
