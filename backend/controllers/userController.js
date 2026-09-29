
const { pool } = require("../config/db");

// ========================================
// GET USER BY ID
// GET /api/users/:id
// ========================================
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // ------------------------------------
    // Get user
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
    // Get user's skills
    // ------------------------------------
    const [skills] = await pool.query(
      `
      SELECT
        us.id,
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

    const teachSkills = skills.filter(
      (skill) => skill.type === "TEACH"
    );

    const learnSkills = skills.filter(
      (skill) => skill.type === "LEARN"
    );

    // ------------------------------------
    // Get rating information
    // ------------------------------------
    let reputation = {
      points: 0,
      rating: 0,
      completed_sessions: 0,
    };

    try {
      const [ratingData] =
        await pool.query(
          `
          SELECT
            COUNT(*) AS total_ratings,
            COALESCE(
              ROUND(AVG(rating), 2),
              0
            ) AS average_rating
          FROM ratings
          WHERE reviewee_id = ?
          `,
          [userId]
        );

      const [completedData] =
        await pool.query(
          `
          SELECT COUNT(*) AS completed_sessions
          FROM sessions
          WHERE status = 'COMPLETED'
            AND (
              user1_id = ?
              OR user2_id = ?
            )
          `,
          [
            userId,
            userId,
          ]
        );

      reputation = {
        points: 0,
        rating:
          Number(
            ratingData[0]
              ?.average_rating
          ) || 0,
        completed_sessions:
          Number(
            completedData[0]
              ?.completed_sessions
          ) || 0,
      };
    } catch (ratingError) {
      // Ratings are an optional part of the
      // database specification. If the ratings
      // table has not been created yet, keep
      // the default reputation object.
      console.warn(
        "Rating information unavailable:",
        ratingError.message
      );
    }

    return res.status(200).json({
      success: true,

      user: {
        ...user,

        teachSkills,
        learnSkills,

        reputation,
      },
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// ========================================
// GET MY PROFILE
// GET /api/users/me
// ========================================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

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

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error(
      "Get my profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

// ========================================
// UPDATE MY PROFILE
// PUT /api/users/me
// ========================================
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      college,
      roll_no,
      department,
      bio,
      profile_image,
    } = req.body;

    const updates = [];
    const values = [];

    // ------------------------------------
    // Name
    // ------------------------------------
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      updates.push("name = ?");
      values.push(
        String(name).trim()
      );
    }

    // ------------------------------------
    // Phone
    // ------------------------------------
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone || null);
    }

    // ------------------------------------
    // College
    // ------------------------------------
    if (college !== undefined) {
      updates.push("college = ?");
      values.push(college || null);
    }

    // ------------------------------------
    // Roll number
    // ------------------------------------
    if (roll_no !== undefined) {
      if (!String(roll_no).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Roll number cannot be empty",
        });
      }

      // Check duplicate roll number
      const [existingRollNo] =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE roll_no = ?
            AND id != ?
          `,
          [
            String(roll_no).trim(),
            userId,
          ]
        );

      if (existingRollNo.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "This roll number is already in use",
        });
      }

      updates.push("roll_no = ?");
      values.push(
        String(roll_no).trim()
      );
    }

    // ------------------------------------
    // Department
    // ------------------------------------
    if (department !== undefined) {
      updates.push("department = ?");
      values.push(
        department || null
      );
    }

    // ------------------------------------
    // Bio
    // ------------------------------------
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio || null);
    }

    // ------------------------------------
    // Profile image
    // ------------------------------------
    if (
      profile_image !== undefined
    ) {
      updates.push(
        "profile_image = ?"
      );
      values.push(
        profile_image || null
      );
    }

    // ------------------------------------
    // No fields
    // ------------------------------------
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No fields to update",
      });
    }

    values.push(userId);

    // ------------------------------------
    // Update user
    // ------------------------------------
    await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );

    // ------------------------------------
    // Get updated profile
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

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error(
      "Update user error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update profile",
    });
  }
};

// ========================================
// GET ALL USERS
// GET /api/users
//
// Useful for development/admin/user listing.
// The provided API specification does not
// explicitly list this endpoint.
// ========================================
const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

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
        created_at
      FROM users
      WHERE id != ?
      ORDER BY created_at DESC
      `,
      [currentUserId]
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get users error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get users",
    });
  }
};

// ========================================
// SEARCH USERS
// GET /api/users/search?q=javascript
// ========================================
const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const query = (
      req.query.q || ""
    ).trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message:
          "Search query is required",
      });
    }

    const searchTerm = `%${query}%`;

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
        created_at
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
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ]
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Search users error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to search users",
    });
  }
};

module.exports = {
  getUserById,
  getMyProfile,
  updateUser,
  getUsers,
  searchUsers,
};

