# Ground placement correction — ground-002

The previous build used a fixed regular-camera offset, translated the entire sculpture with the height stick, and placed its model origin rather than its physical base bottom. These could make the machine float or enter the selected ground.

## Behaviour

**Place on ground** now prefers the existing tracked AR method when the browser reports support. The target must have an upward normal within 20 degrees of horizontal and lie below the viewer. Vertical walls, ceilings, above-viewer hits, lost hits and taps older than 200 milliseconds are rejected. Hit testing cannot semantically distinguish a floor from a tabletop; the viewer is instructed to aim at actual ground. The selected hit's plane and orientation are retained. A tracking-origin reset requires ground placement again.

**Align ground manually** remains available through the suite's regular-camera method. Tap the visible ground point where the base should stand, then confirm **Place on ground**. A proposed circle is shown before placement. The initial proposal is below the centre of the image and above the playback controls. The point is projected into the manual view at the existing 2.4-metre default depth; it is manually composed imagery, not detected ground, a calibrated distance or a tracked world anchor. The first stick can adjust position/depth. Before confirmation, the second stick can adjust the proposed ground level.

After placement, the first stick moves along the selected ground plane. The second stick turns the machine and changes its vertical height from the base; it no longer lifts or lowers the whole sculpture. The existing uniform Size control also scales from the base. Reset pose keeps a placed ground anchor while restoring pose, size and height. Reposition explicitly chooses ground again. Existing audio playback, seek, restart, hold form, exposure, full-screen and fixed joystick controls remain.

The base's lower bound is derived from the actual glTF geometry. It becomes the invariant placement pivot. Dynamic part bounds are also derived from the geometry; any cell, face, core or strut that would cross the base's lower plane is raised locally, without moving the base. Uniform scale and height scaling are applied about this ground pivot. Movement follows the initially selected plane; this does not scan uneven terrain or provide obstacle avoidance. Reposition where a different real surface is required.

## Verification boundaries

`node --test tests/wielded-derangement-001/*.test.mjs` runs the unchanged timeline tests plus floor-target freshness/orientation, manual-point reprojection, fixed-base scale/rotation/height, full-song part bounds, decoded vertex checks on flat/sloped planes and movement projection tests.

The decoded-vertex checks use the actual glTF binary positions, independently of the runtime's bounding-corner check. Syntax, DOM-ID/asset wiring and unchanged audio/vendor/geometry checks are recorded in `ground-validation-report.json`.

Browser automation was not retried after the earlier Computer Use safety restriction. These are static and unit checks, not rendered browser interaction or a physical phone retest. The public page remains labelled for phone retesting.
