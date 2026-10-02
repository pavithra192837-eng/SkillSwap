
const mysql = require("mysql2/promise");
require("dotenv").config();

const initializeDatabase = async () => {
  let connection;

  try {
    // ========================================
    // DATABASE CONFIGURATION
    // ========================================
    const dbName =
      process.env.DB_NAME || "skillswap";

    // Database names cannot be passed as
    // prepared-statement parameters, so make
    // sure the configured name is a safe SQL
    // identifier before using it.
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(
        "Invalid DB_NAME. Use only letters, numbers and underscores."
      );
    }

    // ========================================
    // CONNECT TO MYSQL SERVER
    // ========================================
    connection = await mysql.createConnection({
      host:
        process.env.DB_HOST || "localhost",

      user:
        process.env.DB_USER || "root",

      password:
        process.env.DB_PASSWORD || "",

      port:
        Number(process.env.DB_PORT) || 3306,
    });

    console.log(
      "🔌 Connected to MySQL server"
    );

    // ========================================
    // CREATE DATABASE
    // ========================================
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
    );

    console.log(
      `✅ Database '${dbName}' is ready`
    );

    // ========================================
    // SELECT DATABASE
    // ========================================
    await connection.query(
      `USE \`${dbName}\``
    );

    // ========================================
    // 1. SKILL CATEGORIES
    // ========================================
    //
    // This table is optional in the original
    // specification, but skills.category_id
    // depends on it.
    //
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skill_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(100) NOT NULL UNIQUE,

        description TEXT
      )
    `);

    console.log(
      "✅ skill_categories table ready"
    );

    // ========================================
    // 2. USERS
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(100) NOT NULL,

        email VARCHAR(150) NOT NULL UNIQUE,

        phone VARCHAR(20),

        college VARCHAR(150),

        roll_no VARCHAR(50) NOT NULL UNIQUE,

        department VARCHAR(100),

        password_hash VARCHAR(255) NOT NULL,

        bio TEXT,

        profile_image VARCHAR(500),

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log(
      "✅ users table ready"
    );

    // ========================================
    // 3. SKILLS
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(100) NOT NULL UNIQUE,

        category_id INT NULL,

        description TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (category_id)
          REFERENCES skill_categories(id)
          ON DELETE SET NULL
      )
    `);

    console.log(
      "✅ skills table ready"
    );

    // ========================================
    // 4. USER SKILLS
    // ========================================
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
          'ADVANCED'
        ) NOT NULL DEFAULT 'BEGINNER',

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE,

        UNIQUE (
          user_id,
          skill_id,
          type
        )
      )
    `);

    console.log(
      "✅ user_skills table ready"
    );

    // ========================================
    // 4A. DEFAULT SKILL CATALOG
    // ========================================
    const defaultCategories = [
      ["Programming", "Programming languages and fundamentals"],
      ["Web Development", "Frontend and web technologies"],
      ["Database", "Data storage and SQL"],
      ["Design", "UI/UX and visual design"],
      ["Data & AI", "Data science and artificial intelligence"],
      ["Communication", "Communication and presentation skills"],
      ["Tools", "Developer and collaboration tools"]
    ];
    for (const [name, description] of defaultCategories) {
      await connection.query(
        `INSERT INTO skill_categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [name, description]
      );
    }

    const defaultSkills = [
      ["C", "Programming"], ["C++", "Programming"], ["Java", "Programming"],
      ["Python", "Programming"], ["JavaScript", "Programming"], ["TypeScript", "Programming"],
      ["React", "Web Development"], ["Node.js", "Web Development"], ["HTML", "Web Development"],
      ["CSS", "Web Development"], ["SQL", "Database"], ["MongoDB", "Database"],
      ["UI/UX Design", "Design"], ["Figma", "Design"], ["Graphic Design", "Design"],
      ["Data Structures", "Programming"], ["Machine Learning", "Data & AI"],
      ["Data Science", "Data & AI"], ["Git & GitHub", "Tools"], ["Flutter", "Web Development"],
      ["Android Development", "Programming"], ["Communication", "Communication"],
      ["Public Speaking", "Communication"]
    ];
    for (const [name, category] of defaultSkills) {
      await connection.query(
        `INSERT INTO skills (name, category_id, description) VALUES (?, (SELECT id FROM skill_categories WHERE name = ?), ?) ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)`,
        [name, category, `${name} skill`]
      );
    }

    console.log("✅ default skill catalog ready");

    // ========================================
    // 5. EXCHANGE REQUESTS
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exchange_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,

        sender_id INT NOT NULL,

        receiver_id INT NOT NULL,

        offered_skill_id INT NOT NULL,

        requested_skill_id INT NOT NULL,

        message TEXT,

        status ENUM(
          'PENDING',
          'ACCEPTED',
          'REJECTED',
          'CANCELLED'
        ) NOT NULL DEFAULT 'PENDING',

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (sender_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (receiver_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (offered_skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE,

        FOREIGN KEY (requested_skill_id)
          REFERENCES skills(id)
          ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ exchange_requests table ready"
    );

    // ========================================
    // 6. SESSIONS
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,

        request_id INT NOT NULL,

        user1_id INT NOT NULL,

        user2_id INT NOT NULL,

        scheduled_at DATETIME NOT NULL,

        status ENUM(
          'SCHEDULED',
          'ONGOING',
          'COMPLETED',
          'CANCELLED'
        ) NOT NULL DEFAULT 'SCHEDULED',

        meeting_id VARCHAR(255),

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (request_id)
          REFERENCES exchange_requests(id)
          ON DELETE CASCADE,

        FOREIGN KEY (user1_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (user2_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ sessions table ready"
    );

    // ========================================
    // 6A. LEARNING PROGRESS
    // One row represents one direction of an exchange:
    // the learner is taught a skill by the teacher.
    // A learner must complete the session and then
    // explicitly confirm the skill before adding it
    // to their profile.
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        learner_id INT NOT NULL,
        teacher_id INT NOT NULL,
        skill_id INT NOT NULL,
        status ENUM('IN_PROGRESS','COMPLETED','ADDED_TO_PROFILE') NOT NULL DEFAULT 'IN_PROGRESS',
        completed_at DATETIME NULL,
        added_to_profile_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE (session_id, learner_id, skill_id)
      )
    `);

    console.log("✅ learning_progress table ready");

    // ========================================
    // 7. NOTIFICATIONS
    // ========================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT NOT NULL,

        type VARCHAR(50) NOT NULL,

        title VARCHAR(255) NOT NULL,

        message TEXT NOT NULL,

        reference_id INT NULL,

        is_read BOOLEAN
          NOT NULL DEFAULT FALSE,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ notifications table ready"
    );

    // ========================================
    // 8. RATINGS
    // ========================================
    //
    // Ratings are optional in the original
    // database specification, but your current
    // ratingController uses this table.
    //
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,

        session_id INT NOT NULL,

        reviewer_id INT NOT NULL,

        reviewee_id INT NOT NULL,

        rating INT NOT NULL,

        review TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (session_id)
          REFERENCES sessions(id)
          ON DELETE CASCADE,

        FOREIGN KEY (reviewer_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (reviewee_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CHECK (
          rating >= 1
          AND rating <= 5
        )
      )
    `);

    console.log(
      "✅ ratings table ready"
    );

    // ========================================
    // DATABASE INITIALIZATION COMPLETE
    // ========================================
    console.log(
      "\n========================================"
    );

    console.log(
      "✅ SkillSwap database initialized successfully"
    );

    console.log(
      "========================================\n"
    );
  } catch (error) {
    console.error(
      "\n❌ Database initialization failed:"
    );

    console.error(error.message);

    throw error;
  } finally {
    if (connection) {
      await connection.end();

      console.log(
        "🔌 MySQL connection closed"
      );
    }
  }
};

module.exports = initializeDatabase;

