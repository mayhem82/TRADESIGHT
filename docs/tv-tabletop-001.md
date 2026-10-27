# Samsung tabletop TV preview001

Separate project: https://mayhem82.github.io/TRADESIGHT/ar-experiments/mayhem-ar/tv-tabletop-001/index.html

User-pasted Samsung specifications are the dimensional source. With stand 1.2246 x .760 x .199m; body 1.2246 x .7078 x .0766m; combined stand footprint .8126 x .199m. Black Basic Feet and body are honest dimension-faithful approximations, not manufacturer CAD. Supplied mass10.3kg with stand /10kg without.

The model root is the centre between feet at their BOTTOM (local y0). Body bottom is .0522m above it. +Z is screen front; placement yaw faces the committing viewer. Local/viewer reference spaces, required local/hit-test, optional DOM overlay, accepted renderer, local reticle and fresh-hit animation-frame placement reproduce the existing established flow. A level-surface hit candidate is not proof of a tabletop: user must confirm the circle is on the table. No floor offset. Reference-space reset requires replacement. Tracking interruption hides drawing and consumes pending input.

Scale always1. Rotation joystick left/right applies yaw about the footprint centre with invariant world translation and feet height;36deg/sec max,50ms frame cap. Release/cancel/lost capture, blur, menu hide, tracking/visibility loss, reposition/reset/end stop it. Keyboard arrows and5degree buttons are accessible alternatives. First joystick translates camera-relative horizontally at .25m/sec with fixed tabletop height and no yaw change. Second joystick horizontal axis spins on the spot; its vertical axis is ignored. Both can be used simultaneously with independent pointer ownership. No scale or height joystick. Reposition has commit/cancel and keeps old placement until a fresh hit commits.

Visual fit preview only. Physically measure and confirm tabletop load capacity/stability; no tracking accuracy guarantee. WebXR-compatible browser and HTTPS required; Android Chrome is a candidate, not accepted physical-phone evidence. No account, upload, purchase, remote API or PC server at runtime.

Build in this PC task with node build.mjs; source public/tv-tabletop-001. Published portable source ar-source/tv-tabletop-001 has pinned rolldown1.2.13 and a relative build script. Runtime index/bundle/reticle/licence are published. Original prior AR files and all805protected StoneRoom files must retain hashes; only project hub gets one TV card. See evidence/tv-preservation.json and browser/geometry reports. Browser harness uses installed PC Playwright/Chrome, SwiftShader and emulated XR, never real phone acceptance.
