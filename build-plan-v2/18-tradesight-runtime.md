# 18 - TRADESIGHT Runtime

Objective: connect intake, classification, agents, evidence, assessment, and report generation into one runtime pipeline.

Inspect:
- src/lib/create-assessment.js
- src/agents/run-agent-pipeline.js
- src/lib/generate-report.js
- src/lib/project-storage.js

Create or update:
- src/runtime/run-tradesight.js
- src/runtime/runtime-state.js
- src/runtime/runtime-events.js
- src/main.jsx

Done when:
- one function can run the full local workflow
- runtime events are recorded
- project record can receive runtime output
- UI uses the runtime rather than separate disconnected helpers where practical

Next step: 19-production-readiness
