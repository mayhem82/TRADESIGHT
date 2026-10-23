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

## 2026-10-23 — architecture commit and character assets

Architecture commit: 614f1d3437b966e5d149338b699c1fa8a20aefe1.
Final room GLB: 12,103,168 bytes, 143,226 triangles, 12 material primitives, 11
embedded images. GLB structural validation passed. Editable individual stones remain
in the native Blender source. Mineral variants share normal and roughness maps.

The three original portrait photographs arrived during implementation and were
visually inspected. The frontal photograph supplies the facial albedo crop.
The cap, wraparound glasses, handlebar moustache, longer rear hair, face profile,
navy collar and dark outer layer are modelled in three dimensions. Jeans and boots
follow the approved illustration. The full body is skinned to a 16-bone skeleton,
with blended knee/elbow weighting on continuous trouser/sleeve surfaces. Separate
Idle, Walk, Wave and LookAround clips are exported. Final GLB: 4,187,364 bytes,
66,192 triangles, 10 material primitives, 10 embedded images.

This is a photo-guided, hand-modelled character. It is not photogrammetry, does not
establish identity, and is not a verified facial reconstruction. The approved image
remains a higher photorealistic quality target; the asset's procedural clothing,
hair geometry, skin and animation quality are material limitations.

A CPU Blender review render exposed segmented-looking joints in the initial model;
continuous clothes and blended skinning replaced those forms. No physical mobile
performance or animation-contact check has yet been performed. GLB skeleton, weights,
UVs, embedded textures and all four clip names passed independent structural checks.

## 2026-10-23 — dependency and AR module verification

Character asset commit: 3be9140af0409814852d935f4d57ec8bfd2a484a.
Vendored Three.js r164 core, GLTFLoader and BufferGeometryUtils, with upstream MIT
license. The loader's utility import is adjusted to the local directory; the
browser import map resolves its bare `three` import to the same core module.

New AR module uses viewer-space WebXR hit testing in the renderer's local reference
space. Both XR `select` and DOM Place controls can place. DOM overlay gestures are
excluded from spatial select. Placement uses fresh hits only; reticle/control state
clears on lost hits. Floor hits retain their measured height. Wall hits align the
upright room's rear boundary with the plane and estimate the floor from nominal
1.65 m viewer eye height. That estimate is explicitly shown; a wall-only hit does
not measure the floor. Ceiling and steep slopes are rejected. Tracking loss hides
the model until the viewer pose returns. Exit restores camera, roof, scene and input.
No persistent anchors are requested or claimed. No virtual movement occurs in AR.

Tests: five pure collision/placement tests and two synthetic XR lifecycle tests
pass under Node. Synthetic tests cover scan, floor placement, stale-hit rejection,
wall alignment, reposition, tracking-loss hiding, permission errors, source cancellation,
and exit state restoration. These are mocked XR calls, not spatial tracking evidence.
Local Chromium fails before page launch because the sandbox denies IPC sockets.
Two narrow network-permission attempts were interrupted; there is no browser pass
or physical-device pass from the local environment.
