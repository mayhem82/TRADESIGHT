# Terminus history · proportional model candidate

Open `index.html` through a local HTTP server for desktop preview, or HTTPS on a WebXR AR device. This separate page reuses existing Colour Vision placement, joystick and matrix modules without editing those apps. No release index, collection menu or existing functionality is changed. Published as a proportional reconstruction with explicit source and measurement limits.

The working candidate contains **seven selectable, source-bounded proportional models**: 1841 dashed footprint; 1863 illustrative footprint envelope plus incorporated earlier footprint reference; 1900 wing roof envelope with earlier corner references; 1917 linked roof envelopes; 2017 visible deck addition; 2018 restoration comparison; latest documented comparison. The last three deliberately share the same plaque-derived geometry: no independent later dimensional change has been established. They must not be described as separate measured as-builts.

## Geometry evidence

The parent supplied a structured manual trace from a researcher who inspected the actual user image. `plan-models.js` retains those reviewed UV polygons and extraction provenance. The coder did not independently see the photo; the researcher's extraction is the geometry source. No image bytes or textures are included or uploaded.

Coordinates are dimensionless ratios from an unrectified photograph of a diagram. Projected distortion and drafting uncertainty remain. Clear lines were estimated within 3–6 displayed pixels, faint dashed corners within about 10; those estimates exclude photographic distortion and plaque drafting error. Roof outlines are not proven wall-line footprints. Historic dashed footprints are prior reference overlays, not simultaneous current roof surfaces. Only the clearly visible deck outline is included; ambiguous roof overlap is omitted.

Vertical forms are **illustrative**, controlled by the shared height slider. Zero height gives plan-only slabs/lines. The 1863 textual two-storey sandstone/slate description supplies no measured height. No ornate elevations, exact roof profiles, surveyed ground alignment or exact current-condition claim is made. `reviewedComponent` records extraction provenance and separates estimated geometry from unknown measurements.

The shared display-size control sets metres per relative plan unit for AR rendering. It is a display calibration, not evidence of real dimensions. Independent per-version scale, rotation, opacity and distance remain available. Onsite placement is manual local reference alignment; there is no geospatial registration or GPS accuracy claim.

## Deliverables and export

- `index.html`, `app.js`, `style.css`: isolated viewer with overlay/side-by-side/single comparison, two joysticks, speed, fullscreen/landscape, menu hide, fresh-hit placement, tracking-loss handling, reposition/cancel/reset.
- `plan-models.js`, `geometry.js`, `evidence.js`: reviewed polygons, concave extrusion/outline generation, stage provenance and sources.
- `models/terminus-*.gltf`: seven self-contained glTF 2.0 files with embedded buffers, source registry, component provenance, line/triangle modes, and unverified metric calibration. Default display size is 2 metres per relative plan unit; illustrative height is 0.45 relative units.
- Browser export generates the selected phase with the chosen display calibration and source provenance. Evidence JSON includes source/access status. No ZIP is required or offered as the working deliverable.

## Access limits

The private reference photograph was inspected by the geometry researcher. This build consumes the reviewed structured trace; the photograph is not included or reproduced. That trace establishes comparative geometry, not metric dimensions.

Exact 2016 heritage-report and April 2025 assessment URLs are retained in the source panel. Both returned HTTP 403 when opened normally; no bypass was attempted. Parent research identifies November 2023 imagery reused in the 2025 assessment. The accessible City of Sydney history page confirms a hotel at the corner since 1841 and identifies archive photograph A-00036442 (circa 1909). Official venue and architect text were independently checked 31 October 2026. The architect's 450-square-metre project area is not used as a footprint.

## Validation and release status

From the repository root:

```sh
node --test tests/terminus-history/core.test.mjs
AR_BASE_URL=http://localhost:8774 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/terminus-history/browser.mjs
```

Browser checks render every actual traced model through real Chromium WebGL under the existing synthetic XR emulator, test plan-only height and glTF download, repeated selections, shared origin, independent adjustments, 500-metre distance changes, fresh-hit gating, tracking loss, reset, menu hide, portrait and landscape layouts, and session exit. Zero camera/microphone capture requests are permitted. Results and screenshots are local diagnostic evidence; no reference or camera photograph is published.

This is a useful **local proportional reconstruction candidate**, ready for geometry/presentation review. It does not meet the user's exact-current-state requirement: metric dimensions, original elevations, photo rectification, recent dimensional changes and physical AR tracking remain unverified. Publication does not establish measured fidelity or physical-device tracking accuracy.
