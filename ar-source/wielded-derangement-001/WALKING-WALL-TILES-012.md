# Local 012: wall tiles and music walk

Unpublished continuation of approved public release 011. No camera effect is
included in this checkpoint; that later request is being audited separately.

## Layout and playback

The two machine-mounted screens are removed from the running experience. The
central machine and every face relief retain their original geometry, placement,
animation, texture and controls. Twenty square panels are attached to the
circular outer wall, each subdivided by the fragment shader into four tiles.
All four recovered clip types can appear together within a single panel, so
seeing different types does not depend on seeing the entire ring. Assignment
rotates between panel sections. Media appears on both sides of the wall, with
the video image oriented for the viewing side.

There are up to 80 active tiles, averaging 62.33 over the complete song sampled
at 50 ms. Activation offsets travel around the ring: 320 ms per section and 230 ms per type. A 9.6-second cycle uses
7.6-second active windows, 450 ms fade-in and 650 ms fade-out. The song's final
1.1 seconds settle to hidden tiles. The existing measured wall-height waves and
moving rods, shafts and gears continue; tiles follow their section's height.

One muted video element and one texture are shared per clip type: four media
elements and textures in total, independent of tile count. Each type shares a
loop phase across the ring; the stagger applies to activation, not 80 independent
video clocks. The existing 512x384 loop-blended playback files and originals are
unchanged. Playback still follows song time, seeking, Pause and Hold form.

**Show wall tiles** and **Use recovered clips** are now in the Circular outer
machine controls. The latter selects videos or procedural patterns. A load,
decode, blocked-playback, buffering or texture-upload problem affects only its
clip type; other types continue. Four hardware video decoders may exceed some
Android devices' available resources. No hardware-decoder or physical-phone
claim is made; procedural mode remains a manual lower-load option.

## Music walk and controls

A deterministic prefix integral combines the actual source song's bass band and
smoothed beat envelope. The wall turns forward at a measured maximum of 2.3521
degrees per second and approximately 355.15 degrees across the full 269.32-second
song. Intro/outro easing slows its start and end. Seeking evaluates the same
angle directly, independent of frame rate. Pause and Hold freeze it naturally.

The turn is applied to the outer root around its own selected ground centre.
Manual wall position, diameter, height and yaw are retained. Neither the machine
anchor nor its controls are modified. Rotation follows the selected floor normal
on sloped ground. It moves the visual wall; it does not walk or drift the world
anchor across the floor.

**Music walk** stops at the current angle. Enabling it again rebases the musical
offset so that resuming does not jump. Manual turning remains available in both
states. This is rendered music choreography, not room mapping or physical-wall
tracking.

## Cost and verification

The 80 cells use only twenty quad draws and forty triangles, sharing one
120-byte vertex buffer. Four RGBA video textures account for 3,145,728 bytes of
pixel storage, excluding decoder surfaces and driver overhead. Native renderer
tests confirm exactly four texture allocations and updates per render frame,
rather than eighty. Uploads remain capped to changed 24 fps clip frame indices.
There are four video samplers per panel material. Expensive procedural shader
work is skipped when a clip is ready. Tiles render after opaque mechanisms and
before transparent portraits, preserving the central faces in front of them.

69 local tests pass, including all earlier ground, tracking, audio, likeness and
control tests. New checks cover full-song activation, four-type concurrency,
actual quad vertices at extreme sizes on sloped ground, monotonic bounded music
rotation, centre preservation, pause/resume continuity, shared texture resources,
and independent buffering fallback.

The actual wall-tile shader compiled in standalone ModernGL on Intel UHD. Pixel
checks verified all four videos together, each independent procedural fallback,
hidden-cell transparency and both viewing sides. Representative full-scene
renders and an eight-second excerpt with the real song were inspected. An offline
1000x700 scene render measured median GPU time 1.715 ms and 95th percentile
1.905 ms over 160 frames. This uses simplified metal materials and the actual
tile shader with four frame uploads. It is not browser throughput, HTML video
decode performance, Android performance or native AR camera validation.

Browser and physical-phone interaction were not performed. The prior Computer
Use restriction remains in force. The reported screen-following issue remains
unverified on-device; no camera-relative anchoring was added by this change.

## Files and checks

- `wall-tiles.mjs`: wall-local tile matrices, staggered gates and measured music
  rotation integral.
- `wall-tile-shaders.mjs`: four media types in one panel with independent fallbacks.
- `wall-tile-node.mjs`: shared native geometry and materials.
- `clip-playback.mjs`: existing playback lifecycle plus buffering fallback.
- `tests/wielded-derangement-001/wall-tiles.test.mjs`, and expanded clip renderer
  and playback tests.

Run all checks from the repository root:

```powershell
$wdTests = Get-ChildItem tests/wielded-derangement-001/*.test.mjs |
  ForEach-Object FullName
& 'C:\Program Files\nodejs\node.exe' --test @wdTests
```

No publishing, new Library transfer, alteration of accepted suite projects or
change to source audio/video/face assets occurred for this checkpoint.
