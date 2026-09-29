# SkillSwap Frontend API Guide

This document explains how the SkillSwap React frontend communicates with the Node.js + Express backend.

It is intended for frontend developers working on the SkillSwap project.

---

# 1. Backend Information

The SkillSwap backend runs using:

```text
Node.js
Express.js
MySQL
JWT Authentication
```

During local development:

```text
Backend:
http://localhost:5000

API Base URL:
http://localhost:5000/api
```

Therefore, if the backend endpoint is:

```text
GET /users/me
```

the complete URL is:

```text
http://localhost:5000/api/users/me
```

---

# 2. Frontend → Backend Architecture

The frontend should **not** communicate directly with MySQL.

The correct architecture is:

```text
React Frontend
      ↓
Frontend Service
      ↓
api.js
      ↓
HTTP Request
      ↓
Express Backend
      ↓
Controller
      ↓
MySQL
      ↓
JSON Response
      ↓
React Frontend
```

Example:

```text
Profile.jsx
     ↓
userService.getMyProfile()
     ↓
api.get("/users/me")
     ↓
GET /api/users/me
     ↓
Express
     ↓
MySQL
     ↓
User data
     ↓
Profile.jsx
```

---

# 3. Frontend API Folder Structure

Recommended structure:

```text
frontend/
└── src/
    ├── services/
    │   ├── api.js
    │   ├── authService.js
    │   ├── userService.js
    │   ├── skillService.js
    │   ├── matchService.js
    │   ├── requestService.js
    │   └── sessionService.js
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── pages/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard.jsx
    │   ├── Profile.jsx
    │   ├── Matches.jsx
    │   ├── Requests.jsx
    │   ├── Sessions.jsx
    │   ├── Chat.jsx
    │   └── VideoCall.jsx
    │
    └── components/
```

---

# 4. API Base URL

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend code should use:

```js
const API_URL =
  import.meta.env.VITE_API_URL;
```

Do not hard-code the backend URL in every component.

---

# 5. Authentication

SkillSwap uses JWT authentication.

After successful login:

```text
Frontend
   ↓
POST /api/auth/login
   ↓
Backend
   ↓
JWT token
   ↓
Frontend
   ↓
localStorage
```

The token should be stored locally:

```js
localStorage.setItem(
  "token",
  data.token
);
```

For protected APIs, send:

```text
Authorization: Bearer <JWT_TOKEN>
```

Example:

```http
GET /api/users/me
Authorization: Bearer eyJhbGciOi...
```

The frontend API helper should automatically attach this token.

---

# 6. Authentication APIs

## 6.1 Register

### Endpoint

```http
POST /api/auth/register
```

### Authentication

Not required.

### Request body

```json
{
  "name": "John",
  "email": "john@example.com",
  "phone": "9876543210",
  "college": "ABC College",
  "register_no": "22CS001",
  "department": "Computer Science",
  "password": "password123",
  "bio": "Computer science student",
  "location": "Coimbatore",
  "availability": "Evenings"
}
```

Required fields:

```text
name
email
phone
college
register_no
department
password
```

Optional fields:

```text
bio
location
availability
```

### Successful response

HTTP:

```text
201 Created
```

Example:

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "22CS001",
    "department": "Computer Science",
    "bio": "Computer science student",
    "location": "Coimbatore",
    "availability": "Evenings"
  }
}
```

The frontend should store the returned token.

---

# 7. Login

### Endpoint

```http
POST /api/auth/login
```

### Authentication

Not required.

### Request body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Successful response

HTTP:

```text
200 OK
```

Example:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "22CS001",
    "department": "Computer Science",
    "bio": null,
    "profile_image": null,
    "location": null,
    "availability": null
  }
}
```

Frontend action:

```text
Receive token
      ↓
Store token
      ↓
Store user information
      ↓
Navigate to Dashboard
```

---

# 8. Get Current User

### Endpoint

```http
GET /api/auth/me
```

### Authentication

Required.

