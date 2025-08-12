# Death Draft MVP — Product Requirements Document (PRD)

## 1. Overview
Simple, invite-only “death draft” game for friends/coworkers. Players join a league via shareable link and conduct a one-time snake draft selecting celebrities. No scoring or season play in MVP — drafting experience only. Live updates target up to 5s latency.

## 2. Goals and Non‑Goals
- Goals:
  - Create and join private leagues (invite link; no auth)
  - Conduct a snake draft with randomized order
  - Maintain a shared celebrity pool; allow adding new celebrities pre/during draft
  - Prevent duplicate celebrity entries and picks
  - Real-time draft sync (≤5s perceived lag)
  - Provide a simple post-draft recap in-app (no exports)
- Non‑Goals (MVP):
  - Post‑draft gameplay, scoring, standings, payouts
  - Authentication, profiles, friends list
  - Trading, undo, timers, auto-picks
  - Advanced search/filters, queues, reports/exports

## 3. Audience and Roles
- Audience: Small private groups (friends/coworkers)
- Roles:
  - Commissioner: Creates league, configures size, starts the draft; only one commissioner per league
  - Participant: Joins via link, picks in draft, can add celebrities

## 4. Assumptions and Constraints
- No authentication; participants provide a display name on join
- League access via unguessable invite link; joins disabled once draft starts
- Max teams per league: 20; min: 2
- Roster size: 5 picks per team
- Draft format: Snake; order randomized at draft start
- No timer; no auto-pick; no undo
- Celebrity model: name only; duplicates prevented (case-insensitive, trimmed)
- Live sync target: updates propagate within 5 seconds

## 5. In-Scope Features (MVP)
1) League lifecycle
   - Create league with name, max teams (2–20; default can be 8), picks per team (fixed at 5 in MVP)
   - Generate invite link (includes join token)
   - Commissioner can start draft; starting locks league from new joins
2) Join flow (no auth)
   - Open invite link → enter display name → join as a team until capacity
   - If full or started, show appropriate messaging
3) Celebrity pool
   - Shared per-league pool
   - Add celebrity by name pre-draft and during draft
   - Prevent duplicate names (case-insensitive, trimmed)
4) Drafting
   - Randomize draft order on start; show pick order
   - Snake pattern across rounds until each team has 5 picks
   - Current pick indicator, up-next indicator, simple draft board
   - Prevent picking already-picked celebrities
5) Search and views
   - Basic text search over celebrity names
   - Views: Draft board, available list, team rosters, recap
6) Realtime
   - Participants see picks/joins/additions within ≤5s
   - Basic resilience: attempt reconnect; if offline, allow manual refresh
7) Recap
   - In-app recap showing final rosters and draft order; no CSV/PDF export

## 6. Out-of-Scope (MVP)
- Authentication, user profiles
- Timers, auto-picks, commissioner undo
- Trades, drops, waivers
- Advanced moderation (kick/lock by user), chat, reactions
- Bulk celebrity imports, metadata, categories
- Exports, analytics dashboards

## 7. Key User Stories and Acceptance Criteria
1) As a commissioner, I can create a league and share an invite link.
   - AC: Creating a league returns an invite URL containing a secure token
   - AC: League shows configured team cap (2–20) and picks per team (5)
2) As a participant, I can join a league via link without an account.
   - AC: I enter a display name and join unless full or started
   - AC: On success, I’m visible in the team list
3) As any participant, I can add a celebrity by name, avoiding duplicates.
   - AC: Adding a name that differs only by case/whitespace is blocked
   - AC: Newly added celebrities appear in the pool for all within ≤5s
4) As a commissioner, I can start the draft which locks new joins.
   - AC: Starting sets status to drafting and prevents new joins
   - AC: Draft order is randomized and displayed to all
5) As a participant on the clock, I can select an available celebrity.
   - AC: Picks are validated: cannot pick already-picked celebrity
   - AC: Pick broadcasts to all within ≤5s and advances the clock
6) As any participant, I can view a simple draft board and team rosters.
   - AC: Current pick, up-next, and round/overall indicators are visible
7) As any participant, I can view a post-draft recap in-app.
   - AC: Recap lists final rosters by team and overall draft order

## 8. Draft Mechanics
- Teams: 2–20; roster size fixed at 5 picks per team
- Order: Randomized once at start; snake format
- Rounds: Exactly 5 rounds
- Timing: No pick timer; manual pacing
- Conflicts: First confirmed pick wins; prevent double-pick via server-side lock

## 9. UX Requirements (MVP)
- Pre‑draft lobby: league name, teams joined, capacity, invite link copy
- Draft view:
  - Header: league name, status (setup/drafting/complete)
  - Draft board: current pick, up-next, round/overall, team order
  - Available list with basic text search; add-celebrity field/button
  - Team panels: each team’s roster (up to 5)
  - Start Draft button (commissioner only)
- Recap view: final rosters and overall pick list
- Empty states and simple error toasts for collisions/validation

## 10. Realtime and Performance
- Propagation target: ≤5 seconds for joins, additions, and picks
- Strategy: WebSocket or server‑sent events preferred; fallback to short polling (e.g., 2–5s)
- Concurrency: Server-side validation to ensure single pick per slot; idempotent endpoints
- Resilience: Auto-retry/reconnect; manual refresh affordance if disconnected

## 11. Data Model (MVP sketch)
- League
  - id, name, joinToken, status: setup|drafting|complete, maxTeams (2–20), picksPerTeam (5), createdAt
- Team
  - id, leagueId, displayName, draftPosition (1..N), joinedAt
- Celebrity (per league)
  - id, leagueId, name (unique per league, case-insensitive), addedByTeamId, addedAt
- DraftPick
  - id, leagueId, round (1..5), overall (1..N*5), teamId, celebrityId, pickedAt

Notes:
- Uniqueness: celebrity.name unique within league (normalize case/trim)
- Join token: sufficiently random to resist guessing; join disabled after start
- No users/auth; team is ephemeral identity bound to display name

## 12. Validation and Error Handling
- Joining when full or started → informative block message
- Duplicate celebrity add → inline error and prevent
- Picking already-picked celebrity or out of turn → block with clear message
- Network issues → toast and retry; indicate offline state

## 13. Security and Privacy (MVP)
- No PII beyond display names
- Unguessable join tokens; no directory listing of leagues
- Rate-limit celebrity add and pick endpoints to avoid spam

## 14. Telemetry (nice-to-have, not required for MVP)
- Leagues created, joins, draft started/completed counts

## 15. Acceptance Checklist (Go/No-Go)
- Create/join private league via link; join lock after start
- Snake draft with randomized order; 5 rounds; 2–20 teams
- Shared per-league celebrity pool; add pre/during; duplicates blocked
- Live updates within ≤5s for joins/adds/picks
- Simple draft board and recap views
- No timer, no auto-pick, no undo, no exports

## 16. Post-MVP Backlog (deferred)
- Auth and persistent profiles
- Commissioner undo; timers; auto-pick; queues
- Chat, reactions, commissioner moderation tools
- Bulk celebrity import; metadata; categories/tags
- CSV/PDF export; analytics dashboards


