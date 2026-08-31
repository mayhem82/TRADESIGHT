# TRADESIGHT Testing Notes

## Manual smoke test

1. Start the app.
2. Enter a defect or compliance request in the intake field.
3. Confirm that the runtime events panel updates.
4. Confirm that an assessment object is created.
5. Add an evidence note.
6. Confirm evidence quality and summary values update.
7. Confirm report preview updates.
8. Save the project.
9. Refresh the browser and confirm the project loads.
10. Clear the project and confirm state resets.

## Shed Item List Planner smoke test

1. Scroll to the Shed Item List Planner panel.
2. Enter width, length, and wall height. Confirm the item list table appears with quantities.
3. Leave the boundary distance blank and confirm it appears under "Missing before an item list can be generated" and under the development pathway flags.
4. Change roof type, cladding, floor type, door count, and window count, and confirm the item list quantities update.
5. Enter "I want to build a garden shed" in the main intake field and confirm the request classifies as the `shed` task type and routes through the Shed Item List Planner module.

## Self-check module

`src/diagnostics/self-check.js` provides a runtime self-check that verifies:

- app config loads
- runtime completes
- assessment is created
- report is created
- project is created
- compliance boundary remains conservative
- a shed request classifies as the `shed` task type
- the shed item list estimator generates line items

## Boundary test

A restricted or uncertain request must not produce a final compliance conclusion. The app may prepare a pathway, but unsupported outcomes must remain unresolved.
