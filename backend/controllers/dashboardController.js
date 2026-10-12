
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
        CASE WHEN us.level = 'ADVANCED' THEN 'PROFICIENT' ELSE us.level END AS level,
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
          s.id, s.request_id, s.user1_id, s.user2_id, s.scheduled_at,
          s.duration_minutes, s.session_number, s.status, s.meeting_id,
          s.lesson_type, s.learner_id, s.teacher_id, s.skill_id,
          learner.name AS learner_name, teacher.name AS teacher_name,
          skill.name AS lesson_skill_name
        FROM sessions s
        LEFT JOIN users learner ON learner.id = s.learner_id
        LEFT JOIN users teacher ON teacher.id = s.teacher_id
        LEFT JOIN skills skill ON skill.id = s.skill_id
        WHERE
          (s.user1_id = ? OR s.user2_id = ?)
          AND s.status = 'SCHEDULED'
          AND s.scheduled_at >= UTC_TIMESTAMP()
        ORDER BY s.scheduled_at ASC
        LIMIT 5
        `,
        [userId, userId]
      );

    // ====================================
    // 7. GET ACTIVE EXCHANGES WITH LESSON PROGRESS
    // ====================================
    const [activeExchanges] = await pool.query(`
      SELECT er.id AS request_id, er.sender_id, er.receiver_id,
             er.planned_learning_sessions, er.planned_teaching_sessions,
             CASE WHEN er.sender_id = ? THEN receiver.name ELSE sender.name END AS partner_name,
             CASE WHEN er.sender_id = ? THEN requested_skill.name ELSE offered_skill.name END AS learn_skill_name,
             CASE WHEN er.sender_id = ? THEN offered_skill.name ELSE requested_skill.name END AS teach_skill_name,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='COMPLETED') AS completed_sessions,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED') AS scheduled_sessions,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='COMPLETED' AND s.lesson_type IN ('LEARNING','BOTH') AND s.learner_id = ?) AS completed_learning,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='COMPLETED' AND s.lesson_type IN ('TEACHING','BOTH') AND s.teacher_id = ?) AS completed_teaching,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED' AND s.lesson_type IN ('LEARNING','BOTH') AND s.learner_id = ?) AS scheduled_learning,
             (SELECT COUNT(*) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED' AND s.lesson_type IN ('TEACHING','BOTH') AND s.teacher_id = ?) AS scheduled_teaching,
             (SELECT MIN(s.scheduled_at) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED' AND s.scheduled_at >= UTC_TIMESTAMP()) AS next_session_at,
             (SELECT MIN(s.scheduled_at) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED' AND s.scheduled_at >= UTC_TIMESTAMP() AND s.lesson_type IN ('LEARNING','BOTH') AND s.learner_id = ?) AS next_learning_at,
             (SELECT MIN(s.scheduled_at) FROM sessions s WHERE s.request_id = er.id AND s.status='SCHEDULED' AND s.scheduled_at >= UTC_TIMESTAMP() AND s.lesson_type IN ('TEACHING','BOTH') AND s.teacher_id = ?) AS next_teaching_at
      FROM exchange_requests er
      JOIN users sender ON sender.id=er.sender_id
      JOIN users receiver ON receiver.id=er.receiver_id
      JOIN skills offered_skill ON offered_skill.id=er.offered_skill_id
      JOIN skills requested_skill ON requested_skill.id=er.requested_skill_id
      WHERE (er.sender_id=? OR er.receiver_id=?) AND er.status='ACCEPTED'
      ORDER BY COALESCE(next_session_at,'9999-12-31') ASC, er.updated_at DESC
      LIMIT 8
    `, [userId,userId,userId,userId,userId,userId,userId,userId,userId,userId,userId]);

    // ====================================
    // 8. GET RECENT NOTIFICATIONS
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
    // 9. GET RECENT REQUESTS
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
    // 10. DASHBOARD RESPONSE
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

      active_exchanges: activeExchanges,

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

