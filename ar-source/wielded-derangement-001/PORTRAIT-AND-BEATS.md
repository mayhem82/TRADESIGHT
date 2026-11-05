# Portrait and stronger audio response — local candidate 005

## Portrait

The user-directed `frontal-head.png` was retrieved through his explicitly
authorized self-email transfer, Gmail message `1a1aaba57bb86ac5`. Exact size:
2,759,665 bytes. SHA256:
`0b7b3712ce697e8aa034d2a5e0cfd297651edba88ff29df680c39961bebb5564`.
It is the edited photo-derived asset associated with Library ID
`libfile_82238e4d310481919f923e8a4ccce95c`; the email attachment is the local
source, not a successful Library materialization. No Library helper was patched.

All twelve existing face-root children now use the portrait on a shallow curved
relief. The original face positions, orientations, emergence and fading remain.
The original mechanical nodes, geometry buffer, materials, timeline and source
audio are preserved. The relief is not a measured reconstruction and does not
invent profile imagery from the four source photos. Near side-on it is visibly
shallow; this limitation is visible in the offline contact sheet.

One shared texture and geometry buffer serve twelve independent face materials.
Each face has 825 vertices and 1,536 triangles (18,432 triangles at all twelve
visible), replacing the old primitive face children. The new binary is 35,616
bytes. Old disconnected face child definitions remain in glTF for traceability
but are not part of the rendered scene graph.

A companion portrait material uses the established native renderer's vertex
path and an original fragment shader. RGB is decoded from sRGB for restrained
lighting and exposure, then encoded for display. Alpha remains linear and
multiplies each face's own opacity. Almost-transparent pixels are discarded and
face surfaces do not write depth, preventing invisible rectangle depth masks.
The surface retains normal depth testing against machinery. No vendor files or
accepted AR baseline files were modified. Shared texture filtering is linear,
clamped, and avoids mipmap requirements for the non-power-of-two photograph.

## Beat response

Features come from the entire original stereo PCM recording, verified by its
source SHA256. Analysis uses 35–190 Hz spectral energy/onset at 20 ms intervals,
fast attack and 110 ms release. It found 278 strong local transient peaks over
269.32 seconds; response median is 0.08505, maximum 1.0. This is low-frequency
transient analysis, not a certified musical beat-grid transcription or lyric
timing. `assets/beats.json` contains 13,466 samples, 91,944 bytes.

Compared with the previous quiet broad-energy pulse, the strongest analysed hit
adds 0.22 to the mechanical scale pulse and up to 10% radial expansion. Cells,
core and their connecting struts recoil together; existing morph geometry and
slow timeline remain. A warm emission addition, RGB (0.28, 0.095, 0.022) at the
maximum transient, briefly lights mechanical surfaces and returns to each
material's original emission. Portraits and outer walls do not receive this
extra light pulse. Outer-wall movement, footprint and size controls remain
independent. Hold form freezes this response with the held visual time; seeking
uses analysed audio time deterministically, independent of frame rate.

The grounded-frame clamp and grounded actor pivot remain in force at maximum
transient recoil. The base never receives vertical or radial audio translation.
Maximum response is unit-tested across the full song with the new portrait
geometry. Mobile frame rate and subjective beat timing still need phone testing.

## Completed checks and remaining validation

27 Node tests pass. They include the real audio feature coverage and decay,
reversible seeking, actual grounded portrait/wall vertices and maximum beat
response, independent entity controls/anchors, tracking loss/reset lifecycle,
PNG identity, mesh winding/UVs/normals, and independent portrait material fades.

Offline GPU views use the saved glTF vertices and the actual companion face
fragment shader. Front, three-quarter, near-profile and partial-fade views were
inspected, along with the central machine inside the separate outer enclosure.
These are offline geometry/shader checks, not browser/camera/phone checks.

Native AR still requires platform support for positional WebXR, local space,
hit testing and the DOM control overlay. Optional anchors are used when offered.
The screen-following field report remains subject to actual phone retesting;
the label in the user's screenshot is not proof that tracking was correct.
No room mapping or real-object occlusion is claimed. The camera-only overlay
is explicitly untracked. Earlier Computer Use restrictions were respected.

Publication remains paused. The previously denied public-main push has not been
retried. This local candidate is reviewable and packaged; publishing requires
the exact outstanding approval handled by the parent task.
