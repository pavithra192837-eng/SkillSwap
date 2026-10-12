const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
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
router.put("/read-all", authMiddleware, markAllNotificationsAsRead);

router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

router.delete("/:id", authMiddleware, deleteNotification);
router.delete("/", authMiddleware, deleteAllNotifications);

module.exports = router;
