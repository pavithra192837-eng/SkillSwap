
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
  getPlanning,
  rescheduleSession,
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
router.get("/planning", authMiddleware, getPlanning);

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

// ========================================
// RESCHEDULE SESSION
// POST /api/sessions/:id/reschedule
// ========================================
router.post("/:id/reschedule", authMiddleware, rescheduleSession);

module.exports = router;
