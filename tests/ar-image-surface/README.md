# Image surface size and distance candidate

Base: `45a9db5922cc9ab8255260433567d64f80f934a0`. Only AR Sound Vision / Autostereography is changed. Feature validation record; publication evidence is recorded separately.

Existing limits found: width 0.3–2.5 m, height 0.5–3 m; legacy resize cleared selected photos and prepared stereo resources; no exact distance field; no explicit XR far clipping request (desktop preview far was 30 m).

After preparing and placing an image, open More settings → Image size and distance. Enter width **10**, Apply image size, then distance **500**, Set image distance. The order can be reversed. Aspect lock is on by default and derives height from the prepared image. Unlock to set height independently. Numeric controls provide exact entry; existing width/height sliders also resize prepared images without clearing them. Width range is 0.1–100 m; height 0.01–1000 m (including aspect-derived heights); horizontal distance range is 0.75–1000 m. Invalid input keeps current image and transforms, with a persistent error.

Resizing fixes the *visible plane centre*, rather than the invisible model origin one width behind it. Its position, orientation, original photo record, depth, pattern and shared textures are retained. Distance sets horizontal separation from the current tracked viewer along the current ground direction, preserving width, height, elevation and rotation. It is a one-shot move and does not follow the camera. Clone sizes/transforms remain independent while image resources stay shared. Reposition must finish or cancel before using the exact controls. Current tracking is required for distance. No prepared image means controls are disabled; Reset frees image data normally.

For a prepared camera photo, resizing uses its frozen rectified photo/pattern image plane; immutable source camera pose/projection and source pixels remain unchanged. The original capture-baseline view and raw-camera grant/cropping logic remain available. Resizing a raw camera wall without prepared depth retains its legacy clear-and-recapture behavior, disclosed beside the controls. Saved-photo import, local MiDaS, modes, photo comparison, clone/reset/memory rules, speed slider, joysticks, and menu-hidden controls are preserved.

XR requests near 0.05 m / far 2000 m, preserving the device's projection/FOV. Desktop preview uses the same depth range. The actual device projection is inspected; if the runtime clips before the image, the MASK banner and always-available movement status report the clipping limit instead of claiming it is visible. The app does not override device eye projections or claim every runtime honours the request. At long distance a 10 m image is visually small; stereogram detail/fusion is not assured.

All distance values are **virtual horizontal XR coordinates**. They are not surveyed ground distances or geospatial anchors. Phone tracking stability/accuracy at 500 m and physical S25 FE performance/acceptance remain unverified.

## Validation

- 115 aggregate Node tests passed, including centre preservation at rotated headings, order independence, bounds and projection math.
- Synthetic XR + real software WebGL: a 10 m × 5 m image at 500 m produced 32 visible GPU pixels with a 2000 m projection; near/far moves, resize ordering, aspect lock/unlock, resource identity, clone isolation, invalid inputs, tracking pause, clip-refusal warning, reset and menu-hidden controls passed.
- Synthetic GPU camera route: source rectification pixels/depth matched the original route; resize and 500 m move kept source pose/projection, original photo and prepared resources; clone mode and release behavior passed; GL error 0.
- Existing saved-photo browser/race/EXIF suite passed with the intentional new expectation that prepared-image resize keeps photos.
- Actual local MiDaS ONNX/WASM inference passed on a generated JPEG; no device camera/microphone was used.
- 24 focused layout cases passed across six sizes, menu states and speed endpoints; portrait/landscape fullscreen hit tests passed. Measured travel retains 1/8× and 32× multipliers, rotation unchanged.
- Production build and all 116 manifest asset sizes/hashes passed. Existing Vite chunk-size advisory remains.

Run with `public` served at localhost:8773, `PLAYWRIGHT_MODULE` set if needed:

```sh
node --test tests/ar-image-surface/core.test.mjs
node tests/ar-image-surface/browser.mjs
node tests/ar-image-surface/camera.browser.mjs
npm run build
node tools/verify-autostereography-assets.mjs
```

All test images, camera textures and XR poses are synthetic. No capture devices are accessed. Synthetic rendering is not physical-phone acceptance.
