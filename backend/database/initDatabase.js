const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
  let connection;

  try {
    // =========================
    // CONNECT TO MYSQL
    // =========================
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });

    // =========================
    // CREATE DATABASE
    // =========================
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
    `);

    await connection.query(`
      USE \`${process.env.DB_NAME}\`
    `);

    // =========================
    // USERS
    // =========================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,

        phone VARCHAR(20),
        college VARCHAR(150),
        register_no VARCHAR(50),
        department VARCHAR(100),

        bio TEXT,
        profile_image VARCHAR(500),
        location VARCHAR(255),
        availability VARCHAR(255),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // ADD NEW USER COLUMNS
    // TO EXISTING DATABASE
    // =========================

    const [userColumns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);

    const existingColumns = userColumns.map(
      (column) => column.Field
    );

    if (!existingColumns.includes("phone")) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN phone VARCHAR(20)
      `);

      console.log("✅ Added phone column");
    }

    if (!existingColumns.includes("college")) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN college VARCHAR(150)
      `);

      console.log("✅ Added college column");
    }

    if (!existingColumns.includes("register_no")) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN register_no VARCHAR(50)
      `);

      console.log("✅ Added register_no column");
    }

    if (!existingColumns.includes("department")) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN department VARCHAR(100)
      `);

      console.log("✅ Added department column");
    }

    // =========================
    // SKILLS
    // =========================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100),
        description TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // USER SKILLS
    // =========================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT NOT NULL,
        skill_id INT NOT NULL,

        type ENUM(
          'TEACH',
          'LEARN'
        ) NOT NULL,

        level ENUM(
          'BEGINNER',
          'INTERMEDIATE',
          'ADVANCED',
          'EXPERT'
        ) DEFAULT 'BEGINNER',

        verified BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE,

        UNIQUE (user_id, skill_id, type)
      )
    `);

    // =========================
    // EXCHANGE REQUESTS
    // =========================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exchange_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,

        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,

        sender_skill_id INT NOT NULL,
        receiver_skill_id INT NOT NULL,

        message TEXT,

        status ENUM(
          'pending',
          'accepted',
          'rejected',
          'cancelled'
        ) DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (sender_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (receiver_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (sender_skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE,

        FOREIGN KEY (receiver_skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE
      )
    `);

    // =========================
    // SESSIONS
    // =========================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,

        request_id INT NOT NULL,

        host_id INT NOT NULL,
        participant_id INT NOT NULL,

        scheduled_at DATETIME NOT NULL,

        status ENUM(
          'scheduled',
          'ongoing',
          'completed',
          'cancelled'
        ) DEFAULT 'scheduled',

        meeting_link VARCHAR(500),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (request_id)
          REFERENCES exchange_requests(id)
          ON DELETE CASCADE,

        FOREIGN KEY (host_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (participant_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ Database and tables initialized successfully."
    );

  } catch (error) {
    console.error(
      "❌ Database initialization failed:"
    );

    console.error(error.message);

    throw error;

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initializeDatabase;