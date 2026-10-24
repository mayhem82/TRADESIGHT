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

## 2026-10-23 — deployed verification and exported stone winding repair

Commit f920b406277ddb5e666b7730aa9da88f6524c16d passed Actions run 39910656923:
all three browser viewports passed, without JavaScript errors, and Pages deployment
completed. All ten live runtime files returned HTTP 200 and matched source SHA256.
This is browser automation and deployment evidence, not physical Android/AR testing.

Screenshot review exposed inverted stone faces on north/south walls. An added
production-GLB normal test reproduced the inward-facing hit before correction.
Recalculated closed stone mesh normals in Blender before export; the regenerated
editable source and GLB pass 64 outward-normal checks, 48 unobstructed window rays,
and the solid east-wall check. GLB structural checks and Node test suites also pass.

Scope audit: unrelated restored workspace files match GitHub byte-for-byte. Remote
changes are confined to Stone Room and its build/deployment verification workflow.
Photo-guided character likeness and reference-level photorealism remain unverified;
physical AR tracking and Samsung device performance remain untested.

## 2026-10-23 — portrait starting view

Masonry correction commit: 27e4755e9867bbd3d53be42d84bbb4a9a9c70d38.
Previous browser screenshots showed the NPC outside the initial portrait viewport.
Reset now aims horizontally toward the character, preserving eye height and walking
controls. Browser tests assert the projected character centre is in view at all
three viewport sizes. JavaScript syntax passes; browser rerun pending this commit.

## 2026-10-23 — second deployed screenshot review and mortar depth

Commit 54cb21257a1e5b8d3aedb7177d5e7b2d315514ed passed Actions run 39912114126:
seven unit/mock tests, three browser viewports, and ten live byte-identity checks.
Screenshots confirm the NPC is centred in portrait. All initial views report a
1.838 m character, four clips, 25 render calls, and no missing UVs or page errors.

The reviewed wall still showed excessive blank mortar. Source inspection found a
second cause: backing thickness 0.19 m intersected stones with depth as low as
0.16 m. Reduced backing thickness to 0.10 m and added a generation assertion that
both stone faces remain proud of mortar even at minimum central relief. Window
openings, room dimensions and the FreeCAD structural envelope are unchanged.
Regenerated the editable Blender model and production GLB; verification follows.

Local verification after mortar correction: generation depth assertion passed;
production GLB passed 48 window rays, 64 outward-normal checks and east-wall blocking.
GLB structure/UV/material/rig contracts passed. Runtime byte size and draw count
remain unchanged. Browser screenshot review and deployment are pending this commit.

## 2026-10-23 — final published verification

Runtime commit: 0d8e4cf3cd560c3de3fa9e1138deaf8989721ec2.
Actions run 39912875294 succeeded, including Pages publication and all ten live
HTTP/SHA256 checks. Seven Node tests and desktop/Android portrait/landscape browser
checks passed without page errors. Final portrait screenshot was visually reviewed:
stone faces now cover the backing, and the NPC remains centred. Saved actual CI
browser and live verification reports under tests/stone-room/.

All changes remain within Stone Room assets/source/tests/documentation and its
existing deployment workflow. Native FreeCAD and Blender sources are retained.
The approved photorealistic standard is not attained: especially the character's
clothing, anatomy, hair and facial likeness require further artistic refinement.
Physical AR camera, green reticle, tracking, wall detection and Galaxy S25 FE
performance remain unverified. Mock XR tests verify logic only. Wall placement
estimates floor height; persistent anchoring is not implemented. User was given
the live URL and floor-placement instructions for device inspection.

## 2026-10-24 — visual remediation after production capture review

User requested correction of the visibly stylised production capture. Kept work
within Stone Room and retained atomic commits. Existing controls and XR logic are
unchanged. No physical-device result has been supplied.

Environment defects: repeated high-contrast orange grain, an artificial ceiling
point-light hotspot, and sparse polygon trees against a flat horizon. Replaced the
wood color map with generated fine-grain neutral oak, reduced its normal strength,
replaced the hotspot with broad fill, and added an equirectangular countryside
background with environment reflections. The background is generated scenery, not
surveyed terrain, and is hidden by actual WebXR camera passthrough during AR.
Original generated masters are retained; Blender prepares optimized JPEG maps.
The 1774px panorama is 538,965 bytes and oak albedo is 315,601 bytes.