Header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Response

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "22CS001",
    "department": "Computer Science",
    "bio": "Computer science student",
    "profile_image": null,
    "location": "Coimbatore",
    "availability": "Evenings",
    "created_at": "2026-09-28T10:00:00.000Z"
  }
}
```

This endpoint can be called when the application starts to restore the logged-in user.

---

# 9. User APIs

## Get All Users

```http
GET /api/users
```

Authentication:

```text
Required
```

Response:

```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "id": 2,
      "name": "Jane",
      "email": "jane@example.com",
      "phone": "9876543211",
      "college": "ABC College",
      "register_no": "22CS002",
      "department": "Information Technology",
      "bio": "Designer",
      "profile_image": null,
      "location": "Coimbatore",
      "availability": "Weekends"
    }
  ]
}
```

The current logged-in user is excluded.

---

# 10. Get My Profile

```http
GET /api/users/me
```

Authentication:

```text
Required
```

Response:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "22CS001",
    "department": "Computer Science",
    "bio": "Developer",
    "profile_image": null,
    "location": "Coimbatore",
    "availability": "Evenings"
  }
}
```

---

# 11. Update My Profile

```http
PUT /api/users/me
```

Authentication:

```text
Required
```

### Request body

```json
{
  "name": "John Updated",
  "bio": "Full stack developer",
  "profile_image": "https://example.com/profile.jpg",
  "location": "Coimbatore",
  "availability": "Evenings and weekends"
}
```

The current backend allows updating:

```text
name
bio
profile_image
location
availability
```

### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com"
  }
}
```

---

# 12. Get User by ID

```http
GET /api/users/:id
```

Example:

```http
GET /api/users/2
```

Authentication:

```text
Required
```

The response contains the user's profile and their teaching/learning skills.

Example structure:

```json
{
  "success": true,
  "user": {
    "id": 2,
    "name": "Jane",
    "email": "jane@example.com",
    "teachSkills": [],
    "learnSkills": [],
    "reputation": {
      "points": 0,
      "rating": 0,
      "completed_sessions": 0
    }
  }
}
```

The reputation values are currently placeholders because a separate reputation system has not yet been implemented.

---

# 13. Skill APIs

## Get All Skills

```http
GET /api/skills
```

Authentication:

```text
Not required
```

Response:

```json
{
  "success": true,
  "count": 3,
  "skills": [
    {
      "id": 1,
      "name": "JavaScript",
      "category": "Programming",
      "description": "Programming language used for web development"
    },
    {
      "id": 2,
      "name": "React",
      "category": "Programming",
      "description": "JavaScript library for building user interfaces"
    }
  ]
}
```

---

# 14. Get Skill by ID

```http
GET /api/skills/:id
```

Example:

```http
GET /api/skills/1
```

Authentication:

```text
Not required
```

---

# 15. Create a Skill

```http
POST /api/skills
```

Authentication:

```text
Required
```

Request:

```json
{
  "name": "Docker",
  "category": "Development Tools",
  "description": "Containerization platform"
}
```

Response:

```json
{
  "success": true,
  "message": "Skill created successfully",
  "skill": {
    "id": 10,
    "name": "Docker",
    "category": "Development Tools",
    "description": "Containerization platform"
  }
}
```

---

# 16. Add Skill to My Profile

```http
POST /api/skills/user
```

Authentication:

```text
Required
```

### Request

```json
{
  "skillId": 1,
  "type": "TEACH",
  "level": "INTERMEDIATE"
}
```

`type` must be:

```text
TEACH
LEARN
```

`level` can be:

```text
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

Example for learning:

```json
{
  "skillId": 5,
  "type": "LEARN",
  "level": "BEGINNER"
}
```

---

# 17. Get My Skills

```http
GET /api/skills/user/me
```

Authentication:

```text
Required
```

Response:

```json
{
  "success": true,
  "count": 2,
  "teach": [
    {
      "id": 1,
      "skill_id": 1,
      "name": "JavaScript",
      "category": "Programming",
      "type": "TEACH",
      "level": "INTERMEDIATE",
      "verified": false
    }
  ],
  "learn": [
    {
      "id": 2,
      "skill_id": 5,
      "name": "UI/UX Design",
      "category": "Design",
      "type": "LEARN",
      "level": "BEGINNER",
      "verified": false
    }
  ]
}
```

This endpoint is useful for the Profile/Skills page.

---

# 18. Delete My Skill

```http
DELETE /api/skills/user/:skillId
```

Example:

```http
DELETE /api/skills/user/1
```

Authentication:

```text
Required
```

