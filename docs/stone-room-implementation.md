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

## 2026-10-23 — viewer integration and deployment gate

AR/dependency commit: 6024bd0367004f925ed919f3c5bb8a1f85e355cf.
Replaced procedural runtime placeholder generation with the production GLBs. The
original walkthrough controls remain supported alongside an analogue touch joystick.
Walking speed, reset, overhead, touch drag, keyboard movement, NPC modes, speed,
collision toggle and local self-contained GLB import remain available. Added named
animation selection, wave, browser speech for Talk, gentle turning, avatar separation,
focus-loss input clearing, loading/retry and visible errors. Settings collapse and
44px controls preserve the main viewing area; overhead hides the separate ceiling.
Daylight and cast shadows illuminate the room, with instanced exterior planting.
The placeholder geometry is removed from the production viewer.

Production GLB ray tests: 48 rays through four window apertures are clear; the east
wall blocks a test ray. These tests inspect exported triangles, not only source names.
Structural GLB and seven Node tests pass. JavaScript syntax checks pass. A second
Blender CPU review render was generated after geometry revision; it is a separate
asset review, not a browser screenshot or proof of reference-level photorealism.

The existing Vite and Pages deployment workflow is preserved and augmented with
GLB contracts, Node tests and Playwright tests against dist/ at desktop 1280×800,
Android portrait 393×852 and landscape 852×393. Screenshots and JSON reports are
retained as workflow artifacts. Browser results are pending until Actions runs.
These viewport checks do not emulate the Samsung GPU or ARCore hardware.

The workspace now has an exact shallow Git HEAD/index hydrated from connected Git
objects. Unrelated files absent locally are marked sparse; they are preserved in
remote trees and are not staged for deletion. Shell proxy access remains unavailable.
All remote commits use non-force, expected-head updates preserving existing history.

## 2026-10-23 — browser runner compatibility repair

Viewer integration commit: 29097f54c3b518b73a5d0aeaefd03f2a2183342a.
Actions run 39910220899 successfully installed application dependencies, built Vite,
verified all existing published pages, passed all seven Node tests, and passed GLB
contracts. Browser installation failed before browser launch: ubuntu-latest selected
Ubuntu 26.04, unsupported by Playwright 1.55.0. Pages deployment was correctly skipped.
Pinned only the build runner to Ubuntu 24.04, which that Playwright release supports.
Screenshots remain artifacts and JPEG review copies are emitted into test logs so
visual review is accessible through the connected GitHub API. Rerun pending.

## 2026-10-23 — observed browser frame timing and live deployment verification

Runner compatibility commit: a2337562a73305dd497dfb7959444ac4515668ce.
Run 39910356450 launched Chromium successfully. Production assets loaded and initial
UV/scale/animation/roof assertions passed. A fixed 400 ms key-press test observed no
camera change; this is not recorded as a movement pass. Changed the test to hold
the key until an actual camera position change is observed (30 s bound), and wait
for observed animation state rather than a fixed 350 ms interval. Page errors and
initial render diagnostics are now emitted for diagnosis; source movement behavior
is not weakened to make a timing assertion pass. Browser rerun pending.

Added post-deployment verification that all ten required runtime files at the public
Stone Room URL return HTTP 200 and match source SHA256 byte-for-byte, including both
GLBs. This checks the published artifact rather than only repository contents.
