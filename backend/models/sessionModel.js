const { pool } = require("../config/db");

// =========================
// CREATE SESSION
// =========================
const createSession = async ({
  requestId,
  hostId,
  participantId,
  scheduledAt,
  meetingLink,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO sessions
    (
      request_id,
      host_id,
      participant_id,
      scheduled_at,
      meeting_link,
      status
    )
    VALUES (?, ?, ?, ?, ?, 'scheduled')
    `,
    [
      requestId,
      hostId,
      participantId,
      scheduledAt,
      meetingLink || null,
    ]
  );

  return result.insertId;
};


// =========================
// FIND SESSION BY ID
// =========================
const findSessionById = async (sessionId) => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.request_id,
      s.host_id,
      s.participant_id,
      s.scheduled_at,
      s.meeting_link,
      s.status,
      s.created_at,
      s.updated_at,

      host.name AS host_name,
      participant.name AS participant_name

    FROM sessions s

    JOIN users host
      ON s.host_id = host.id

    JOIN users participant
      ON s.participant_id = participant.id

    WHERE s.id = ?
    `,
    [sessionId]
  );

  return rows[0] || null;
};


// =========================
// GET USER SESSIONS
// =========================
const findSessionsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.request_id,
      s.host_id,
      s.participant_id,
      s.scheduled_at,
      s.meeting_link,
      s.status,
      s.created_at,
      s.updated_at,

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

  return rows;
};


// =========================
// FIND SESSION BY REQUEST
// =========================
const findSessionByRequestId = async (requestId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      request_id,
      host_id,
      participant_id,
      scheduled_at,
      meeting_link,
      status,
      created_at,
      updated_at

    FROM sessions

    WHERE request_id = ?
    `,
    [requestId]
  );

  return rows[0] || null;
};


// =========================
// UPDATE SESSION
// =========================
const updateSession = async (
  sessionId,
  updates
) => {
  const fields = [];
  const values = [];

  // Scheduled time
  if (updates.scheduledAt !== undefined) {
    fields.push("scheduled_at = ?");
    values.push(updates.scheduledAt);
  }

  // Meeting link
  if (updates.meetingLink !== undefined) {
    fields.push("meeting_link = ?");
    values.push(updates.meetingLink);
  }

  // Status
  if (updates.status !== undefined) {
    const allowedStatuses = [
      "scheduled",
      "ongoing",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(updates.status)) {
      throw new Error("Invalid session status");
    }

    fields.push("status = ?");
    values.push(updates.status);
  }

  // Nothing to update
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


// =========================
// COMPLETE SESSION
// =========================
const completeSession = async (sessionId) => {
  const [result] = await pool.query(
    `
    UPDATE sessions
    SET status = 'completed'
    WHERE id = ?
    `,
    [sessionId]
  );

  return result.affectedRows > 0;
};


// =========================
// EXPORT
// =========================
module.exports = {
  createSession,
  findSessionById,
  findSessionsByUserId,
  findSessionByRequestId,
  updateSession,
  completeSession,
};