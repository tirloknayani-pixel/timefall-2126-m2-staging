# TIMEFALL: 2126 — Milestone 4

M4 public staging: https://timefall-2126-m4-staging.onrender.com/

A cinematic low-poly Three.js adventure prototype with genuine server-authoritative multiplayer. Two to six explorers arrive in an abandoned future city, scan a shared emergency beacon and trace a distant portal signal. M3 adds server-authoritative survival, supplies, a security drone, a timed two-operator encounter, and teammate revival. M4 extends the avenue into the navigable HELIX AI facility. The portal finale and endings remain out of scope.

## Install, build and run

Use Node.js 24 and npm:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. `PORT` overrides port 3000. `/health` returns JSON. For phones on your Wi-Fi, use `http://YOUR_COMPUTER_LAN_IP:3000`; permit inbound access through your firewall. Both devices must reach the same Node server. Production HTTPS is recommended.

For development, run `npm run dev:server` and `npm run dev` in separate terminals. Vite proxies Socket.IO to port 3000.

## Create, join and play

Create a room with a fictional display nickname. Share the five-character room code with another device. Join codes are case-insensitive. Every connected player selects Ready; the host starts when at least two players are connected and all are ready. Colors distinguish avatars. Approach the cyan beacon and scan it. One valid scan updates the whole team's objective. Follow the avenue toward the amber barrier and trace the signal. The distant portal remains a landmark in M2.

Desktop: WASD/arrows move; drag the world to rotate the third-person camera; wheel changes distance; E or the action button interacts. Mobile: left joystick moves; drag the right side to look; large action button interacts. Controls offers quality, reduced-motion and performance options. The host can return everyone to the lobby and start a new round.

Temporary disconnects reserve a slot for 90 seconds. Reload or return in the same tab to restore identity and position. Closing the tab may lose its token. Host privileges immediately transfer to another connected explorer. No account or personal information is required.

## Architecture

`server/engine.ts` owns membership, player identity, readiness, host privileges, start/reset, movement/collision and shared objectives. `server/app.ts` exposes Express and same-origin Socket.IO. Simulation runs at 20 Hz; playing-room snapshots at 10 Hz. Clients send bounded input commands, never authoritative positions. Shared collision data supports prediction and validation. Clients reconcile predicted movement with authoritative acknowledgements; remote avatars interpolate snapshots with a 120 ms delay.

`shared/` contains strict Zod schemas, types and map geometry. `src/network.ts` handles transport and prediction. `src/main.ts`, `world.ts`, `controls.ts` and `style.css` preserve M1's graphics and controls while presenting server state. Cryptographically random reconnect tokens use tab-scoped sessionStorage only for restoration; tokens never enter teammate broadcasts. Duplicate nicknames do not determine identity. Packet limits and rate bounds constrain malfunctioning clients.

Rooms are in-memory and single-process. Server restarts lose rooms. Run exactly one instance; scaling requires shared authoritative infrastructure beyond M4. Do not share reconnect tokens/browser storage.

## Tests

```sh
npm run build
npm test
npx playwright install chromium
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The five original M1 collision checks remain unchanged. Integration tests use real Socket.IO connections and deterministic injected simulation clocks where useful; the production-frequency test uses real timers. Browser tests use two separate browser processes and write screenshots/results under `evidence/local/`. Set `CHROMIUM_PATH` to Chrome/Chromium installed on your machine; this workspace defaults to a separately supplied packaged Chromium at `../browser-runtime/chromium`.

Repeat against a public service:

```sh
BASE_URL=https://YOUR-SERVICE.onrender.com CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

Original M1 browser scripts are preserved in `tests/m1-preserved/`. Their solo landing flow is historical; the M2 suite tests the multiplayer lobby.

## Persistent Node deployment

`render.yaml` describes a single-instance free Node web service. Push the complete project to a repository accessible to Render and create a Blueprint, or configure a Node Web Service with:

- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Health: `/health`
- Environment: `NODE_ENV=production`, Node 24
- Instances: one

The host supplies `PORT`. Built client and Socket.IO share one port and origin. Do not deploy as a static site. No browser secrets are needed. Runtime uses compiled JavaScript and production dependencies; TypeScript/Vite/tsx are build tools only. A multi-stage Dockerfile is included.

Verify public root, `/health`, WebSocket transport and two independent clients after deployment. Local tests do not prove production connectivity. Review hosting resource/availability limits before a competition session.

## Manual phone test

Use a real phone and a separate computer or second phone. Create/join, Ready both and start. Check both avatars, independent movement, joystick release, camera drag, shared scan, portrait/landscape layout and readable HUD. Switch away/reload within 90 seconds; verify restored identity without duplicates. Disconnect the host and verify transfer. Return to lobby and start again. Use Controls → Performance for actual-device FPS. No physical phone was tested in this workspace.

## M3 staging

Playable Free staging: https://timefall-2126-m3-staging.onrender.com/

Source: https://github.com/tirloknayani-pixel/timefall-2126-m2-staging

Free instances may sleep while idle and take 50 seconds or more to wake. Server restarts clear in-memory rooms. Open the site before sharing a code. Browser acceptance supports an optional `BROWSER_PROXY` for managed test environments; do not commit proxy credentials. HTTPS validation remains enabled.

## M3 survival rules

