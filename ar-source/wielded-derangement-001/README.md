# Wielded Derangement — phone AR suite integration

The new experience is served from `public/ar-experiments/mayhem-ar/wielded-derangement-001/` and linked from the existing project hub at `public/ar-experiments/mayhem-ar/projects/index.html`.

Intended live route, using the existing TRADESIGHT GitHub Pages deployment: https://mayhem82.github.io/TRADESIGHT/ar-experiments/mayhem-ar/wielded-derangement-001/index.html

This is one growing, contracting, shape-changing mechanical entity, with faces forming and fading across its structure. It is not a portal or doorway. The full original 269.32-second WAV is included unchanged. The machine uses the copied accepted reference renderer; existing Stone Room, Yowie and other suite projects are untouched.

Open the experience from Your AR projects. Play/Pause, Restart and the position slider follow the full song. Hold form freezes only the sculpture while audio continues. Camera placement is manual, with no real-world tracking or persistent anchor; optional Surface AR uses supported native WebXR hit testing. The fixed sticks move/depth and turn/height. Size and model light are adjustable. The Projects link returns to the suite. The viewer controls camera permissions. Camera frames are neither recorded nor uploaded.

Static/unit checks pass. Rendered browser interaction QA and physical phone acceptance remain pending because Computer Use stopped native Chrome interaction. No alternate browser route was used. Existing CI checks for older projects do not prove this new experience renders or tracks correctly. This should remain labelled a phone test build until tested.

All production code is readable directly under the new public folder, with no additional install/build step. Preserve its local vendor licence files. Original audio SHA256: `52364f8dd70f4a149974c2350693dd09f122d67d60d4cba64ff4ff36271ac214`.

Run `node --test tests/wielded-derangement-001/timeline.test.mjs` for finite deterministic timeline, growth/contraction and face appearance checks. The inherited deployment workflow builds the existing site and copies `public/` into its Pages artifact. No workflow, audience, permissions, old application or attribution change is required for this additive integration.

Provenance and retained notices are recorded in PROVENANCE-AND-NOTICES.md. validation-report.json is the pre-integration filesystem/unit report, not a browser acceptance report.

## Ground placement update

See [GROUND-PLACEMENT.md](GROUND-PLACEMENT.md) for the ground-002 correction. Place on ground prefers tracked floor hits. Align ground manually selects a visible ground point without claiming tracking. The base pivot stays on that selected plane as the machine morphs, rotates or changes size/height. After placement, the second stick changes height from the base. A physical phone retest remains pending.
