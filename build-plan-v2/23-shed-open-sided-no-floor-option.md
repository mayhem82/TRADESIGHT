# 23 - Shed Open-Sided / No-Floor Option

Objective: let homeowners plan an open-sided structure (carport/shelter) and/or a shed with no floor, since the planner previously forced a fully enclosed box on a slab or bearers.

Inspect:
- src/shed/shed-plan.js
- src/shed/shed-item-list.js
- src/shed/build-shed-model.js
- src/components/ShedPlanner.jsx

Create or update:
- src/shed/shed-plan.js
- src/shed/shed-item-list.js
- src/shed/shed-review-pathway.js
- src/shed/build-shed-model.js
- src/components/ShedPlanner.jsx
- src/styles.css
- src/diagnostics/self-check.js
- docs/testing.md

Done when:
- floorType accepts `none`, and the item list shows a "No floor specified" line instead of slab or bearer items
- an `openSides` toggle replaces wall framing, wall cladding, and door/window openings with support-post and bracing items in the item list
- the 3D model renders corner posts instead of a solid wall box when open-sided, and skips door/window meshes
- door and window inputs disable in the UI when open-sided, since they have no wall to sit in
- development-pathway flags note that open-sided structures still face the same exempt/complying development floor area, height, and setback checks, and that ground preparation still matters with no floor
- self-check covers an open-sided, no-floor plan for both the item list and the 3D model

Next step: 34-live-supplier-api-foundation (blocked on approved Bunnings partner API credentials)
