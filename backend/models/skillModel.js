const { pool } = require("../config/db");

// =========================
// FIND ALL SKILLS
// =========================
const findAllSkills = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      category,
      description,
      created_at
    FROM skills
    ORDER BY name ASC
    `
  );

  return rows;
};


// =========================
// FIND SKILL BY ID
// =========================
const findSkillById = async (skillId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      category,
      description,
      created_at
    FROM skills
    WHERE id = ?
    `,
    [skillId]
  );

  return rows[0] || null;
};


// =========================
// FIND SKILL BY NAME
// =========================
const findSkillByName = async (name) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      category,
      description,
      created_at
    FROM skills
    WHERE LOWER(name) = LOWER(?)
    `,
    [name]
  );

  return rows[0] || null;
};


// =========================
// CREATE SKILL
// =========================
const createSkill = async ({
  name,
  category,
  description,
}) => {
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

  return result.insertId;
};


// =========================
// ADD USER SKILL
// =========================
const addUserSkill = async ({
  userId,
  skillId,
  type,
  level,
}) => {
  const skillLevel = level || "BEGINNER";

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
    VALUES (?, ?, ?, ?, FALSE)
    `,
    [
      userId,
      skillId,
      type,
      skillLevel,
    ]
  );

  return result.insertId;
};


// =========================
// FIND USER SKILLS
// =========================
const findUserSkills = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      us.id,
      us.user_id,
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

  return rows;
};


// =========================
// FIND USER SKILL
// =========================
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
      AND us.skill_id = ?
      AND us.type = ?
    `,
    [
      userId,
      skillId,
      type,
    ]
  );

  return rows[0] || null;
};


// =========================
// DELETE USER SKILL
// =========================
const deleteUserSkill = async (
  userId,
  skillId,
  type
) => {
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

  return result.affectedRows > 0;
};


// =========================
// UPDATE USER SKILL
// =========================
const updateUserSkill = async (
  userId,
  skillId,
  type,
  level
) => {
  const [result] = await pool.query(
    `
    UPDATE user_skills
    SET level = ?
    WHERE user_id = ?
      AND skill_id = ?
      AND type = ?
    `,
    [
      level,
      userId,
      skillId,
      type,
    ]
  );

  return result.affectedRows > 0;
};


// =========================
// EXPORT
// =========================
module.exports = {
  findAllSkills,
  findSkillById,
  findSkillByName,
  createSkill,
  addUserSkill,
  findUserSkills,
  findUserSkill,
  deleteUserSkill,
  updateUserSkill,
};