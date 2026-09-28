# SkillSwap AI Service

SkillSwap is a skill exchange platform where people can teach the skills they know and learn the skills they want through mutual skill exchange.

## Project Structure

* `frontend/` - React frontend
* `backend/` - Node.js and Express backend
* `ai-service/` - Python and FastAPI AI services
* `database/` - Database schema and scripts
* `docs/` - Project documentation

## Technology Stack

* React.js
* Tailwind CSS
* Node.js
* Express.js
* MySQL
* Firebase
* Python
* FastAPI
* Git and GitHub

## Core Features

* User Skill Profiles
* AI Skill Matching
* Skill Exchange Requests
* Skill Exchange Sessions
* Real-time Chat
* Skill Verification
* Skill Points and Reputation
* AI Learning Roadmaps
* AI-generated Quizzes
* Skill Exchange Chains

## AI Service

The AI service is built using Python and FastAPI. It matches users based on the skills they can teach and the skills they want to learn.

### Current Features

* Reciprocal skill matching
* Match score calculation
* Exclusion of self-matches
* Matches sorted by score

### Setup

1. Open a terminal in the `ai-service` folder.
2. Create and activate a virtual environment.
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

### Run the Service

```bash
uvicorn app.main:app --reload
```

The service runs at `http://127.0.0.1:8000`.

### API Documentation

Open `http://127.0.0.1:8000/docs` to view and test the API.

### API Endpoint

`POST /match` - Accepts a user profile and candidate profiles, then returns matching users with match scores and relevant skills.

### Run Tests

```bash
pytest -v
```

## Team

SkillSwap is developed collaboratively by a team of four students.
