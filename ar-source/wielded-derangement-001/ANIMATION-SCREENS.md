# Larger screens — local procedural framework 009

The central machine, its twelve portrait faces and fades, circular outer wall,
music-wave score, source recording and AR placement implementation are retained.
At most two larger 16:9 screen panels appear in the machine's face slots while
those particular faces are hidden (face opacity below 0.01). Screens fade before
the face returns; the original face animation is never overridden. Screens are
more than twice the maximum face width, at 1.5 model units wide, and move/scale
with the central machine's independent placement controls.

The viewer can switch **Show animation screens** off in Central machine controls.
Panels remain in the scene rather than replacing the camera view with a DOM
overlay. Their angular separation exceeds 1.4 radians and their maximum opacity
is 0.92. They can still occlude objects from some viewpoints, as physical-size
panels do; the implementation does not promise occlusion-free views from every
position. Screen bottoms remain above the selected ground across the full song
and existing position, uniform-size, height and rotation controls. The native
parent visibility guard hides screens with the machine when tracking is lost.

## Current procedural loops

Three original eight-second analytic shader loops are available:

1. **Clockwork** — rotating gear diagrams and a piston.
2. **Signal weave** — travelling cyan/gold signal lines.
3. **Loading circuit** — documents travelling beneath a repeating stamp.

These are real procedural animations, not generated film, real-world footage or
the user's recovered MP4 clips. They have no additional audio, video decoder,
image texture or per-frame upload. Their phase follows visual song time,
including pause, seek and Hold form. Face-slot selection changes in twelve-second
windows with smooth fades, and the ending clears the panels.

Two screen quads share a 120-byte geometry buffer, adding four triangles and at
most two material draws. Each panel has independent phase, loop type, opacity and
exposure uniforms. Depth testing remains enabled and invisible rectangle depth
writing is disabled. The back of a screen is a static dark surface rather than
mirrored animation. Phone fill-rate/frame-time costs are not measured.

## Recovered clips: transfer blocked, not integrated

The four actual moving clips were resolved in Library as version 1:

| Original file | Library ID | Bytes |
|---|---|---:|
| Mercury_Loom.mp4 | libfile_ebea97a149348191af1ee42526e572b9 | 1,367,820 |
| Hydraulic_Bloom.mp4 | libfile_0255a49c9828819197253f84612d1423 | 1,608,730 |
| Suspended_Foundry.mp4 | libfile_951d67d47dcc8191a9f99b083f6c1dca | 1,395,986 |
| Pressure_Skin.mp4 | libfile_0f5f6c0840008191b85220ff23c27606 | 1,209,068 |

Preparation returned signed transfers, not local workspace paths. The current
official Library helper and companion were fetched afresh and invoked for
Mercury_Loom.mp4, targeting the private `task-5/clip-inputs-009/` folder. The
operation failed before atomic installation at `os.setxattr`, which this Windows
Python runtime does not provide. The target file does not exist. The operation
was not denied by approval review; it failed at runtime. The other three files
were not attempted through the same unsupported route. No helper was patched,
raw Library URL fetched manually, temporary file used or original overwritten.

Supported transfer or user-supplied local originals are required before clip
integration, frame/decode verification, seam inspection and phone performance
checks can occur. None of the four MP4s is bundled or claimed as integrated in
this checkpoint. The earlier single-frame PNG, despite its GIF name, has not
been substituted for a moving clip. Library originals remain untouched.

## Verification and status

47 local Node tests pass. New tests cover face-free placement without modifying
faces, screen count/spacing/size, periodic phase and smooth slot transitions,
full-song actual-vertex ground clearance, independent material state and shared
geometry, hide controls and inherited tracking-suspension visibility.

The actual screen vertex/fragment source compiled and rendered in standalone
ModernGL on Intel UHD. All three loops differ across phases, repeat at eight
seconds within tiny floating-point pixel differences, clear at zero opacity,
and do not animate on their backs. Offline scene views with the original faces
were inspected. A muted eight-second procedural-loop proof is available locally.
These checks are not browser interaction or physical-phone validation.

This framework is local and unpublished. Public release 008 remains unchanged.
The recovered-clip requirement is still blocked by transfer, so the complete
user-clip screen experience is not ready for publication.
