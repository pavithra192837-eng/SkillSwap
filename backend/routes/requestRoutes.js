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
// POST /api/requests
// =========================
router.post(
  "/",
  authMiddleware,
  sendRequest
);


// =========================
// GET RECEIVED REQUESTS
// GET /api/requests/received
// =========================
router.get(
  "/received",
  authMiddleware,
  getReceivedRequests
);


// =========================
// GET SENT REQUESTS
// GET /api/requests/sent
// =========================
router.get(
  "/sent",
  authMiddleware,
  getSentRequests
);


// =========================
// ACCEPT REQUEST
// PUT /api/requests/:id/accept
// =========================
router.put(
  "/:id/accept",
  authMiddleware,
  acceptRequest
);


// =========================
// REJECT REQUEST
// PUT /api/requests/:id/reject
// =========================
router.put(
  "/:id/reject",
  authMiddleware,
  rejectRequest
);


module.exports = router;