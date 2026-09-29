# SkillSwap API Documentation

## Base URL

```text
http://localhost:5000/api
```

---

# 1. Authentication

## Register

**POST** `/auth/register`

Creates a new SkillSwap user account.

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "college": "ABC College",
  "register_no": "REG12345",
  "department": "Computer Science",
  "password": "password123"
}
```

Optional profile fields:

```json
{
  "bio": "I enjoy teaching programming.",
  "location": "Coimbatore",
  "availability": "Weekends"
}
```

### Response

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "REG12345",
    "department": "Computer Science",
    "bio": null,
    "location": null,
    "availability": null
  }
}
```

---

## Login

**POST** `/auth/login`

Logs an existing user into SkillSwap.

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "REG12345",
    "department": "Computer Science",
    "bio": null,
    "profile_image": null,
    "location": null,
    "availability": null
  }
}
```

---

## Get Current User

**GET** `/auth/me`

Returns the currently authenticated user.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Response

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "ABC College",
    "register_no": "REG12345",
    "department": "Computer Science",
    "bio": null,
    "profile_image": null,
    "location": null,
    "availability": null
  }
}
```

---

# 2. Users

## Get All Users

**GET** `/users`

Returns users other than the currently logged-in user.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Get My Profile

**GET** `/users/me`

Returns the current user's profile.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Update My Profile

**PUT** `/users/me`

Updates the current user's profile.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

Any supported profile fields can be updated:

```json
{
  "name": "John Doe",
  "bio": "I teach JavaScript.",
  "profile_image": "https://example.com/profile.jpg",
  "location": "Coimbatore",
  "availability": "Evenings"
}
```

### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## Get User By ID

**GET** `/users/:id`

Returns another user's profile and their teaching/learning skills.

### Example

```text
GET /users/2
```

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

# 3. Skills

## Get All Skills

**GET** `/skills`

Returns all available skills.

### Example Response

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

## Get Skill By ID

**GET** `/skills/:id`

Example:

```text
GET /skills/1
```

---

## Create New Skill

**POST** `/skills`

Creates a new skill.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

```json
{
  "name": "Docker",
  "category": "Development Tools",
  "description": "Containerization platform for applications"
}
```

---

## Add Skill To My Profile

**POST** `/skills/user`

Adds a teaching or learning skill to the current user's profile.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

```json
{
  "skillId": 1,
  "type": "TEACH",
  "level": "ADVANCED"
}
```

### `type`

```text
TEACH
LEARN
```

### `level`

```text
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

---

## Get My Skills

**GET** `/skills/user/me`

Returns the current user's teaching and learning skills.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Example Response

```json
{
  "success": true,
  "count": 2,
  "teach": [
    {
      "id": 1,
      "skill_id": 1,
      "name": "JavaScript",
      "type": "TEACH",
      "level": "ADVANCED"
    }
  ],
  "learn": [
    {
      "id": 2,
      "skill_id": 9,
      "name": "UI/UX Design",
      "type": "LEARN",
      "level": "BEGINNER"
    }
  ]
}
```

---

## Delete Skill From My Profile

**DELETE** `/skills/user/:skillId`

Example:

```text
DELETE /skills/user/1
```

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

```json
{
  "type": "TEACH"
}
```

---

# 4. Skill Matching

## Get Matches

**GET** `/matches`

Returns users whose teaching and learning skills are compatible with the current user's skills.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

The current backend performs this matching using the database skill relationships.

The current response includes:

```json
{
  "success": true,
  "count": 1,
  "matches": [
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "bio": "I enjoy design.",
      "profile_image": null,
      "location": "Coimbatore",
      "availability": "Weekends",
      "skills_they_can_teach": 1,
      "skills_they_want_to_learn": 1
    }
  ]
}
```

---

## Get Match By User ID

**GET** `/matches/:id`

Example:

```text
GET /matches/2
```

Returns the matched user's information and the skills that connect the two users.

---

# 5. Exchange Requests

## Send Exchange Request

**POST** `/requests`

Sends an exchange request to another user.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

```json
{
  "receiverId": 2,
  "senderSkillId": 1,
  "receiverSkillId": 9,
  "message": "I can teach JavaScript in exchange for UI/UX lessons."
}
```

### Important

`senderSkillId` and `receiverSkillId` refer to **skill IDs from the `skills` table**.

The sender's selected skill must be one they can teach, and the receiver's selected skill must be one they can teach.

---

## Get Received Requests

**GET** `/requests/received`

Returns exchange requests received by the current user.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Get Sent Requests

**GET** `/requests/sent`

Returns exchange requests sent by the current user.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Accept Request

**PUT** `/requests/:id/accept`

Accepts an exchange request.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

Example:

```text
PUT /requests/1/accept
```

---

## Reject Request

**PUT** `/requests/:id/reject`

Rejects an exchange request.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

Example:

```text
PUT /requests/1/reject
```

---

# 6. Sessions

Sessions are created after an exchange request has been accepted.

## Create Session

**POST** `/sessions`

Creates a learning session for an accepted exchange request.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

### Request Body

```json
{
  "requestId": 1,
  "scheduledAt": "2026-10-05 18:00:00",
  "meetingLink": "https://example.com/meeting"
}
```

The backend determines the host and participant from the accepted exchange request.

### Response

```json
{
  "success": true,
  "message": "Session created successfully",
  "sessionId": 1
}
```

---

## Get My Sessions

**GET** `/sessions`

Returns sessions where the current user is either the host or participant.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Get Session By ID

**GET** `/sessions/:id`

Example:

```text
GET /sessions/1
```

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## Update Session

**PUT** `/sessions/:id`

Updates the session schedule, meeting link, or status.

### Request Body

```json
{
  "scheduledAt": "2026-10-05 19:00:00",
  "meetingLink": "https://example.com/new-meeting",
  "status": "ongoing"
}
```

Allowed statuses:

```text
scheduled
ongoing
completed
cancelled
```

---

## Complete Session

**PUT** `/sessions/:id/complete`

Marks the session as completed.

### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

# 7. Authentication

Protected endpoints require JWT authentication.

Include the token in the request header:

```text
Authorization: Bearer JWT_TOKEN
```

The JWT is generated during registration or login and is valid for 7 days.

---

# 8. HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| `200`  | Request successful    |
| `201`  | Resource created      |
| `400`  | Bad request           |
| `401`  | Unauthorized          |
| `403`  | Forbidden             |
| `404`  | Resource not found    |
| `409`  | Conflict              |
| `500`  | Internal server error |

---

# 9. SkillSwap Application Flow

```text
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
Send Exchange Request
   ↓
Accept Request
   ↓
Create Session
   ↓
Chat / Video Call
   ↓
Complete Session
```

---

# 10. Technology

| Component       | Technology              |
| --------------- | ----------------------- |
| Frontend        | React + Tailwind CSS    |
| Backend         | Node.js + Express       |
| Database        | MySQL                   |
| Authentication  | JWT                     |
| AI Service      | Python + FastAPI        |
| Real-time Chat  | Firebase                |
| Video Call      | Video / meeting service |
| Version Control | Git + GitHub            |

---

# 11. Current Implementation Note

The current `/matches` backend performs skill matching using MySQL queries based on teaching and learning skill relationships.

The separate Python + FastAPI AI service is part of the planned SkillSwap architecture and can later be connected to the matching flow.

The API documentation should therefore be updated again when the AI service is integrated into the backend.
