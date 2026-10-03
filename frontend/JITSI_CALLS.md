# SkillSwap calls: media-server integration

SkillSwap keeps Firebase Realtime Database for the existing incoming-call invitation, call lifecycle, and session chat. The browser no longer implements its own offer/answer/ICE engine.

Audio/video is provided by Jitsi Meet through its IFrame API. The embedded meeting uses the Jitsi bridge/SFU path (`p2p.enabled=false`) so phone-to-laptop calls do not depend on a direct browser-to-browser media path.

## Development

The default is:

```env
VITE_JITSI_DOMAIN=meet.jit.si
```

The frontend loads the Jitsi IFrame API from that host at runtime. Jitsi documents this integration at https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/.

## Production

For production, set `VITE_JITSI_DOMAIN` to a Jitsi deployment controlled by your project or to the JaaS-compatible deployment you have configured. Do not put a JaaS JWT signing secret in the Vite frontend. If JWT-authenticated rooms are used, generate the token on a trusted backend and pass only the short-lived token to the frontend.

No database schema, API routes, authentication flow, or deployment configuration is required by this frontend integration beyond the new `VITE_JITSI_DOMAIN` value.

## Call room identity

Each SkillSwap call gets a unique room derived from its Firebase `callId`:

`SkillSwap-<callId>`

The Firebase invitation still controls who is allowed to enter the SkillSwap call flow; the media provider carries the actual audio/video packets.
