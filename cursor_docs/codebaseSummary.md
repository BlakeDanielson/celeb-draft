## Codebase Summary

### Structure
- `cursor_docs/` contains PRD and planning docs.
- `.taskmaster/` stores Task Master configuration and generated task definitions.

### Key Components (planned)
- League creation and invite flow
- Join lobby (no auth; display name)
- Draft engine (snake; 5 rounds)
- Celebrity pool (per league) and search
- Realtime sync (≤5s)
- Recap view

### Data Flow (planned)
- Client → API: create/join/start, add celebrity, make pick
- Server → Clients: realtime updates for joins/adds/picks

### External Dependencies
- None selected yet (to be decided during implementation planning)
- Task Master AI (MCP) used for planning and task tracking only (no runtime dependency).

### Recent Changes
- Added MVP PRD and roadmap docs to `cursor_docs/`.
- Initialized Task Master and parsed PRD into `.taskmaster/tasks/tasks.json`.

### User Feedback Integration
- MVP decisions captured directly from stakeholder responses; scope intentionally minimal.


