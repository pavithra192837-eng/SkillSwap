 id="q7m2kp"
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} = require("../controllers/requestController");

// ========================================
// SEND EXCHANGE REQUEST
// POST /api/requests
// ========================================
router.post(
  "/",
  authMiddleware,
  sendRequest
);

// ========================================
// GET INCOMING REQUESTS
// GET /api/requests/incoming
// ========================================
router.get(
  "/incoming",
  authMiddleware,
  getIncomingRequests
);

// ========================================
// GET OUTGOING REQUESTS
// GET /api/requests/outgoing
// ========================================
router.get(
  "/outgoing",
  authMiddleware,
  getOutgoingRequests
);

// ========================================
// GET REQUEST BY ID
// GET /api/requests/:id
// ========================================
router.get(
  "/:id",
  authMiddleware,
  getRequestById
);

// ========================================
// ACCEPT REQUEST
// PUT /api/requests/:id/accept
// ========================================
router.put(
  "/:id/accept",
  authMiddleware,
  acceptRequest
);

// ========================================
// REJECT REQUEST
// PUT /api/requests/:id/reject
// ========================================
router.put(
  "/:id/reject",
  authMiddleware,
  rejectRequest
);

// ========================================
// CANCEL REQUEST
// DELETE /api/requests/:id
// ========================================
router.delete(
  "/:id",
  authMiddleware,
  cancelRequest
);

module.exports = router;

