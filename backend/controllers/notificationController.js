const {
  getNotificationsByUserId, getUnreadNotificationCount,
  markNotificationAsRead: markNotificationAsReadModel,
  markAllNotificationsAsRead: markAllNotificationsAsReadModel,
  deleteNotification: deleteNotificationModel,
  deleteAllNotifications: deleteAllNotificationsModel,
} = require("../models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [notifications, unread_count] = await Promise.all([getNotificationsByUserId(userId), getUnreadNotificationCount(userId)]);
    return res.json({ success: true, count: notifications.length, unread_count: Number(unread_count), notifications });
  } catch (error) { console.error("Get notifications error:", error); return res.status(500).json({ success:false, message:"Failed to get notifications" }); }
};

const markNotificationAsRead = async (req,res) => {
  try {
    const updated = await markNotificationAsReadModel(req.params.id, req.user.id);
    if (!updated) return res.status(404).json({ success:false, message:"Notification not found" });
    return res.json({ success:true });
  } catch (error) { console.error("Mark notification error:", error); return res.status(500).json({ success:false, message:"Failed to mark notification as read" }); }
};

const markAllNotificationsAsRead = async (req,res) => {
  try { const updated = await markAllNotificationsAsReadModel(req.user.id); return res.json({ success:true, updated }); }
  catch (error) { console.error("Mark all notifications error:", error); return res.status(500).json({ success:false, message:"Failed to mark notifications as read" }); }
};

const deleteNotification = async (req,res) => {
  try { const deleted = await deleteNotificationModel(req.params.id, req.user.id); if (!deleted) return res.status(404).json({success:false,message:"Notification not found"}); return res.json({success:true}); }
  catch (error) { console.error("Delete notification error:", error); return res.status(500).json({success:false,message:"Failed to delete notification"}); }
};

const deleteAllNotifications = async (req,res) => {
  try { const deleted = await deleteAllNotificationsModel(req.user.id); return res.json({success:true,deleted}); }
  catch (error) { console.error("Clear notifications error:", error); return res.status(500).json({success:false,message:"Failed to clear notifications"}); }
};

module.exports = { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications };
