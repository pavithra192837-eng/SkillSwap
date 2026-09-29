const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMatches,
  getMatchById,
} = require("../controllers/matchController");


// =========================
// GET ALL MATCHES
// GET /api/matches
// =========================
router.get(
  "/",
  authMiddleware,
  getMatches
);


// =========================
// GET MATCH BY USER ID
// GET /api/matches/:id
// =========================
router.get(
  "/:id",
  authMiddleware,
  getMatchById
);


module.exports = router;