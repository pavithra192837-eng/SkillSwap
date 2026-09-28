# SkillSwap Project Documentation

## 1. Project Overview

**SkillSwap** is a skill-exchange platform that allows users to teach skills they know while learning skills they want to improve.

Instead of paying for courses, users can exchange knowledge with each other.

### Example

```text
User A
Teaches: JavaScript
Wants to Learn: UI/UX Design

        ↕

User B
Teaches: UI/UX Design
Wants to Learn: JavaScript
```

The platform can identify this as a potential skill match.

---

# 2. Project Goal

The main goal of SkillSwap is to create a platform where users can:

* Create a personal skill profile
* Add skills they can teach
* Add skills they want to learn
* Discover compatible users
* Receive AI-assisted skill matches
* Send and receive exchange requests
* Schedule skill-exchange sessions
* Chat with other users
* Join video sessions

---

# 3. Core Features

## User Authentication

Users can:

* Register
* Login
* Logout
* Manage their profile

Authentication is handled using JWT.

---

## Skill Profile

Users can add:

### Skills they can teach

Example:

```text
JavaScript
React
Python
```

### Skills they want to learn

Example:

```text
UI/UX Design
Photography
Public Speaking
```

Users can also specify their proficiency level:

```text
Beginner
Intermediate
Advanced
```

---

# 4. AI Skill Matching

The platform provides AI-assisted matching between users.

The matching system compares:

```text
Skills I can teach
        ↓
Skills another user wants to learn

Skills I want to learn
        ↓
Skills another user can teach
```

A compatibility score can then be generated.

### Example

```text
User A

Teaches:
JavaScript

Wants:
UI/UX Design
```

```text
User B

Teaches:
UI/UX Design

Wants:
JavaScript
```

The system identifies a strong two-way skill compatibility.

---

# 5. Exchange Requests

After finding a potential match, users can send an exchange request.

The request contains:

* Sender
* Receiver
* Skill offered
* Skill requested
* Optional message
* Request status

Possible statuses:

```text
Pending
Accepted
Rejected
Cancelled
```

---

# 6. Skill-Exchange Sessions

Once an exchange request is accepted, users can schedule a session.

A session contains:

* Host
* Participant
* Date and time
* Session status
* Meeting link

Possible statuses:

```text
Scheduled
Ongoing
Completed
Cancelled
```

---

# 7. Real-Time Chat

SkillSwap uses Firebase for real-time communication.

Users can communicate with their exchange partners before and during their sessions.

Possible chat features:

* One-to-one messaging
* Real-time message updates
* Message timestamps
* Session-related conversations

---

# 8. Video Calls

The platform supports video-based skill-exchange sessions.

A session can contain a meeting link that users can use to join the video call.

The video functionality can be integrated with an appropriate video/meeting service.

---

# 9. Technology Stack

| Layer           | Technology       |
| --------------- | ---------------- |
| Frontend        | React            |
| Styling         | Tailwind CSS     |
| Backend         | Node.js          |
| API Framework   | Express.js       |
| Database        | MySQL            |
| Authentication  | JWT              |
| AI Service      | Python + FastAPI |
| Real-Time Chat  | Firebase         |
| Version Control | Git + GitHub     |

---

# 10. System Architecture

```text
                    ┌─────────────────┐
                    │     User        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ React Frontend  │
                    │ + Tailwind CSS  │
                    └────────┬────────┘
                             │
                             │ REST API
                             ▼
                    ┌─────────────────┐
                    │ Node + Express  │
                    │    Backend      │
                    └──────┬───┬──────┘
                           │   │
                 ┌─────────┘   └──────────┐
                 ▼                        ▼
        ┌─────────────────┐      ┌─────────────────┐
        │     MySQL       │      │  AI FastAPI     │
        │    Database     │      │     Service     │
        └─────────────────┘      └─────────────────┘

                           │
                           ▼
                    ┌─────────────────┐
                    │     Firebase    │
                    │      Chat       │
                    └─────────────────┘
```

---

# 11. Main User Flow

```text
Register
   ↓
Login
   ↓
Create Profile
   ↓
Add Teaching Skills
   ↓
Add Learning Skills
   ↓
View AI Matches
   ↓
Choose Match
   ↓
Send Exchange Request
   ↓
Request Accepted
   ↓
Schedule Session
   ↓
Chat
   ↓
Video Call
   ↓
Complete Skill Exchange
```

---

# 12. Project Structure

```text
SkillSwap/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── ai-service/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── PROJECT.md
│   └── SETUP.md
│
└── README.md
```

---

# 13. Team Responsibilities

## Frontend Developer

Responsible for:

* React application
* Tailwind CSS
* Pages
* Components
* Navigation
* API integration
* User interface

---

## Backend Developer

Responsible for:

* Node.js
* Express.js
* REST APIs
* MySQL integration
* Authentication
* Database operations

---

## AI Developer

Responsible for:

* FastAPI service
* Skill matching logic
* Compatibility calculation
* AI service API

---

## Integration Developer

Responsible for:

* Firebase chat
* Video-call integration
* Frontend/backend integration
* Testing
* Deployment support

---

# 14. Git Branch Strategy

The project uses separate branches for development.

```text
main
  │
  └── stable version
       
develop
  │
  └── integration branch

frontend1
  │
  └── frontend developer branch
```

Developers should work on their own feature branches and merge completed work into `develop`.

The `main` branch should contain the stable project version.

---

# 15. Development Priorities

The core demo should prioritize the following flow:

```text
Login
   ↓
Profile
   ↓
Skills
   ↓
AI Match
   ↓
Exchange Request
   ↓
Accept
   ↓
Session
   ↓
Chat / Video
```

Additional features can be added after this core flow works reliably.

---

# 16. Project Objective

The final SkillSwap application should demonstrate how users can exchange knowledge with each other through a single platform.

The key demonstration should show:

**User → Skills → AI Match → Exchange Request → Session → Communication → Skill Exchange**
