
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  startSession,
  completeSession,
  deleteSession,
} = require("../controllers/sessionController");

// ========================================
// CREATE SESSION
// POST /api/sessions
// ========================================
router.post(
  "/",
  authMiddleware,
  createSession
);

// ========================================
// GET MY SESSIONS
// GET /api/sessions
// ========================================
router.get(
  "/",
  authMiddleware,
  getSessions
);

// ========================================
// GET SESSION BY ID
// GET /api/sessions/:id
// ========================================
router.get(
  "/:id",
  authMiddleware,
  getSessionById
);

// ========================================
// UPDATE SESSION
// PUT /api/sessions/:id
// ========================================
router.put(
  "/:id",
  authMiddleware,
  updateSession
);

// ========================================
// START SESSION
// PUT /api/sessions/:id/start
// ========================================
router.put(
  "/:id/start",
  authMiddleware,
  startSession
);

// ========================================
// COMPLETE SESSION
// PUT /api/sessions/:id/complete
// ========================================
router.put(
  "/:id/complete",
  authMiddleware,
  completeSession
);

// ========================================
// CANCEL SESSION
// DELETE /api/sessions/:id
// ========================================
router.delete(
  "/:id",
  authMiddleware,
  deleteSession
);

module.exports = router;
