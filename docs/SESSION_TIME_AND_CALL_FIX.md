# Session timing and live lesson behavior

This version fixes the session planner and two-person lesson room:

- The browser's local `datetime-local` value is converted to an ISO timestamp with timezone before it reaches the API.
- Session times are normalized to UTC and MySQL `DATETIME` values are read as UTC.
- The Sessions page converts UTC back to the participant's device-local time.
- The displayed lesson window includes both start and finish time.
- A 60-minute lesson scheduled for 8:00 PM ends at 9:00 PM even if the first participant joins late.
- The backend auto-completes both `SCHEDULED` and `ONGOING` sessions at the fixed scheduled end time, even if nobody joins.
- The live call room uses a deterministic room ID derived from the session ID, so both participants can enter the same room even if they both press Join instead of using the incoming-call popup.
- Incoming session calls carry the session ID, so the second participant also receives the same fixed session countdown.
- The server remains the source of truth for session completion; the browser countdown is only the UI layer.

## Important for existing sessions

Sessions created by the old version may already contain timezone-shifted values. For those old bookings, use **Can't attend → Confirm new time** (or cancel and schedule again) so the new UTC-safe format is written. New sessions created after this fix use the correct timezone handling.
