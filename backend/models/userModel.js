const { pool } = require("../config/db");

// =========================
// FIND USER BY ID
// =========================
const findUserById = async (userId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        bio,
        profile_image,
        location,
        availability,
        created_at
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Find user by ID error:", error);
    throw error;
  }
};

// =========================
// FIND USER BY EMAIL
// =========================
const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password,
        bio,
        profile_image,
        location,
        availability,
        created_at
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Find user by email error:", error);
    throw error;
  }
};

// =========================
// CREATE USER
// =========================
const createUser = async ({
  name,
  email,
  password,
  bio,
  profileImage,
  location,
  availability,
}) => {
  try {
    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        bio,
        profile_image,
        location,
        availability
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        password,
        bio || null,
        profileImage || null,
        location || null,
        availability || null,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

// =========================
// UPDATE USER
// =========================
const updateUser = async (userId, updates) => {
  try {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }

    if (updates.bio !== undefined) {
      fields.push("bio = ?");
      values.push(updates.bio);
    }

    if (updates.profileImage !== undefined) {
      fields.push("profile_image = ?");
      values.push(updates.profileImage);
    }

    if (updates.location !== undefined) {
      fields.push("location = ?");
      values.push(updates.location);
    }

    if (updates.availability !== undefined) {
      fields.push("availability = ?");
      values.push(updates.availability);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(userId);

    const [result] = await pool.query(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

// =========================
// GET ALL USERS
// =========================
const findAllUsers = async (currentUserId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        bio,
        profile_image,
        location,
        availability,
        created_at
      FROM users
      WHERE id != ?
      ORDER BY created_at DESC
      `,
      [currentUserId]
    );

    return rows;
  } catch (error) {
    console.error("Find all users error:", error);
    throw error;
  }
};

// =========================
// DELETE USER
// =========================
const deleteUser = async (userId) => {
  try {
    const [result] = await pool.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [userId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  findAllUsers,
  deleteUser,
};