Request body:

```json
{
  "type": "TEACH"
}
```

The `type` is required because the same skill can theoretically exist as both TEACH and LEARN.

---

# 19. Matching APIs

## Get Matches

```http
GET /api/matches
```

Authentication:

```text
Required
```

The backend compares:

```text
My LEARN skills
        ↓
Other user's TEACH skills
```

and:

```text
My TEACH skills
        ↓
Other user's LEARN skills
```

### Response

```json
{
  "success": true,
  "count": 1,
  "matches": [
    {
      "id": 2,
      "name": "Jane",
      "email": "jane@example.com",
      "bio": "Designer",
      "profile_image": null,
      "location": "Coimbatore",
      "availability": "Weekends",
      "skills_they_can_teach": 1,
      "skills_they_want_to_learn": 1
    }
  ]
}
```

### Important

The current backend does **not** return:

```text
match_score
compatibility_score
AI_score
```

The current matching implementation is SQL-based.

The FastAPI AI service is planned for more advanced matching.

---

# 20. Get Match Details

```http
GET /api/matches/:id
```

Example:

```http
GET /api/matches/2
```

Authentication:

```text
Required
```

Response:

```json
{
  "success": true,
  "match": {
    "user": {
      "id": 2,
      "name": "Jane",
      "email": "jane@example.com",
      "bio": "Designer"
    },
    "skillsTheyCanTeach": [
      {
        "id": 5,
        "name": "UI/UX Design",
        "category": "Design",
        "level": "ADVANCED"
      }
    ],
    "skillsTheyWantToLearn": [
      {
        "id": 1,
        "name": "JavaScript",
        "category": "Programming",
        "level": "BEGINNER"
      }
    ]
  }
}
```

This endpoint can be used by a Match Details page.

---

# 21. Exchange Request APIs

## Send Exchange Request

```http
POST /api/requests
```

Authentication:

```text
Required
```

Request:

```json
{
  "receiverId": 2,
  "senderSkillId": 1,
  "receiverSkillId": 5,
  "message": "I can teach JavaScript if you teach me UI/UX Design."
}
```

Meaning:

```text
senderSkillId
    ↓
A skill the sender can TEACH

receiverSkillId
    ↓
A skill the receiver can TEACH
```

The request represents:

```text
I teach your skill
        ↕
You teach my desired skill
```

---

# 22. Get Received Requests

```http
GET /api/requests/received
```

Authentication:

```text
Required
```

Returns requests sent to the current user.

Useful for:

```text
Requests page
Notifications
Accept / Reject buttons
```

---

# 23. Get Sent Requests

```http
GET /api/requests/sent
```

Authentication:

```text
Required
```

Returns requests created by the current user.

Useful for:

```text
Sent Requests
Request status
Pending requests
Accepted requests
Rejected requests
```

---

# 24. Accept Request

```http
PUT /api/requests/:id/accept
```

Example:

```http
PUT /api/requests/10/accept
```

Authentication:

```text
Required
```

The request must belong to the current user as the receiver.

---

# 25. Reject Request

```http
PUT /api/requests/:id/reject
```

Example:

```http
PUT /api/requests/10/reject
```

Authentication:

```text
Required
```

---

# 26. Request Status

Possible statuses:

```text
pending
accepted
rejected
cancelled
```

Frontend should display user-friendly text:

```text
pending   → Pending
accepted  → Accepted
rejected  → Rejected
cancelled → Cancelled
```

---

# 27. Session APIs

Sessions can only be created from an accepted exchange request.

---

## Create Session

```http
POST /api/sessions
```

Authentication:

```text
Required
```

Request:

```json
{
  "requestId": 10,
  "scheduledAt": "2026-10-01 18:00:00",
  "meetingLink": "https://example.com/meeting"
}
```

The backend automatically determines:

```text
host
participant
```

from the accepted exchange request.

---

# 28. Get My Sessions

```http
GET /api/sessions
```

Authentication:

```text
Required
```

Returns sessions where the current user is either:

```text
host
```

or:

```text
participant
```

Example response:

```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "id": 1,
      "request_id": 10,
      "host_id": 1,
      "participant_id": 2,
      "scheduled_at": "2026-10-01T18:00:00.000Z",
      "status": "scheduled",
      "meeting_link": "https://example.com/meeting",
      "host_name": "John",
      "participant_name": "Jane"
    }
  ]
}
```

