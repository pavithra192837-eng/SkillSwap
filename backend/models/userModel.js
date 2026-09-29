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
        phone,
        college,
        register_no,
        department,
        bio,
        profile_image,
        location,
        availability,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    return rows[0] || null;

  } catch (error) {
    console.error(
      "Find user by ID error:",
      error
    );

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
        phone,
        college,
        register_no,
        department,
        password,
        bio,
        profile_image,
        location,
        availability,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    return rows[0] || null;

  } catch (error) {
    console.error(
      "Find user by email error:",
      error
    );

    throw error;
  }
};


// =========================
// CREATE USER
// =========================
const createUser = async ({
  name,
  email,
  phone,
  college,
  registerNo,
  department,
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
        phone,
        college,
        register_no,
        department,
        password,
        bio,
        profile_image,
        location,
        availability
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        phone,
        college,
        registerNo,
        department,
        password,
        bio || null,
        profileImage || null,
        location || null,
        availability || null,
      ]
    );

    return result.insertId;

  } catch (error) {
    console.error(
      "Create user error:",
      error
    );

    throw error;
  }
};


// =========================
// UPDATE USER
// =========================
const updateUser = async (
  userId,
  updates
) => {
  try {
    const fields = [];
    const values = [];

    // Name
    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }

    // Phone
    if (updates.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updates.phone);
    }

    // College
    if (updates.college !== undefined) {
      fields.push("college = ?");
      values.push(updates.college);
    }

    // Register number
    if (updates.registerNo !== undefined) {
      fields.push("register_no = ?");
      values.push(updates.registerNo);
    }

    // Department
    if (updates.department !== undefined) {
      fields.push("department = ?");
      values.push(updates.department);
    }

    // Bio
    if (updates.bio !== undefined) {
      fields.push("bio = ?");
      values.push(updates.bio);
    }

    // Profile image
    if (updates.profileImage !== undefined) {
      fields.push("profile_image = ?");
      values.push(updates.profileImage);
    }

    // Location
    if (updates.location !== undefined) {
      fields.push("location = ?");
      values.push(updates.location);
    }

    // Availability
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
    console.error(
      "Update user error:",
      error
    );

    throw error;
  }
};


// =========================
// GET ALL USERS
// =========================
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
        register_no,
        department,
        bio,
        profile_image,
        location,
        availability,
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
      error
    );

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
    console.error(
      "Delete user error:",
      error
    );

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