# AR Colour Vision image surface size and distance

Base: `b61060b7f7e7dfb0852305afe0e58e154abc8fd9`.

Routing correction: the earlier size/distance request was implemented in AR Sound Vision / Autostereography. The user clarified that AR Colour Vision was intended, and separately confirmed that the Autostereography correction should stay. This change adds the requested controls to **Colour Vision's existing Image surface model**. It does not remove or edit the Sound Vision feature. The plain open cube, pavilion and gallery geometry are unchanged.

Public target: https://mayhem82.github.io/TRADESIGHT/ar-experiments/mayhem-ar/ar-colour-vision-001/index.html

Choose **Image surface** in Model, load an image/video if desired, then Explore model or enter AR and tap a current floor ring. Open **Image surface size and distance**, enter width **10**, Apply surface size, then target horizontal distance **500**, Set surface distance. The order may be reversed.

- Width 0.1–100 m, height 0.01–1000 m; precise numeric controls. Content aspect is locked by default; unlock to edit height independently. Media dimensions determine aspect, including existing image/video and captured-content routes. The full loaded image is now mapped to both broad faces of this model, replacing its previously cropped architectural UV mapping.
- Distance 0.75–1000 m is a one-time horizontal displacement from the current tracked viewer (or the desktop preview camera). It preserves elevation, rotation and size, without following the camera.
- Size is applied at draw time around the visible surface centre, leaving its placement matrix, orientation and thickness unchanged. No media is cleared, captured or reloaded by size/distance controls. Each clone keeps its own dimensions and position. Reposition and cancel preserve dimensions/content.
- Controls are disabled for other models, absent placement, lost tracking (distance), and pending reposition. Invalid numeric input preserves the current image and transforms.
- XR requests near 0.05 m / far 2000 m; preview far is also 2000 m. Device eye projection/FOV is retained. If the device projection clips before the selected surface, a separate warning stays visible with menus hidden. A runtime that refuses the requested far range is not claimed to display 500 m.
- Original cube opening, neutral non-textured cube, media/effect processing, cartoon/outline composition, joysticks, speed slider and menu/landscape behavior are preserved.

Distances/sizes are virtual XR coordinates, not measured ground distances or geographic anchors. A 10 m image at 500 m occupies few screen pixels. Real phone tracking, physical placement accuracy and S25 FE acceptance remain unverified.

Validation: 121 aggregate tests passed, including six new math/geometry tests. Browser test loads a synthetic 2:1 image and exercises 10 m × 5 m at 500 m with real software-WebGL rendering (39 visible pixels), resize/distance ordering, source-pixel preservation, retained effect toggles, aspect lock/unlock, numeric errors, clipping refusal while menu hidden, tracking pause, clone isolation, reposition/cancel, portrait/landscape, fullscreen and reset. Existing cube GPU, cube-facing initial/reposition, effect rendering/combinations, 24 focused speed-layout cases, fullscreen hit tests and measured 1/8×/32× speed regressions passed. Production build and existing 116 Sound Vision asset hashes passed. Existing Vite bundle-size advisory remains.

All images and XR poses used by tests are synthetic; actual camera/microphone access is blocked. No phone or geographic accuracy is inferred from browser tests.

```sh
node --test tests/ar-colour-surface/core.test.mjs
# Serve public at localhost:8774; set PLAYWRIGHT_MODULE if external.
node tests/ar-colour-surface/browser.mjs
```
