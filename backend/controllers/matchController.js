const { pool } = require("../config/db");

// =========================
// GET MATCHES
// GET /api/matches
// =========================
const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    /*
      Find users who:
      1. Teach something the current user wants to learn
      2. Want to learn something the current user can teach

      This creates a reciprocal skill exchange.
    */

    const [matches] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.bio,
        u.profile_image,
        u.location,
        u.availability,

        COUNT(DISTINCT
          CASE
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

        COUNT(DISTINCT
          CASE
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

      JOIN user_skills their_skill
        ON u.id = their_skill.user_id

      WHERE u.id != ?

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.bio,
        u.profile_image,
        u.location,
        u.availability

      HAVING
        skills_they_can_teach > 0
        AND skills_they_want_to_learn > 0

      ORDER BY
        (skills_they_can_teach + skills_they_want_to_learn) DESC
      `,
      [userId, userId, userId]
    );

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });

  } catch (error) {
    console.error("Get matches error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to find matches",
    });
  }
};


// =========================
// GET MATCH BY ID
// GET /api/matches/:id
// =========================
const getMatchById = async (req, res) => {
  try {
    const userId = req.user.id;
    const matchId = req.params.id;

    // Get matched user's basic information
    const [users] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        bio,
        profile_image,
        location,
        availability
      FROM users
      WHERE id = ?
      AND id != ?
      `,
      [matchId, userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matched user not found",
      });
    }

    const matchedUser = users[0];

    // Skills this user teaches that current user wants
    const [teachingSkills] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.category,
        us.level
      FROM user_skills us
      JOIN skills s
        ON us.skill_id = s.id
      WHERE us.user_id = ?
      AND us.type = 'TEACH'
      AND us.skill_id IN (
        SELECT skill_id
        FROM user_skills
        WHERE user_id = ?
        AND type = 'LEARN'
      )
      `,
      [matchId, userId]
    );

    // Skills this user wants to learn that current user teaches
    const [learningSkills] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.category,
        us.level
      FROM user_skills us
      JOIN skills s
        ON us.skill_id = s.id
      WHERE us.user_id = ?
      AND us.type = 'LEARN'
      AND us.skill_id IN (
        SELECT skill_id
        FROM user_skills
        WHERE user_id = ?
        AND type = 'TEACH'
      )
      `,
      [matchId, userId]
    );

    res.status(200).json({
      success: true,
      match: {
        user: matchedUser,
        skillsTheyCanTeach: teachingSkills,
        skillsTheyWantToLearn: learningSkills,
      },
    });

  } catch (error) {
    console.error("Get match error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get match",
    });
  }
};


module.exports = {
  getMatches,
  getMatchById,
};