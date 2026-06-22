# 03 - Assessment Pipeline

Objective: convert intake text into a structured assessment object.

Inspect:
- src/main.jsx
- src/models/assessment.js
- src/lib

Create:
- src/lib/classify-task.js
- src/lib/create-assessment.js
- src/lib/required-information.js

Done when:
- task classification is isolated from the UI
- an assessment object is created from user input
- missing information is generated from task type
- UI imports pipeline functions instead of keeping logic inline

Next step: 04-evidence-pipeline
