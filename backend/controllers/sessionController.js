
const { pool } = require("../config/db");

// ========================================
// CREATE SESSION
// POST /api/sessions
// ========================================
const createSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      request_id,
      scheduled_at,
      meeting_id,
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    if (!request_id || !scheduled_at) {
      return res.status(400).json({
        success: false,
        message:
          "Request ID and scheduled time are required",
      });
    }

    // ------------------------------------
    // Get accepted request
    // ------------------------------------
    const [requests] = await pool.query(
      `
      SELECT
        id,
        sender_id,
        receiver_id,
        status
      FROM exchange_requests
      WHERE id = ?
        AND status = 'ACCEPTED'
      `,
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Accepted exchange request not found",
      });
    }

    const request = requests[0];

    // ------------------------------------
    // Check user belongs to request
    // ------------------------------------
    if (
      Number(request.sender_id) !==
        Number(userId) &&
      Number(request.receiver_id) !==
        Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this exchange request",
      });
    }

    // ------------------------------------
    // Check existing session
    // ------------------------------------
    const [existingSessions] =
      await pool.query(
        `
        SELECT id
        FROM sessions
        WHERE request_id = ?
        `,
        [request_id]
      );

    if (existingSessions.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "A session already exists for this request",
      });
    }

    // ------------------------------------
    // Create session
    // ------------------------------------
    const user1Id = request.sender_id;
    const user2Id = request.receiver_id;

    const [result] = await pool.query(
      `
      INSERT INTO sessions
      (
        request_id,
        user1_id,
        user2_id,
        scheduled_at,
        status,
        meeting_id
      )
      VALUES (?, ?, ?, ?, 'SCHEDULED', ?)
      `,
      [
        request_id,
        user1Id,
        user2Id,
        scheduled_at,
        meeting_id || null,
      ]
    );

    // ------------------------------------
    // Notify both users
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES
      (?, 'SESSION_CREATED', ?, ?, ?, FALSE),
      (?, 'SESSION_CREATED', ?, ?, ?, FALSE)
      `,
      [
        user1Id,
        "Session scheduled",
        "A new skill exchange session has been scheduled.",
        result.insertId,

        user2Id,
        "Session scheduled",
        "A new skill exchange session has been scheduled.",
        result.insertId,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Session created successfully",

      session: {
        id: result.insertId,
        request_id: Number(request_id),
        user1_id: user1Id,
        user2_id: user2Id,
        scheduled_at,
        status: "SCHEDULED",
        meeting_id:
          meeting_id || null,
      },
    });
  } catch (error) {
    console.error(
      "Create session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create session",
    });
  }
};

// ========================================
// GET MY SESSIONS
// GET /api/sessions
// ========================================
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        user1.name AS user1_name,
        user1.roll_no AS user1_roll_no,

        user2.name AS user2_name,
        user2.roll_no AS user2_roll_no

      FROM sessions s

      INNER JOIN users user1
        ON s.user1_id = user1.id

      INNER JOIN users user2
        ON s.user2_id = user2.id

      WHERE
        s.user1_id = ?
        OR s.user2_id = ?

      ORDER BY s.scheduled_at DESC
      `,
      [userId, userId]
    );

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(
      "Get sessions error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get sessions",
    });
  }
};

// ========================================
// GET SESSION BY ID
// GET /api/sessions/:id
// ========================================
const getSessionById = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        user1.name AS user1_name,
        user1.roll_no AS user1_roll_no,

        user2.name AS user2_name,
        user2.roll_no AS user2_roll_no

      FROM sessions s

      INNER JOIN users user1
        ON s.user1_id = user1.id

      INNER JOIN users user2
        ON s.user2_id = user2.id

      WHERE s.id = ?
        AND (
          s.user1_id = ?
          OR s.user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session: sessions[0],
    });
  } catch (error) {
    console.error(
      "Get session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get session",
    });
  }
};

// ========================================
// UPDATE SESSION
// PUT /api/sessions/:id
// ========================================
const updateSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const {
      scheduled_at,
      meeting_id,
    } = req.body;

    // ------------------------------------
    // Check session ownership
    // ------------------------------------
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const updates = [];
    const values = [];

    // ------------------------------------
    // Update scheduled time
    // ------------------------------------
    if (
      scheduled_at !== undefined
    ) {
      updates.push(
        "scheduled_at = ?"
      );
      values.push(scheduled_at);
    }

    // ------------------------------------
    // Update meeting ID
    // ------------------------------------
    if (
      meeting_id !== undefined
    ) {
      updates.push(
        "meeting_id = ?"
      );
      values.push(
        meeting_id || null
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid fields to update",
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

    return res.status(200).json({
      success: true,
      message:
        "Session updated successfully",
    });
  } catch (error) {
    console.error(
      "Update session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update session",
    });
  }
};

// ========================================
// START SESSION
// PUT /api/sessions/:id/start
// ========================================
const startSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    if (session.status === "ONGOING") {
      return res.status(400).json({
        success: false,
        message:
          "Session is already ongoing",
      });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Completed sessions cannot be started",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled sessions cannot be started",
      });
    }

    await pool.query(
      `
      UPDATE sessions
      SET status = 'ONGOING'
      WHERE id = ?
      `,
      [sessionId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session started successfully",
    });
  } catch (error) {
    console.error(
      "Start session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start session",
    });
  }
};

// ========================================
// COMPLETE SESSION
// PUT /api/sessions/:id/complete
// ========================================
const completeSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
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
        message:
          "Session is already completed",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled sessions cannot be completed",
      });
    }

    await pool.query(
      `
      UPDATE sessions
      SET status = 'COMPLETED'
      WHERE id = ?
      `,
      [sessionId]
    );

    // ------------------------------------
    // Notify both participants
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES
      (?, 'SESSION_COMPLETED', ?, ?, ?, FALSE),
      (?, 'SESSION_COMPLETED', ?, ?, ?, FALSE)
      `,
      [
        session.user1_id,
        "Session completed",
        "Your skill exchange session has been completed.",
        sessionId,

        session.user2_id,
        "Session completed",
        "Your skill exchange session has been completed.",
        sessionId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session completed successfully",
    });
  } catch (error) {
    console.error(
      "Complete session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete session",
    });
  }
};

// ========================================
// CANCEL / DELETE SESSION
// DELETE /api/sessions/:id
// ========================================
const deleteSession = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
        AND (
          user1_id = ?
          OR user2_id = ?
        )
      `,
      [
        sessionId,
        userId,
        userId,
      ]
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
        message:
          "Completed sessions cannot be cancelled",
      });
    }

    if (session.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Session is already cancelled",
      });
    }

    // ------------------------------------
    // Mark as cancelled
    // ------------------------------------
    await pool.query(
      `
      UPDATE sessions
      SET status = 'CANCELLED'
      WHERE id = ?
      `,
      [sessionId]
    );

    // ------------------------------------
    // Notify both participants
    // ------------------------------------
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        reference_id,
        is_read
      )
      VALUES
      (?, 'SESSION_CANCELLED', ?, ?, ?, FALSE),
      (?, 'SESSION_CANCELLED', ?, ?, ?, FALSE)
      `,
      [
        session.user1_id,
        "Session cancelled",
        "Your skill exchange session has been cancelled.",
        sessionId,

        session.user2_id,
        "Session cancelled",
        "Your skill exchange session has been cancelled.",
        sessionId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Session cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Delete session error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel session",
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  startSession,
  completeSession,
  deleteSession,
};

