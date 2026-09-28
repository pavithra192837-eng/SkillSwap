const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");

// =========================
// SEND EXCHANGE REQUEST
// =========================
router.post("/", authMiddleware, sendRequest);

// =========================
// GET RECEIVED REQUESTS
// =========================
router.get("/received", authMiddleware, getReceivedRequests);

// =========================
// GET SENT REQUESTS
// =========================
router.get("/sent", authMiddleware, getSentRequests);

// =========================
// ACCEPT REQUEST
// =========================
router.put("/:id/accept", authMiddleware, acceptRequest);

// =========================
// REJECT REQUEST
// =========================
router.put("/:id/reject", authMiddleware, rejectRequest);

module.exports = router;