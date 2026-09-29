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
// POST /api/sessions
// =========================
router.post(
  "/",
  authMiddleware,
  createSession
);


// =========================
// GET MY SESSIONS
// GET /api/sessions
// =========================
router.get(
  "/",
  authMiddleware,
  getSessions
);


// =========================
// GET SESSION BY ID
// GET /api/sessions/:id
// =========================
router.get(
  "/:id",
  authMiddleware,
  getSessionById
);


// =========================
// UPDATE SESSION
// PUT /api/sessions/:id
// =========================
router.put(
  "/:id",
  authMiddleware,
  updateSession
);


// =========================
// COMPLETE SESSION
// PUT /api/sessions/:id/complete
// =========================
router.put(
  "/:id/complete",
  authMiddleware,
  completeSession
);


module.exports = router;