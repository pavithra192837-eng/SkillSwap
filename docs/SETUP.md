# SkillSwap Setup Guide

This document explains how to set up and run the SkillSwap project locally.

---

# 1. Prerequisites

Install the following software before starting:

* Node.js
* npm
* MySQL
* MySQL Workbench
* Python 3.x
* Git
* VS Code

Verify the installations:

```bash
node --version
npm --version
python --version
git --version
```

You should also make sure that MySQL Server is running before starting the backend.

---

# 2. Clone the Repository

Clone the SkillSwap repository:

```bash
git clone <GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd SkillSwap
```

Check the project structure:

```text
SkillSwap/

├── frontend/
├── backend/
├── ai-service/
├── database/
├── docs/
└── README.md
```

---

# 3. Database Setup

SkillSwap uses MySQL as its relational database.

The current backend contains:

```text
backend/database/initDatabase.js
```

This initializer automatically:

1. Connects to MySQL.
2. Creates the `skillswap` database if it does not exist.
3. Creates the required tables.
4. Adds missing profile columns when necessary.

The required tables are:

```text
users
skills
user_skills
exchange_requests
sessions
```

## Option A — Recommended for the Current Backend

Configure the backend `.env` file first and start the backend.

The `initDatabase.js` script will automatically create the database and tables.

No manual database creation is required for a fresh setup.

---

## Option B — Using MySQL Workbench

The project also contains:

```text
database/schema.sql
```

You can open this file in MySQL Workbench and execute it manually.

It creates:

```text
skillswap
```

and the required tables.

The schema should match the current backend database structure.

---

# 4. Seed Data

Sample skills are stored in:

```text
database/seed.sql
```

Example skills include:

```text
JavaScript
React
Python
Java
HTML
CSS
SQL
UI/UX Design
Graphic Design
Photography
Public Speaking
Machine Learning
Git & GitHub
MySQL
Figma
```

For a fresh database, the seed file can be executed after the tables have been created.

### Important

The `skills.name` column is unique.

Therefore, if a skill such as:

```text
JavaScript
```

already exists, running the seed file again may produce a duplicate-entry error.

For an existing database, do not repeatedly run the complete seed file without checking the existing data.

---

# 5. Backend Setup

Open a terminal and move into the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

The backend uses:

* Express
* MySQL2
* CORS
* dotenv
* bcryptjs
* jsonwebtoken
* Nodemon for development

---

# 6. Backend Environment Variables

Create a `.env` file inside:

```text
backend/.env
```

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillswap
DB_PORT=3306

JWT_SECRET=your_strong_secret_key
```

Replace:

```text
your_mysql_password
```

with the password for your MySQL user.

Use a strong random value for:

```text
JWT_SECRET
```

Do not commit the `.env` file to GitHub.

---

# 7. Start the Backend

For development:

```bash
npm run dev
```

If the project does not have a development script configured, use:

```bash
npm start
```

The backend should normally run at:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

When the backend starts successfully, it initializes the database and then starts the Express server.

You should see messages similar to:

```text
✅ Database and tables initialized successfully.
✅ MySQL database connected successfully
🚀 SkillSwap server running on http://localhost:5000
```

---

# 8. Test the Backend

Open a browser or API client such as Postman.

### Backend health check

```text
GET http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "SkillSwap Backend API is running 🚀"
}
```

### API test

```text
GET http://localhost:5000/api/test
```

Expected response:

```json
{
  "success": true,
  "message": "API is working"
}
```

### Database test

```text
GET http://localhost:5000/api/test-db
```

Expected response:

```json
{
  "success": true,
  "message": "Database connection is working",
  "data": [
    {
      "result": 1
    }
  ]
}
```

---

# 9. Frontend Setup

Open another terminal.

Move to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Vite will display a local URL, usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

# 10. AI Service Setup

The project contains a separate AI service:

```text
ai-service/
```

The AI service is intended to provide more advanced skill-matching functionality.

At the current development stage, the main backend matching endpoint uses SQL-based matching. The FastAPI AI service is a separate planned/integration component.

If the AI service has been implemented, open another terminal:

```bash
cd ai-service
```

---

## Windows

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn main:app --reload
```

The service normally runs at:

```text
http://localhost:8000
```

---

## macOS / Linux

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

---

# 11. Environment and Git Ignore Rules

Never commit passwords, secrets, or private credentials.

### Backend `.gitignore`

The backend should ignore:

```text
node_modules/
.env
```

### AI Service `.gitignore`

The AI service should ignore:

```text
venv/
.env
__pycache__/
```

Example AI-service `.gitignore`:

```gitignore
venv/
.env
__pycache__/
*.pyc
```

---

# 12. Running the Complete Project

During development, run each service in its own terminal.

## Terminal 1 — Backend

```powershell
cd SkillSwap\backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Terminal 2 — Frontend

```powershell
cd SkillSwap\frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Terminal 3 — AI Service

If the AI service is implemented:

```powershell
cd SkillSwap\ai-service
venv\Scripts\activate
uvicorn main:app --reload
```

AI service:

```text
http://localhost:8000
```

---

## Database

MySQL Server must remain running.

Default MySQL port:

```text
3306
```

---

# 13. Service URLs

| Service    | URL                         |
| ---------- | --------------------------- |
| Frontend   | `http://localhost:5173`     |
| Backend    | `http://localhost:5000`     |
| API        | `http://localhost:5000/api` |
| AI Service | `http://localhost:8000`     |
| MySQL      | `localhost:3306`            |

The exact frontend and AI-service ports can vary depending on local configuration.

