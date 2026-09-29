const { pool } = require("../config/db");

// =========================
// GET ALL SKILLS
// GET /api/skills
// =========================
const getSkills = async (req, res) => {
  try {
    const [skills] = await pool.query(`
      SELECT
        id,
        name,
        category,
        description
      FROM skills
      ORDER BY name ASC
    `);

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error("Get skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get skills",
      error: error.message,
    });
  }
};


// =========================
// GET SKILL BY ID
// GET /api/skills/:id
// =========================
const getSkillById = async (req, res) => {
  try {
    const skillId = req.params.id;

    const [skills] = await pool.query(
      `
      SELECT
        id,
        name,
        category,
        description
      FROM skills
      WHERE id = ?
      `,
      [skillId]
    );

    if (skills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      skill: skills[0],
    });
  } catch (error) {
    console.error("Get skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get skill",
      error: error.message,
    });
  }
};


// =========================
// CREATE SKILL
// POST /api/skills
// =========================
const createSkill = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    // Check if skill already exists
    const [existingSkills] = await pool.query(
      `
      SELECT id
      FROM skills
      WHERE LOWER(name) = LOWER(?)
      `,
      [name]
    );

    if (existingSkills.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Skill already exists",
      });
    }

    // Create skill
    const [result] = await pool.query(
      `
      INSERT INTO skills
      (
        name,
        category,
        description
      )
      VALUES (?, ?, ?)
      `,
      [
        name,
        category || null,
        description || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Skill created successfully",

      skill: {
        id: result.insertId,
        name,
        category: category || null,
        description: description || null,
      },
    });

  } catch (error) {
    console.error("Create skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create skill",
      error: error.message,
    });
  }
};


// =========================
// ADD SKILL TO MY PROFILE
// POST /api/skills/user
// =========================
const addUserSkill = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      skillId,
      type,
      level,
    } = req.body;

    // Validate required fields
    if (!skillId || !type) {
      return res.status(400).json({
        success: false,
        message: "Skill ID and skill type are required",
      });
    }

    // Validate skill type
    const allowedTypes = [
      "TEACH",
      "LEARN",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Skill type must be TEACH or LEARN",
      });
    }

    // Validate skill level
    const allowedLevels = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ];

    const skillLevel = level || "BEGINNER";

    if (!allowedLevels.includes(skillLevel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill level",
      });
    }

    // Check if skill exists
    const [skills] = await pool.query(
      `
      SELECT
        id,
        name,
        category,
        description
      FROM skills
      WHERE id = ?
      `,
      [skillId]
    );

    if (skills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check duplicate
    const [existingUserSkills] = await pool.query(
      `
      SELECT id
      FROM user_skills
      WHERE user_id = ?
      AND skill_id = ?
      AND type = ?
      `,
      [
        userId,
        skillId,
        type,
      ]
    );

    if (existingUserSkills.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This skill is already added",
      });
    }

    // Add skill to user
    const [result] = await pool.query(
      `
      INSERT INTO user_skills
      (
        user_id,
        skill_id,
        type,
        level,
        verified
      )
      VALUES (?, ?, ?, ?, false)
      `,
      [
        userId,
        skillId,
        type,
        skillLevel,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Skill added successfully",

      userSkillId: result.insertId,

      skill: {
        id: skills[0].id,
        name: skills[0].name,
        category: skills[0].category,
        description: skills[0].description,
        type,
        level: skillLevel,
        verified: false,
      },
    });

  } catch (error) {
    console.error("Add user skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add skill",
      error: error.message,
    });
  }
};


// =========================
// DELETE SKILL FROM MY PROFILE
// DELETE /api/skills/user/:skillId
// =========================
const deleteUserSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.skillId;

    const { type } = req.body;

    // Validate type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Skill type is required",
      });
    }

    if (!["TEACH", "LEARN"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Skill type must be TEACH or LEARN",
      });
    }

    // Delete only the selected type
    const [result] = await pool.query(
      `
      DELETE FROM user_skills
      WHERE user_id = ?
      AND skill_id = ?
      AND type = ?
      `,
      [
        userId,
        skillId,
        type,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User skill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill removed successfully",
    });

  } catch (error) {
    console.error(
      "Delete user skill error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to remove skill",
      error: error.message,
    });
  }
};


// =========================
// GET MY SKILLS
// GET /api/skills/user/me
// =========================
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;

    const [skills] = await pool.query(
      `
      SELECT
        us.id,
        us.skill_id,

        s.name,
        s.category,
        s.description,

        us.type,
        us.level,
        us.verified,

        us.created_at

      FROM user_skills us

      JOIN skills s
        ON us.skill_id = s.id

      WHERE us.user_id = ?

      ORDER BY s.name ASC
      `,
      [userId]
    );

    // Separate TEACH and LEARN
    const teach = skills.filter(
      (skill) => skill.type === "TEACH"
    );

    const learn = skills.filter(
      (skill) => skill.type === "LEARN"
    );

    res.status(200).json({
      success: true,
      count: skills.length,
      teach,
      learn,
    });

  } catch (error) {
    console.error(
      "Get user skills error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get user skills",
      error: error.message,
    });
  }
};


// =========================
// EXPORT
// =========================
module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  addUserSkill,
  deleteUserSkill,
  getUserSkills,
};