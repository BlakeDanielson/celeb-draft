## Tech Stack (Tentative; keep simple)

### App
- Web app (desktop-first), minimal UI components.

### Backend
- Simple REST + realtime (WebSocket/SSE or short-poll). Server validates picks and prevents duplicates.

### Data
- Minimal schema: League, Team, Celebrity (per league), DraftPick.

### Realtime Target
- Propagation within ≤5 seconds for joins/adds/picks.

Notes: Concrete framework/hosting decisions to be finalized during implementation planning.


