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
      meetingLink,
    } = req.body;

    if (!requestId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Request ID and scheduled time are required",
      });
    }

    // =========================
    // GET ACCEPTED REQUEST
    // =========================
    const [requests] = await pool.query(
      `
      SELECT *
      FROM exchange_requests
      WHERE id = ?
      AND status = 'accepted'
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

    // =========================
    // CHECK USER IS PART OF REQUEST
    // =========================
    if (
      Number(request.sender_id) !== Number(userId) &&
      Number(request.receiver_id) !== Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this request",
      });
    }

    // =========================
    // CHECK EXISTING SESSION
    // =========================
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

    // =========================
    // CREATE SESSION
    // =========================
    const hostId = request.sender_id;
    const participantId = request.receiver_id;

    const [result] = await pool.query(
      `
      INSERT INTO sessions
      (
        request_id,
        host_id,
        participant_id,
        scheduled_at,
        status,
        meeting_link
      )
      VALUES (?, ?, ?, ?, 'scheduled', ?)
      `,
      [
        requestId,
        hostId,
        participantId,
        scheduledAt,
        meetingLink || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      sessionId: result.insertId,
    });

  } catch (error) {
    console.error(
      "Create session error:",
      error.message
    );

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
        s.host_id,
        s.participant_id,
        s.scheduled_at,
        s.status,
        s.meeting_link,
        s.created_at,

        host.name AS host_name,
        participant.name AS participant_name

      FROM sessions s

      JOIN users host
        ON s.host_id = host.id

      JOIN users participant
        ON s.participant_id = participant.id

      WHERE s.host_id = ?
         OR s.participant_id = ?

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
    console.error(
      "Get sessions error:",
      error.message
    );

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
        s.host_id,
        s.participant_id,
        s.scheduled_at,
        s.status,
        s.meeting_link,
        s.created_at,

        host.name AS host_name,
        participant.name AS participant_name

      FROM sessions s

      JOIN users host
        ON s.host_id = host.id

      JOIN users participant
        ON s.participant_id = participant.id

      WHERE s.id = ?
      AND (
        s.host_id = ?
        OR s.participant_id = ?
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
    console.error(
      "Get session error:",
      error.message
    );

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
      meetingLink,
      status,
    } = req.body;

    // =========================
    // CHECK SESSION OWNERSHIP
    // =========================
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
      AND (
        host_id = ?
        OR participant_id = ?
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

    // =========================
    // BUILD UPDATE
    // =========================
    const updates = [];
    const values = [];

    if (scheduledAt !== undefined) {
      updates.push("scheduled_at = ?");
      values.push(scheduledAt);
    }

    if (meetingLink !== undefined) {
      updates.push("meeting_link = ?");
      values.push(meetingLink);
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "scheduled",
        "ongoing",
        "completed",
        "cancelled",
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
    console.error(
      "Update session error:",
      error.message
    );

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

    // =========================
    // VERIFY USER BELONGS TO SESSION
    // =========================
    const [sessions] = await pool.query(
      `
      SELECT *
      FROM sessions
      WHERE id = ?
      AND (
        host_id = ?
        OR participant_id = ?
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

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled sessions cannot be completed",
      });
    }

    // =========================
    // MARK SESSION COMPLETED
    // =========================
    await pool.query(
      `
      UPDATE sessions
      SET status = 'completed'
      WHERE id = ?
      `,
      [sessionId]
    );

    res.status(200).json({
      success: true,
      message: "Session completed successfully",
    });

  } catch (error) {
    console.error(
      "Complete session error:",
      error.message
    );

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