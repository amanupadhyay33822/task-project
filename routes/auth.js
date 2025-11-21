const express = require("express");
const router = express.Router();
const { register, login, logout, getUserProfile } = require("../controllers/auth");
const { authLimiter } = require("../middlwares/rateLimiter");
const { authenticate } = require("../middlwares/auth");

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate,logout)
router.get("/profile", authenticate, getUserProfile);

module.exports = router;
