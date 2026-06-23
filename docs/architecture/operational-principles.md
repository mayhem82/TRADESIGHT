# TRADESIGHT Operational Principles

## Agent First

The TRADESIGHT Agent is the front door. It receives the user's problem, classifies the task, identifies required modules, and prepares the assessment pathway.

## Universal Use

TRADESIGHT supports homeowner, professional, advocacy, and government-facing use cases through the same core workflow.

## Evidence Based

Every assessment should be linked to evidence records where evidence is available. Unsupported claims must remain clearly marked as unsupported.

## Conservative State Handling

The system uses CS1 to CS7 labels. Early builds may classify many items as unknown until specific rules are implemented.

## Repository Memory

The build process uses build-plan/00-build-state.json to track the next step. Each build run should update that file after committing the completed step.

## No Parallel Builds

All work must be committed into mayhem82/TRADESIGHT. No duplicate repositories or detached mock projects are to be created.
