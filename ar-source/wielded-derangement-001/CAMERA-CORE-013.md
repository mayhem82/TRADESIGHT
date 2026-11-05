# Local 013: camera-only core, partial Nebula integration

Unpublished continuation of local 012. Public release 011 is unchanged. Wall
checkpoint 012 remains independently available at commit
`6f27dfc76789878954340c8cedeae8cdc029dee7`.

## Source located

Original Sound Nebula is present at:

`C:\Users\minko\Documents\Codex\2026-11-03\what-can-you-work-with-on\colour-vision-extreme\nebula.html`

Its implementation is the adjacent `script.js`, 199,416 bytes, SHA-256
`4461173a82e2356219c78e8d879a5af55d5f8e6db17c1483cde0ddd61a483bd1`.
The source-location gap recorded in the earlier audit is resolved.
`NEBULA-SOURCE-PROVENANCE.json` records the preserved original files and hashes.
Original projects are read-only; no baseline was edited or executed.

The camera correction shader was extracted from that exact implementation and
adapted to GLSL ES 3.00. It retains original correction, edge, cartoon and colour
assist formulas. Cartoon and outlines also combine: outlines apply after cartoon,
while individual modes match the original pixel output. A separate DOM-video
vertical orientation flag is the other visual adapter.

## Implemented now

**Camera view effects** is a separate section in the existing panel. The master
**Camera effects** switch defaults off. Controls include:

- Cartoon: levels, edge width/strength and saturation.
- Outlines: width, blend, opacity and colour; can combine with Cartoon.
- Protan/deutan/tritan colour assist and strength.
- Camera image rotation by 180 degrees.
- Calibration correction blend/spread; import/export of original Nebula colour
  points, bounded to 32 valid records.
- Reset of camera effects and imported colours.

Colour import accepts an original point array or an object with `points`. It
validates finite, normalized source RGB and correction values. File data is read
only after the user selects it; no network connection is introduced. The original
Nebula shader's Lab, HSL, contrast and exposure corrections are retained.

Effects operate on camera pixels **before** the original three-dimensional scene
draws. Model, portrait, wall and tile materials receive no filter. The pass
restores program, VAO, array buffer, active texture, unit-zero texture/sampler,
separate read/draw framebuffers, viewport, masks, unpack flags and graphics
capabilities. Failed effect initialization is not retried every frame; the camera
stays unfiltered and the user can explicitly switch effects off/on to retry.

## Camera modes and capability limits

In **Camera overlay (untracked)**, the existing user's camera video supplies
pixels. The shader uses the original cover crop with a DOM-video vertical flip.
That mode remains explicitly screen-relative and untracked. It is never labelled
as ground-tracked AR.

For tracked AR, enable Camera effects **before** starting AR to request optional
`camera-access`. Required local/hit-test tracking and controls remain unchanged.
When granted, `XRView.camera` and `XRWebGLBinding.getCameraImage` supply current,
pose-aligned textures during the native animation frame. Each eye gets its own
camera image and viewport. All eye inputs are checked before rendering. The
borrowed textures are not retained or modified; sampler settings use a separate
sampler object. Current camera imagery is processed directly on the GPU rather
than retaining a low-rate camera snapshot behind current world-locked models.

If access or a current image is absent, the native background stays unfiltered
and world tracking remains active. No model imagery is substituted, no second
camera stream starts, and no overlay fallback starts. The controls state the
missing capability. Switching effects on after a session without the feature
requires restarting AR. Tracking loss skips processing and labels it paused.

The 3D preview stays unfiltered. Camera effects require an actual camera view.
No camera image is recorded, uploaded or shared by this core implementation.

See the primary [WebXR Raw Camera Access specification](https://immersive-web.github.io/raw-camera-access/)
for feature grants, frame lifetimes, view alignment and read-only camera textures.
Actual browser grants, physical image alignment/orientation and phone performance
remain unverified. No claim is made that the user's particular phone grants it.

## Complete Sound Nebula coverage is unfinished

The original source contains more than the implemented filters. Still pending:

- Three audio-band swarms with per-band hue/count/size/speed/jitter; pulsing core;
  colour-triggered fireworks, flames and dripping; particle cartoon/outlines.
- Song/microphone analysis and Voice/Music microphone modes; bass/mid/treble,
  volume-spike, colour-match and timer triggers; delay and sensitivity controls.
- Screen/colour-point beat flash, blackout, torch/dim/invert modes and haptics.
- Camera aim/calibrate/edit/select/delete flows, named templates and point-cycle
  flash transitions beyond the working colour-data import/export.
- Photo/video capture, device selection, camera-only sharing, tablet broadcasting
  and receiving. These require dedicated integration and capability checks; they
  are not silently started by copying the source.

Some hardware functions have different constraints in tracked AR. A borrowed XR
camera texture is not a MediaStreamTrack that can accept torch constraints.
These functions must report their actual availability rather than opening a
competing capture stream. Native capture/sharing must include the intended
composite explicitly; the original engine's camera canvas is not automatically
the complete AR experience.

This is a verified core increment, **not** a complete Sound Nebula port.

## Checks

77 Node tests pass, retaining the previous 69 checks. New tests cover independent
settings, cover crop, bounded colour uniforms, exact camera-texture source
guards, per-eye composition, stale sessions, state restoration, failure fallback
and camera-before-model pass ordering.

The actual adapted shader compiled and rendered in standalone ModernGL on Intel
UHD. On a synthetic colour fixture, its individual modes matched the original
Nebula shader with zero pixel delta. Combined mode differs as intended. DOM and
native-texture orientation adapters match. A separate 3D marker retains identical
pixels across every filter. These are fixture tests, not camera captures or
browser interaction. Offline timing at 1280x720 is recorded in the verification
report and must not be interpreted as Android or browser throughput.

The earlier Computer Use restriction is respected. No browser or physical-phone
test, microphone/camera access, public push or Library upload was attempted.
