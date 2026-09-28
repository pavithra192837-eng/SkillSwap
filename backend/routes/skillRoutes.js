const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getSkills,
  getSkillById,
  createSkill,
  addUserSkill,
  deleteUserSkill,
  getUserSkills,
} = require("../controllers/skillController");

// =========================
// GET ALL SKILLS
// GET /api/skills
// =========================
router.get("/", getSkills);

// =========================
// CREATE NEW SKILL
// POST /api/skills
// =========================
router.post(
  "/",
  authMiddleware,
  createSkill
);

// =========================
// ADD SKILL TO MY PROFILE
// POST /api/skills/user
// =========================
router.post(
  "/user",
  authMiddleware,
  addUserSkill
);

// =========================
// GET MY SKILLS
// GET /api/skills/user/me
// =========================
router.get(
  "/user/me",
  authMiddleware,
  getUserSkills
);

// =========================
// DELETE SKILL FROM MY PROFILE
// DELETE /api/skills/user/:skillId
// =========================
router.delete(
  "/user/:skillId",
  authMiddleware,
  deleteUserSkill
);

// =========================
// GET SKILL BY ID
// GET /api/skills/:id
// =========================
router.get(
  "/:id",
  getSkillById
);

module.exports = router;