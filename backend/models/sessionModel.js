const { pool } = require("../config/db");

// =========================
// CREATE SESSION
// =========================
const createSession = async ({
  requestId,
  teacherId,
  learnerId,
  scheduledAt,
  duration,
  meetingLink,
}) => {
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

  return rows;
};

// =========================
// FIND SESSION BY REQUEST
// =========================
const findSessionByRequestId = async (requestId) => {
  const [rows] = await pool.query(
    `
    SELECT *
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
const updateSession = async (sessionId, updates) => {
  const fields = [];
  const values = [];

  if (updates.scheduledAt !== undefined) {
    fields.push("scheduled_at = ?");
    values.push(updates.scheduledAt);
  }

  if (updates.duration !== undefined) {
    fields.push("duration = ?");
    values.push(updates.duration);
  }

  if (updates.meetingLink !== undefined) {
    fields.push("meeting_link = ?");
    values.push(updates.meetingLink);
  }

  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }

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
    SET status = 'COMPLETED'
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