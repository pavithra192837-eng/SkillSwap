# SkillSwap Database Documentation

## Database

SkillSwap uses **MySQL** as its relational database.

### Database Name

```text
skillswap
```

---

# 1. Database Structure

The SkillSwap database contains the following main tables:

```text
users
skills
user_skills
exchange_requests
sessions
```

### Relationship Overview

```text
                    ┌──────────────┐
                    │    users     │
                    └──────┬───────┘
                           │
                           │
                    ┌──────▼───────┐
                    │  user_skills │
                    └──────┬───────┘
                           │
                           │
                    ┌──────▼───────┐
                    │    skills    │
                    └──────────────┘


       ┌──────────────────────┐
       │        users         │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │  exchange_requests   │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │       sessions       │
       └──────────────────────┘
```

---

# 2. Users Table

### Table

```text
users
```

Stores registered SkillSwap users.

| Column          | Type         | Description                 |
| --------------- | ------------ | --------------------------- |
| `id`            | INT          | Primary key                 |
| `name`          | VARCHAR(100) | User's name                 |
| `email`         | VARCHAR(150) | Unique email address        |
| `password`      | VARCHAR(255) | Hashed password             |
| `phone`         | VARCHAR(20)  | User's phone number         |
| `college`       | VARCHAR(150) | User's college              |
| `register_no`   | VARCHAR(50)  | College registration number |
| `department`    | VARCHAR(100) | User's department           |
| `bio`           | TEXT         | User biography              |
| `profile_image` | VARCHAR(500) | Profile image URL           |
| `location`      | VARCHAR(255) | User location               |
| `availability`  | VARCHAR(255) | User availability           |
| `created_at`    | TIMESTAMP    | Account creation time       |
| `updated_at`    | TIMESTAMP    | Last update time            |

### Primary Key

```text
id
```

### Important

Passwords are stored as **hashed passwords**, not plain-text passwords.

---

# 3. Skills Table

### Table

```text
skills
```

Stores the skills available on the SkillSwap platform.

| Column        | Type         | Description       |
| ------------- | ------------ | ----------------- |
| `id`          | INT          | Primary key       |
| `name`        | VARCHAR(100) | Skill name        |
| `category`    | VARCHAR(100) | Skill category    |
| `description` | TEXT         | Skill description |
| `created_at`  | TIMESTAMP    | Creation time     |

### Example Skills

```text
JavaScript
React
Python
Java
C++
HTML
CSS
SQL
UI/UX Design
Graphic Design
Video Editing
Photography
Digital Marketing
Content Writing
Public Speaking
Communication
English
Data Science
Machine Learning
Git & GitHub
Node.js
Express.js
MySQL
Figma
Video Production
```

---

# 4. User Skills Table

### Table

```text
user_skills
```

Connects users with skills.

It identifies whether a user wants to **teach** or **learn** a skill.

| Column       | Type      | Description                                      |
| ------------ | --------- | ------------------------------------------------ |
| `id`         | INT       | Primary key                                      |
| `user_id`    | INT       | Reference to `users.id`                          |
| `skill_id`   | INT       | Reference to `skills.id`                         |
| `type`       | ENUM      | `TEACH` or `LEARN`                               |
| `level`      | ENUM      | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` |
| `verified`   | BOOLEAN   | Whether the skill is verified                    |
| `created_at` | TIMESTAMP | Creation time                                    |

### Allowed Skill Types

```text
TEACH
LEARN
```

### Allowed Skill Levels

```text
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

### Relationships

```text
user_skills.user_id
        ↓
users.id
```

```text
user_skills.skill_id
        ↓
skills.id
```

### Example

A user might have:

```text
User: John

TEACH:
JavaScript - ADVANCED
React - INTERMEDIATE

LEARN:
UI/UX Design - BEGINNER
```

---

# 5. Exchange Requests Table

### Table

```text
exchange_requests
```

Stores requests between users who want to exchange skills.

| Column              | Type      | Description                |
| ------------------- | --------- | -------------------------- |
| `id`                | INT       | Primary key                |
| `sender_id`         | INT       | User sending the request   |
| `receiver_id`       | INT       | User receiving the request |
| `sender_skill_id`   | INT       | Skill offered by sender    |
| `receiver_skill_id` | INT       | Skill offered by receiver  |
| `message`           | TEXT      | Optional message           |
| `status`            | ENUM      | Request status             |
| `created_at`        | TIMESTAMP | Creation time              |
| `updated_at`        | TIMESTAMP | Last update time           |

### Important

Both:

```text
sender_skill_id
receiver_skill_id
```

reference:

```text
skills.id
```

They do **not** reference `user_skills.id`.

The backend validates that the selected skills actually belong to the appropriate user's teaching skills.

### Request Status

```text
pending
accepted
rejected
cancelled
```

### Example

```text
John teaches JavaScript.

Jane teaches UI/UX Design.

John → Jane

"I can teach you JavaScript
in exchange for UI/UX lessons."
```

