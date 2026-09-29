-- ============================================
-- SkillSwap Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS skillswap;

USE skillswap;


-- ============================================
-- 1. USERS
-- ============================================

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
);


-- ============================================
-- 2. SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 3. USER SKILLS
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

    UNIQUE (
        user_id,
        skill_id,
        type
    )
);


-- ============================================
-- 4. EXCHANGE REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,

    -- These reference skills.id
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
);


-- ============================================
-- 5. SESSIONS
-- Created after an exchange request
-- is accepted
-- ============================================

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
);