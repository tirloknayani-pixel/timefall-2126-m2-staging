# TIMEFALL: 2126 — M7 physical-phone release validation

Use **two actual physical phones** on the final production URL supplied in the M7 report. Browser emulation does not count as this test.

## Setup
1. Prefer one Android phone with current Chrome and, if available, one iPhone with current Safari.
2. Keep both phones on normal Wi‑Fi or cellular connectivity. Do not use private/reconnect tokens or developer tools.
3. On Phone A create a room with a fictional nickname.
4. On Phone B join the exact five-character code with a different fictional nickname.
5. Ready both and Start from the host.

## Required physical checks
- Lobby: room code, both player names, ready state, host badge, Start availability.
- Portrait HUD: objective, Health, Energy, Materials, Alert and countdown readable with no overlap/notch clipping.
- Landscape HUD: rotate both phones and re-check safe areas.
- Movement: joystick moves independently; release stops movement.
- Camera: right-side drag rotates camera without moving the joystick.
- Interaction: large action button remains reachable and usable.
- Field Guide & Settings: open/close; Master/Ambience/SFX sliders; Mute; Reduced Motion; camera sensitivity.
- Audio: confirm ambience/SFX can be heard when enabled and silence when muted. Audio must not be necessary to play.
- Cooperation: beacon sync; city WEST/EAST interaction; at least one teammate revive.
- HELIX: airlock, ALPHA/BETA clues, cipher, power routing and GENERATOR/RELAY.
- Portal: shared countdown, sentry pressure, two distinct coil operators, team decision and crossing.
- Ending: both phones show the same canonical team ending.
- Reconnect: reload one phone during play; same identity/state returns without a duplicate avatar.
- Host transfer: disconnect host temporarily; remaining phone becomes host and room continues.
- Play Again: full run resets to clean lobby/default Health/resources/objectives.
- Performance observation: note visible FPS if shown, stutter, input latency, device heat and battery drain. Do not estimate numbers you cannot measure.

## Evidence to send back
For each phone, send:
1. Make/model and OS version.
2. Browser and browser version.
3. Screenshot of portrait gameplay HUD.
4. Screenshot of landscape gameplay HUD.
5. Screenshot of Field Guide & Settings.
6. Screenshot of one HELIX interaction.
7. Screenshot of portal/finale.
8. Screenshot of the ending screen.
9. Short note: joystick/camera/action usability — PASS/FAIL.
10. Short note: audio/mute — PASS/FAIL.
11. Short note: reconnect/host transfer — PASS/FAIL.
12. Short note: Play Again/reset — PASS/FAIL.
13. Any visible FPS sample plus whether you noticed stutter/heat/battery issues.

A short screen recording is helpful for joystick/camera/reconnect, but screenshots + notes are sufficient.
