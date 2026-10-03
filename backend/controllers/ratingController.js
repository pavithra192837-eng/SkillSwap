
const { pool } = require("../config/db");

// ========================================
// CREATE RATING
// POST /api/ratings
// ========================================
const createRating = async (req, res) => {
  try {
    const reviewerId = req.user.id;

    const {
      session_id,
      reviewee_id,
      rating,
      review,
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    if (
      !session_id ||
      !reviewee_id ||
      rating === undefined ||
      rating === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Session ID, reviewee ID and rating are required",
      });
    }

    // ------------------------------------
    // Validate rating value
    // ------------------------------------
    const ratingValue = Number(rating);

    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be an integer between 1 and 5",
      });
    }

    // ------------------------------------
    // Prevent rating yourself
    // ------------------------------------
    if (
      Number(reviewerId) ===
      Number(reviewee_id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot rate yourself",
      });
    }

    // ------------------------------------
    // Check session
    // ------------------------------------
    const [sessions] = await pool.query(
      `
      SELECT
        id,
        user1_id,
        user2_id,
        status
      FROM sessions
      WHERE id = ?
      `,
      [session_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    // ------------------------------------
    // Session must be completed
    // ------------------------------------
    if (session.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "You can rate a session only after it is completed",
      });
    }

    // ------------------------------------
    // Verify reviewer participated
    // ------------------------------------
    const isParticipant =
      Number(session.user1_id) ===
        Number(reviewerId) ||
      Number(session.user2_id) ===
        Number(reviewerId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant of this session",
      });
    }

    // ------------------------------------
    // Verify reviewee participated
    // ------------------------------------
    const revieweeIsParticipant =
      Number(session.user1_id) ===
        Number(reviewee_id) ||
      Number(session.user2_id) ===
        Number(reviewee_id);

    if (!revieweeIsParticipant) {
      return res.status(400).json({
        success: false,
        message:
          "The reviewee is not a participant of this session",
      });
    }

    // ------------------------------------
    // Check whether rating already exists
    // ------------------------------------
    const [existingRatings] =
      await pool.query(
        `
        SELECT id
        FROM ratings
        WHERE session_id = ?
          AND reviewer_id = ?
        `,
        [
          session_id,
          reviewerId,
        ]
      );

    if (existingRatings.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You have already rated this session",
      });
    }

    // ------------------------------------
    // Create rating
    // ------------------------------------
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
        reviewerId,
        reviewee_id,
        ratingValue,
        (review || "").trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",

      rating: {
        id: result.insertId,
        session_id: Number(session_id),
        reviewer_id: reviewerId,
        reviewee_id: Number(reviewee_id),
        rating: ratingValue,
        review: review || null,
      },
    });
  } catch (error) {
    console.error(
      "Create rating error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit rating",
    });
  }
};

// ========================================
// GET USER RATINGS
// GET /api/users/:id/ratings
// ========================================
const getUserRatings = async (req, res) => {
  try {
    const userId = req.params.id;

    // ------------------------------------
    // Check user exists
    // ------------------------------------
    const [users] = await pool.query(
      `
      SELECT
        id,
        name,
        profile_image
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

    // ------------------------------------
    // Get ratings
    // ------------------------------------
    const [ratings] = await pool.query(
      `
      SELECT
        r.id,
        r.session_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.review,
        r.created_at,

        u.name AS reviewer_name,
        u.profile_image AS reviewer_profile_image

      FROM ratings r

      INNER JOIN users u
        ON r.reviewer_id = u.id

      WHERE r.reviewee_id = ?

      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    // ------------------------------------
    // Calculate average rating
    // ------------------------------------
    const [summary] = await pool.query(
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

    return res.status(200).json({
      success: true,

      user: users[0],

      summary: {
        total_ratings: Number(
          summary[0].total_ratings
        ),
        average_rating: Number(
          summary[0].average_rating
        ),
      },

      ratings,
    });
  } catch (error) {
    console.error(
      "Get user ratings error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get user ratings",
    });
  }
};

module.exports = {
  createRating,
  getUserRatings,
};

