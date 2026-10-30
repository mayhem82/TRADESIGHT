# AR movement speed candidate

Base: released `109e2a064d947419c4affb903769beb8503521b1`. Local implementation only; no commit, push, deployment, PC file access or retry of the previously denied public-site fetch.

## Control and units

A logarithmic slider runs from exponent -3 to +5 in 0.125 increments: **0.125× to 32×**, default **1×**. It displays the multiplier and full-stick ground speed in metres/second, provides a 1× reset, and supports native keyboard interaction. Values reset to normal on a fresh page load. The slider stays outside hideable settings and inside the existing DOM overlay when that experience has one.

Translation scales after the original input normalisation and frame-time clamps. Wall/Colour ground travel remains 0.45 m/s at 1× (0.05625–14.4 m/s across the range); vertical travel remains 0.35 m/s at 1× (0.04375–11.2 m/s). Yaw is unchanged. At full input and steady synthetic frames, Colour Vision covers 0.054 m, 0.432 m and 13.824 m over the same sixty 16 ms frames at slow, normal and fast respectively. Fast nominal travel is 100 metres in about 6.94 seconds; this is movement math, not a phone tracking/performance claim.

Range gestures do not cancel another pointer, call the stick stop functions or capture a stick's pointer. Real browser multi-touch tests hold both joysticks while a third touch adjusts the slider and verify horizontal and vertical movement continues.

## Coverage

Paths are relative to `public/ar-experiments/mayhem-ar/`.

| Experience | Placement of speed control | Movement scaled |
| --- | --- | --- |
| `ar-colour-vision-001/` | Between existing 132 px sticks | Ground and height; rotation unchanged |
| `ar-sound-vision-autostereography-001/` | Between existing 86 px sticks, outside menu | Ground, height, nearer/farther; yaw unchanged; 0.75 m nearer stop retained |
| `single-wall-009/` | Beside its existing 96 px stick | Ground |
| `single-wall-010/` | Between existing 86 px sticks | Ground and height; yaw unchanged |
| `tv-tabletop-002/` | Between existing 136×72 px controls | Tabletop translation, 0.25 m/s normal; spin/height/scale unchanged |
| `stone-room/reference/bellbrook-yowie-v1.html` | Beside its existing walking pad | Manual ground movement; default 0.75 m/s → 0.09375–24 m/s |
| `stone-room/reference/bellbrook-yowie-v2.html` | Beside walking pad | Same manual movement |
| `stone-room/reference/bellbrook-yowie-v3.html` | Beside walking pad | Same manual movement; existing ground following preserved |
| `stone-room/reference/bellbrook-yowie-v4.html` | Beside walking pad | Manual movement; automatic routes retain their existing speed |
| `stone-room/reference/walking-stable.html` | Beside walking pad | Manual movement |
| `stone-room/reference/joystick-movement.html` | Beside walking pad | Manual movement; existing automatic walking retains its speed |
| `stone-room-texture-001/` | Between walkthrough stick and action pad | Walkthrough camera only; multiplier also applies to its equivalent keyboard/pad path. Existing speed setting is the baseline (default 1.4 m/s). Bounds and NPC separation retained through movement substeps no larger than 0.1 m. AR keeps its existing button controls and independent NPC speed. |

The walking pages retain their existing Slow/Normal/Fast select as the baseline. The new slider is explicitly labelled Manual speed. The slider does not speed up automatic route following, avoiding route-stop overshoot. Character facing and existing animation behavior are preserved.

Fourteen button-only experiences in the 26-page collection receive no new joystick or speed UI. Secondary history pages such as Sound Vision's `baseline-010.html`, older TV 001, the older `stone-room/index.html`, and unlisted reference versions remain outside the direct-launcher scope.

## UI compromises

- At the standard 412 px portrait width, Colour Vision's slider sits between the full-size sticks. Below 356 px it moves above and between them to preserve both stick sizes.
- TV's dock widens within the viewport. Below 391 px its slider occupies a centred row above the two original controls.
- Single-stick walking pages put the slider beside the stick, or above it at widths below 391 px. Their information panel reserves the extra space. Room walkthrough uses the gap between stick/pad, with an above-stick fallback below 356 px.
- Sound Vision's landscape dock widens from 310 to 354 px, with the settings/action column shifted accordingly. This keeps the complete dock on screen at 852×393. Wall captions may wrap, retaining their original fonts and wording. No joystick shrinks.

## Verification

- 103 Node tests passed, including real displacement at 30/60/90 Hz, 1/8× and 32× scaling, frame-gap clamping and unchanged yaw.
- Production build passed. Sound Vision's 113 pinned asset identities passed after refreshing changed source/bundle/shared dependency hashes.
- Actual served wall/TV/Colour code passes emulated AR movement tests. Six actual walking bundles pass manual-displacement tests with test-only instance access. Room's real camera movement path passes scaling and bound checks.
- All twelve movement cases demonstrate a 32× fast/normal ratio and 1/8× slow/normal ratio. Browser checks also cover Home/End, reset to normal, simultaneous touch adjustment, unchanged rotation and vertical movement. A focused Bellbrook v4 check confirms the manual slider does not change active route speed; Sound's fast nearer motion still stops at 0.75 m.
- Initial speed layout run passed 192 cases across all twelve experiences, including fullscreen checks. Follow-up checks cover the shortened 852×393 viewport and the widened Sound dock. **Final six-viewport run: 288 cases passed across twelve apps, plus 24 primary portrait/landscape fullscreen checks.**
- Layout tests use 412×915, 915×412, 852×393, 393×852, 360×800 and 320×700, open/closed menus and both speed endpoints. They check range hit testing, stick dimensions/hit testing, and no range/stick overlap. Fullscreen is exercised in the primary portrait/landscape sizes. Room's background render loop is paused only in the layout fixture to bound software-rendering cost; the separate movement check runs its actual movement code with real loaded assets.
- Existing neutral cube GPU checks passed: zero pixel difference between red/blue uploaded imagery, interior/exterior rendered, GL error zero. Cube model, placement and Colour application files are unchanged from the released base.

Run Node tests as in `docs/ar-collection-verification.md`, adding `tests/ar-collection/*.test.mjs`. Browser scripts are `speed.browser.mjs` and `speed-layout.browser.mjs`, using the same `PLAYWRIGHT_MODULE`, `AR_BROWSER`, `AR_BASE_URL` and `AR_OUTPUT_DIR` environment options as the previous scripts. `AR_SPEED_FILTER` can select a named app for a focused rerun.

## Remaining acceptance

Physical S25 FE use, real compositor behavior, actual tracking at fast distances and real-device ergonomics are unverified. Publication has not been attempted. The previous live-fetch network denial remains respected; there was no new request to that host.
