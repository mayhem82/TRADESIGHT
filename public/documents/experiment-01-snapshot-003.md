# TRADESIGHT — Experiment 01: Depth Perception
## Continuity Snapshot 003 — 20 October 2026

### Status and predecessor

OPEN / NOT FINAL. Direct predecessor: SNAP-002 (experiment-01-snapshot-002.html). Baseline: SNAP-001. Append-only record; previous snapshots remain unchanged.

### New observed evidence

User screenshot shows the browser reporting 'Immersive AR supported — ready' at 11:40:10; 'Requesting depth-enabled immersive-ar session…' at 11:50:14; and 'Depth-enabled AR session started; no render loop or graphics. Depth data not yet read.' at 11:50:15. The browser accepted the depth-sensing feature request and resolved the session promise. This does not demonstrate delivery of usable depth frames.

### Control failure reported

User reported READ DEPTH and END AR controls did not respond while the immersive session was active. The screenshot preceding this report displayed an older page version without the READ DEPTH control; later behavior was reported by the user. Ordinary DOM controls may be inaccessible in immersive XR without a supported overlay. This is a hypothesis, not a confirmed root cause.

### Implementation changes since SNAP-002

Commit 59fdd4360527e6cfad92ecd6233f04b70e72a4f6: automatic single-frame depth acquisition initiated after session creation, with an attempted automatic session exit. User reported 'Still no read depth'. No depth values were established. Commit 5372e00569d3b2fe362c88e2cc9981213e33e1ab: added diagnostics for graphics context creation, XR graphics layer setup, reference space, frame callback, CPU depth acquisition, and an eight-second callback timeout. Device outcome for this instrumented revision has NOT been supplied.

### Confirmed findings

Basic WebXR immersive AR session creation was confirmed in SNAP-001. Depth-enabled WebXR session creation is now confirmed by screenshot. The earlier Three.js configurations repeatedly froze according to user reports. Neither live camera stability nor usable depth measurement is confirmed.

### Unresolved technical questions

Does the graphics layer initialize? Does local reference-space acquisition succeed? Does session.requestAnimationFrame invoke the callback? Does XRFrame.getDepthInformation provide a CPU depth buffer? Are sampled values physically plausible? Does the automatic session exit work? Is depth update latency acceptable? None of these have verified answers.

### Next validation gate

Open the latest Experiment 01 diagnostic and start depth AR. Record the last visible diagnostic stage and any timeout or error. If the page cannot be read while immersive, capture the log after exiting immersive mode. Do not reintroduce models, synthetic depth or occlusion into Experiment 01.

### Continuity integrity

This snapshot is additive and references SNAP-002. Future SNAP-004 must reference SNAP-003. Preserve all user observations separately from technical explanations and do not mark the experiment final without user approval.

### Source links

Experiment: https://mayhem82.github.io/TRADESIGHT/physical-occlusion-experiment.html ; Repository: https://github.com/mayhem82/TRADESIGHT