All rules and positions are in `shared/survival.ts`. Initial Health 100 each, team Energy 30, Materials 2, Robot Alert 0. Walking never consumes Energy. Collect cyan cells (+20 Energy), amber material (+2), or green medical kits (+35 collector Health, capped at 100). Each supply is server-owned and can be collected once within 2.5 units. Team reserves cap at Energy 100, Materials 20, Alert 100.

Scan the beacon, then approach WEST power at (-3,-17). Choose divert (45 Energy, temporarily disable drone), shielding (4 Materials, reduce damage to 5), or risky bypass (no spend, +20 Alert and 35 damage). Normal drone damage is 25 every 2 seconds inside the red circle centered (0,-24), radius 4.2; every detection adds 3 Alert.

Once selected, two different explorers must operate WEST power and EAST ground (3,-17) within **45 server-controlled seconds**. Each player contributes once and each terminal accepts one contribution. Three to six players still require only two operators; others can collect or revive. Reservations retain participation for 90 seconds; expired/leaving members are removed and requirements recalculate, allowing one remaining operator if the team shrinks to one. The deadline continues during temporary disconnects.

Success preserves the chosen security state. Timeout resolves once, restores normal security, adds 15 Alert and deals 30 Health to the team, including reserved players. The event cannot be retried until a host reset. Outcomes and timers are authoritative; on-screen countdown is a display of the server deadline.

Health 0 means incapacitated: no movement, scans, collection or decisions. A connected standing teammate within 2.8 units can revive once to Health 40. Revive provides 2 seconds before the next drone damage, so leave the zone promptly. Medical collection cannot revive an incapacitated player. If everyone falls, the host can use Controls → Return team to lobby for a fresh run.

M3 adds `survival:action` strict payload validation, range/epoch/event checks, duplicate protections and server-only spending/damage. No client Health or outcome claims are accepted. `npm test` includes 5 preserved M1 collision checks, 46 preserved M2 integration checks and 30 new real Socket.IO survival checks. `node tests/survival-browser.mjs` runs actual two-process M3 acceptance; `BASE_URL` repeats it on staging. Production smoke: `node tests/production-smoke.mjs`.

## M2 recovery and scope

M2 remains on repository `main` at commit `88817e11030815fd4f7a798b9602b77c353dc186` and https://timefall-2126-m2-staging.onrender.com/ . M3 source uses branch `m3-staging` in the same repository and a separate Render Free service. M1 and its backup are unchanged. This M4 branch adds the HELIX facility; the preserved M3 deployment remains unchanged. The resource-crisis adventure and portal finale remain later work.

The creator reports a successful two-player physical-phone test of M2. That report does not establish physical-phone performance for M3; M3 and M4 still require real-phone testing.

## M4 HELIX facility walkthrough

Resolve the city security event (success or timeout), then trace the signal at the north barrier. Two different explorers hold WEST/EAST entry stations within 8 seconds, staying nearby until entry opens. In the memory vault, different explorers read ALPHA and BETA fragments at opposite terminals. Share the symbols, then choose ALPHA–BETA at CIPHER. Each run varies the symbols. Wrong answers cost 8 operator Health and +5 Alert.

Cross the central research door. Explore optional caches, avoid the scanner field along the sides, or distract it for 8 Energy/20 seconds or disable it for 2 Materials. The reactor patrol moves across the middle; avoid it or divert it at PATROL for 10 Energy. Challenging it costs +5 Alert and increases its damage.

At ROUTE, choose 12 Energy, 3 Materials, or overload (no supplies, −15 team Health, +15 Alert). Different explorers operate GENERATOR and RELAY. The transit checkpoint opens; an optional archive grants +8 Energy and fictional portal information. This is the M4 endpoint: no finale or endings.

Supplies and walking preserve the M3 rules. Collectibles reward once. Incapacitated explorers need a standing connected teammate nearby. Scanner hits cause 12 damage; patrol hits 18 (26 if provoked), every 2.5 seconds at most. All tuning and station positions are in `shared/facility.ts`. Reservation expiry recalculates cooperation for survivors; temporary disconnect retains identity and completed contributions, while incapacitated power contributors stop counting.

### M4 tests

```sh
npm run build
npm test
npm run test:facility
CHROMIUM_PATH=/path/to/chromium node tests/facility-browser.mjs
CHROMIUM_PATH=/path/to/chromium node tests/survival-browser.mjs
BASE_URL=https://YOUR-M4.onrender.com CHROMIUM_PATH=/path/to/chromium node tests/facility-browser.mjs
```

Browser tests launch two independent Chromium processes. They use keyboard traversal plus actual touch interactions on a mobile viewport; this is not physical-phone testing. Playwright browsers can be installed with `npx playwright install chromium`, then set CHROMIUM_PATH to the installed executable. Only set BROWSER_PROXY if your environment requires an HTTP proxy.

### Separate deployment and preservation

M4 uses branch `m4-staging` of `tirloknayani-pixel/timefall-2126-m2-staging`, separate Render Free service `timefall-2126-m4-staging`. Build `npm ci --include=dev && npm run build`; start `npm start`; health `/health`; Node 24; one instance. Runtime uses compiled JS and production dependencies, not tsx/Vite. Set NODE_ENV=production. Render supplies PORT and HTTPS. Set auto-deploy off for controlled staging. M2 `main` and M3 `m3-staging` and their services remain unchanged. Free services may sleep; active rooms are in memory and do not survive server restarts.

No credentials or personal/private files are required. Reconnect tokens remain opaque and tab-scoped; do not publish them.
