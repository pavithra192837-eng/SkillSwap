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

---

# 3. Project Structure

The project contains:

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

# 4. Database Setup

## Step 1: Start MySQL

Make sure MySQL Server is running.

Open MySQL Workbench.

---

## Step 2: Create Database

Open:

```text
database/schema.sql
```

Run the SQL script.

This creates:

```text
skillswap
```

and the required tables:

```text
users
skills
user_skills
exchange_requests
sessions
```

---

## Step 3: Add Sample Data

Open:

```text
database/seed.sql
```

Run the script.

This adds sample skills such as:

```text
JavaScript
React
Python
UI/UX Design
SQL
Graphic Design
Photography
Machine Learning
```

---

# 5. Backend Setup

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend/` folder.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillswap
DB_PORT=3306

JWT_SECRET=your_secret_key
```

Replace:

```text
your_mysql_password
```

with your MySQL password.

Use a strong secret for:

```text
JWT_SECRET
```

---

## Start Backend

For development:

```bash
npm run dev
```

Or:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

---

# 6. Frontend Setup

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

Open that URL in your browser.

---

# 7. AI Service Setup

Open another terminal:

```bash
cd ai-service
```

Create a Python virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### macOS/Linux

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

Start the FastAPI service:

```bash
uvicorn main:app --reload
```

The AI service will normally run at:

```text
http://localhost:8000
```

---

# 8. Environment Variables

Do not commit `.env` files containing passwords, API keys, or secrets.

The backend `.gitignore` should include:

```text
.env
node_modules/
```

The AI service should also ignore:

```text
.env
venv/
__pycache__/
```

---

# 9. Running the Complete Project

For development, run each service in its own terminal.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3 — AI Service

```bash
cd ai-service
venv\Scripts\activate
uvicorn main:app --reload
```

MySQL should also be running.

---

# 10. Service URLs

| Service    | URL                         |
| ---------- | --------------------------- |
| Frontend   | `http://localhost:5173`     |
| Backend    | `http://localhost:5000`     |
| API        | `http://localhost:5000/api` |
| AI Service | `http://localhost:8000`     |
| MySQL      | `localhost:3306`            |

---

# 11. Git Workflow

Check your current branch:

```bash
git branch
```

Check changes:

```bash
git status
```

Create a feature branch when working on a new feature:

```bash
git checkout -b feature-name
```

After completing your work:

```bash
git add .
git commit -m "Describe your changes"
git push origin feature-name
```

Create a pull request to:

```text
develop
```

The `main` branch should contain the stable version of the project.

---

# 12. Development Order

Recommended development order:

```text
Database
   ↓
Backend API
   ↓
Frontend UI
   ↓
Frontend API Integration
   ↓
AI Matching
   ↓
Firebase Chat
   ↓
Video Integration
   ↓
Testing
   ↓
Deployment
```

---

# 13. Core Application Test

After setup, verify the main flow:

```text
1. Register
      ↓
2. Login
      ↓
3. Create Profile
      ↓
4. Add Teaching Skills
      ↓
5. Add Learning Skills
      ↓
6. View AI Matches
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
```

If this complete flow works, the core SkillSwap functionality is working.

---

# 14. Troubleshooting

## npm command not working

Check Node.js and npm:

```bash
node --version
npm --version
```

If using Windows PowerShell and scripts are disabled, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then restart the terminal.

---

## MySQL connection error

Check:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
```

Make sure MySQL Server is running.

---

## Port already in use

If port `5000`, `5173`, or `8000` is already being used, stop the existing process or configure another port.

---

# 15. Security Notes

Never commit:

```text
.env
API keys
JWT secrets
Database passwords
Firebase private credentials
```

Use environment variables for sensitive configuration.

---

# 16. Final Checklist

Before starting development, confirm:

* [ ] Node.js installed
* [ ] npm installed
* [ ] Python installed
* [ ] MySQL installed
* [ ] Git installed
* [ ] Repository cloned
* [ ] Database created
* [ ] Seed data inserted
* [ ] Backend dependencies installed
* [ ] Frontend dependencies installed
* [ ] AI dependencies installed
* [ ] `.env` configured
* [ ] Backend running
* [ ] Frontend running
* [ ] AI service running
