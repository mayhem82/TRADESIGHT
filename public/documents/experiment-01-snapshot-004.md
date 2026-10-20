# TRADESIGHT — Experiment 01
## Continuity Snapshot 004 — 20 October 2026

### Status and chain

OPEN. Direct predecessor SNAP-003; prior SNAP-002 and SNAP-001 retained. This snapshot records new user-observed evidence and a subsequent unverified code revision.

### New verified screenshot observation

At 12:51:07 the diagnostic logged REAL DEPTH FRAME RECEIVED: 160 × 90 after 37 XR frames. The page displayed Centre: invalid, Left: invalid, Right: invalid, Top: invalid, Bottom: invalid. The AR session ended. This confirms WebXR CPU depth buffer delivery, NOT valid distances or calibrated depth perception.

### Root-cause investigation

The implementation treated any received depth buffer as a completed successful measurement, even when all five samples were invalid. Whether this was due to zero-valued depth, coordinate transformation, insufficient tracking or runtime data quality is not established.

### New implementation

Commit 8def1fc4ba3b18e6cc7bd8957e14ad6bb770157d: scan the full depth buffer for nonzero, finite metric samples, report valid-pixel count, zero-pixel count, depth range and rawValueToMeters. If zero valid pixels, continue requesting frames rather than immediately ending. This change is NOT yet device-tested.

### Next gate

Test latest page, report valid pixel count and range. If positive values exist but five samples remain invalid, examine depth-coordinate mapping and spatial distribution. If all pixels remain invalid, investigate AR tracking and depth runtime availability. Preserve measurements without simulation.

### Continuity

SNAP-004 references SNAP-003. Do not rewrite earlier snapshots or declare final without user approval.