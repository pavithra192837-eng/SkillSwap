
const {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationAsRead: markNotificationAsReadModel,
  markAllNotificationsAsRead: markAllNotificationsAsReadModel,
  deleteNotification: deleteNotificationModel,
  deleteAllNotifications: deleteAllNotificationsModel,
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

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const count = await markAllNotificationsAsReadModel(req.user.id);
    return res.status(200).json({ success: true, updated: count });
  } catch (error) {
    console.error("Mark all notifications error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const deleted = await deleteNotificationModel(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const deleted = await deleteAllNotificationsModel(req.user.id);
    return res.status(200).json({ success: true, deleted });
  } catch (error) {
    console.error("Clear notifications error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to clear notifications" });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};

