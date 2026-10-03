 id="m8q3vk"
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createRating,
} = require("../controllers/ratingController");

// ========================================
// CREATE RATING
// POST /api/ratings
// ========================================
router.post(
  "/",
  authMiddleware,
  createRating
);

module.exports = router;
