# TIMEFALL: 2126 — M6
A real 2–6-player cooperative Three.js browser adventure. Humans arrive in 2126, restore a beacon, survive city security, solve the HELIX facility and choose their future at the Timefall portal. Fictional nicknames only; no account needed.

M6 staging is deployed separately from the preserved M5 service.

## Run
Node 24 (24.19.0 tested locally). `npm ci --include=dev`, `npm run build`, `npm start`. Open http://localhost:3000 (or the PORT printed at startup). The server binds `0.0.0.0:$PORT`; /health reports milestone 5. For development run `npm run dev:server` and `npm run dev`.

Create a room with a nickname. Share the five-character code; teammates join from their own devices. Everyone selects Ready; the host starts. Use contextual objectives and the large interaction button. Desktop: WASD/arrows, drag camera, wheel zoom, E. Phone: left joystick, right camera drag, action button. Use Quality: Low if needed.

## Journey and finale
Scan beacon; collect supplies; choose city security plan at WEST; different players operate WEST/EAST. Trace signal north. Synchronize facility airlock, read ALPHA/BETA separately, combine clues, route power and operate GENERATOR/RELAY. Optional caches, scanner disable, patrol diversion and archive help conserve supplies. Head north through the transit checkpoint to the portal.

Collect emergency portal supplies. At CORE choose stable power (20 Energy) or emergency surge (free, +15 Alert). This starts a server-controlled 90-second deadline. Repair coils (2 Materials) at the west service console and optionally disable final sentry (1 Material, −10 Alert) at the east console. Avoid the moving red field: 15 damage per 2.5 seconds, 25 at Alert ≥40. Two distinct healthy connected players hold WEST/EAST coils within 15 seconds while staying nearby. Activation starts a 30-second window. Two different explorers agree on Return or HELIX at DECISION. Gather everyone at CROSSING and confirm before expiry. A nearby standing teammate can revive a downed player to 40 Health. Walking consumes no Energy.

## Deterministic endings
* HOME / 2026: Return decision, stable power, repaired coils, Alert <40, every reserved explorer connected and standing within 8 units of CROSSING.
* THE PRICE OF A SECOND: Return decision and crossing, but one or more safe-return conditions fail. Standing connected explorers near CROSSING escape; others remain; emergency power scars the timeline.
* STRANDED / 2126: Charge or active deadline expires before crossing.
* THE HELIX ACCORD: Two distinct explorers choose HELIX and confirm crossing; canonical team outcome is remaining in 2126 as AI partners.

All outcomes resolve exactly once on the server. Host Play Again returns everyone to a clean lobby, resetting the full run. Temporary disconnect reserves the same player identity for 90 seconds. Host privileges transfer; expired reservations recalculate participation. Rooms are in memory and disappear on service restart, not persisted to a database.

## Architecture
Express + Socket.IO Node server owns room membership, movement/collision, Health, team supplies/Alert, puzzles, deadlines and endings. Strict Zod schemas, epoch/event/request IDs, range and eligibility checks, capped queues and rate budgets protect actions. Server ticks 20 Hz and snapshots 10 Hz during play; frozen endings receive membership/reset changes immediately without redundant periodic snapshots. Existing client prediction/reconciliation and remote interpolation remain. Shared gameplay constants live in `shared/survival.ts`, `facility.ts`, `portal.ts`. Client presents geometry/HUD and sends input intent; read-only `window.__M1`–`__M6` diagnostics expose no setters or reconnect tokens.

## Tests
Build first, then `npm test` (169 tests: 5 collision, 46 multiplayer integration, 30 survival, 40 facility, 48 portal). Real Socket.IO clients connect to ephemeral authoritative servers. Tests may arrange server fixtures; browser acceptance uses physical navigation and normal UI only.
`CHROMIUM_PATH=/path/to/chromium node tests/portal-browser.mjs` launches TWO independent Chromium processes, desktop and emulated touch portrait. It includes two full normal journeys, HELIX and safe-return endings, damage/revive, reconnect, host transfer, isolation, reset and screenshots. Optional BASE_URL runs against public staging; BROWSER_PROXY supports the managed environment. Never disable TLS validation. `node tests/multiplayer-browser.mjs`, `node tests/survival-browser.mjs`, `node tests/facility-browser.mjs` retain regression checks. `node tests/production-smoke.mjs` verifies npm start, PORT, root, health and WebSocket with the compiled build.

## Deploy
Use a separate `m5-staging` branch and Render Free Node service, never update preserved M2–M4 services. Build `npm ci --include=dev && npm run build`; start `npm start`; NODE_ENV=production, NODE_VERSION=24.19.0; health endpoint /health. `render.yaml` and Dockerfile are supplied. Express serves built client and same-origin Socket.IO over HTTPS/WSS. No secrets needed. Free cold starts and server restarts interrupt in-memory rooms. One instance only; horizontal scaling would require a shared room simulation/store and is outside M5.

## Performance / scope
Low-poly reused/instanced cuboids, one portal label atlas, bounded sentry geometry, no particle cloud/postprocessing/shadows. Low quality renders at DPR .75 and MSAA is disabled to reduce software fill cost. Software Chromium FPS is not physical phone performance. M5 completes core story; M6 audio/polish/accessibility/refinement remains unimplemented.
Preserved M4 branch `m4-staging`, commit `21f62f6727cc8fcab2dfeb7884ce04c76d30e433`. M1–M3 backups and staging remain untouched.


## M6 release polish
M6 adds lightweight WebAudio cues and ambience, independent volume/mute controls, reduced-motion enforcement, camera sensitivity, contextual onboarding, improved connection/rejection copy, mobile safe-area layout, keyboard focus visibility and HUD/ending presentation polish. These are client presentation features; authoritative movement, resources, timers, puzzles and deterministic endings remain server-owned and unchanged.

<!-- M6 public acceptance workflow trigger: independent Chromium verification -->
