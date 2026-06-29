# TRADESIGHT

TRADESIGHT is an agent-first universal application for construction compliance, defect intelligence, project advocacy, and structured assessment workflows in New South Wales.

The user interacts with the TRADESIGHT Agent. The runtime classifies the task, identifies the assessment pathway, links evidence, runs agent orchestration, prepares a report, and updates the project record.

## Current Build State

Capability Build v2 is active under BuildOS.

Current completed capability:

- 18-tradesight-runtime

Current next capability:

- 19-production-readiness

## Active Runtime

TRADESIGHT now includes:

- BuildOS repository memory
- Compliance Knowledge Engine
- Evidence Intelligence
- Image DNA Engine
- Plan Review Engine
- Assessment Intelligence
- Report Studio
- Project Intelligence
- Agent Orchestration
- TRADESIGHT Runtime

## Core Workflow

1. Intake
2. Runtime execution
3. Task classification
4. Evidence register
5. Assessment object
6. Compliance rule pathway
7. Agent orchestration
8. Report Studio
9. Project record update

## Build Memory

The repository carries build memory through:

- buildos/state.json
- buildos/roadmap.json
- buildos/quality-gates.json
- buildos/changelog.json
- build-plan-v2/
- build-plan/

Future build runs should read BuildOS state, complete one operational increment, commit, update BuildOS, and stop.

## Boundary

TRADESIGHT does not invent standards, approvals, or final compliance outcomes. Unknown items remain unknown until validated by supplied evidence or verified rules.
