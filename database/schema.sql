
-- ============================================
-- SkillSwap Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS skillswap;

USE skillswap;


-- ============================================
-- 1. SKILL CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS skill_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 2. USERS
-- ============================================

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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================
-- 3. SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    category_id INT,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES skill_categories(id)
        ON DELETE SET NULL
);


-- ============================================
-- 4. USER SKILLS
-- Stores skills a user can TEACH
-- or wants to LEARN
-- ============================================

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
    ) DEFAULT 'BEGINNER',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
);


-- ============================================
-- 5. EXCHANGE REQUESTS
-- ============================================

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
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
);


-- ============================================
-- 6. SESSIONS
-- Created after an exchange request
-- is accepted
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    request_id INT NOT NULL,

    user1_id INT NOT NULL,
    user2_id INT NOT NULL,

    scheduled_at DATETIME NOT NULL,

    duration_minutes INT NOT NULL DEFAULT 60,
    started_at DATETIME NULL,
    ended_at DATETIME NULL,
    ended_by INT NULL,
    end_reason VARCHAR(50) NULL,

    status ENUM(
        'SCHEDULED',
        'ONGOING',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'SCHEDULED',

    meeting_id VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
);


-- ============================================
-- 7. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT,

    reference_id INT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- 8. RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT NOT NULL,

    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,

    rating TINYINT NOT NULL,

    review TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id)
        REFERENCES sessions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reviewer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reviewee_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CHECK (rating >= 1 AND rating <= 5),

    UNIQUE (
        session_id,
        reviewer_id
    )
);


-- Learning progress is created for each direction of an accepted exchange.
-- The API exposes ADVANCED as the user-facing label PROFICIENT.
CREATE TABLE IF NOT EXISTS learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    learner_id INT NOT NULL,
    teacher_id INT NOT NULL,
    skill_id INT NOT NULL,
    status ENUM('IN_PROGRESS','COMPLETED','ADDED_TO_PROFILE') DEFAULT 'IN_PROGRESS',
    completed_at DATETIME NULL,
    added_to_profile_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE (session_id, learner_id, skill_id)
);
