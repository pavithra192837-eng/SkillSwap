
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
const connectionRoutes = require("./routes/connectionRoutes");

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

app.use(
  "/api/connections",
  connectionRoutes
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

    // Automatically complete live sessions when their configured duration expires.
    // This keeps both participants synchronized even if one browser is closed.
    const expireSessions = async () => {
      let connection;
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [expired] = await connection.query(`
          SELECT id, user1_id, user2_id
          FROM sessions
          WHERE status = 'ONGOING'
            AND started_at IS NOT NULL
            AND DATE_ADD(started_at, INTERVAL duration_minutes MINUTE) <= NOW()
          FOR UPDATE
        `);
        if (expired.length) {
          const ids = expired.map((row) => row.id);
          await connection.query(`
            UPDATE sessions
            SET status = 'COMPLETED', ended_at = NOW(), end_reason = 'TIME_EXPIRED'
            WHERE id IN (${ids.map(() => '?').join(',')})
          `, ids);
          await connection.query(`
            UPDATE learning_progress
            SET status = 'COMPLETED', completed_at = COALESCE(completed_at, NOW())
            WHERE session_id IN (${ids.map(() => '?').join(',')}) AND status = 'IN_PROGRESS'
          `, ids);
          const notificationValues = [];
          for (const session of expired) {
            notificationValues.push(session.user1_id, 'SESSION_COMPLETED', 'Session time is up', 'Your SkillSwap session ended automatically when its duration expired.', session.id);
            notificationValues.push(session.user2_id, 'SESSION_COMPLETED', 'Session time is up', 'Your SkillSwap session ended automatically when its duration expired.', session.id);
          }
          await connection.query(`
            INSERT INTO notifications (user_id, type, title, message, reference_id, is_read)
            VALUES ${expired.map(() => '(?, ?, ?, ?, ?, FALSE), (?, ?, ?, ?, ?, FALSE)').join(',')}
          `, notificationValues);
        }
        await connection.commit();
      } catch (error) {
        if (connection) await connection.rollback();
        console.error('Session expiry check failed:', error.message);
      } finally {
        connection?.release();
      }
    };
    await expireSessions();
    setInterval(expireSessions, 15000);

    // Start server
    app.listen(PORT, () => {
      console.log(
        `🚀 SkillSwap server running on http://localhost:${PORT}`
      );
      console.log('⏱️ Session auto-expiry monitor enabled');
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
