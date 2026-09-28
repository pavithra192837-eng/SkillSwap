const { pool } = require("../config/db");

// =========================
// CREATE SESSION
// POST /api/sessions
// =========================
const createSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      requestId,
      scheduledAt,
      duration,
      meetingLink,
    } = req.body;

    if (!requestId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Request ID and scheduled time are required",
      });
    }

    // Get accepted request
    const [requests] = await pool.query(
      `
      SELECT *
      FROM exchange_requests
      WHERE id = ?
      AND status = 'ACCEPTED'
      `,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Accepted request not found",
      });
    }

    const request = requests[0];

    // Only sender or receiver can create the session
    if (
      Number(request.sender_id) !== Number(userId) &&
      Number(request.receiver_id) !== Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this request",
      });
    }

    // Check if session already exists
    const [existingSessions] = await pool.query(
      `
      SELECT id
      FROM sessions
      WHERE request_id = ?
      `,
      [requestId]
    );

    if (existingSessions.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A session already exists for this request",
      });
    }

    // For MVP:
    // sender = teacher
    // receiver = learner
    const teacherId = request.sender_id;
    const learnerId = request.receiver_id;

    // Create session
    const [result] = await pool.query(
      `
      INSERT INTO sessions
      (
        request_id,
        teacher_id,
        learner_id,
        scheduled_at,
        duration,
        meeting_link,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')
      `,
      [
        requestId,
        teacherId,
        learnerId,
        scheduledAt,
        duration || 60,
        meetingLink || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      sessionId: result.insertId,
    });

  } catch (error) {
    console.error("Create session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create session",
    });
  }
};


// =========================
// GET MY SESSIONS
// GET /api/sessions
// =========================
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.teacher_id,
        s.learner_id,
        s.scheduled_at,
        s.duration,
        s.meeting_link,
        s.status,
        s.created_at,

        teacher.name AS teacher_name,
        learner.name AS learner_name

      FROM sessions s

      JOIN users teacher
        ON s.teacher_id = teacher.id

      JOIN users learner
        ON s.learner_id = learner.id

      WHERE s.teacher_id = ?
         OR s.learner_id = ?

      ORDER BY s.scheduled_at DESC
      `,
      [userId, userId]
    );

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });

  } catch (error) {
    console.error("Get sessions error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get sessions",
    });
  }
};


// =========================
// GET SESSION BY ID
// GET /api/sessions/:id
// =========================
const getSessionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.teacher_id,
        s.learner_id,
        s.scheduled_at,
        s.duration,
        s.meeting_link,
        s.status,
        s.created_at,

        teacher.name AS teacher_name,
        learner.name AS learner_name

      FROM sessions s

      JOIN users teacher
        ON s.teacher_id = teacher.id

      JOIN users learner
        ON s.learner_id = learner.id

      WHERE s.id = ?
      AND (
        s.teacher_id = ?
        OR s.learner_id = ?
      )
      `,
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      session: sessions[0],
    });

  } catch (error) {
    console.error("Get session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get session",
    });
  }
};


// =========================
// UPDATE SESSION
// PUT /api/sessions/:id
// =========================
const updateSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const {
      scheduledAt,
      duration,
      meetingLink,
      status,
    } = req.body;

    // Check session ownership
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
      AND (
        teacher_id = ?
        OR learner_id = ?
      )
      `,
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Build dynamic update
    const updates = [];
    const values = [];

    if (scheduledAt !== undefined) {
      updates.push("scheduled_at = ?");
      values.push(scheduledAt);
    }

    if (duration !== undefined) {
      updates.push("duration = ?");
      values.push(duration);
    }

    if (meetingLink !== undefined) {
      updates.push("meeting_link = ?");
      values.push(meetingLink);
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "SCHEDULED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session status",
        });
      }

      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    values.push(sessionId);

    await pool.query(
      `
      UPDATE sessions
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
    });

  } catch (error) {
    console.error("Update session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update session",
    });
  }
};


// =========================
// COMPLETE SESSION
// PUT /api/sessions/:id/complete
// =========================
const completeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    // Verify user belongs to session
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
      AND (
        teacher_id = ?
        OR learner_id = ?
      )
      `,
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    if (session.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled sessions cannot be completed",
      });
    }

    // Mark session as completed
    await pool.query(
      `
      UPDATE sessions
      SET status = 'COMPLETED'
      WHERE id = ?
      `,
      [sessionId]
    );

    // Update reputation / completed session count
    await pool.query(
      `
      INSERT INTO reputation
      (user_id, points, rating, completed_sessions)
      VALUES (?, 10, 0, 1)
      ON DUPLICATE KEY UPDATE
        points = points + 10,
        completed_sessions = completed_sessions + 1
      `,
      [session.teacher_id]
    );

    await pool.query(
      `
      INSERT INTO reputation
      (user_id, points, rating, completed_sessions)
      VALUES (?, 10, 0, 1)
      ON DUPLICATE KEY UPDATE
        points = points + 10,
        completed_sessions = completed_sessions + 1
      `,
      [session.learner_id]
    );

    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      pointsAwarded: 10,
    });

  } catch (error) {
    console.error("Complete session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to complete session",
    });
  }
};


module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  completeSession,
};