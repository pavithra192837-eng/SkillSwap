# SkillSwap Project Documentation

## 1. Project Overview

**SkillSwap** is a skill-exchange platform that allows users to teach skills they know while learning skills they want to improve.

Instead of relying only on traditional courses, users can exchange knowledge with each other.

### Example

```text id="2g0qak"
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

The main goal of SkillSwap is to provide a platform where users can:

* Create a personal profile
* Add skills they can teach
* Add skills they want to learn
* Discover compatible users
* Find skill matches
* Send and receive exchange requests
* Accept or reject exchange requests
* Schedule skill-exchange sessions
* Communicate with exchange partners
* Join video-based sessions
* Complete skill-exchange sessions

---

# 3. Core Features

## User Authentication

Users can:

* Register
* Login
* Access their authenticated profile
* Update their profile

Authentication is handled using **JWT**.

Registration currently collects:

* Name
* Email
* Phone
* College
* Register number
* Department
* Password

Optional profile information includes:

* Bio
* Profile image
* Location
* Availability

---

## Skill Profile

Users can add skills in two categories.

### Skills they can teach

Example:

```text id="tq9w8c"
JavaScript
React
Python
```

### Skills they want to learn

Example:

```text id="8av1qm"
UI/UX Design
Photography
Public Speaking
```

Each user skill can have a proficiency level:

```text id="0k4t4q"
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

A skill can also have a verification status.

---

# 4. Skill Matching

SkillSwap identifies potential matches by comparing users' teaching and learning skills.

The matching logic compares:

```text id="4y6xsl"
My LEARN skills
       ↓
Another user's TEACH skills
```

and:

```text id="b7w5xz"
My TEACH skills
       ↓
Another user's LEARN skills
```

### Example

```text id="j1b8zy"
User A

TEACH:
JavaScript

LEARN:
UI/UX Design
```

```text id="f3z0h8"
User B

TEACH:
UI/UX Design

LEARN:
JavaScript
```

These users have compatible skills in both directions.

### Current Implementation

The current `/api/matches` endpoint performs this matching using **MySQL queries**.

The project also contains a planned **Python + FastAPI AI service**. The AI service can later be integrated into the matching process to provide more advanced compatibility calculations.

---

# 5. Exchange Requests

After finding a potential match, a user can send an exchange request.

A request contains:

* Sender
* Receiver
* Sender's teaching skill
* Receiver's teaching skill
* Optional message
* Request status

Possible statuses are:

```text id="6m2sk3"
pending
accepted
rejected
cancelled
```

### Example

```text id="6qv0oz"
John teaches JavaScript.

Jane teaches UI/UX Design.

John → Jane

"I can teach you JavaScript
in exchange for UI/UX lessons."
```

After Jane accepts the request, a session can be created.

---

# 6. Skill-Exchange Sessions

Once an exchange request is accepted, users can schedule a session.

A session contains:

* Request ID
* Host
* Participant
* Scheduled date and time
* Session status
* Meeting link

Possible statuses:

```text id="0im4h3"
scheduled
ongoing
completed
cancelled
```

The current backend determines the host and participant from the accepted exchange request.

A session cannot be created unless the related exchange request has been accepted.

---

# 7. Real-Time Chat

SkillSwap is planned to use **Firebase** for real-time communication.

Chat can support communication between exchange partners.

Potential features include:

* One-to-one messaging
* Real-time message updates
* Message timestamps
* Session-related conversations

Firebase integration is handled separately from the MySQL database.

---

# 8. Video Calls

SkillSwap supports video-based skill-exchange sessions through a meeting link stored with the session.

The current database stores:

```text id="8x0g5j"
meeting_link
```

The actual video-call provider can be integrated separately.

---

# 9. Technology Stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Frontend        | React                   |
| Styling         | Tailwind CSS            |
| Backend         | Node.js                 |
| API Framework   | Express.js              |
| Database        | MySQL                   |
| Authentication  | JWT                     |
| AI Service      | Python + FastAPI        |
| Real-Time Chat  | Firebase                |
| Video Calls     | Video / meeting service |
| Version Control | Git + GitHub            |

---

# 10. System Architecture

```text id="d6eqr0"
                    ┌─────────────────┐
                    │      User       │
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
                    │     Backend     │
                    └──────┬───┬──────┘
                           │   │
              ┌────────────┘   └────────────┐
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │      MySQL      │           │  AI FastAPI     │
     │    Database     │           │     Service     │
     └─────────────────┘           └─────────────────┘
                                          
                    ┌─────────────────┐
                    │    Firebase     │
                    │      Chat       │
                    └─────────────────┘
```

### Current Architecture Note

The Node.js backend currently communicates directly with MySQL.

The current skill matching implementation is database-based. The FastAPI service is part of the planned AI architecture and can be connected to the backend later.

Firebase is intended for real-time chat rather than storing the application's core relational data.

---

# 11. Main User Flow

```text id="7i3w9j"
Register
   ↓
Login
   ↓
Create / Update Profile
   ↓
Add Teaching Skills
   ↓
Add Learning Skills
   ↓
Find Skill Matches
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
Complete Session
```

---

# 12. Project Structure

```text id="z3py6p"
SkillSwap/

│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
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
* Frontend state management

---

## Backend Developer

Responsible for:

* Node.js
* Express.js
* REST APIs
* MySQL integration
* JWT authentication
* Database operations
* Backend validation

---

## AI Developer

Responsible for:

* Python
* FastAPI service
* Skill matching logic
* Compatibility calculation
* AI service API
* Integration with the backend matching flow

---

## Integration Developer

Responsible for:

* Firebase chat
* Video-call integration
* Frontend/backend integration
* Integration testing
* Deployment support

---

# 14. Git Branch Strategy

The project uses separate branches for development.

```text id="c5s1te"
main
 │
 └── Stable version

develop
 │
 └── Integration branch

frontend1
 │
 └── Frontend developer branch
```

Developers should work on their own feature branches.

Completed work should be merged into:

```text id="m4d2xh"
develop
```

The `main` branch should contain the stable project version.

The `frontend1` branch is the working branch for the frontend developer.

---

# 15. Development Priorities

The core demonstration should prioritize:

```text id="4bjx0d"
Login
   ↓
Profile
   ↓
Skills
   ↓
Skill Match
   ↓
Exchange Request
   ↓
Accept
   ↓
Session
   ↓
Chat / Video
   ↓
Complete
```

The core flow should work reliably before adding advanced features.

---

# 16. Current Implementation Status

The backend currently provides:

```text id="c6qg6x"
Authentication
        ↓
User Profiles
        ↓
Skills
        ↓
User Teaching / Learning Skills
        ↓
Skill Matching
        ↓
Exchange Requests
        ↓
Sessions
```

The following components are part of the wider project architecture and can be integrated as development continues:

```text id="m4xy0x"
FastAPI AI Service
Firebase Chat
Video Call Integration
```

---

# 17. Project Objective

The final SkillSwap application should demonstrate how users can exchange knowledge with each other through a single platform.

The key demonstration is:

```text id="fjx4e0"
User
  ↓
Profile
  ↓
Skills
  ↓
Skill Match
  ↓
Exchange Request
  ↓
Accept
  ↓
Session
  ↓
Communication
  ↓
Completed Skill Exchange
```

The project combines a React frontend, Node.js/Express backend, MySQL database, JWT authentication, and planned AI, chat, and video integrations into one skill-exchange platform.
