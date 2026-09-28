# SkillSwap API Documentation

## Base URL

```text
http://localhost:5000/api
```

---

## 1. Authentication

### Register

**POST** `/auth/register`

Creates a new user account.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "JWT_TOKEN"
}
```

---

### Login

**POST** `/auth/login`

Logs an existing user into SkillSwap.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "JWT_TOKEN"
}
```

---

## 2. User

### Get Current User

**GET** `/users/me`

Returns the profile of the currently logged-in user.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

### Update Profile

**PUT** `/users/me`

Updates the current user's profile.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

#### Request Body

```json
{
  "name": "John Doe",
  "bio": "I teach JavaScript and want to learn UI/UX."
}
```

---

## 3. Skills

### Get All Skills

**GET** `/skills`

Returns all available skills.

#### Response

```json
[
  {
    "id": 1,
    "name": "JavaScript",
    "description": "Programming language used for web development"
  },
  {
    "id": 2,
    "name": "React",
    "description": "JavaScript library for building user interfaces"
  }
]
```

---

### Add User Skill

**POST** `/users/skills`

Adds a skill to the current user's profile.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

#### Request Body

```json
{
  "skill_id": 1,
  "skill_type": "teach",
  "proficiency": "advanced"
}
```

`skill_type`:

```text
teach
learn
```

`proficiency`:

```text
beginner
intermediate
advanced
```

---

### Get User Skills

**GET** `/users/skills`

Returns the current user's teaching and learning skills.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## 4. AI Matching

### Get Matches

**GET** `/matches`

Returns potential skill-exchange partners.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

#### Example Response

```json
[
  {
    "user_id": 2,
    "name": "Jane Smith",
    "match_score": 85,
    "teaches": "UI/UX Design",
    "learns": "JavaScript"
  }
]
```

The AI service calculates compatibility between users based on their teaching and learning skills.

---

## 5. Exchange Requests

### Send Request

**POST** `/requests`

Sends an exchange request to another user.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

#### Request Body

```json
{
  "receiver_id": 2,
  "sender_skill_id": 1,
  "receiver_skill_id": 9,
  "message": "I can teach JavaScript in exchange for UI/UX lessons."
}
```

---

### Get Requests

**GET** `/requests`

Returns exchange requests sent and received by the current user.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

### Accept Request

**PUT** `/requests/:id/accept`

Accepts an exchange request.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

### Reject Request

**PUT** `/requests/:id/reject`

Rejects an exchange request.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## 6. Sessions

### Create Session

**POST** `/sessions`

Creates a learning session after an exchange request is accepted.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

#### Request Body

```json
{
  "request_id": 1,
  "participant_id": 2,
  "scheduled_at": "2026-10-05 18:00:00",
  "meeting_link": "https://example.com/meeting"
}
```

---

### Get Sessions

**GET** `/sessions`

Returns the current user's sessions.

#### Header

```text
Authorization: Bearer JWT_TOKEN
```

---

## 7. Authentication

Protected endpoints use JWT authentication.

Include the token in every protected request:

```text
Authorization: Bearer JWT_TOKEN
```

---

## 8. HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| `200`  | Request successful    |
| `201`  | Resource created      |
| `400`  | Bad request           |
| `401`  | Unauthorized          |
| `403`  | Forbidden             |
| `404`  | Resource not found    |
| `500`  | Internal server error |

---

## 9. SkillSwap Application Flow

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
AI Matching
   ↓
Send Exchange Request
   ↓
Accept Request
   ↓
Create Session
   ↓
Chat / Video Call
   ↓
Complete Skill Exchange
```

---

## 10. Technology

| Component       | Technology            |
| --------------- | --------------------- |
| Frontend        | React + Tailwind CSS  |
| Backend         | Node.js + Express     |
| Database        | MySQL                 |
| Authentication  | JWT                   |
| AI Service      | Python + FastAPI      |
| Real-time Chat  | Firebase              |
| Video Call      | Video/meeting service |
| Version Control | Git + GitHub          |

````

Save it as:

```text
SkillSwap/docs/API.md
````

Then commit it on your `frontend1` branch if you're the one maintaining the project documentation:

```bash
git add docs/API.md
git commit -m "Add API documentation"
git push origin frontend1
```
