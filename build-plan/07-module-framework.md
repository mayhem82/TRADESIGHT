# 07 - Module Framework

Objective: define a registry that maps task types to TRADESIGHT modules.

Inspect:
- src/main.jsx
- src/lib/classify-task.js

Create:
- src/modules/registry.js
- src/modules/compliance.js
- src/modules/builder.js
- src/modules/engineer.js
- src/modules/image.js
- src/modules/materials.js
- src/modules/hazard.js

Done when:
- modules have stable IDs, names, scopes, and status
- routing uses the module registry
- modules avoid unsupported conclusions

Next step: 08-compliance-engine
