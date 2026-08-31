# 21 - Shed Item List Planner

Objective: give homeowners a dedicated pathway to build a shed plan and generate a materials item list, without inventing certified structural or development-approval outcomes.

Inspect:
- src/modules/registry.js
- src/lib/classify-task.js
- src/agents/select-agents.js
- src/compliance/rule-registry.js
- src/main.jsx

Create or update:
- src/shed/shed-plan.js
- src/shed/shed-dimension-checks.js
- src/shed/shed-item-list.js
- src/shed/shed-review-pathway.js
- src/modules/shed.js
- src/modules/registry.js
- src/lib/classify-task.js
- src/lib/required-information.js
- src/agents/select-agents.js
- src/compliance/rule-registry.js
- src/components/ShedPlanner.jsx
- src/main.jsx
- src/styles.css
- src/diagnostics/self-check.js

Done when:
- a homeowner can enter shed width, length, wall height, roof/cladding/floor type, boundary distance, and door/window counts
- an item list with quantities, units, and estimate notes is generated from those inputs
- quantities are explicitly labelled as a planning estimate, not a certified structural design
- development-pathway flags (floor area, height, boundary setback) surface as verification prompts, not asserted compliance outcomes
- free-text requests mentioning a shed classify as the new `shed` task type and route through the Shed Item List Planner module alongside compliance and report
- self-check covers shed task classification and item list generation

Next step: 32-shed-3d-model-builder
