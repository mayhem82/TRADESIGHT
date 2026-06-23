# TRADESIGHT System Overview

TRADESIGHT is an agent-first universal application for construction compliance, defect intelligence, project advocacy, and structured assessment workflows.

The user interacts with the TRADESIGHT Agent. The agent creates a structured assessment path instead of sending the user directly into separate modules.

## Primary Flow

1. Intake
2. Classification
3. Assessment object creation
4. Evidence capture
5. State classification
6. Report generation
7. Project record update

## Core Objects

- Project Object
- Assessment Object
- Evidence Object
- Report Object
- Compliance State Object

## Operating Principle

The repository is the source of truth. Build state is tracked in build-plan/00-build-state.json so future build runs can continue without relying on chat memory.

## Boundaries

TRADESIGHT must not invent standards, approvals, or compliance conclusions. Unknown items remain unknown until validated by supplied evidence or verified rules.
