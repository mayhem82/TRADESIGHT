# 13 - Plan Review Engine

Objective: create a plan review pathway for drawings, sketches, PDF plans, and missing-detail detection.

Inspect:
- src/modules/engineer.js
- src/models/evidence.js
- src/lib/create-assessment.js

Create or update:
- src/plan/plan-record.js
- src/plan/missing-detail-checks.js
- src/plan/plan-review.js
- src/modules/engineer.js

Done when:
- plan records can capture file reference, drawing type, scale status, and review notes
- missing detail checks return unresolved items
- engineering review boundary remains explicit

Next step: 14-assessment-intelligence