---

# 29. Get Session by ID

```http
GET /api/sessions/:id
```

Example:

```http
GET /api/sessions/1
```

Authentication:

```text
Required
```

Only participants of the session can access it.

---

# 30. Update Session

```http
PUT /api/sessions/:id
```

Authentication:

```text
Required
```

Possible fields:

```text
scheduledAt
meetingLink
status
```

Example:

```json
{
  "scheduledAt": "2026-10-01 19:00:00",
  "meetingLink": "https://example.com/new-meeting"
}
```

Possible status values:

```text
scheduled
ongoing
completed
cancelled
```

---

# 31. Complete Session

```http
PUT /api/sessions/:id/complete
```

Example:

```http
PUT /api/sessions/1/complete
```

Authentication:

```text
Required
```

The session status becomes:

```text
completed
```

---

# 32. Complete API Map

| Feature           | Method | Endpoint                 | Auth |
| ----------------- | ------ | ------------------------ | ---- |
| Register          | POST   | `/auth/register`         | No   |
| Login             | POST   | `/auth/login`            | No   |
| Current user      | GET    | `/auth/me`               | Yes  |
| All users         | GET    | `/users`                 | Yes  |
| My profile        | GET    | `/users/me`              | Yes  |
| Update profile    | PUT    | `/users/me`              | Yes  |
| User by ID        | GET    | `/users/:id`             | Yes  |
| All skills        | GET    | `/skills`                | No   |
| Skill by ID       | GET    | `/skills/:id`            | No   |
| Create skill      | POST   | `/skills`                | Yes  |
| Add user skill    | POST   | `/skills/user`           | Yes  |
| My skills         | GET    | `/skills/user/me`        | Yes  |
| Delete user skill | DELETE | `/skills/user/:skillId`  | Yes  |
| Get matches       | GET    | `/matches`               | Yes  |
| Match details     | GET    | `/matches/:id`           | Yes  |
| Send request      | POST   | `/requests`              | Yes  |
| Received requests | GET    | `/requests/received`     | Yes  |
| Sent requests     | GET    | `/requests/sent`         | Yes  |
| Accept request    | PUT    | `/requests/:id/accept`   | Yes  |
| Reject request    | PUT    | `/requests/:id/reject`   | Yes  |
| Create session    | POST   | `/sessions`              | Yes  |
| My sessions       | GET    | `/sessions`              | Yes  |
| Session details   | GET    | `/sessions/:id`          | Yes  |
| Update session    | PUT    | `/sessions/:id`          | Yes  |
| Complete session  | PUT    | `/sessions/:id/complete` | Yes  |

---

# 33. HTTP Status Codes

Frontend developers should handle these common responses.

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 200    | Request successful                      |
| 201    | Resource created                        |
| 400    | Invalid request                         |
| 401    | Authentication required / invalid token |
| 403    | Access denied                           |
| 404    | Resource not found                      |
| 409    | Conflict / duplicate                    |
| 500    | Server error                            |

Example frontend error handling:

```js
try {
  const data =
    await userService.getMyProfile();

  setUser(data.user);
} catch (error) {
  setError(error.message);
}
```

---

# 34. Protected API Rule

Any endpoint marked:

```text
Auth: Yes
```

must include:

```http
Authorization: Bearer <JWT_TOKEN>
```

The frontend `api.js` should handle this automatically.

Components should **not** manually attach the token every time.

Correct:

```js
await userService.getMyProfile();
```

Avoid:

```js
fetch(
  "http://localhost:5000/api/users/me",
  {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  }
);
```

The second approach creates repeated code throughout the application.

---

# 35. Recommended Frontend Service Pattern

Each service should contain backend-related functions.

Example:

```text
authService.js
    ↓
register()
login()
getMe()
logout()
```

```text
userService.js
    ↓
getUsers()
getMyProfile()
getUserById()
updateMyProfile()
```

```text
skillService.js
    ↓
getSkills()
getSkillById()
createSkill()
addUserSkill()
getMySkills()
deleteUserSkill()
```

```text
matchService.js
    ↓
getMatches()
getMatchById()
```

