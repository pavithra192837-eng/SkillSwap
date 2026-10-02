
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection, pool } = require("./config/db");
const initializeDatabase = require("./database/initDatabase");

// =========================
// ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const learningRoutes = require("./routes/learningRoutes");

// =========================
// APP
// =========================
const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillSwap Backend API is running 🚀",
  });
});

// =========================
// API TEST
// =========================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

// =========================
// DATABASE TEST
// =========================
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS result"
    );

    res.json({
      success: true,
      message: "Database connection is working",
      data: rows,
    });
  } catch (error) {
    console.error(
      "Database query error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database query failed",
      error: error.message,
    });
  }
});

// =========================
// API ROUTES
// =========================
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/skills",
  skillRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

app.use(
  "/api/requests",
  requestRoutes
);

app.use(
  "/api/sessions",
  sessionRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/ratings",
  ratingRoutes
);

app.use(
  "/api/learning",
  learningRoutes
);

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error(
    "Server error:",
    err
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(
        `🚀 SkillSwap server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
}

startServer();
