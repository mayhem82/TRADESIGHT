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

## Shed Model Builder smoke test

1. Scroll to the Shed Model Builder panel.
2. Enter width, length, and wall height. Confirm the 3D model and the item list table both appear with quantities.
3. Leave the boundary distance blank and confirm it appears under "Missing before a model can be built" and under the development pathway flags.
4. Drag inside the 3D viewer and confirm the model orbits; scroll inside it and confirm it zooms.
5. Change roof type between skillion and gable and confirm the model's roof shape changes.
6. Change cladding, floor type, door count, and window count, and confirm both the model and the item list quantities update.
7. Enter a boundary distance and confirm the dashed boundary-offset line appears in the model.
8. Enter "I want to build a garden shed" in the main intake field and confirm the request classifies as the `shed` task type and routes through the Shed Model Builder module.
9. Set floor type to "No floor (ground/gravel)" and confirm the item list shows a "No floor specified" row instead of slab or bearer items.
10. Check "Open sides" and confirm: doors/windows inputs disable, the model shows corner posts instead of a solid wall box, the item list shows "Structure" (support posts, bracing) instead of wall framing/cladding/openings, and the development pathway flags note that open-sided structures are still assessed under the same exempt/complying development rules.

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
- the 3D shed model builds walls and a roof from a plan
- an open-sided, no-floor plan produces support-post/bracing items instead of wall framing and a floor, and the model still builds

## Boundary test

A restricted or uncertain request must not produce a final compliance conclusion. The app may prepare a pathway, but unsupported outcomes must remain unresolved.
