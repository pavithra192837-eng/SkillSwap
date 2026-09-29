const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// REGISTER
// POST /api/auth/register
// =========================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      college,
      register_no,
      department,
      password,
      bio,
      location,
      availability,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !college ||
      !register_no ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, college, register number, department and password are required",
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users
       (
         name,
         email,
         phone,
         college,
         register_no,
         department,
         password,
         bio,
         location,
         availability
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        college,
        register_no,
        department,
        hashedPassword,
        bio || null,
        location || null,
        availability || null,
      ]
    );

    // Generate token
    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        college,
        register_no,
        department,
        bio: bio || null,
        location: location || null,
        availability: availability || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// =========================
// LOGIN
// POST /api/auth/login
// =========================
const login = async (req, res) => {
  try {
    // LOGIN ONLY NEEDS EMAIL + PASSWORD
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        register_no: user.register_no,
        department: user.department,
        bio: user.bio,
        profile_image: user.profile_image,
        location: user.location,
        availability: user.availability,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// =========================
// GET CURRENT USER
// GET /api/auth/me
// =========================
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT
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
        created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};