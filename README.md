# TRADESIGHT

TRADESIGHT is an agent-first universal application for construction compliance, defect intelligence, project advocacy, and structured assessment workflows in New South Wales.

The user interacts with the TRADESIGHT Agent. The agent classifies the task, identifies the required assessment pathway, captures missing information, links evidence, and prepares a structured report.

## Current Build State

Foundation phase.

Existing foundation:

- React and Vite app scaffold
- Agent intake interface
- Task classification preview
- Module routing preview
- Compliance state placeholder
- Self-advancing build queue in build-plan/

## Core Workflow

1. Intake
2. Classification
3. Assessment Object
4. Evidence Object
5. Compliance State
6. Report Generator
7. Project Record

## Build Memory

The repository carries build memory through:

- build-plan/00-build-state.json
- build-plan/01-foundation.md through build-plan/09-ui-refinement.md

Future build runs should read the build state file, complete one step, commit, update state, and stop.

## Boundary

TRADESIGHT does not invent standards, approvals, or final compliance outcomes. Unknown items remain unknown until validated by supplied evidence or verified rules.
