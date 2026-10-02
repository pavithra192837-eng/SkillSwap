 id="k3r7xp"
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getSkills,
  getSkillById,
  createSkill,
} = require("../controllers/skillController");

// ========================================
// GET ALL SKILLS
// GET /api/skills
// ========================================
router.get(
  "/",
  getSkills
);

// ========================================
// CREATE NEW SKILL
// POST /api/skills
// ========================================
router.post(
  "/",
  authMiddleware,
  createSkill
);

// ========================================
// GET SKILL BY ID
// GET /api/skills/:id
// ========================================
router.get(
  "/:id",
  getSkillById
);

module.exports = router;

