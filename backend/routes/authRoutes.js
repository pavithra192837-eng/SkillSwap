const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

// =========================
// REGISTER
// =========================
router.post("/register", register);

// =========================
// LOGIN
// =========================
router.post("/login", login);

// =========================
// GET CURRENT USER
// =========================
router.get("/me", authMiddleware, getMe);

module.exports = router;