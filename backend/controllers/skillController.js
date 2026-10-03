
const { pool } = require("../config/db");

// ========================================
// GET ALL SKILLS
// GET /api/skills
// ========================================
const getSkills = async (req, res) => {
  try {
    const [skills] = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.category_id,
        sc.name AS category_name,
        s.description,
        s.created_at
      FROM skills s
      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id
      ORDER BY s.name ASC
    `);

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(
      "Get skills error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get skills",
    });
  }
};

// ========================================
// GET SKILL BY ID
// GET /api/skills/:id
//
// This endpoint is useful for the frontend,
// although it is not explicitly listed in the
// provided API specification.
// ========================================
const getSkillById = async (req, res) => {
  try {
    const skillId = req.params.id;

    const [skills] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.category_id,
        sc.name AS category_name,
        s.description,
        s.created_at
      FROM skills s
      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id
      WHERE s.id = ?
      `,
      [skillId]
    );

    if (skills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.status(200).json({
      success: true,
      skill: skills[0],
    });
  } catch (error) {
    console.error(
      "Get skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get skill",
    });
  }
};

// ========================================
// CREATE SKILL
// POST /api/skills
//
// This is an admin/setup-style operation.
// The provided API specification explicitly
// lists GET /api/skills, but does not list
// POST /api/skills.
// ========================================
const createSkill = async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const skillName = name.trim();

    // ------------------------------------
    // Check duplicate skill
    // ------------------------------------
    const [existingSkills] =
      await pool.query(
        `
        SELECT id
        FROM skills
        WHERE LOWER(name) = LOWER(?)
        `,
        [skillName]
      );

    if (existingSkills.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Skill already exists",
      });
    }

    // ------------------------------------
    // Validate category if provided
    // ------------------------------------
    if (category_id !== undefined &&
        category_id !== null) {
      const [categories] =
        await pool.query(
          `
          SELECT id
          FROM skill_categories
          WHERE id = ?
          `,
          [category_id]
        );

      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Skill category not found",
        });
      }
    }

    // ------------------------------------
    // Create skill
    // ------------------------------------
    const [result] = await pool.query(
      `
      INSERT INTO skills
      (
        name,
        category_id,
        description
      )
      VALUES (?, ?, ?)
      `,
      [
        skillName,
        category_id ?? null,
        description || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",

      skill: {
        id: result.insertId,
        name: skillName,
        category_id:
          category_id ?? null,
        description:
          description || null,
      },
    });
  } catch (error) {
    console.error(
      "Create skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create skill",
    });
  }
};

// ========================================
// GET MY SKILLS
// GET /api/users/me/skills
// ========================================
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;

    const [skills] = await pool.query(
      `
      SELECT
        us.id,
        us.user_id,
        us.skill_id,

        s.name,
        s.category_id,
        sc.name AS category_name,
        s.description,

        us.type,
        CASE WHEN us.level = 'ADVANCED' THEN 'PROFICIENT' ELSE us.level END AS level,
        us.created_at

      FROM user_skills us

      INNER JOIN skills s
        ON us.skill_id = s.id

      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id

      WHERE us.user_id = ?

      ORDER BY s.name ASC
      `,
      [userId]
    );

    const teach = skills.filter(
      (skill) => skill.type === "TEACH"
    );

    const learn = skills.filter(
      (skill) => skill.type === "LEARN"
    );

    return res.status(200).json({
      success: true,
      count: skills.length,
      teach,
      learn,
      skills,
    });
  } catch (error) {
    console.error(
      "Get user skills error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get user skills",
    });
  }
};

