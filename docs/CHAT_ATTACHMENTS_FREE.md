# SkillSwap — Free Chat Attachments

SkillSwap chat attachments no longer use Firebase Storage.

## Architecture
- Firebase Realtime Database: realtime chat messages and presence.
- SkillSwap Node/Express backend: receives chat files and stores them under `backend/uploads/chat`.
- Firebase Storage: **not required** for chat attachments and no Firebase Storage billing setup is needed.

## Supported files
Photos plus PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV and ZIP files up to 20 MB.

## Run locally
Start the backend normally:

```bash
cd backend
npm install
npm run dev
```

The frontend sends files to `POST /api/uploads/chat` and then writes the returned attachment URL into the existing Firebase Realtime Database chat message.

## Important hosting note
The backend filesystem is intentionally used because it does not require a paid object-storage account. On hosts with ephemeral disks (for example, many free web-service deployments), uploaded files can disappear after a redeploy/restart. For a permanent production attachment system, use a persistent disk or object storage later.

## Firebase setup
You still need Firebase Authentication/Realtime Database for realtime chat. You do **not** need to initialize Firebase Storage just for attachments.
