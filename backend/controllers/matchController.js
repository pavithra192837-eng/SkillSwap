
const { pool } = require("../config/db");

// ========================================
// GET MATCHES
// GET /api/matches
// ========================================
const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    /*
      Reciprocal skill matching:

      1. The other user teaches a skill
         that the current user wants to learn.

      2. The other user wants to learn a skill
         that the current user can teach.

      A user is returned only when both
      conditions are satisfied.
    */

    const [matches] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.college,
        u.roll_no,
        u.department,
        u.bio,
        u.profile_image,

        COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM ratings r WHERE r.reviewee_id = u.id), 0) AS average_rating,
        (SELECT COUNT(*) FROM ratings r WHERE r.reviewee_id = u.id) AS rating_count,

        COUNT(
          DISTINCT CASE
            WHEN their_skill.type = 'TEACH'
            AND their_skill.skill_id IN (
              SELECT skill_id
              FROM user_skills
              WHERE user_id = ?
              AND type = 'LEARN'
            )
            THEN their_skill.skill_id
          END
        ) AS skills_they_can_teach,

        COUNT(
          DISTINCT CASE
            WHEN their_skill.type = 'LEARN'
            AND their_skill.skill_id IN (
              SELECT skill_id
              FROM user_skills
              WHERE user_id = ?
              AND type = 'TEACH'
            )
            THEN their_skill.skill_id
          END
        ) AS skills_they_want_to_learn

      FROM users u

      INNER JOIN user_skills their_skill
        ON u.id = their_skill.user_id

      WHERE u.id != ?

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.college,
        u.roll_no,
        u.department,
        u.bio,
        u.profile_image

      HAVING
        skills_they_can_teach > 0
        AND skills_they_want_to_learn > 0

      ORDER BY
        (
          skills_they_can_teach +
          skills_they_want_to_learn
        ) DESC
      `,
      [
        userId,
        userId,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(
      "Get matches error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to find matches",
    });
  }
};

// ========================================
// GET MATCH BY USER ID
// GET /api/matches/:userId
// ========================================
const getMatchById = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const matchUserId = req.params.userId;

    // ------------------------------------
    // Prevent matching with yourself
    // ------------------------------------
    if (
      Number(currentUserId) ===
      Number(matchUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot match with yourself",
      });
    }

    // ------------------------------------
    // Get matched user's profile
    // ------------------------------------
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
        profile_image
      FROM users
      WHERE id = ?
      `,
      [matchUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const matchedUser = users[0];

    // ------------------------------------
    // Skills they can teach
    // that current user wants to learn
    // ------------------------------------
    const [teachingSkills] =
      await pool.query(
        `
        SELECT
          s.id,
          s.name,
          s.description,
          CASE WHEN us.level = 'ADVANCED' THEN 'PROFICIENT' ELSE us.level END AS level
        FROM user_skills us

        INNER JOIN skills s
          ON us.skill_id = s.id

        WHERE us.user_id = ?
          AND us.type = 'TEACH'
          AND us.skill_id IN (
            SELECT skill_id
            FROM user_skills
            WHERE user_id = ?
              AND type = 'LEARN'
          )

        ORDER BY s.name ASC
        `,
        [
          matchUserId,
          currentUserId,
        ]
      );

    // ------------------------------------
    // Skills they want to learn
    // that current user can teach
    // ------------------------------------
    const [learningSkills] =
      await pool.query(
        `
        SELECT
          s.id,
          s.name,
          s.description,
          CASE WHEN us.level = 'ADVANCED' THEN 'PROFICIENT' ELSE us.level END AS level
        FROM user_skills us

        INNER JOIN skills s
          ON us.skill_id = s.id

        WHERE us.user_id = ?
          AND us.type = 'LEARN'
          AND us.skill_id IN (
            SELECT skill_id
            FROM user_skills
            WHERE user_id = ?
              AND type = 'TEACH'
          )

        ORDER BY s.name ASC
        `,
        [
          matchUserId,
          currentUserId,
        ]
      );

    // ------------------------------------
    // Calculate simple compatibility count
    // ------------------------------------
    const skillsTheyCanTeach =
      teachingSkills.length;

    const skillsTheyWantToLearn =
      learningSkills.length;

    const compatibilityScore =
      skillsTheyCanTeach +
      skillsTheyWantToLearn;

    // ------------------------------------
    // Response
    // ------------------------------------
    return res.status(200).json({
      success: true,

      match: {
        user: matchedUser,

        skillsTheyCanTeach:
          teachingSkills,

        skillsTheyWantToLearn:
          learningSkills,

        compatibilityScore,
      },
    });
  } catch (error) {
    console.error(
      "Get match error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get match",
    });
  }
};

module.exports = {
  getMatches,
  getMatchById,
};

