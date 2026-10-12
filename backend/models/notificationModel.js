
const { pool } = require("../config/db");

// ========================================
// CREATE NOTIFICATION
// ========================================
const createNotification = async ({
  user_id,
  type,
  title,
  message,
  reference_id = null,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      user_id,
      type,
      title,
      message,
      reference_id,
    ]
  );

  return {
    id: result.insertId,
    user_id,
    type,
    title,
    message,
    reference_id,
  };
};

// ========================================
// GET USER NOTIFICATIONS
// ========================================
const getNotificationsByUserId = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
};

// ========================================
// GET UNREAD NOTIFICATION COUNT
// ========================================
const getUnreadNotificationCount = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ?
        AND is_read = FALSE
    `,
    [userId]
  );

  return rows[0].unread_count;
};

// ========================================
// MARK NOTIFICATION AS READ
// ========================================
const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const [result] = await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
        AND user_id = ?
    `,
    [
      notificationId,
      userId,
    ]
  );

  return result.affectedRows > 0;
};

// ========================================
// MARK ALL NOTIFICATIONS AS READ
// ========================================
const markAllNotificationsAsRead = async (
  userId
) => {
  const [result] = await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
        AND is_read = FALSE
    `,
    [userId]
  );

  return result.affectedRows;
};

// ========================================
// DELETE NOTIFICATION
// ========================================
const deleteNotification = async (
  notificationId,
  userId
) => {
  const [result] = await pool.query(
    `
      DELETE FROM notifications
      WHERE id = ?
        AND user_id = ?
    `,
    [
      notificationId,
      userId,
    ]
  );

  return result.affectedRows > 0;
};

// ========================================
// DELETE ALL USER NOTIFICATIONS
// ========================================
const deleteAllNotifications = async (userId) => {
  const [result] = await pool.query(
    `DELETE FROM notifications WHERE user_id = ?`,
    [userId]
  );
  return result.affectedRows;
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  createNotification,
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};

