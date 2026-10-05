# TIMEFALL: 2126 — Milestone 2

A cinematic low-poly Three.js adventure prototype with genuine server-authoritative multiplayer. Two to six explorers arrive in an abandoned future city, scan a shared emergency beacon and trace a distant portal signal. M2 implements rooms, movement and shared exploration. Survival systems and endings belong to later milestones.

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

Rooms are in-memory and single-process. Server restarts lose rooms. Run exactly one instance; scaling requires shared authoritative infrastructure beyond M2. Do not share reconnect tokens/browser storage.

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

- Build: `npm ci && npm run build`
- Start: `npm start`
- Health: `/health`
- Environment: `NODE_ENV=production`, Node 24
- Instances: one

The host supplies `PORT`. Built client and Socket.IO share one port and origin. Do not deploy as a static site. No browser secrets are needed. Runtime uses compiled JavaScript and production dependencies; TypeScript/Vite/tsx are build tools only. A multi-stage Dockerfile is included.

Verify public root, `/health`, WebSocket transport and two independent clients after deployment. Local tests do not prove production connectivity. Review hosting resource/availability limits before a competition session.

## Manual phone test

Use a real phone and a separate computer or second phone. Create/join, Ready both and start. Check both avatars, independent movement, joystick release, camera drag, shared scan, portrait/landscape layout and readable HUD. Switch away/reload within 90 seconds; verify restored identity without duplicates. Disconnect the host and verify transfer. Return to lobby and start again. Use Controls → Performance for actual-device FPS. No physical phone was tested in this workspace.
