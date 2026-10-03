
const { pool } = require("../config/db");

// ========================================
// CREATE RATING
// ========================================
const createRating = async ({
  session_id,
  reviewer_id,
  reviewee_id,
  rating,
  review = null,
}) => {
  const [result] = await pool.query(
    `
      INSERT INTO ratings
      (
        session_id,
        reviewer_id,
        reviewee_id,
        rating,
        review
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      session_id,
      reviewer_id,
      reviewee_id,
      rating,
      review,
    ]
  );

  return {
    id: result.insertId,
    session_id,
    reviewer_id,
    reviewee_id,
    rating,
    review,
  };
};

// ========================================
// FIND EXISTING RATING
// ========================================
const findRating = async (
  sessionId,
  reviewerId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        session_id,
        reviewer_id,
        reviewee_id,
        rating,
        review,
        created_at
      FROM ratings
      WHERE session_id = ?
        AND reviewer_id = ?
      LIMIT 1
    `,
    [
      sessionId,
      reviewerId,
    ]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// GET USER RATINGS
// ========================================
const getRatingsByUserId = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        r.id,
        r.session_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.review,
        r.created_at,

        reviewer.name AS reviewer_name,
        reviewer.profile_image AS reviewer_profile_image

      FROM ratings r

      INNER JOIN users reviewer
        ON reviewer.id = r.reviewer_id

      WHERE r.reviewee_id = ?

      ORDER BY r.created_at DESC
    `,
    [userId]
  );

  return rows;
};

// ========================================
// GET USER RATING SUMMARY
// ========================================
const getRatingSummary = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT
        COUNT(*) AS total_ratings,
        COALESCE(
          ROUND(AVG(rating), 2),
          0
        ) AS average_rating

      FROM ratings

      WHERE reviewee_id = ?
    `,
    [userId]
  );

  return {
    total_ratings: Number(
      rows[0].total_ratings
    ),
    average_rating: Number(
      rows[0].average_rating
    ),
  };
};

// ========================================
// CHECK SESSION
// ========================================
const getSessionById = async (
  sessionId
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
        meeting_id
      FROM sessions
      WHERE id = ?
      LIMIT 1
    `,
    [sessionId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// CHECK USER
// ========================================
const getUserById = async (
  userId
) => {
  const [rows] = await pool.query(
    `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  createRating,
  findRating,
  getRatingsByUserId,
  getRatingSummary,
  getSessionById,
  getUserById,
};

