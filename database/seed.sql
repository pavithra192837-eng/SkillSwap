
-- ============================================
-- SkillSwap Seed Data
-- ============================================

USE skillswap;


-- ============================================
-- 1. SAMPLE SKILL CATEGORIES
-- ============================================

INSERT INTO skill_categories (name)
VALUES
    ('Programming'),
    ('Web Development'),
    ('Database'),
    ('Design'),
    ('Media'),
    ('Marketing'),
    ('Communication'),
    ('Language'),
    ('Data & AI'),
    ('Development Tools'),
    ('Backend Development')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);


-- ============================================
-- 2. SAMPLE SKILLS
-- ============================================

INSERT INTO skills
    (name, category_id, description)
VALUES
(
    'JavaScript',
    (SELECT id FROM skill_categories WHERE name = 'Programming'),
    'Programming language used for web development'
),

(
    'React',
    (SELECT id FROM skill_categories WHERE name = 'Programming'),
    'JavaScript library for building user interfaces'
),

(
    'Python',
    (SELECT id FROM skill_categories WHERE name = 'Programming'),
    'Programming language used for software and AI development'
),

(
    'Java',
    (SELECT id FROM skill_categories WHERE name = 'Programming'),
    'Programming language for application development'
),

(
    'C++',
    (SELECT id FROM skill_categories WHERE name = 'Programming'),
    'Programming language used for software and system development'
),

(
    'HTML',
    (SELECT id FROM skill_categories WHERE name = 'Web Development'),
    'Markup language used to structure web pages'
),

(
    'CSS',
    (SELECT id FROM skill_categories WHERE name = 'Web Development'),
    'Language used to style web pages'
),

(
    'SQL',
    (SELECT id FROM skill_categories WHERE name = 'Database'),
    'Language used to manage relational databases'
),

(
    'UI/UX Design',
    (SELECT id FROM skill_categories WHERE name = 'Design'),
    'Designing user interfaces and user experiences'
),

(
    'Graphic Design',
    (SELECT id FROM skill_categories WHERE name = 'Design'),
    'Creating visual content and digital graphics'
),

(
    'Video Editing',
    (SELECT id FROM skill_categories WHERE name = 'Media'),
    'Editing and producing video content'
),

(
    'Photography',
    (SELECT id FROM skill_categories WHERE name = 'Media'),
    'Taking and editing photographs'
),

(
    'Digital Marketing',
    (SELECT id FROM skill_categories WHERE name = 'Marketing'),
    'Marketing products and services through digital platforms'
),

(
    'Content Writing',
    (SELECT id FROM skill_categories WHERE name = 'Communication'),
    'Creating written content for digital platforms'
),

(
    'Public Speaking',
    (SELECT id FROM skill_categories WHERE name = 'Communication'),
    'Communicating ideas effectively to an audience'
),

(
    'Communication',
    (SELECT id FROM skill_categories WHERE name = 'Communication'),
    'Developing effective verbal and written communication skills'
),

(
    'English',
    (SELECT id FROM skill_categories WHERE name = 'Language'),
    'English language learning and communication'
),

(
    'Data Science',
    (SELECT id FROM skill_categories WHERE name = 'Data & AI'),
    'Analyzing data to discover useful insights'
),

(
    'Machine Learning',
    (SELECT id FROM skill_categories WHERE name = 'Data & AI'),
    'Building systems that learn from data'
),

(
    'Git & GitHub',
    (SELECT id FROM skill_categories WHERE name = 'Development Tools'),
    'Version control and collaborative software development'
),

(
    'Node.js',
    (SELECT id FROM skill_categories WHERE name = 'Backend Development'),
    'JavaScript runtime for backend development'
),

(
    'Express.js',
    (SELECT id FROM skill_categories WHERE name = 'Backend Development'),
    'Web framework for Node.js'
),

(
    'MySQL',
    (SELECT id FROM skill_categories WHERE name = 'Database'),
    'Relational database management system'
),

(
    'Figma',
    (SELECT id FROM skill_categories WHERE name = 'Design'),
    'Tool for UI/UX design and prototyping'
),

(
    'Video Production',
    (SELECT id FROM skill_categories WHERE name = 'Media'),
    'Planning, recording, and producing videos'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name);


-- ============================================
-- END OF SEED DATA
