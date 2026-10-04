# SkillSwap call architecture

## Scheduled lessons are meeting rooms

A scheduled lesson is **not** treated as an incoming phone call.

1. Participant A opens the scheduled lesson during its fixed time window.
2. A is placed in the same deterministic Firebase room: `calls/session-<sessionId>`.
3. A creates a presence record under `participants/<userId>` and sees **Waiting for participant**.
4. No incoming-call notification is sent to Participant B.
5. Participant B opens the same lesson from their Sessions page and creates their presence record.
6. When the room contains both participants, both clients start WebRTC negotiation.
7. The scheduled end time remains `scheduled_at + duration_minutes`, regardless of when either person actually joins.
8. Leaving the browser removes the participant presence. Explicitly ending the session completes the lesson.

This gives the session the behavior of a two-person Zoom/Meet room instead of a phone call.

## Direct calls

Calls started outside a scheduled lesson still use the incoming-call notification flow.
