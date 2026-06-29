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

## Self-check module

`src/diagnostics/self-check.js` provides a runtime self-check that verifies:

- app config loads
- runtime completes
- assessment is created
- report is created
- project is created
- compliance boundary remains conservative

## Boundary test

A restricted or uncertain request must not produce a final compliance conclusion. The app may prepare a pathway, but unsupported outcomes must remain unresolved.