Geometry verification after material rebuild: 48 window aperture rays, 64 outward
stone-normal checks, and the solid east-wall check pass. New runtime background
is included in live byte verification. Browser tests now additionally walk toward
the character and retain a close-up, preventing distant screenshots from being
the only visual review. Browser and deployment rerun pending.

## 2026-10-24 — anatomical character and close-up remediation

Material/source asset commit: 74b933a38621b31f7743acc4b324ac0ac8bffde4.
The old sphere-based face and separate primitive fingers were inadequate in captures.
Added CC0 MakeHuman base/shape data for anatomical head and hands; asset license
and provenance are retained under design/stone-room/anatomy/. Upstream asset names
are not demographic claims about the photographed person. No MakeHuman program
code is included. This supersedes earlier statements that no third-party anatomy
was incorporated.

Reworked continuous garment sections, gathered cloth folds, open shirt neckline,
shaped collars, jacket thickness, joined jeans seat, rounded boot soles, thinner
curved glasses, embroidered cap, fine moustache tips and layered rear hair. Retained
the 16-bone rig and Idle/Walk/Wave/LookAround clips. Studio close-up renders exposed
neck/shoulder intersections and cord-like facial hair; those were iteratively repaired
before committing. A UV bake blends the generated photo-guided face into surrounding
skin to eliminate the hard projection boundary. The generated eye detail is inferred
and covered by the glasses; neither reconstruction nor likeness is verified.

Blender source retains editable geometry, rig and packed textures. Source scripts,
original frontal crop, generated color master and baked UV atlas are retained.
The mannequin-like silhouette is improved, but photorealism and exact likeness are
not established by structural tests. Browser visual review remains required.

Final character GLB contracts pass: 96,378 triangles, 11 material primitives and
all four skinned clips, within the existing mobile geometry budget. A UV-layer name
mismatch during mesh joining initially made the baked face dark. Standardized the
joined UV layer name and added a non-degenerate material-UV contract to detect that
failure. Reviewed the corrected studio close-up before upload. No physical-device
performance, gait ground-contact or verified likeness result is claimed.

## 2026-10-24 — removable AR environment and live companion movement

Character revision commit: 3a78a74ca56bb91272328f9a8ea68646316ac03b.
User requested a removable environment and a character walking on real ground in
live AR. Added NPC-only mode as the default. Environment selection is available
inside the AR session; selecting the full room preserves the existing floor/wall
placement workflow. Switching modes requires fresh placement. Virtual camera, NPC
position/orientation and architecture visibility are restored on exit.

NPC-only mode accepts measured floor hits, centres the companion at the hit, and
uses subsequent floor hits as walk destinations. Follow consumes live XR viewer
poses and stops 1.25 m away. Walking does not clamp to the virtual room's boundaries.
Stop cancels movement/waving; Wave and speed remain accessible in AR. A transparent
shadow receiver leaves real camera surroundings visible. Session tracking loss
pauses motion and hides virtual content until tracking returns.

Explicit limits: motion assumes the placed flat floor plane; destinations differing
by over 12 cm in height are rejected. Obstacles, stairs and real-world collision are
not reconstructed. No persistent anchors are claimed. AR camera passthrough, hit
availability and tracking stability still require physical-device verification.

Local JavaScript syntax, geometry/GLB contracts and unit/mock tests pass. Added tests
cover NPC-only wall rejection, measured floor placement, destination selection,
live-viewer following, tracking-loss pause, Stop, mode switching and exit restore.
Added browser checks for all AR controls fitting portrait/landscape without panel
overlap. Those layout checks do not simulate a physical AR session. CI pending.

## 2026-10-24 — animated floor contact and close-up test timing

