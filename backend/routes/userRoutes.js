const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUserById,
  updateUser,
  getUsers,
  getMyProfile,
} = require("../controllers/userController");

// GET ALL USERS
router.get("/", authMiddleware, getUsers);

// GET MY PROFILE
router.get("/me", authMiddleware, getMyProfile);

// UPDATE MY PROFILE
router.put("/me", authMiddleware, updateUser);

// GET USER BY ID
router.get("/:id", authMiddleware, getUserById);

module.exports = router;