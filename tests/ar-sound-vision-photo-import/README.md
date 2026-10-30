# Ordinary-photo import candidate

Base: `d2a458b00c63476d3f42cfabccdf3b15b42a1a01`.

The phone-photo card accepts ordinary JPEG/PNG images and automatically runs the existing local MiDaS estimator, then produces a crossed-eye or parallel autostereogram. No AR session, wall capture, external depth map, camera or microphone is needed for this route. Original comparison, spacing, retry, clear, and PNG download are available. The optional AR placement uses basic AR, keeps the complete image aspect ratio, and uses the existing placement/clone/movement controls. Exit AR keeps the prepared source; Clear or Reset removes it.

The original wall-camera route retains its capture grants, pose/projection, cropping and automatic depth path. Optional supplied depth is clearly separate under Advanced; its filename is retained and the same file can be applied again after confirming alignment.

Limits: JPEG/PNG input at most 16 MiB and 32 megapixels, minimum 16 pixels per side. EXIF orientation is respected; transparent PNG pixels are flattened on white. Retained source is reduced to at most 1024 pixels on its long side. Extremely panoramic images whose short edge would become smaller than 16 pixels are rejected. Prepared source shares the existing 16 MiB unique-photo pool with AR wall photos. Existing four-wall/shared-clone limits remain. AR physical dimensions use existing slider bounds with contain-fit when image aspect exceeds those bounds. Depth is estimated relative depth, not measurement. MiDaS model/runtime assets remain pinned; initial local model load is 63.7 MiB.

## Validation

```sh
node --test tests/ar-collection/*.test.mjs tests/ar-sound-vision-autostereography-001/*.test.mjs tests/ar-sound-vision-photo-import/*.test.mjs tests/stone-room/*.test.mjs ar-source/single-wall-010/tests/*.test.mjs ar-source/tv-tabletop-002/tests/*.test.mjs
node tests/ar-sound-vision-photo-import/browser.mjs
node tests/ar-sound-vision-photo-import/camera-route.browser.mjs
node tests/ar-sound-vision-photo-import/real-midas.browser.mjs
AR_BASE_URL=http://localhost:8771 AR_SPEED_FILTER=ar-sound-vision-autostereography-001 node tests/ar-collection/speed-layout.browser.mjs
AR_BASE_URL=http://localhost:8771 AR_SPEED_FILTER=ar-sound-vision-autostereography-001 node tests/ar-collection/speed.browser.mjs
npm run build
node tools/verify-autostereography-assets.mjs
```

Serve `public` at localhost:8771 for browser checks. Set `PLAYWRIGHT_MODULE` when Playwright is installed outside the checkout. Tests use Chromium/software WebGL. Browser fixture tests substitute only depth results and synthetic XR/camera textures; the separate real-model test runs the actual local ONNX worker/MiDaS on a generated JPEG. Device capture is blocked in all new browser checks. Test images are synthetic, not the user's diagnostic screenshot.

Results: 111 aggregate tests passed; browser import/error/reselection/EXIF/reset races passed; camera-route CPU rectification matched original pixels/depth exactly with GL error 0; real MiDaS output normalized to [0,1] with nonconstant raw predictions; 24 layout cases passed (six viewports, menu open/closed, speed endpoints), portrait/landscape fullscreen hit tests passed, measured travel retained 1/8x and 32x normal speed with unchanged rotation. Production build and 115 pinned asset hashes passed. Existing Vite chunk-size advisory remains.

Physical S25 FE acceptance, real tracking, Android picker UX and phone model performance remain unverified. This is an isolated, unpublished candidate. Colour Vision effects work is excluded.
