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
// POST /api/auth/register
// =========================
router.post(
  "/register",
  register
);


// =========================
// LOGIN
// POST /api/auth/login
// =========================
router.post(
  "/login",
  login
);


// =========================
// GET CURRENT USER
// GET /api/auth/me
// =========================
router.get(
  "/me",
  authMiddleware,
  getMe
);


module.exports = router;