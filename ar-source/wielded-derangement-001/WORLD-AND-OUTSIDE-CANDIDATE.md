# Local candidate: tracking and separate outer machine

Not published. Portrait integration is complete in candidate 005; actual phone verification remains pending. See PORTRAIT-AND-BEATS.md for the current checks and portrait/audio changes.

## User report and diagnosis

The user reports that the sculpture moves with the screen. Their screenshot
reads “Surface AR”; that label does not establish actual positional tracking.
The original manual getUserMedia route is screen-relative. The separate native
AR route already captures a local-space placement and draws native viewer
poses, so the field report cannot be explained conclusively from code alone.

The candidate addresses confirmed weaknesses: premature AR labeling, accepting
unverified or emulated positional poses, weak cancellation/reset handling, and
the risk of the fullscreen DOM canvas duplicating the native XR image. During
native AR, that canvas is hidden and the native layer is the sole machine image.
There is no automatic camera-overlay fallback. A separate explicitly untracked
overlay remains available. Invalid native poses hide content and pause audio.
Local reference-space placement remains world-relative; optional native anchors
are used when provided. Each entity owns its anchor independently. Reference
space resets invalidate both placements rather than silently moving them.

Physical-device testing is required to establish whether these changes resolve
the reported screen-following on the user's browser/device. No such test has
been performed. No browser automation was used to bypass the earlier restriction.

## Separate outer structure

The original mechanical structure and timeline are preserved; only the face children are replaced in candidate 005. New outer
walls are a separate open mechanical lattice with 20 modules, 3,600 triangles
and 60 material draws. The shared binary is 12,960 bytes. Phone frame rate has
not been measured. Walls breathe subtly with the song without changing footprint.

Select **Machine** or **Outer walls** in the persistent target buttons. The two
sticks and Reposition/Reset operate on that selection only. The central machine
keeps its own size slider. Outer walls have independent width/depth (2–20 m)
and height (0.8–5 m) sliders plus visibility. These are manually set virtual
dimensions, not room measurements. There is no room mapping or real-object
occlusion. A 6 x 6 m initial footprint is adjustable, not an assumed room size.

In native AR, place the selected entity at an actual ground hit. After placing
one entity, select the other to place it separately. Changing the selected
entity clears pending taps to prevent placing the wrong entity. Grounded pivots
and local floor-plane movement keep both entities above their chosen floor,
including sloped planes. The manual overlay uses separate manual alignments and
is screen-relative.

## Verification

20 Node regressions pass: complete original song timeline, dynamic grounded
geometry, floor filtering, session lifecycle, emulated tracking, world-space
placement under moving viewer poses, optional native-anchor cleanup, independent
wall controls and anchors, true decoded wall vertices across extreme dimensions,
and wall geometry budget. Syntax, DOM/import/asset references and source hashes
are checked separately in the local candidate report. These are unit/static
checks, not browser interaction or physical AR validation.

An offline ModernGL contact sheet shows the actual saved geometry from outside,
inside and after wall expansion. It is not a screenshot of the browser or AR.

## Face transfer resolved

The initial Library Windows materialization limitation was resolved through the
user's explicitly authorized self-email transfer. Exact attachment identity,
integration method and current verification are recorded in
`PORTRAIT-AND-BEATS.md`. No Library helper was modified or raw Library URL used.

## Publication

The public version remains the original integration, commit
`b13f0e1d27c7ec8e0a90e33c90e7d0c960b194a0`. Ground-only commit
`1c85081e62a0869a3159e8536e0038412800a0b9` was not pushed: automatic approval
review rejected the exact public-main push because the exact external deployment
had not been explicitly approved. No retry or connector workaround was made.
The parent has explicitly paused publication pending approval.
