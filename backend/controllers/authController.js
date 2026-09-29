
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const { pool } = require("../config/db");

// ========================================
// REGISTER
// POST /api/auth/register
// ========================================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      college,
      roll_no,
      department,
      password,
      bio,
      profile_image,
    } = req.body;

    // ------------------------------------
    // Validate required fields
    // ------------------------------------
    if (
      !name ||
      !email ||
      !phone ||
      !college ||
      !roll_no ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, college, roll number, department and password are required",
      });
    }

    // ------------------------------------
    // Check whether email already exists
    // ------------------------------------
    const [existingEmail] = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = ?
      `,
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // ------------------------------------
    // Check whether roll number exists
    // ------------------------------------
    const [existingRollNo] =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE roll_no = ?
        `,
        [roll_no]
      );

    if (existingRollNo.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "User with this roll number already exists",
      });
    }

    // ------------------------------------
    // Hash password
    // ------------------------------------
    const passwordHash =
      await bcrypt.hash(password, 10);

    // ------------------------------------
    // Insert user
    // ------------------------------------
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
        passwordHash,
        bio || null,
        profile_image || null,
      ]
    );

    // ------------------------------------
    // Generate JWT
    // ------------------------------------
    const token = generateToken(
      result.insertId
    );

    // ------------------------------------
    // Response
    // Never send password_hash
    // ------------------------------------
    return res.status(201).json({
      success: true,
      message: "Registration successful",

      token,

      user: {
        id: result.insertId,
        name,
        email,
        phone,
        college,
        roll_no,
        department,
        bio: bio || null,
        profile_image:
          profile_image || null,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================
const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ------------------------------------
    // Validate input
    // ------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // ------------------------------------
    // Find user by email
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
          password_hash,
          bio,
          profile_image,
          created_at,
          updated_at
        FROM users
        WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const user = users[0];

    // ------------------------------------
    // Compare password
    // ------------------------------------
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ------------------------------------
    // Generate JWT
    // ------------------------------------
    const token = generateToken(
      user.id
    );

    // ------------------------------------
    // Response
    // Never send password_hash
    // ------------------------------------
    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        roll_no: user.roll_no,
        department: user.department,
        bio: user.bio,
        profile_image:
          user.profile_image,
        created_at:
          user.created_at,
        updated_at:
          user.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ========================================
// GET CURRENT USER
// GET /api/auth/me
// ========================================
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // ------------------------------------
    // Find current user
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
          profile_image,
          created_at,
          updated_at
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

    const user = users[0];

    // ------------------------------------
    // Response
    // ------------------------------------
    return res.status(200).json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        roll_no: user.roll_no,
        department: user.department,
        bio: user.bio,
        profile_image:
          user.profile_image,
        created_at:
          user.created_at,
        updated_at:
          user.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get current user",
    });
  }
};

// ========================================
// LOGOUT
// POST /api/auth/logout
// ========================================
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================
module.exports = {
  register,
  login,
  getMe,
  logout,
};

