const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getMyLearningProgress, completeLearning, addCompletedSkillToProfile } = require("../controllers/learningController");
const router = express.Router();
router.get("/", authMiddleware, getMyLearningProgress);
router.put("/:id/complete", authMiddleware, completeLearning);
router.post("/:id/add-to-profile", authMiddleware, addCompletedSkillToProfile);
module.exports = router;
