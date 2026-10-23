# Stone Room implementation record (append only)

## 2026-10-23 — baseline inspection

Remote baseline: d1919aca7b3cbc74ee536883597bc4fdcc3ce375 (`main`).
Repository tree and last five commits inspected through the connected GitHub API.
No AGENTS.md, architectural Stone Room GLB, Blender source or FreeCAD source found.
The unrelated Bellbrook assets and all TRADESIGHT application files are preserved.

Existing components identified in source: virtual movement and speed slider, touch
arrows, drag-to-look, reset, overhead mode, NPC mode/speed/collision controls,
local GLB import, direct immersive-ar session request, hit testing and reticle.
These were source-inspected, not assumed operational on a physical device.
Latest Pages run 39904547961 succeeded for the baseline commit.
Vite copies public/ into dist/ and uses base /TRADESIGHT/. The root stone-room/
file is a different legacy implementation; the production source is public/stone-room/.

Defects found: fieldstones omit UV coordinates; shadow casting is disabled; many
hundreds of separate mesh submissions; window stones cross vertical aperture edges;
NPC sunglasses and moustache are parented outside the hideable placeholder;
imported characters play only the first animation; overhead looks through the ceiling;
no avatar separation; input can stick after focus loss; touch panels obscure the scene.
AR discards the detected orientation, retains the virtual camera offset, has no XR
select handler, silently disables unsupported activation, lacks reliable state restoration,
and doesn't suspend virtual NPC motion. No device evidence identifies the historical
launch failure; unsupported features, permission and dependency failures remain hypotheses.

Environment: Blender 4.3.2 and FreeCAD Python library 1.0 work. The FreeCAD CLI launcher
segfaults; the supported library through system Python successfully saves native files.
Shell HTTPS cannot connect to the configured proxy. GitHub connector reads/writes work;
use connected Git data APIs for atomic commits preserving the parent history.
Cloud environment runtime skill used for network/readiness inspection.

## 2026-10-23 — architectural assets

Created a native FreeCAD model and STEP export with separately named floor, four
walls, real window cuts, jambs, lintels, sills, ceiling and beams. All dimensions
are explicitly illustrative, in metres in runtime and millimetres in FreeCAD.
No survey measurements are inferred from photographs.

Blender source retains individually editable angular fieldstones, UVs and worn
edges, recessed lime mortar, staggered oak boards, timber frames, ceiling and beams.
Production export merges render geometry while retaining a separately hideable ceiling.
Original deterministic procedural 512px albedo, tangent normal and roughness maps
are retained. They are procedural material work, not scanned stone or verified
photorealism. Reproduction tools are in tools/stone-room/.
Validation: FreeCAD source generated successfully with Python API. Blender export
and structural geometry validation are recorded in subsequent entries.
