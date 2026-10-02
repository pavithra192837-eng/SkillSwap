
const {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationAsRead: markNotificationAsReadModel,
} = require("../models/notificationModel");

// ========================================
// GET NOTIFICATIONS
// GET /api/notifications
// ========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // ------------------------------------
    // Get user's notifications
    // ------------------------------------
    const notifications =
      await getNotificationsByUserId(userId);

    // ------------------------------------
    // Get unread count
    // ------------------------------------
    const unreadCount =
      await getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unread_count: Number(unreadCount),
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

// ========================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ========================================
const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // ------------------------------------
    // Mark notification as read
    // Model checks ownership using
    // notificationId + userId
    // ------------------------------------
    const updated =
      await markNotificationAsReadModel(
        notificationId,
        userId
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
};

