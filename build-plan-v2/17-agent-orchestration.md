# 17 - Agent Orchestration

Objective: introduce specialist agent definitions and route task types to agent pipelines.

Inspect:
- src/modules/registry.js
- src/lib/classify-task.js
- src/lib/create-assessment.js

Create or update:
- src/agents/agent-registry.js
- src/agents/select-agents.js
- src/agents/run-agent-pipeline.js
- src/lib/create-assessment.js

Done when:
- agents have stable IDs, names, scopes, and active status
- task types map to agent pipelines
- pipeline output is structured and auditable
- no agent produces unsupported final conclusions

Next step: 18-tradesight-runtime
