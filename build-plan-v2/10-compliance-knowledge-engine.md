# 10 - Compliance Knowledge Engine

Objective: replace placeholder state logic with a structured rule registry and provenance-aware boundary layer.

Inspect:
- src/models/states.js
- src/lib/create-assessment.js
- src/modules/compliance.js

Create or update:
- src/compliance/rule-registry.js
- src/compliance/rule-sources.js
- src/compliance/evaluate-rules.js
- src/compliance/jurisdictions.js
- src/lib/classify-state.js
- src/lib/risk-classifier.js
- src/modules/compliance.js

Done when:
- rule objects have stable IDs, jurisdiction, source, condition, state, confidence, and notes
- evaluation returns matched rules and unresolved items
- unknown items remain unknown
- UI can display rule provenance without implying final conclusions

Next step: 11-evidence-intelligence