The request stores:

```text
sender_id         → John
receiver_id       → Jane
sender_skill_id   → JavaScript
receiver_skill_id → UI/UX Design
```

---

# 6. Sessions Table

### Table

```text
sessions
```

Stores scheduled skill-exchange sessions.

| Column           | Type         | Description              |
| ---------------- | ------------ | ------------------------ |
| `id`             | INT          | Primary key              |
| `request_id`     | INT          | Related exchange request |
| `host_id`        | INT          | Session host             |
| `participant_id` | INT          | Other participant        |
| `scheduled_at`   | DATETIME     | Scheduled session time   |
| `status`         | ENUM         | Session status           |
| `meeting_link`   | VARCHAR(500) | Video meeting link       |
| `created_at`     | TIMESTAMP    | Creation time            |
| `updated_at`     | TIMESTAMP    | Last update time         |

### Session Status

```text
scheduled
ongoing
completed
cancelled
```

### Session Creation

A session can be created only after the related exchange request has been accepted.

The current backend determines the host and participant from the accepted request.

---

# 7. Foreign Key Relationships

## User Skills

```text
users
  │
  └── user_skills
          │
          └── skills
```

More specifically:

```text
user_skills.user_id
        ↓
users.id
```

```text
user_skills.skill_id
        ↓
skills.id
```

---

## Exchange Requests

```text
users
  │
  └── exchange_requests
          │
          ├── sender_id
          ├── receiver_id
          ├── sender_skill_id
          └── receiver_skill_id
```

The user references are:

```text
exchange_requests.sender_id
        ↓
users.id
```

```text
exchange_requests.receiver_id
        ↓
users.id
```

The skill references are:

```text
exchange_requests.sender_skill_id
        ↓
skills.id
```

```text
exchange_requests.receiver_skill_id
        ↓
skills.id
```

---

## Sessions

```text
exchange_requests
        │
        └── sessions
              │
              ├── host_id
              └── participant_id
```

Session request relationship:

```text
sessions.request_id
        ↓
exchange_requests.id
```

User relationships:

```text
sessions.host_id
        ↓
users.id
```

```text
sessions.participant_id
        ↓
users.id
```

---

# 8. Delete Behavior

The database uses:

```sql
ON DELETE CASCADE
```

for its foreign-key relationships.

For example, when a user is deleted, related records such as their user skills, exchange requests, and sessions can be deleted automatically according to the configured foreign keys.

Similarly, deleting a skill can remove related `user_skills` and exchange-request records that reference that skill.

---

# 9. Sample Skill Exchange

Example database flow:

```text
User 1: John

    │
    ├── TEACH → JavaScript
    │
    └── LEARN → UI/UX Design


User 2: Jane

    │
    ├── TEACH → UI/UX Design
    │
    └── LEARN → JavaScript

             ↓

       Skill Match Found

             ↓

      Exchange Request

             ↓

          Accepted

             ↓

          Session

             ↓

      Chat / Video Call

             ↓

      Complete Session
```

---

# 10. SQL Files

The database folder contains:

```text
database/
├── schema.sql
├── seed.sql
└── README.md
```

### `schema.sql`

Contains the SQL definition for the database and tables.

### `seed.sql`

Contains sample skills for development and testing.

### `README.md`

Contains database setup instructions.

---

# 11. Database Setup

For a fresh database, create the database:

```sql
CREATE DATABASE IF NOT EXISTS skillswap;
```

Then select it:

```sql
USE skillswap;
```

Run:

```text
schema.sql
```

first.

Then run:

```text
seed.sql
```

to insert sample skills.

### Existing Development Database

The SkillSwap backend also uses:

```text
backend/database/initDatabase.js
```

This automatically creates the database and required tables when the backend starts.

Therefore, developers working with the existing project do not normally need to manually recreate the database every time the server starts.

---

# 12. Backend Connection

The Node.js backend connects to MySQL using the `mysql2` package.

Database configuration is stored in environment variables.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=skillswap
DB_PORT=3306
```

These values should be stored in:

```text
backend/.env
```

The `.env` file must **not** be committed to GitHub.

Add it to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# 13. Current Backend Database Flow

```text
Node.js / Express
       │
       ▼
config/db.js
       │
       ▼
MySQL
       │
       ├── users
       │
       ├── skills
       │
       ├── user_skills
       │
       ├── exchange_requests
       │
       └── sessions
```

The backend uses a MySQL connection pool for database queries.

---

# 14. Database and Matching

The current backend determines skill matches by comparing:

```text
Current user's LEARN skills
        ↕
Other user's TEACH skills
```

and:

```text
Current user's TEACH skills
        ↕
Other user's LEARN skills
```

A user is considered a match when there is compatibility in both directions.

The current implementation performs this matching through MySQL queries. The separate Python + FastAPI AI service is part of the project architecture and can be integrated into this flow later.
