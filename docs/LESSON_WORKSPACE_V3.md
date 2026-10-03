# SkillSwap Lesson Workspace

## Product model

An accepted exchange is a long-running learning relationship. A request does not create a single call. It creates an exchange plan with a target number of lessons in each direction.

Flow:

`Match -> Exchange Request -> Accept -> Lesson Plan -> Schedule Lessons -> Attend/Rejoin -> Complete -> Continue until plan is complete`

## Scheduling rules

- Scheduling is managed from **Sessions**, not inside Requests.
- One exchange can contain many sessions.
- A user can add another lesson without creating another exchange request.
- A scheduled lesson can be moved when a participant cannot attend.
- The old booking is retained as history and a new booking is created.
- `Browser Back`, closing the tab, or a temporary WebRTC disconnect must not mean "End Lesson".
- Joining is blocked before the scheduled start time.
- A lesson cannot be restarted after its scheduled window has expired; the user can add/move another lesson from Sessions.
- The backend is the source of truth for session start eligibility and lesson status.

## Dashboard

The dashboard now emphasizes actionable work:

- next lesson
- active exchanges
- completed/scheduled/to-plan lesson counts
- quick actions
- teach/learn skill profile
- notifications

## Database additions

`exchange_requests`:
- `planned_learning_sessions`
- `planned_teaching_sessions`

`sessions`:
- `session_number`
- `rescheduled_from_id`
- `schedule_note`

The runtime initializer adds these columns to existing databases automatically.

## Lesson direction model

Each exchange plan has two independent directions: **Learning** and **Teaching**. For example, `Learn 1 · Teach 1` means two schedulable lessons, not one. Every session stores `lesson_type`, `learner_id`, `teacher_id`, and `skill_id`, so the lesson workspace can always show exactly who is teaching, who is learning, and which skill is being covered.
