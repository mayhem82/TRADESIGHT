# Isolated browser camera experiments

Two isolated browser experiments. Existing AR scene files are preserved; the project hub adds two clearly labelled entries. No local package install or external models. All runtime assets are local. Total upstream assets: about 14.1 MB (13.4 MiB). Camera frames are processed in the browser, without an upload endpoint.

## Run locally

From this folder run `node serve.cjs`, then open <http://localhost:8787/>. Stop the server with Ctrl+C. The server binds only to 127.0.0.1. It is not left running by verification.

A phone needs these files on an HTTPS origin; `http://<PC-LAN-IP>` does not provide the required secure camera context, and this localhost-only server is intentionally not a phone hosting solution. Proposed future paths on the existing HTTPS AR hub: `/experiments/opencv-outline/` and `/experiments/ar-marker/`, preserving this parent folder's shared CSS and notices. Publish the entire `browser-experiments` folder under `/experiments/` and link each subfolder, or copy the two demo folders together with `shared.css`, `licenses/`, and notices. No existing placement, StoneRoom, or wall scene should be replaced. The user approved publication under the existing HTTPS hub. The publication checkout uses `public/ar-experiments/mayhem-ar/experiments/`, with hub cards in `projects/index.html`.

## OpenCV edge outline

Open `opencv-outline/`. Start explicitly requests a rear camera (front option is in collapsed controls). Stop releases its tracks, including a permission request that finishes after Stop. Capture creates a side-by-side PNG and exposes a save link; it does not upload. The no-camera sample processes a rectangle and circle. Controls use a 20px base, with 18px small text (+4px over a 14px small-text baseline), 48px touch buttons and phone layout.

Processing is capped at 480px wide and scheduled at approximately 12 frames/second, subject to actual CPU speed. It uses grayscale, Gaussian blur and Canny edges. This is an outline effect: no segmentation, clean-background reconstruction, invisibility, scene understanding or hidden-content recovery. Captures retain only the last displayed processed pair. A hidden page pauses the camera and requires another Start.

## AR.js printed marker

Open `ar-marker/`, expand controls and open the printable Hiro marker page. Print on matte white paper with the full black square and white margin. Start explicitly requests the camera. Point at the complete marker to show a coloured rotating cube. Stop releases the camera; size/colour controls collapse away. The ordinary Hiro picture marker is not a QR code. No GPS, device orientation permission, WebXR placement or large model is used.

This implements **marker tracking**, not arbitrary image/NFT tracking. Good light, focus and a visible border are required; occlusion, motion blur and steep angles can cause jitter or loss. The included default calibration is approximate, not per-device calibration. Basic WebGL in the browser is required; there is no dedicated GPU requirement, native OpenCV compilation, large model or paid service. Phone camera and marker alignment remain to be checked on a physical phone.

## Version decision (verified 2026-10-27 UTC session)

- GitHub's current OpenCV release listing reports **4.14.0**, stable, published 2026-07-19; it also lists 5.0.0 as stable (2026-06-06). The official `https://docs.opencv.org/4.14.0/opencv.js` returned HTTP 404. This prototype deliberately pins the available **4.13.0** official browser build, matching the requested documentation. Its actual runtime reports OpenCV 4.13.0. It is not represented as the newest stable OpenCV release.
- AR.js latest stable release is **3.4.8**, published 2026-03-16. The marker-capable Three.js ES-module build is pinned to that tag. Its package declares Three.js `^0.164.0`; this prototype pins **r164 / 0.164.0**, rather than upgrading the renderer independently.
- `vendor-manifest.json` records exact download URLs, byte counts and SHA-256 hashes. `upstream-refs.json` records tag object identities. Local vendor files are unchanged.

Official sources: [OpenCV releases](https://github.com/opencv/opencv/releases), [OpenCV 4.13.0 JS tutorials](https://docs.opencv.org/4.13.0/d5/d10/tutorial_js_root.html), [AR.js releases](https://github.com/AR-js-org/AR.js/releases), [AR.js 3.4.8 README](https://github.com/AR-js-org/AR.js/blob/3.4.8/README.md), [Three.js r164](https://github.com/mrdoob/three.js/tree/r164).

## Verification

Run `node verify.cjs`. Passed in this environment:

- All thirteen upstream assets and licence files match their recorded byte counts and SHA-256 hashes. OpenCV's embedded Zlib, Protobuf and Flatbuffers versions were checked against the actual runtime build information and their pinned upstream notices are included.
- The actual official OpenCV 4.13.0 runtime processes a synthetic square into exactly 160 nonzero edge pixels, with Mat cleanup.
- OpenCV page setup makes no camera request; Start requests once, Stop releases a late permission result, and the legacy self-resolving OpenCV thenable loads without Promise recursion.
- AR page setup and Stop make no camera request (DOM lifecycle smoke check).
- Local HTTP serves both entry points, marker print page and all upstream assets; module MIME types are correct.
- Both app scripts pass `node --check`.

The first sandboxed loopback HTTP fetch failed with EACCES; the same bounded localhost verification was approved and passed with escalation. Upstream downloads were likewise approved after sandbox DNS was unavailable. No action was denied by automatic review; no pending or uncertain action remains.

Local verification did not perform a browser/WebGL render, camera permission prompt, phone camera, AR marker detection, print scaling or screenshot layout test. The deployment workflow additionally runs camera-free Playwright checks in desktop and phone viewports, retains screenshots and `browser-report.json`, and deliberately simulates permission denial without granting camera access. A successful workflow and its report provide those additional checks; physical phone/marker acceptance remains outstanding. Shared desktop interaction was deliberately avoided under the delegated constraints, and no alternative browser-control path was used to bypass the other task's UI restrictions. Automated verification is evidence for assets, actual OpenCV processing and basic lifecycle/HTTP behavior, not proof of working live phone tracking.