// ========================================
// ADD SKILL TO MY PROFILE
// POST /api/users/me/skills
// ========================================
const addUserSkill = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      skill_id,
      type,
      level,
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    if (!skill_id || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Skill ID and skill type are required",
      });
    }

    // ------------------------------------
    // Validate type
    // ------------------------------------
    const allowedTypes = [
      "TEACH",
      "LEARN",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Skill type must be TEACH or LEARN",
      });
    }

    // ------------------------------------
    // Validate level
    // ------------------------------------
    const allowedLevels = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "PROFICIENT",
    ];

    const requestedLevel = level || "BEGINNER";
    const skillLevel = requestedLevel === "PROFICIENT" ? "ADVANCED" : requestedLevel;

    if (!allowedLevels.includes(requestedLevel)) {
      return res.status(400).json({
        success: false,
        message:
          "Skill level must be BEGINNER, INTERMEDIATE or PROFICIENT",
      });
    }

    // ------------------------------------
    // Check skill exists
    // ------------------------------------
    const [skills] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.category_id,
        sc.name AS category_name,
        s.description
      FROM skills s
      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id
      WHERE s.id = ?
      `,
      [skill_id]
    );

    if (skills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // A skill has one purpose in a student's profile. The same skill cannot
    // be both something the student teaches and something they learn.
    const [conflictingUserSkills] = await pool.query(
      `SELECT id, type FROM user_skills WHERE user_id = ? AND skill_id = ? LIMIT 1`,
      [userId, skill_id]
    );
    if (conflictingUserSkills.length > 0 && conflictingUserSkills[0].type !== type) {
      return res.status(409).json({
        success: false,
        message: `This skill is already in your ${conflictingUserSkills[0].type === 'TEACH' ? 'teaching' : 'learning'} list. A skill cannot be both.`
      });
    }

    // ------------------------------------
    // Check duplicate
    // ------------------------------------
    const [existingUserSkills] =
      await pool.query(
        `
        SELECT id
        FROM user_skills
        WHERE user_id = ?
          AND skill_id = ?
          AND type = ?
        `,
        [
          userId,
          skill_id,
          type,
        ]
      );

    if (existingUserSkills.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This skill is already added to your profile",
      });
    }

    // ------------------------------------
    // Add skill
    // ------------------------------------
    const [result] = await pool.query(
      `
      INSERT INTO user_skills
      (
        user_id,
        skill_id,
        type,
        level
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        skill_id,
        type,
        skillLevel,
      ]
    );

    const skill = skills[0];

    return res.status(201).json({
      success: true,
      message:
        "Skill added successfully",

      user_skill: {
        id: result.insertId,
        user_id: userId,
        skill_id: skill.id,

        name: skill.name,
        category_id:
          skill.category_id,
        category_name:
          skill.category_name,
        description:
          skill.description,

        type,
        level: requestedLevel === "ADVANCED" ? "PROFICIENT" : requestedLevel,
      },
    });
  } catch (error) {
    console.error(
      "Add user skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add skill",
    });
  }
};

// ========================================
// UPDATE MY SKILL
// PUT /api/users/me/skills/:id
//
// :id = user_skills.id
// ========================================
const updateUserSkill = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const userSkillId = req.params.id;

    const {
      type,
      level,
    } = req.body;

    // ------------------------------------
    // Check user skill ownership
    // ------------------------------------
    const [userSkills] =
      await pool.query(
        `
        SELECT *
        FROM user_skills
        WHERE id = ?
          AND user_id = ?
        `,
        [
          userSkillId,
          userId,
        ]
      );

    if (userSkills.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User skill not found",
      });
    }

    const updates = [];
    const values = [];

    // ------------------------------------
    // Validate/update type
    // ------------------------------------
    if (type !== undefined) {
      if (
        !["TEACH", "LEARN"].includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Skill type must be TEACH or LEARN",
        });
      }

      updates.push("type = ?");
      values.push(type);
    }

    // ------------------------------------
    // Validate/update level
    // ------------------------------------
    if (level !== undefined) {
      const allowedLevels = [
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
        "PROFICIENT",
      ];

      if (!allowedLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          message: "Invalid skill level",
        });
      }

      updates.push("level = ?");
      values.push(level === "PROFICIENT" ? "ADVANCED" : level);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid fields to update",
      });
    }

    // ------------------------------------
    // Prevent duplicate type
    // ------------------------------------
    const newType =
      type !== undefined
        ? type
        : userSkills[0].type;

    const [duplicate] =
      await pool.query(
        `
        SELECT id
        FROM user_skills
        WHERE user_id = ?
          AND skill_id = ?
          AND type = ?
          AND id != ?
        `,
        [
          userId,
          userSkills[0].skill_id,
          newType,
          userSkillId,
        ]
      );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This skill type already exists for your profile",
      });
    }

    values.push(userSkillId);

    await pool.query(
      `
      UPDATE user_skills
      SET ${updates.join(", ")}
      WHERE id = ?
        AND user_id = ?
      `,
      [
        ...values,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "User skill updated successfully",
    });
  } catch (error) {
    console.error(
      "Update user skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user skill",
    });
  }
};

// ========================================
// DELETE SKILL FROM MY PROFILE
// DELETE /api/users/me/skills/:id
//
// :id = user_skills.id
// ========================================
const deleteUserSkill = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const userSkillId = req.params.id;

    const [result] = await pool.query(
      `
      DELETE FROM user_skills
      WHERE id = ?
        AND user_id = ?
      `,
      [
        userSkillId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User skill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Skill removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete user skill error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove skill",
    });
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
};

