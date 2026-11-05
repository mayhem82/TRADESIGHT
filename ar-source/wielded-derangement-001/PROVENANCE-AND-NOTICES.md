# Provenance and retained notices

## Preserved AR renderer and placement asset

Source: the user-confirmed Bellbrook Yowie checkpoint under `2026-10-25/continue-stone-room/stone-room/checkpoints/bellbrook-yowie-working-2026-10-26/runtime`.

The reference renderer, glTF loader, scene graph, maths modules, local dependencies and surface reticle were copied byte-for-byte. The accepted baseline bundle was not edited or substituted. Its SHA256 is `d0e78b45bad90485e51130f340d4f9e4472d4ed18a01641e3667bd94bde8a2e1`.

The copied Immersive Web source identifies copyright 2018 The Immersive Web Community Group and carries an MIT permission notice. Its full notice is retained in `public/vendor/LICENSE.md`, with original source headers left intact. The gl-matrix, motion-controllers and WebXR polyfill dependencies retain their separately supplied full notices at:

- `public/vendor/js/third-party/gl-matrix/LICENSE.md`
- `public/vendor/js/third-party/motion-controllers-LICENSE.txt`
- `public/vendor/js/third-party/webxr-polyfill/LICENSE`

The static audit checks that these files exist and records their SHA256. This is a source-and-notice audit, not a new legal opinion or a warranty about upstream ownership.

## Camera and control helpers

`public/vendor/camera-lifecycle.js` and `public/vendor/joystick.js` are unchanged copies from the user's existing `2026-10-29/task/ar-colour-vision/public` application. The camera helper provides the existing attach-to-video and input-device enumeration primitives; the new application owns camera permission requests and cleanup. The joystick supplies the existing pointer-capture controller, release handling and camera-relative movement maths.

Those two copied files do not contain an explicit standalone licence grant. They are recorded as reused user-project code; this package does not relabel them as MIT or invent a separate redistribution licence. Their exact source and byte hashes remain in `reuse-manifest.json`.

## Newly authored application and artwork

The application runtime, mobile layout, audio-time transformation functions, 48 mechanical cells, 24 struts, core, 12 anonymous three-dimensional relief faces and sculpture base are original procedural work made for Wielded Derangement in this task. No stock portraits or AI-generated actor footage were used. The faces are invented geometry and are not representations of identified people.

The inherited renderer is reused as described above; it is not claimed as newly authored. Runtime code applies its existing model-opacity and exposure uniforms to the new geometry. No earlier accepted project or checkpoint was changed.

## Audio and lyrics

The user supplied their song WIELDED DERANGEMENT by Architect of MAYHEM. The WAV originated from the official Suno download for `e24bc7cd-8fd8-4471-815c-5183a8ebf16b`. The included WAV has SHA256 `52364f8dd70f4a149974c2350693dd09f122d67d60d4cba64ff4ff36271ac214`, 48,000 Hz, stereo 16-bit PCM and duration 269.32 seconds.

The recording is included intact. The package grants no new licence to the song. `public/lyrics.txt` preserves the source lyrics as an untimed reference. The energy data is a local RMS analysis of this same recording, used for modest mechanical pulses; it is not a replacement recording or a lyric-alignment claim.

## External state

No publication, purchase, account change, upload or sharing action is included in these files. Phone/browser rendering and interaction acceptance remain pending. Read the README and actual validation report before presenting this as a device-verified release.
