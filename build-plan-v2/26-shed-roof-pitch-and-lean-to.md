# 26 - Shed Roof Pitch and Lean-To

Objective: pull two ideas from a competitor teardown (Best Sheds Designer, ACT Building Systems) into the Shed Model Builder — a user-adjustable roof pitch and a lean-to add-on. Skipped multi-bay support as out of scope for a single-structure homeowner tool.

Inspect:
- src/shed/shed-plan.js
- src/shed/shed-item-list.js
- src/shed/build-shed-model.js
- src/shed/shed-review-pathway.js
- src/components/ShedPlanner.jsx

Create or update:
- src/shed/shed-plan.js
- src/shed/shed-item-list.js
- src/shed/build-shed-model.js
- src/shed/shed-review-pathway.js
- src/shed/shed-dimension-checks.js
- src/components/ShedPlanner.jsx
- src/diagnostics/self-check.js
- docs/testing.md

Done when:
- `roofPitchDeg` replaces the old fixed `skillionFallAllowance`/`gablePitchAllowance` constants; the same user-entered pitch drives roof area, rafter lengths, fastener counts, and the 3D model's roof tilt for both roof types
- an `leanToEnabled` + `leanToDepthM` pair adds an open-sided lean-to off the back wall: its own support-post, rafter, roofing, and fastener item-list rows, and its own posts + sloped roof in the 3D model, sharing the main roof's pitch
- lean-to post height is imputed from wall height, lean-to depth, and pitch, with a sensible minimum floor
- development-pathway flags account for the lean-to's added footprint
- self-check confirms pitch changes roof area and that a lean-to plan produces lean-to items and additional model geometry

Next step: 37-live-supplier-api-foundation (blocked on approved Bunnings partner API credentials)
