## Current Task

### Objective
Triage Task Master tasks, expand into actionable subtasks, and begin MVP implementation starting with Task 1 (Setup Project Structure and Database Schema).

### Context
- Task Master initialized; PRD parsed into `.taskmaster/tasks/tasks.json` with 15 tasks.
- Decisions: 2–20 teams, 5 picks per team, snake, randomized order, no timer/auto-pick/undo, invite-only, no auth, shared celebrity pool (name only), anyone can add pre/during, duplicates prevented, live sync ≤5s, recap only.

### Next Steps
- Task 1.9 (in progress): Implement Data Access Layer under `web/src/data/` and refactor API routes to use it.
- After DAL refactor, run lint/build and smoke test endpoints.
- Next: Start Task 1.10/1.11 integration tests once endpoints stabilize.

### Links
- See `cursor_docs/PRD.md` and `cursor_docs/projectRoadmap.md`.


