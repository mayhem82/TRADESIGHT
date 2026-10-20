# TRADESIGHT — EXPERIMENT 01: DEPTH PERCEPTION
## Continuity Snapshot 001 — 20 October 2026

Status: OPEN / NOT FINAL. First continuity baseline. Scope: Experiment 01 and its earlier physical-occlusion prototype. Source basis: user device reports, screenshot, and recorded repository changes. No independent phone performance measurement.

### Objective and scope correction
Original prototype sought real-world occlusion of an outline windmill. User corrected scope: Experiment 01 is depth perception ONLY. No windmill, cube, virtual model, simulated depth, or occlusion effects. Core question: can the phone/browser acquire reliable real-world depth data, with acceptable stability and latency?

### Chronological change and observation register
1. e639fb1 — Created physical-occlusion experiment with WebXR CPU depth and geometry occluder. e7dbdf8 — Linked experiment from model library.
2. f022e1a — Fixed AR-button visibility and added diagnostics after user screenshot showed controls obscuring the interface. Screenshot established page loading, NOT depth functionality.
3. User reported AR started then froze. 3e05894 — Reduced depth mesh 40×30 to 20×15; throttled processing and added error shutdown. Cause of freeze was not proven.
4. User reported mixed-in model. 1e3d38f — Replaced windmill with static calibration cube, which user subsequently rejected as outside scope.
5. e9c4d14 and ab11b04 — Removed all virtual geometry, renamed experiment to Depth Perception, and exposed sampled depth readings. User reported another frozen screen. Depth values were NOT confirmed.
6. 45bcf38 — Fixed undefined 'seen' reference in AR session-start handler and added explicit depth-reading toggle. User reported freezing with reads disabled.
7. c554fb5 — Separated basic immersive-AR and depth-required sessions while retaining Three.js rendering. User reported another freeze even on basic AR.
8. d25f551 — Removed Three.js, graphics, rendering loop and depth requests for a bare WebXR session test.
9. User supplied screenshot: 'Immersive AR supported — ready' at 11:22:54; 'Requesting basic immersive-ar session…' and 'Basic AR session started; no render loop, no depth, no graphics' at 11:22:58. This verifies the requestSession promise resolved, NOT ongoing tracking or depth acquisition. Black screen is expected without rendering.
10. eabd953 — Added bare depth-required WebXR session option, without renderer or buffer reads. Result NOT YET REPORTED.

### Findings, evidence levels and limits
OBSERVED: Previous Three.js-based AR test configurations repeatedly froze according to user device reports. Exact freeze cause remains unknown.
OBSERVED: Browser reported immersive AR support and successfully created a basic session in a minimal implementation.
NOT ESTABLISHED: Device WebXR depth support, availability of depth frames, accuracy in metres, update rate, latency, occlusion quality, sustained AR session stability, and root cause of prior freezes.
CORRECTED: Successful basic session creation is not proof of depth perception; failure in a WebXR implementation is not proof that the phone lacks depth sensing.

### Alternative engine discovery (research candidates, not benchmarked)
Native Google ARCore Depth API: candidate for low-latency Android live depth; requires native integration and device support.
WebXR Depth Sensing: browser candidate; current integration unstable or unverified.
Depth Anything V2 Small: candidate for image-based relative depth, potentially accelerated on device; does not intrinsically provide metric distance.
Metric3D / UniDepth: candidates for metric depth estimation subject to calibration and validation.
MiDaS: relative depth baseline.
DUSt3R / photogrammetry: multi-view reconstruction, generally not first choice for low-latency feedback.
Proposed engineering targets of 30 FPS (33 ms) and 15 FPS (67 ms) are TARGETS, not measured outcomes.

### Immediate next validation gates
A. Launch bare depth-enabled WebXR session, report session success or error; do not add rendering.
B. If A succeeds, add minimal depth-data acquisition with timestamped diagnostics and no geometry.
C. Measure actual end-to-end latency and stability on target phone before choosing engine.
D. Independently evaluate native ARCore and image-depth fallbacks if WebXR fails.

### Snapshot continuity protocol
This is SNAP-001, the baseline. Future SNAP-002 must explicitly reference SNAP-001 and preserve the full change/observation register; never overwrite a prior snapshot. Keep source evidence separate from inference. Do not mark investigation final without user approval.

Repository: https://github.com/mayhem82/TRADESIGHT
Experiment: https://mayhem82.github.io/TRADESIGHT/physical-occlusion-experiment.html
