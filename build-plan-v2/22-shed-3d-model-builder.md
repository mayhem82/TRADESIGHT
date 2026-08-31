# 22 - Shed 3D Model Builder

Objective: turn the Shed Item List Planner into an actual model builder, giving homeowners a live 3D shed model alongside the materials item list, using the same plan and roof-pitch assumptions so the two stay consistent.

Inspect:
- src/shed/shed-item-list.js
- src/shed/shed-review-pathway.js
- src/components/ShedPlanner.jsx
- src/components/PhoneScanWorkflow.jsx (existing Three.js viewer pattern)

Create or update:
- src/shed/build-shed-model.js
- src/components/ShedPlanner.jsx
- src/styles.css
- src/diagnostics/self-check.js
- docs/testing.md

Done when:
- a Three.js scene builds a shed model (walls, roof, door/window openings, boundary-offset line) from the current plan
- roof geometry angle is derived from the same `skillionFallAllowance` / `gablePitchAllowance` constants the item list estimator uses, so the model and the quantities stay consistent
- the model rebuilds live as dimensions, roof type, cladding, doors, windows, or boundary distance change
- the viewer supports drag-to-orbit and scroll-to-zoom, with geometry and renderer resources disposed on unmount
- self-check confirms the model builder produces walls and roof geometry from a plan

Next step: 33-shed-open-sided-no-floor-option
