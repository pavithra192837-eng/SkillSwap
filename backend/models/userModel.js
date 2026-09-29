
const { pool } = require("../config/db");

// ========================================
// FIND USER BY ID
// ========================================
const findUserById = async (userId) => {
  try {
    const [rows] = await pool.query(
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
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  } catch (error) {
    console.error(
      "Find user by ID error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// FIND USER BY EMAIL
// ========================================
//
// password_hash is included because this
// function can be used during authentication.
//
const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          phone,
          college,
          roll_no,
          department,
          password_hash,
          bio,
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  } catch (error) {
    console.error(
      "Find user by email error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// FIND USER BY ROLL NUMBER
// ========================================
const findUserByRollNo = async (
  rollNo
) => {
  try {
    const [rows] = await pool.query(
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
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE roll_no = ?
        LIMIT 1
      `,
      [rollNo]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  } catch (error) {
    console.error(
      "Find user by roll number error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// CREATE USER
// ========================================
const createUser = async ({
  name,
  email,
  phone,
  college,
  roll_no,
  department,
  password_hash,
  bio = null,
  profile_image = null,
}) => {
  try {
    const [result] = await pool.query(
      `
        INSERT INTO users
        (
          name,
          email,
          phone,
          college,
          roll_no,
          department,
          password_hash,
          bio,
          profile_image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        phone,
        college,
        roll_no,
        department,
        password_hash,
        bio,
        profile_image,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error(
      "Create user error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// UPDATE USER
// ========================================
const updateUser = async (
  userId,
  updates
) => {
  try {
    const fields = [];
    const values = [];

    // ------------------------------------
    // Name
    // ------------------------------------
    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }

    // ------------------------------------
    // Phone
    // ------------------------------------
    if (updates.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updates.phone);
    }

    // ------------------------------------
    // College
    // ------------------------------------
    if (updates.college !== undefined) {
      fields.push("college = ?");
      values.push(updates.college);
    }

    // ------------------------------------
    // Roll number
    // ------------------------------------
    if (updates.roll_no !== undefined) {
      fields.push("roll_no = ?");
      values.push(updates.roll_no);
    }

    // ------------------------------------
    // Department
    // ------------------------------------
    if (
      updates.department !== undefined
    ) {
      fields.push("department = ?");
      values.push(updates.department);
    }

    // ------------------------------------
    // Bio
    // ------------------------------------
    if (updates.bio !== undefined) {
      fields.push("bio = ?");
      values.push(updates.bio);
    }

    // ------------------------------------
    // Profile image
    // ------------------------------------
    if (
      updates.profile_image !== undefined
    ) {
      fields.push("profile_image = ?");
      values.push(
        updates.profile_image
      );
    }

    // ------------------------------------
    // Nothing to update
    // ------------------------------------
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
    console.error(
      "Update user error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// GET ALL USERS
// ========================================
const findAllUsers = async (
  currentUserId
) => {
  try {
    const [rows] = await pool.query(
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
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE id != ?
        ORDER BY created_at DESC
      `,
      [currentUserId]
    );

    return rows;
  } catch (error) {
    console.error(
      "Find all users error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// SEARCH USERS
// ========================================
const searchUsers = async (
  currentUserId,
  searchTerm
) => {
  try {
    const term = `%${searchTerm}%`;

    const [rows] = await pool.query(
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
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE id != ?
          AND (
            name LIKE ?
            OR email LIKE ?
            OR roll_no LIKE ?
            OR college LIKE ?
            OR department LIKE ?
          )
        ORDER BY name ASC
      `,
      [
        currentUserId,
        term,
        term,
        term,
        term,
        term,
      ]
    );

    return rows;
  } catch (error) {
    console.error(
      "Search users error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// DELETE USER
// ========================================
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
    console.error(
      "Delete user error:",
      error.message
    );

    throw error;
  }
};

// ========================================
// EXPORT
// ========================================
module.exports = {
  findUserById,
  findUserByEmail,
  findUserByRollNo,
  createUser,
  updateUser,
  findAllUsers,
  searchUsers,
  deleteUser,
};