Commit f8d20182f0bf2d87f67fe5f32f0ce06d2727978e passed all nine unit/mock tests in
Actions run 40058557858. The revised production scene loaded without page errors,
with 24 draw calls and 239,616 rendered triangles. The new desktop close-up approach
timed out after 45 seconds on the software-rendered runner, so deployment was
correctly skipped. The test now uses the existing 3 m/s speed control for approach,
a 120-second bound, and reports final camera/NPC diagnostics even if it times out.
It still requires the camera to reach the character using actual movement controls.

Added a small boot-contact sampler to correct vertical drift from skeletal walking
against the placed floor plane. This keeps the lowest sampled boot surface grounded;
it is not terrain reconstruction or full foot IK. Imported replacement models are
not altered. A new unit test checks raised and penetrating animated feet against a
translated floor. All ten unit/mock tests pass locally. Browser checks now require
near-zero sampled ground clearance while idle and walking. New runtime module is
included in live byte verification. Physical terrain/collision remain unverified.

## 2026-10-24 — phone input and interrupted AR startup

Checked out main 218167cccfd7ff3e5cd2cd61a8691c3939d4d1f8 in the cloud workspace.
The failing CI log identifies Page.screenshot's 30-second default timeout after
successful scene load, not a failed keyboard movement assertion. Screenshot capture
now has an explicit 120-second bound and timing evidence; screenshots, viewport
checks, and deployment gating remain mandatory. This is a pending CI repair, not
proof of Samsung rendering performance.

Clearing input now forgets the active joystick pointer, preventing a stale move
from restarting movement after focus loss, reset or AR entry. Secondary pointers
cannot take over or release the active joystick. Context loss is observed on the
canvas (the event does not bubble); input clears and the recovery message is shown.
Browser regressions cover interrupted input, actual joystick movement, and delivery
of the canvas context-loss message.

Two synthetic XR regressions reproduced late startup results corrupting a restarted
session. Attempt-scoped ownership now cancels a stale hit-test source and prevents
an old rejection or event from closing or placing in the new session. Both tests
failed before the change; all twelve Node core/XR tests pass after it.

Local production build, JavaScript/Python syntax and production GLB contracts pass.
Local Chromium cannot start because this executor denies IPC sockets; the normal
escalation failed during environment setup. Full browser verification remains for
CI before deployment. No character assets, likeness, geometry, or controls were
redesigned. Physical S25 FE camera passthrough, floor hit testing, tracking and GPU
performance remain unverified.

A supported cloud-browser inspection of the old live site reported WebGL disabled
and remained on its loading screen. Added a renderer-construction failure message,
dismissed loading and disabled AR for that case. A separate browser regression
forces getContext to return null and checks this recovery guidance. That regression
is pending CI; the cloud browser limitation is not evidence of a phone failure.

## 2026-10-24 — physical phone rendering failure after successful browser CI

Commit 66beccca890a8aa6535802cf019ea53a3eec1100 passed run 40065124494,
including all three browser viewports, twelve unit/mock tests, screenshot captures,
Pages deployment and live byte checks. That was not a physical AR pass.

The user then supplied a phone screenshot showing camera passthrough, enabled
Walk here, and “Companion stopped at the floor target”. Neither the character nor
green target was visible. This demonstrates accepted floor hits and running motion
logic, narrowing the failure to rendering/compositing rather than permission or
missing surface detection. No root cause is yet physically confirmed.

Isolated DOM controls into a dedicated transparent overlay root, excluding the
WebGL canvas, matching the separation used by Three r164 ARButton. This removes
an avoidable compositor overlap; it is a compatibility correction, not a claim
that the phone is fixed. Actual target geometry remains in the XR scene and no
screen-space target, arbitrary placement or fabricated floor was added.

Added on-phone startup stages and real frame/pose/hit/target, draw-call, XR-view,
XR-render-target and context-loss diagnostics. Frame/render exceptions are visible;
tracking errors pause companion motion. Missing hits and rejected wall/slope hits
are now distinguished without relaxing measured-floor placement. New synthetic
regressions cover diagnostic branches, error recovery, dedicated overlay selection
and render-submission reporting. Browser checks retain all existing assertions and
add canvas exclusion from the overlay. Physical re-test remains required.
