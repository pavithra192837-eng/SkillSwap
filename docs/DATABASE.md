# SkillSwap Database Documentation

## Database

SkillSwap uses **MySQL** as its relational database.

### Database Name

```text
skillswap
```

---

# 1. Database Structure

The database contains the following main tables:

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
       │ exchange_requests    │
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

| Column          | Type         | Description           |
| --------------- | ------------ | --------------------- |
| `id`            | INT          | Primary key           |
| `name`          | VARCHAR(100) | User's name           |
| `email`         | VARCHAR(150) | Unique email address  |
| `password`      | VARCHAR(255) | Hashed password       |
| `bio`           | TEXT         | User biography        |
| `profile_image` | VARCHAR(500) | Profile image URL     |
| `created_at`    | TIMESTAMP    | Account creation time |
| `updated_at`    | TIMESTAMP    | Last update time      |

### Primary Key

```text
id
```

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
| `description` | TEXT         | Skill description |
| `created_at`  | TIMESTAMP    | Creation time     |

### Example Skills

```text
JavaScript
React
Python
UI/UX Design
Graphic Design
SQL
Video Editing
Photography
Public Speaking
Machine Learning
```

---

# 4. User Skills Table

### Table

```text
user_skills
```

Connects users with their skills.

It also identifies whether a user wants to **teach** or **learn** a particular skill.

| Column        | Type      | Description                            |
| ------------- | --------- | -------------------------------------- |
| `id`          | INT       | Primary key                            |
| `user_id`     | INT       | Reference to users                     |
| `skill_id`    | INT       | Reference to skills                    |
| `skill_type`  | ENUM      | `teach` or `learn`                     |
| `proficiency` | ENUM      | `beginner`, `intermediate`, `advanced` |
| `created_at`  | TIMESTAMP | Creation time                          |

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
JavaScript - Advanced
React - Intermediate

LEARN:
UI/UX Design - Beginner
```

---

# 5. Exchange Requests Table

### Table

```text
exchange_requests
```

Stores requests between users who want to exchange skills.

| Column              | Type      | Description                   |
| ------------------- | --------- | ----------------------------- |
| `id`                | INT       | Primary key                   |
| `sender_id`         | INT       | User sending request          |
| `receiver_id`       | INT       | User receiving request        |
| `sender_skill_id`   | INT       | Skill offered by sender       |
| `receiver_skill_id` | INT       | Skill requested from receiver |
| `message`           | TEXT      | Optional message              |
| `status`            | ENUM      | Request status                |
| `created_at`        | TIMESTAMP | Creation time                 |
| `updated_at`        | TIMESTAMP | Last update time              |

### Request Status

```text
pending
accepted
rejected
cancelled
```

### Example

```text
John teaches JavaScript
Jane teaches UI/UX

John → Jane

"I can teach you JavaScript
in exchange for UI/UX lessons."
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

---

# 7. Foreign Key Relationships

### User Skills

```text
users
  │
  └── user_skills
          │
          └── skills
```

### Exchange Requests

```text
users
  │
  └── exchange_requests
          │
          ├── sender
          ├── receiver
          ├── sender skill
          └── receiver skill
```

### Sessions

```text
exchange_requests
        │
        └── sessions
              │
              ├── host
              └── participant
```

---

# 8. Delete Behavior

The database uses:

```sql
ON DELETE CASCADE
```

for related records.

For example, if a user is deleted, their related `user_skills`, exchange requests, and sessions can also be removed according to the defined foreign-key relationships.

---

# 9. Sample Skill Exchange

Example database flow:

```text
User 1: John
    │
    ├── Teaches → JavaScript
    └── Learns  → UI/UX Design

User 2: Jane
    │
    ├── Teaches → UI/UX Design
    └── Learns  → JavaScript

              ↓

       AI Match Found

              ↓

       Exchange Request

              ↓

          Accepted

              ↓

          Session

              ↓

       Chat / Video Call
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

Creates the database and tables.

### `seed.sql`

Adds sample skills and test data.

### `README.md`

Contains instructions for setting up the database.

---

# 11. Database Setup

Create the database by running:

```sql
CREATE DATABASE skillswap;
```

Then select it:

```sql
USE skillswap;
```

Run `schema.sql` first.

After that, run `seed.sql`.

---

# 12. Backend Connection

The Node.js backend connects to MySQL using the `mysql2` package.

The connection configuration should use environment variables rather than storing passwords directly in source code.

Example:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=skillswap
DB_PORT=3306
```

These values should be stored in the backend `.env` file and should **not** be committed to GitHub.
