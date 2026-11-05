# Local camera-effects candidate 014

This is an unpublished continuation of camera core 013, based on public wall
release 012 (`6f27dfc76789878954340c8cedeae8cdc029dee7`). No deployment was made.

## Implemented

The existing panel now includes Camera view effects, Sound Nebula, Calibration
editor and templates, Camera-layer photo and recording, and Share or receive
camera effects. These controls affect the camera layer; the central machine,
likeness, circular wall, four videos, placement and song choreography are preserved.

- Camera-only cartoon, outlines (including combination), colour assist, rotation,
  calibration blend/spread and JSON import/export retain the core 013 adapter.
- Particle swarm: 270 default particles; per-band hue, count, size, speed, jitter;
  source-derived fireworks, flames and dripping styles activated by band hue.
  Particle Canvas is bounded to 640 pixels on the long edge and 30 fps.
- Original song analysis, or explicitly enabled microphone Voice/Music modes.
  Bass, mid, treble, volume, band-hue and timer triggers; sensitivity, speed,
  bass-frequency range and 0–500 ms delay. Test flash does not invoke hardware.
- Camera-layer colour/black flashes, optional existing-camera torch, inverted
  baseline and dim-flicker approximation, optional gamepad/phone haptics.
- Centre camera-colour sample, editable source colour/label and five corrections,
  32-point limit, named device-local templates, source-style 220 ms single-point
  colour transitions. Samples freeze a colour, never the tracking camera frame.
- Camera-layer PNG and MediaRecorder video, optional song/active-microphone audio.
  Captures exclude the AR machine/wall, bounded to 640 pixels and 15 fps. Native
  camera textures are used only inside their active frame, copied through an
  owned framebuffer; native camera framebuffer is never read or attached.
- Explicit MQTT/WebRTC share/receive. Uses original source's three public WSS
  signaling endpoints, topic/protocol and STUN. Shares processed camera video and
  a cloned raw camera stream when available. No audio is sent. Two-peer cap.
  Received video is a labelled untracked preview, never the physical AR camera.

Pause Nebula motion freezes its animation/triggers and stops hardware pulses.
Stop sound response disconnects analysis and stops microphone tracks; it never
suspends the shared song AudioContext or disconnects the original speaker route.
Mode changes, hidden document, tracking suspension and page exit stop microphone,
hardware, recording and sharing. These must be re-enabled explicitly.

## Verification and limits

94 Node checks pass. Tests cover source detector formulas, microphone cancellation,
one song speaker route, bounded copy orientation, owned readback attachment,
camera-consumer failure isolation, recording cancellation, signaling validation,
sharing cancellation/cleanup, grounding, world tracking and previous regressions.
Syntax and relative imports pass. The original WAV remains 269.32 seconds with
SHA-256 `52364f8dd70f4a149974c2350693dd09f122d67d60d4cba64ff4ff36271ac214`.

Standalone Intel UHD OpenGL compiled the actual adapter shader. Synthetic fixtures
retain zero pixel delta from original Nebula for individual filters, correct DOM
orientation, combined filters, transparent/premultiplied overlay, and unchanged
3D marker with particles, colour/black flash and blackout. This is not browser,
Canvas particle output, real camera or phone validation. Standalone GPU timings
are not phone performance estimates. Particle distributions adapt original
formulas; they are not pixel-identical random sequences.

Native XR filters/calibration/capture require granted optional `camera-access` and
`XRWebGLBinding.getCameraImage`. Enable Camera effects before starting AR. If the
device withholds pixels, native tracking remains, camera filters/capture are
unavailable, and particles may render as a transparent camera-layer overlay.
Torch is unavailable in tracked AR; no second camera is opened. Haptic/torch
requests are not proof of physical output. Capture uses synchronous readback,
whose cost is unmeasured on phone. Recording format is selected by browser codec
support. Sharing needs the pinned MQTT CDN, available public brokers and direct
WebRTC connectivity; no TURN, authentication or guaranteed delivery. Treat room
codes as access details. Sharing/recording/hardware have not been exercised with
real devices or connections. The earlier screen-following field report remains
unresolved by physical testing; unit checks do not establish real anchoring.

The existing Computer Use restriction was respected. No browser/phone automation,
camera/microphone/hardware activation, relay connection or publication occurred.

## Source and reproduction

Original source and hashes: `NEBULA-SOURCE-PROVENANCE.json`. Public source:
https://github.com/mayhem82/Sound-visualiser-/blob/main/nebula.html and adjacent
`script.js`. Original project was read only. Existing renderer notices remain.
MQTT.js 5.15.2 (MIT) is loaded at explicit sharing start from
`https://unpkg.com/mqtt@5.15.2/dist/mqtt.min.js`; its distribution is not copied or
modified here. Public signaling providers and STUN are external runtime services.

From repository root (PowerShell):

```powershell
& 'C:\Program Files\nodejs\node.exe' --test tests/wielded-derangement-001/*.test.mjs
& 'C:\Program Files\nodejs\node.exe' --check public/ar-experiments/mayhem-ar/wielded-derangement-001/app.js
```

Workspace verification: `verify_nebula_014.py`; GPU proof: `gpu_nebula_014.py`
(requires the existing `vendor` ModernGL environment and saved original GLSL).
Evidence: `Wielded-014-report.json`, `Wielded-014-tests.txt`,
`Wielded-014-shader-report.json`, `Wielded-014-nebula-composite-contact.jpg`.

Serve the existing project over HTTPS for camera access; use the existing suite
deployment process only after approval of an exact new commit. Browser and phone
interaction testing is still required before describing this as device-verified.