---

# 14. Git Workflow

Check the current branch:

```bash
git branch
```

Check changes:

```bash
git status
```

The project uses:

```text
main
  ↓
Stable version

develop
  ↓
Integration branch

frontend1
  ↓
Frontend developer branch
```

For frontend development, work on:

```bash
git checkout frontend1
```

Create another feature branch when appropriate:

```bash
git checkout -b feature-name
```

After completing the work:

```bash
git add .
git commit -m "Describe your changes"
git push origin feature-name
```

Create a pull request into:

```text
develop
```

After integration and testing, stable work can be merged into:

```text
main
```

Avoid making direct changes to `main`.

---

# 15. Recommended Development Order

The recommended development sequence is:

```text
Database
   ↓
Backend API
   ↓
Frontend UI
   ↓
Frontend API Integration
   ↓
Skill Matching
   ↓
AI Matching Integration
   ↓
Firebase Chat
   ↓
Video Integration
   ↓
Testing
   ↓
Deployment
```

The current SQL-based matching should be functional before integrating the separate AI service.

---

# 16. Core Application Test

After the services are running, verify the main application flow.

```text
1. Register
      ↓
2. Login
      ↓
3. Create / Update Profile
      ↓
4. Add Teaching Skills
      ↓
5. Add Learning Skills
      ↓
6. View Skill Matches
      ↓
7. Send Exchange Request
      ↓
8. Accept Request
      ↓
9. Schedule Session
      ↓
10. Chat
      ↓
11. Join Video Session
      ↓
12. Complete Session
```

The core backend flow can be tested through Postman before the complete frontend integration is finished.

---

# 17. Backend API Verification

The main backend endpoints include:

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET /api/users
GET /api/users/me
PUT /api/users/me
GET /api/users/:id
```

### Skills

```text
GET    /api/skills
GET    /api/skills/:id
POST   /api/skills
POST   /api/skills/user
GET    /api/skills/user/me
DELETE /api/skills/user/:skillId
```

### Matches

```text
GET /api/matches
GET /api/matches/:id
```

### Exchange Requests

```text
POST /api/requests
GET  /api/requests/received
GET  /api/requests/sent
PUT  /api/requests/:id/accept
PUT  /api/requests/:id/reject
```

### Sessions

```text
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/:id
PUT  /api/sessions/:id
PUT  /api/sessions/:id/complete
```

Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 18. Troubleshooting

## npm command not working

Check Node.js and npm:

```bash
node --version
npm --version
```

If Windows PowerShell blocks npm scripts, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then restart the terminal.

---

## MySQL connection error

Check the values in:

```text
backend/.env
```

Especially:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
```

Make sure MySQL Server is running.

For the default local configuration:

```text
DB_HOST=localhost
DB_PORT=3306
```

---

## Database or table errors

If an error indicates that a database or table does not exist:

1. Confirm MySQL is running.
2. Check the `.env` database settings.
3. Restart the backend.
4. Check whether `initDatabase.js` completed successfully.
5. For a fresh database, verify `database/schema.sql`.

Do not drop an existing database unless you intentionally want to delete its data.

---

## Port already in use

If port `5000`, `5173`, or `8000` is already being used, stop the existing process or configure another port.

---

## Authentication errors

If protected endpoints return:

```text
401 Unauthorized
```

check that the request contains:

```text
Authorization: Bearer <JWT_TOKEN>
```

Also make sure the token was generated using the current `JWT_SECRET`.

If the database was deleted and recreated, an old JWT may reference a user that no longer exists. Register/login again to obtain a fresh token.

---

## Skill matching returns no users

The matching system requires compatible teaching and learning skills.

For example:

```text
User A
TEACH → JavaScript
LEARN → UI/UX Design
```

and:

```text
User B
TEACH → UI/UX Design
LEARN → JavaScript
```

should produce a potential match.

Make sure both users have the relevant records in:

```text
user_skills
```

---

# 19. Security Notes

Never commit the following files or information:

```text
.env
API keys
JWT secrets
Database passwords
Firebase private credentials
```

Use environment variables for sensitive configuration.

For example:

```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_strong_secret
```

Do not place real credentials directly inside source code.

---

# 20. Final Setup Checklist

Before starting development, confirm:

* [ ] Node.js installed
* [ ] npm installed
* [ ] Python installed
* [ ] MySQL installed
* [ ] MySQL Server running
* [ ] Git installed
* [ ] Repository cloned
* [ ] Backend dependencies installed
* [ ] Frontend dependencies installed
* [ ] AI dependencies installed if the AI service is implemented
* [ ] Backend `.env` configured
* [ ] Database created
* [ ] Tables created
* [ ] Seed data inserted if required
* [ ] Backend starts successfully
* [ ] `/api/test` works
* [ ] `/api/test-db` works
* [ ] Frontend starts successfully
* [ ] AI service starts successfully if implemented
* [ ] JWT authentication works
* [ ] Skills can be added
* [ ] Skill matching works
* [ ] Exchange requests work
* [ ] Sessions work

---

# 21. Expected Development Environment

A correctly configured local environment should look approximately like this:

```text
SkillSwap
│
├── MySQL
│   └── skillswap database
│
├── Backend
│   └── http://localhost:5000
│
├── Frontend
│   └── http://localhost:5173
│
└── AI Service
    └── http://localhost:8000
```

The backend is the main API layer connecting the frontend to the MySQL database.

The AI service is a separate service intended for advanced matching.

Firebase and video functionality are separate integrations used for communication and sessions.
