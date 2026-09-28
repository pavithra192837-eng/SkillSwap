const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  completeSession,
} = require("../controllers/sessionController");

// =========================
// CREATE SESSION
// =========================
router.post("/", authMiddleware, createSession);

// =========================
// GET MY SESSIONS
// =========================
router.get("/", authMiddleware, getSessions);

// =========================
// GET SESSION BY ID
// =========================
router.get("/:id", authMiddleware, getSessionById);

// =========================
// UPDATE SESSION
// =========================
router.put("/:id", authMiddleware, updateSession);

// =========================
// COMPLETE SESSION
// =========================
router.put("/:id/complete", authMiddleware, completeSession);

module.exports = router;