```text
requestService.js
    ↓
sendRequest()
getReceivedRequests()
getSentRequests()
acceptRequest()
rejectRequest()
```

```text
sessionService.js
    ↓
createSession()
getSessions()
getSessionById()
updateSession()
completeSession()
```

---

# 36. Page-to-API Mapping

## Login Page

Uses:

```text
POST /auth/login
```

Flow:

```text
Login form
    ↓
authService.login()
    ↓
JWT token
    ↓
localStorage
    ↓
Dashboard
```

---

## Register Page

Uses:

```text
POST /auth/register
```

Flow:

```text
Registration form
    ↓
authService.register()
    ↓
JWT token
    ↓
Dashboard
```

---

## Dashboard

Can use:

```text
GET /auth/me
GET /matches
GET /requests/received
GET /sessions
```

---

## Profile Page

Uses:

```text
GET /users/me
GET /skills/user/me
PUT /users/me
```

---

## Skills Page

Uses:

```text
GET /skills
GET /skills/user/me
POST /skills/user
DELETE /skills/user/:skillId
```

---

## Matches Page

Uses:

```text
GET /matches
```

---

## Match Details Page

Uses:

```text
GET /matches/:id
```

Then the user can send:

```text
POST /requests
```

---

## Requests Page

Uses:

```text
GET /requests/received
GET /requests/sent
PUT /requests/:id/accept
PUT /requests/:id/reject
```

---

## Sessions Page

Uses:

```text
GET /sessions
POST /sessions
PUT /sessions/:id
PUT /sessions/:id/complete
```

---

## Chat Page

Chat is planned to use:

```text
Firebase
```

It does not use the MySQL REST APIs for real-time messaging.

---

## Video Call Page

The session API provides:

```text
meeting_link
```

The frontend can use that link to open/join the selected video meeting.

---

# 37. Main Application Flow

The frontend should implement the application in this order:

```text
REGISTER
   ↓
POST /auth/register
   ↓
JWT
   ↓
LOGIN
   ↓
POST /auth/login
   ↓
JWT
   ↓
PROFILE
   ↓
GET /users/me
   ↓
SKILLS
   ↓
GET /skills
   ↓
POST /skills/user
   ↓
MATCHES
   ↓
GET /matches
   ↓
MATCH DETAILS
   ↓
GET /matches/:id
   ↓
REQUEST
   ↓
POST /requests
   ↓
ACCEPT
   ↓
PUT /requests/:id/accept
   ↓
SESSION
   ↓
POST /sessions
   ↓
CHAT / VIDEO
   ↓
COMPLETE
   ↓
PUT /sessions/:id/complete
```

---

# 38. Important Frontend Rules

### Rule 1 — Do not access MySQL from React

Wrong:

```text
React → MySQL
```

Correct:

```text
React → Express → MySQL
```

---

### Rule 2 — Do not put JWT secrets in React

The frontend only receives the JWT token.

The JWT signing secret stays on the backend.

---

### Rule 3 — Use service files

Prefer:

```js
await matchService.getMatches();
```

instead of putting raw `fetch()` calls throughout components.

---

### Rule 4 — Handle loading states

Every API-driven page should consider:

```text
Loading
Success
Error
Empty
```

Example:

```text
Loading matches...

Matches found

No matches found

Failed to load matches
```

---

### Rule 5 — Handle authentication errors

If an API returns:

```text
401 Unauthorized
```

the frontend should normally:

```text
Remove invalid token
      ↓
Clear user state
      ↓
Redirect to Login
```

---

# 39. Backend Health Check

Before testing the frontend, verify:

```http
GET http://localhost:5000/
```

Then:

```http
GET http://localhost:5000/api/test
```

Then:

```http
GET http://localhost:5000/api/test-db
```

All three should work before frontend API integration is tested.

---

# 40. Development Goal

The frontend should eventually demonstrate:

```text
User
 ↓
Register
 ↓
Login
 ↓
Profile
 ↓
Teaching Skills
 ↓
Learning Skills
 ↓
Skill Matches
 ↓
Match Details
 ↓
Exchange Request
 ↓
Accept Request
 ↓
Schedule Session
 ↓
Chat
 ↓
Video Call
 ↓
Complete Session
```

This document should be treated as the main reference for frontend developers when connecting React components to the SkillSwap backend.
