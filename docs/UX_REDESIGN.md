# SkillSwap UX / Realtime Session Redesign

This version keeps the existing MySQL/API/Firebase architecture and upgrades the product layer.

## Product flow

Landing -> Login/Register -> Skill setup -> Dashboard -> Matches -> Request -> Accepted connection -> Messages -> Session -> Learning completion.

## Authentication UX

- Login is a focused single-task screen with inline validation, password visibility, loading state and protected navigation.
- Registration is a two-step client-side flow: profile details, then password/security. Skill selection remains a separate onboarding step.
- No mock account data is inserted into the UI.

## Session UX

- `/video-call` and `/voice-call` use the same realtime call room.
- A connected session can switch between video and audio-only mode without leaving the room.
- Microphone and camera controls update the live MediaStream.
- Session chat uses Firebase Realtime Database.
- Call ending writes the call end state and cleans up media/peer connection state.
- Incoming call handling is mounted in the authenticated application shell, so the user does not have to keep the Messages screen open.

## Design system

- Dark glass workspace, soft gradients and restrained motion.
- Shared spacing, focus, border, button and empty-state language.
- Responsive sidebar/mobile navigation.
- Reduced-motion preference is respected globally.

## Important WebRTC note

The frontend can use a configured TURN server through the existing Vite variables. For production, long-lived TURN secrets should be kept server-side and short-lived credentials should be issued to the browser.
