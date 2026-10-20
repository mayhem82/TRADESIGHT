# TRADESIGHT — EXPERIMENT 01: DEPTH PERCEPTION
## Continuity Snapshot 002 — 20 October 2026

Status: OPEN / NOT FINAL. Predecessor: SNAP-001 at ./experiment-01-snapshot-001.html. This is an additive continuity record, not a replacement.

### New implementation
Commit 8b4258967250ad2890a442f01edb9a94fad07b31: extended the native WebXR diagnostic to request a single CPU depth frame on demand. The earlier bare basic-AR and depth-enabled session buttons remain. The new READ DEPTH — ONE FRAME control is enabled only after depth-session creation. The code sets up an XR-compatible WebGL context and XRWebGLLayer, requests local reference space, waits up to 30 XR frames for pose and CPU depth, and reports five samples (centre, left, right, top, bottom), frame dimensions, or an explicit error.

### Technical distinction
The WebGL context is required for WebXR frame access but no 3D models, Three.js renderer, synthetic depth, continuous scene rendering or occlusion meshes are used. A depth sample is a runtime-provided estimate, not independently calibrated ground-truth distance. Reading one frame does not demonstrate live throughput or latency.

### Results
No device test result has yet been supplied for this revision. Depth-enabled session acceptance, depth frame availability, measured values and stability remain UNKNOWN. Prior confirmed result: basic immersive-AR session creation in SNAP-001.

### Next test
Open Experiment 01; select START DEPTH AR — NO RENDERER. Record exact status. If it succeeds, select READ DEPTH — ONE FRAME and record readings/error. If frozen, report which button triggered the freeze. Do not claim success until observed.

### Continuity
SNAP-001 is immutable and remains the baseline. Future SNAP-003 must reference this SNAP-002. No final disposition without user approval.
