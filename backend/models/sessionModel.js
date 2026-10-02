
const { pool } = require("../config/db");

// ========================================
// CREATE SESSION
// ========================================
const createSession = async ({
  request_id,
  user1_id,
  user2_id,
  scheduled_at,
  meeting_id = null,
  duration_minutes = 60,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO sessions
      (
        request_id,
        user1_id,
        user2_id,
        scheduled_at,
        duration_minutes,
        status,
        meeting_id
      )
      VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?)
    `,
    [
      request_id,
      user1_id,
      user2_id,
      scheduled_at,
      duration_minutes,
      meeting_id,
    ]
  );

  return result.insertId;
};

// ========================================
// FIND SESSION BY ID
// ========================================
const findSessionById = async (
  sessionId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.duration_minutes,
        s.started_at,
        s.ended_at,
        s.ended_by,
        s.end_reason,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        u1.name AS user1_name,
        u2.name AS user2_name

      FROM sessions s

      INNER JOIN users u1
        ON s.user1_id = u1.id

      INNER JOIN users u2
        ON s.user2_id = u2.id

      WHERE s.id = ?
      LIMIT 1
    `,
    [sessionId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// GET USER SESSIONS
// ========================================
const findSessionsByUserId = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        s.id,
        s.request_id,
        s.user1_id,
        s.user2_id,
        s.scheduled_at,
        s.duration_minutes,
        s.started_at,
        s.ended_at,
        s.ended_by,
        s.end_reason,
        s.status,
        s.meeting_id,
        s.created_at,
        s.updated_at,

        u1.name AS user1_name,
        u2.name AS user2_name

      FROM sessions s

      INNER JOIN users u1
        ON s.user1_id = u1.id

      INNER JOIN users u2
        ON s.user2_id = u2.id

      WHERE s.user1_id = ?
         OR s.user2_id = ?

      ORDER BY s.scheduled_at DESC
    `,
    [
      userId,
      userId,
    ]
  );

  return rows;
};

// ========================================
// FIND SESSION BY REQUEST ID
// ========================================
const findSessionByRequestId = async (
  requestId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        request_id,
        user1_id,
        user2_id,
        scheduled_at,
        status,
        meeting_id,
        created_at,
        updated_at

      FROM sessions

      WHERE request_id = ?

      LIMIT 1
    `,
    [requestId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// UPDATE SESSION
// ========================================
const updateSession = async (
  sessionId,
  updates
) => {
  const fields = [];
  const values = [];

  // ----------------------------------------
  // Scheduled time
  // ----------------------------------------
  if (
    updates.scheduled_at !== undefined
  ) {
    fields.push("scheduled_at = ?");
    values.push(
      updates.scheduled_at
    );
  }

  // ----------------------------------------
  // Duration
  // ----------------------------------------
  if (updates.duration_minutes !== undefined) {
    const duration = Number(updates.duration_minutes);
    if (![30, 45, 60, 90].includes(duration)) {
      throw new Error("Invalid session duration");
    }
    fields.push("duration_minutes = ?");
    values.push(duration);
  }

  // ----------------------------------------
  // Meeting ID
  // ----------------------------------------
  if (
    updates.meeting_id !== undefined
  ) {
    fields.push("meeting_id = ?");
    values.push(
      updates.meeting_id
    );
  }

  // ----------------------------------------
  // Status
  // ----------------------------------------
  if (
    updates.status !== undefined
  ) {
    const allowedStatuses = [
      "SCHEDULED",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ];

    if (
      !allowedStatuses.includes(
        updates.status
      )
    ) {
      throw new Error(
        "Invalid session status"
      );
    }

    fields.push("status = ?");
    values.push(updates.status);
  }

  // ----------------------------------------
  // Nothing to update
  // ----------------------------------------
  if (fields.length === 0) {
    return false;
  }

  values.push(sessionId);

  const [result] = await pool.query(
    `
      UPDATE sessions
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values
  );

  return result.affectedRows > 0;
};

// ========================================
// START SESSION
// ========================================
const startSession = async (
  sessionId
) => {
  const [result] = await pool.query(
    `
      UPDATE sessions
      SET status = 'ONGOING'
      WHERE id = ?
        AND status = 'SCHEDULED'
    `,
    [sessionId]
  );

  return result.affectedRows > 0;
};

// ========================================
// COMPLETE SESSION
// ========================================
const completeSession = async (
  sessionId
) => {
  const [result] = await pool.query(
    `
      UPDATE sessions
      SET status = 'COMPLETED'
      WHERE id = ?
        AND status = 'ONGOING'
    `,
    [sessionId]
  );

  return result.affectedRows > 0;
};

// ========================================
// CANCEL SESSION
// ========================================
const cancelSession = async (
  sessionId
) => {
  const [result] = await pool.query(
    `
      UPDATE sessions
      SET status = 'CANCELLED'
      WHERE id = ?
        AND status IN (
          'SCHEDULED',
          'ONGOING'
        )
    `,
    [sessionId]
  );

  return result.affectedRows > 0;
};

// ========================================
// DELETE / CANCEL SESSION
// ========================================
//
// We keep the session record for history
// and change its status to CANCELLED.
//
const deleteSession = async (
  sessionId
) => {
  return cancelSession(sessionId);
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  createSession,
  findSessionById,
  findSessionsByUserId,
  findSessionByRequestId,
  updateSession,
  startSession,
  completeSession,
  cancelSession,
  deleteSession,
};

