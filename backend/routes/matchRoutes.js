const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMatches,
  getMatchById,
} = require("../controllers/matchController");

// =========================
// GET ALL MATCHES
// =========================
router.get("/", authMiddleware, getMatches);

// =========================
// GET MATCH BY USER ID
// =========================
router.get("/:id", authMiddleware, getMatchById);

module.exports = router;