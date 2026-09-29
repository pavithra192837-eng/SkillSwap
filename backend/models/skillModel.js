
const { pool } = require("../config/db");

// ========================================
// FIND ALL SKILLS
// ========================================
const findAllSkills = async () => {
  const [rows] = await pool.query(
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

      ORDER BY s.name ASC
    `
  );

  return rows;
};

// ========================================
// FIND SKILL BY ID
// ========================================
const findSkillById = async (
  skillId
) => {
  const [rows] = await pool.query(
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

      LIMIT 1
    `,
    [skillId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// FIND SKILL BY NAME
// ========================================
const findSkillByName = async (
  name
) => {
  const [rows] = await pool.query(
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

      WHERE LOWER(s.name) = LOWER(?)

      LIMIT 1
    `,
    [name]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// CREATE SKILL
// ========================================
const createSkill = async ({
  name,
  category_id = null,
  description = null,
}) => {
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
      name,
      category_id,
      description,
    ]
  );

  return result.insertId;
};

// ========================================
// ADD USER SKILL
// ========================================
const addUserSkill = async ({
  userId,
  skillId,
  type,
  level = "BEGINNER",
}) => {
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
      skillId,
      type,
      level,
    ]
  );

  return result.insertId;
};

// ========================================
// FIND USER SKILLS
// ========================================
const findUserSkills = async (
  userId
) => {
  const [rows] = await pool.query(
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
        us.level,
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

  return rows;
};

// ========================================
// FIND USER SKILL BY RECORD ID
// ========================================
//
// Here skillRecordId means:
// user_skills.id
//
const findUserSkillById = async (
  userId,
  skillRecordId
) => {
  const [rows] = await pool.query(
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
        us.level,
        us.created_at

      FROM user_skills us

      INNER JOIN skills s
        ON us.skill_id = s.id

      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id

      WHERE us.id = ?
        AND us.user_id = ?

      LIMIT 1
    `,
    [
      skillRecordId,
      userId,
    ]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// FIND USER SKILL BY SKILL + TYPE
// ========================================
const findUserSkill = async (
  userId,
  skillId,
  type
) => {
  const [rows] = await pool.query(
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
        us.level,
        us.created_at

      FROM user_skills us

      INNER JOIN skills s
        ON us.skill_id = s.id

      LEFT JOIN skill_categories sc
        ON s.category_id = sc.id

      WHERE us.user_id = ?
        AND us.skill_id = ?
        AND us.type = ?

      LIMIT 1
    `,
    [
      userId,
      skillId,
      type,
    ]
  );

  return rows.length > 0
    ? rows[0]
    : null;
};

// ========================================
// DELETE USER SKILL
// ========================================
//
// Deletes by user_skills.id
//
const deleteUserSkill = async (
  userId,
  skillRecordId
) => {
  const [result] = await pool.query(
    `
      DELETE FROM user_skills
      WHERE id = ?
        AND user_id = ?
    `,
    [
      skillRecordId,
      userId,
    ]
  );

  return result.affectedRows > 0;
};

// ========================================
// UPDATE USER SKILL
// ========================================
//
// Updates by user_skills.id
//
const updateUserSkill = async (
  userId,
  skillRecordId,
  updates
) => {
  const fields = [];
  const values = [];

  // ----------------------------------------
  // Update type
  // ----------------------------------------
  if (updates.type !== undefined) {
    fields.push("type = ?");
    values.push(updates.type);
  }

  // ----------------------------------------
  // Update level
  // ----------------------------------------
  if (updates.level !== undefined) {
    fields.push("level = ?");
    values.push(updates.level);
  }

  // Nothing to update
  if (fields.length === 0) {
    return false;
  }

  values.push(
    skillRecordId,
    userId
  );

  const [result] = await pool.query(
    `
      UPDATE user_skills
      SET ${fields.join(", ")}
      WHERE id = ?
        AND user_id = ?
    `,
    values
  );

  return result.affectedRows > 0;
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  findAllSkills,
  findSkillById,
  findSkillByName,
  createSkill,
  addUserSkill,
  findUserSkills,
  findUserSkillById,
  findUserSkill,
  deleteUserSkill,
  updateUserSkill,
};

