const { pool } = require("../config/db");

// =========================
// GET USER BY ID
// =========================
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.query(
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

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Get user's skills
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
        us.verified
      FROM user_skills us
      JOIN skills s
        ON us.skill_id = s.id
      WHERE us.user_id = ?
      ORDER BY s.name ASC
      `,
      [userId]
    );

    const teachSkills = skills.filter(
      (skill) => skill.type === "TEACH"
    );

    const learnSkills = skills.filter(
      (skill) => skill.type === "LEARN"
    );

    // Temporary reputation values
    const reputation = {
      points: 0,
      rating: 0,
      completed_sessions: 0,
    };

    res.status(200).json({
      success: true,
      user: {
        ...user,
        teachSkills,
        learnSkills,
        reputation,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// =========================
// UPDATE MY PROFILE
// =========================
const updateUser = async (req, res) => {
  try {
    // User ID comes from JWT
    const userId = req.user.id;

    const {
      name,
      bio,
      profile_image,
      location,
      availability,
    } = req.body;

    const updates = [];
    const values = [];

    // Name
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    // Bio
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }

    // Profile image
    if (profile_image !== undefined) {
      updates.push("profile_image = ?");
      values.push(profile_image);
    }

    // Location
    if (location !== undefined) {
      updates.push("location = ?");
      values.push(location);
    }

    // Availability
    if (availability !== undefined) {
      updates.push("availability = ?");
      values.push(availability);
    }

    // Nothing to update
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    // Add user ID for WHERE clause
    values.push(userId);

    await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );

    // Get updated user
    const [users] = await pool.query(
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

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// =========================
// GET ALL USERS
// =========================
const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const [users] = await pool.query(
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

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

// =========================
// GET MY PROFILE
// =========================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
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
    console.error("Get my profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  getUserById,
  updateUser,
  getUsers,
  getMyProfile,
};