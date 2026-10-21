# Engineering Work Sample — TIMEFALL: 2126 (Milestone 2)

**Repository:** https://github.com/tirloknayani-pixel/timefall-2126-m2-staging  
**Live staging (availability may vary):** https://timefall-2126-m2-staging.onrender.com/

## Project summary

TIMEFALL: 2126 M2 is a browser-based, low-poly 3D cooperative adventure prototype for **2–6 players**, built around authoritative, real-time multiplayer gameplay. Players create or join rooms, ready up, explore a shared scene, and complete synchronized objectives. This is **Milestone 2**, not a claim of a finished game.

## What a code reviewer can inspect

| Area | Main files / directories | Validation focus |
| --- | --- | --- |
| Server state and gameplay | `server/engine.ts` | Room membership, ready/start/reset, movement, collisions, objective state, host transfer |
| Network API | `server/app.ts` | Express and Socket.IO integration |
| Contracts and geometry | `shared/` | Zod validation, shared types, geometry |
| Client-side networking | `src/network.ts` | Prediction, reconciliation and snapshot handling |
| UI and rendering | `src/` | Three.js scene, input controls and multiplayer presentation |
| Automated verification | `tests/` | Collision checks, Socket.IO integration and browser-level flows |
| Deployment | `render.yaml`, `Dockerfile` | Single-instance Node hosting configuration |

## Architecture and engineering decisions

- The server owns authoritative room and game state; client messages carry bounded inputs rather than authoritative position updates.
- Server simulation runs at **20 Hz** and sends room snapshots at **10 Hz**.
- The client predicts local movement and reconciles against server acknowledgements; remote avatars interpolate updates.
- Disconnected players can reclaim their slot within **90 seconds** from the same tab. Host privileges transfer to a connected player.
- Shared Zod schemas and geometry help keep client and server interpretation aligned.
- Rooms are **in-memory and single-process**; a restart clears them. This is not a horizontally scalable deployment.

## Reproduce the checks

Prerequisites: Node.js 24 and npm.

```bash
npm ci
npm run build
npm test
```

For browser-level verification, install Chromium with Playwright and use the project-specific script:

```bash
npx playwright install chromium
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

These are documented commands and test entry points, **not a claim that a fresh test run passed as part of this work-sample preparation**. Browser tests require an accessible Chromium executable and test environment.

## Repository-validation checklist

1. Confirm `npm ci` produces a repeatable install and `npm run build` succeeds.
2. Run collision and Socket.IO integration tests with `npm test`.
3. Create two separate browser sessions and validate create/join, ready/start, movement and shared objective state.
4. Check invalid or out-of-bounds client messages against shared schemas and authoritative server decisions.
5. Test disconnection, reconnection inside the reserved window and host transfer.
6. Verify public deployment separately: site, `/health`, WebSocket connectivity and two-client operation. Local tests alone do not establish deployed health.

## Technology

TypeScript, Node.js, Express, Socket.IO, Three.js, Vite, Zod, Playwright, Docker and Render.

## Candidate contribution statement

When referencing this project in a job application, describe **only the tasks you personally performed** (including any AI-assisted development) and be prepared to explain the code, debugging steps and test evidence. This document describes the repository; it does not independently verify individual authorship or assessment results.

See [README.md](README.md) for usage, full architecture notes and deployment limitations.
