## Codebase Summary

### Structure
- `cursor_docs/` contains PRD and planning docs.

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

### Recent Changes
- Added MVP PRD and roadmap docs to `cursor_docs/`.

### User Feedback Integration
- MVP decisions captured directly from stakeholder responses; scope intentionally minimal.


