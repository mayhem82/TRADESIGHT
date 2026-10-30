# AR collection candidate verification

Base: `4480e60d10a9717f51e8f74ce283d5fa4ba4bb53`. Prepared 2026-10-30 in the saved cloud checkout. Implementation was prepared without PC access or PC file changes. Release is authorized separately after checking current remote HEAD.

## Changes

- Colour Vision defaults to a neutral two-metre hollow cube: floor, ceiling, back, left and right; +Z is open. Faces are double sided. Its shader ignores image, video, camera and effect imagery. Original gallery/pavilion/surface choices and their geometry remain available; base history also preserves them. Placement orientation and transforms are unchanged.
- Single Wall 009/010 and Sound Vision move their existing motion nodes outside `#panel`. Their frame loops no longer require the panel to be visible. Source app modules and the actual served bundles receive the same guard removal. Menu hiding still releases any current held input; a new drag works immediately.
- Shared collection CSS/JS reserve space around existing controls. Portrait panel clearance follows the measured motion dock; landscape uses adjacent columns. Existing stick dimensions are retained, and Bellbrook/room landscape rules no longer shrink their sticks.
- Existing wall action rows move to a persistent dock while their menus are hidden, then return to their original position. The same nodes retain their event handlers and ordering. No sticks are added to apps that have none.
- Bellbrook/walking pages gain a menu toggle for the information/settings panel; their walking pad and existing actions stay available. Stone Texture keeps its AR action buttons; its walkthrough stick remains inactive/hidden in AR, matching its movement implementation.
- Marker, OpenCV and placement pages gain browser menu hiding while retaining their existing actions. Placement has no DOM overlay menu in its original immersive session: surface taps and the browser's native session exit remain its existing AR controls.
- Invalid historical 008b–008f CSS z-index values become valid integers. Existing collection-menu-007 behavior remains in place.

## Validation

- `npm run build`: passed (existing large-chunk advisory).
- Sound Vision release manifest: refreshed hashes for the three changed assets and pinned both new shared dependencies; `node tools/verify-autostereography-assets.mjs` passes for all 112 assets.
- `node --test tests/ar-collection/*.test.mjs tests/stone-room/*.test.mjs tests/ar-sound-vision-autostereography-001/*.test.mjs ar-source/single-wall-010/tests/*.test.mjs ar-source/tv-tabletop-002/tests/*.test.mjs`: **95 passed**.
- `layout.browser.mjs`: **156 cases passed**, zero page exceptions. Every page loads its actual served code. It exercises menu buttons at 412×915 and 915×412, open/closed and closed in fullscreen. AR overlay classes are simulated for this layout pass; this is not physical WebXR acceptance. Existing joystick rectangles stay in bounds and their centres pass pointer hit testing.
- `motion.browser.mjs`: actual served Single Wall 009/010 and Sound Vision bundles run against an emulated WebXR session. Fresh hit placement, landscape hidden-menu world movement, dual height movement, portrait touch movement, simultaneous two-stick touch (010/Sound), release-to-stop and Exit AR all pass. Rendering uses real Chromium WebGL; poses/session frames are synthetic.
- `cube.browser.mjs`: real WebGL2 rendering passes. Cube pixels differ by **0** between red/blue uploaded source images; preserved gallery pixels differ by **6892**. Interior **16384** pixels and exterior **5476** pixels render; GL error **0**. Preview defaults to `cube`.
- `git -c core.whitespace=cr-at-eol diff --check`: passed. Existing reference HTML uses CRLF; retained deliberately.

## Per-page coverage

Paths below are relative to `public/ar-experiments/mayhem-ar/`. Each row passed six layout/fullscreen cases.

| Experience page | Existing sticks checked | Cases | Additional evidence |
| --- | ---: | ---: | --- |
| `index.html` | 0 | 6 | Layout and menu/fullscreen |
| `ar-colour-vision-001/index.html` | 2 | 6 | Cube preview, real GPU texture independence, interior/exterior |
| `ar-sound-vision-autostereography-001/index.html` | 2 | 6 | Emulated AR movement, touch, release, exit |
| `tv-tabletop-002/index.html` | 2 | 6 | Layout and menu/fullscreen |
| `mayhem-text-003/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-005/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-006/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008b/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008c/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008d/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008e/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008f/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `invisibility-wall-008g/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `single-wall-009/index.html` | 1 | 6 | Emulated AR movement, touch, release, exit |
| `single-wall-010/index.html` | 2 | 6 | Emulated AR movement, touch, release, exit |
| `stone-room-texture-001/index.html` | 0 | 6 | AR actions retained; walkthrough stick intentionally inactive in AR |
| `experiments/ar-marker/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `experiments/opencv-outline/index.html` | 0 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/bellbrook-yowie-v1.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/bellbrook-yowie-v2.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/bellbrook-yowie-v3.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/bellbrook-yowie-v4.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/walking-stable.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/joystick-movement.html` | 1 | 6 | Layout and menu/fullscreen |
| `stone-room/reference/placement.html` | 0 | 6 | Browser menu; original immersive session has no DOM overlay |

## Reproduce browser checks

Serve `public/` from the repository root using `python3 -m http.server 8765 --directory public`. Install Playwright outside the repository if needed: `npm install --prefix /tmp/ar-validation --cache /tmp/npm-cache playwright --no-audit --no-fund`.

Run each script with `PLAYWRIGHT_MODULE=/tmp/ar-validation/node_modules/playwright/index.mjs node tests/ar-collection/<script>.browser.mjs` where `<script>` is `layout`, `motion` or `cube`. Chromium defaults to `/usr/bin/chromium`; override `AR_BROWSER`, `AR_BASE_URL`, or `AR_OUTPUT_DIR` as needed. Default artifacts go to `/tmp/ar-validation`.

## Limits and release handoff

Physical S25 FE rotation, simultaneous real touch, camera/depth grants, tracking stability, compositor overlays and session lifecycle still need phone acceptance. The layout pass simulates the AR DOM state; only the three repaired wall apps have additional emulated frame-loop movement coverage. Bellbrook's accepted placement/rendering bundles and all non-cube scene/model/effect logic are unchanged.

Scope is the 26 experience pages directly reachable from Projects, Models, and the Stone Room collection. Secondary history links such as `invisibility-wall-004c`, Sound Vision's `baseline-010.html`, older TV 001, and other unlisted reference versions were noted but not recursively patched. The older `stone-room/index.html` experience is not a direct experience link in these launchers and was not changed.

The parent should review the candidate patch, coordinate a single release, publish with the shared CSS/JS and served bundle changes together, verify the public pages, then arrange physical phone acceptance. Existing authorization covers release, and the designated publisher performs the normal non-force update after checking remote HEAD.
