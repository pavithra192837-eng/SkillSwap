
const { pool } = require("../config/db");

// ========================================
// GET DASHBOARD
// GET /api/dashboard
// ========================================
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // ====================================
    // 1. GET USER
    // ====================================
    const [users] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        college,
        roll_no,
        department,
        bio,
        profile_image,
        created_at
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // ====================================
    // 2. GET USER SKILLS
    // ====================================
    const [skills] = await pool.query(
      `
      SELECT
        us.id,
        us.type,
        us.level,
        s.id AS skill_id,
        s.name,
        s.description
      FROM user_skills us
      INNER JOIN skills s
        ON us.skill_id = s.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      `,
      [userId]
    );

    // ====================================
    // 3. GET INCOMING REQUEST COUNT
    // ====================================
    const [incomingRequests] =
      await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM exchange_requests
        WHERE receiver_id = ?
          AND status = 'PENDING'
        `,
        [userId]
      );

    // ====================================
    // 4. GET OUTGOING REQUEST COUNT
    // ====================================
    const [outgoingRequests] =
      await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM exchange_requests
        WHERE sender_id = ?
          AND status = 'PENDING'
        `,
        [userId]
      );

    // ====================================
    // 5. GET ACCEPTED REQUEST COUNT
    // ====================================
    const [acceptedRequests] =
      await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM exchange_requests
        WHERE
          (sender_id = ? OR receiver_id = ?)
          AND status = 'ACCEPTED'
        `,
        [userId, userId]
      );

    // ====================================
    // 6. GET UPCOMING SESSIONS
    // ====================================
    const [upcomingSessions] =
      await pool.query(
        `
        SELECT
          s.id,
          s.request_id,
          s.user1_id,
          s.user2_id,
          s.scheduled_at,
          s.status,
          s.meeting_id
        FROM sessions s
        WHERE
          (s.user1_id = ? OR s.user2_id = ?)
          AND s.status = 'SCHEDULED'
          AND s.scheduled_at >= NOW()
        ORDER BY s.scheduled_at ASC
        LIMIT 5
        `,
        [userId, userId]
      );

    // ====================================
    // 7. GET RECENT NOTIFICATIONS
    // ====================================
    const [notifications] =
      await pool.query(
        `
        SELECT
          id,
          type,
          title,
          message,
          reference_id,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
        `,
        [userId]
      );

    // ====================================
    // 8. GET RECENT REQUESTS
    // ====================================
    const [recentRequests] =
      await pool.query(
        `
        SELECT
          er.id,
          er.sender_id,
          er.receiver_id,
          er.offered_skill_id,
          er.requested_skill_id,
          er.message,
          er.status,
          er.created_at,

          sender.name AS sender_name,
          receiver.name AS receiver_name,

          offered_skill.name AS offered_skill_name,
          requested_skill.name AS requested_skill_name

        FROM exchange_requests er

        INNER JOIN users sender
          ON er.sender_id = sender.id

        INNER JOIN users receiver
          ON er.receiver_id = receiver.id

        INNER JOIN skills offered_skill
          ON er.offered_skill_id = offered_skill.id

        INNER JOIN skills requested_skill
          ON er.requested_skill_id = requested_skill.id

        WHERE
          er.sender_id = ?
          OR er.receiver_id = ?

        ORDER BY er.created_at DESC
        LIMIT 5
        `,
        [userId, userId]
      );

    // ====================================
    // 9. DASHBOARD RESPONSE
    // ====================================
    return res.status(200).json({
      success: true,

      user,

      skills,

      statistics: {
        incoming_pending_requests:
          Number(
            incomingRequests[0].count
          ),

        outgoing_pending_requests:
          Number(
            outgoingRequests[0].count
          ),

        accepted_requests:
          Number(
            acceptedRequests[0].count
          ),
      },

      upcoming_sessions:
        upcomingSessions,

      recent_requests:
        recentRequests,

      notifications,
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

module.exports = {
  getDashboard,
};

