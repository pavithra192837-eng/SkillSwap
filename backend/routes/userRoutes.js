
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUserById,
  updateUser,
  getUsers,
  getMyProfile,
  searchUsers,
} = require("../controllers/userController");

const {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
} = require("../controllers/skillController");

const {
  getUserRatings,
} = require("../controllers/ratingController");

// ========================================
// SEARCH USERS
// GET /api/users/search?q=
// ========================================
router.get(
  "/search",
  authMiddleware,
  searchUsers
);

// ========================================
// GET MY PROFILE
// GET /api/users/me
// ========================================
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

// ========================================
// UPDATE MY PROFILE
// PUT /api/users/me
// ========================================
router.put(
  "/me",
  authMiddleware,
  updateUser
);

// ========================================
// GET MY SKILLS
// GET /api/users/me/skills
// ========================================
router.get(
  "/me/skills",
  authMiddleware,
  getUserSkills
);

// ========================================
// ADD SKILL TO MY PROFILE
// POST /api/users/me/skills
// ========================================
router.post(
  "/me/skills",
  authMiddleware,
  addUserSkill
);

// ========================================
// UPDATE MY SKILL
// PUT /api/users/me/skills/:id
// ========================================
router.put(
  "/me/skills/:id",
  authMiddleware,
  updateUserSkill
);

// ========================================
// DELETE SKILL FROM MY PROFILE
// DELETE /api/users/me/skills/:id
// ========================================
router.delete(
  "/me/skills/:id",
  authMiddleware,
  deleteUserSkill
);

// ========================================
// GET USER RATINGS
// GET /api/users/:id/ratings
// ========================================
router.get(
  "/:id/ratings",
  authMiddleware,
  getUserRatings
);

// ========================================
// GET USER BY ID
// GET /api/users/:id
// ========================================
router.get(
  "/:id",
  authMiddleware,
  getUserById
);

// ========================================
// GET ALL USERS
// GET /api/users
// ========================================
router.get(
  "/",
  authMiddleware,
  getUsers
);

module.exports = router;
