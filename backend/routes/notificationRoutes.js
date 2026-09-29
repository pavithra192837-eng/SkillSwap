id="j5q2rm"
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

// ========================================
// GET ALL NOTIFICATIONS
// GET /api/notifications
// ========================================
router.get(
  "/",
  authMiddleware,
  getNotifications
);

// ========================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ========================================
router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

module.exports = router;
