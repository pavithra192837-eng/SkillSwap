const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUserById,
  updateUser,
  getUsers,
  getMyProfile,
} = require("../controllers/userController");


// =========================
// GET ALL USERS
// GET /api/users
// =========================
router.get(
  "/",
  authMiddleware,
  getUsers
);


// =========================
// GET MY PROFILE
// GET /api/users/me
// =========================
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);


// =========================
// UPDATE MY PROFILE
// PUT /api/users/me
// =========================
router.put(
  "/me",
  authMiddleware,
  updateUser
);


// =========================
// GET USER BY ID
// GET /api/users/:id
// =========================
router.get(
  "/:id",
  authMiddleware,
  getUserById
);


module.exports = router;