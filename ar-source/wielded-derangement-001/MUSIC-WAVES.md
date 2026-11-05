# Music travelling through the circular wall — local candidate 008

Only the outer-wall choreography changes. The original central machine,
portrait likeness and fades, its existing beat response, full recording,
independent controls and AR placement/tracking implementation are preserved.

## Travelling motion and light

The existing 20 ms low-frequency onset analysis is sampled with a 70 ms delay
per wall section. Each impulse travels around the twenty-section ring in about
1.4 seconds instead of moving the entire wall in unison. The light follows the
transient directly; motion uses an 80 ms five-tap smoothing window (roughly
40 ms lag) and a trailing contraction, avoiding single-frame mechanical jumps.
Cranks gain a small matching phase response. All samples are derived from audio
time, so seeking and Hold form are reversible and deterministic.

Each wall section has independent material uniforms for a warm travelling light
wave. Geometry buffers remain shared and unchanged. There are still 14,960
outer-structure triangles and 140 material draws. The wall now has 60 material
instances rather than three shared ones; mobile frame time remains unmeasured.

## Five larger transformations

New analysis of the intact WAV measures low (35–190 Hz), middle (190–2000 Hz)
and high (2000–9000 Hz) spectral envelopes every 50 ms. Five isolated strong
before/after timbral contrasts, at least 28 seconds apart, supply cue centres:

| Source time | Choreography |
|---|---|
| 16.05 s | Compression and gathering |
| 67.95 s | Rising crown |
| 98.70 s | Opposing travelling forms |
| 137.10 s | Larger collective surge |
| 228.35 s | Rising/falling cascade |

These are analysis-selected editorial cues, not verified chorus, verse or lyric
timestamps. Their before/after PCM energy changes are independently checked in
tests. Cue attacks lead the measured centre by 1.1 seconds, hold near the centre,
then release smoothly over six seconds. Section offsets sweep the larger form
around the circle. Height stays between 0.55 and 1.70 of the user's chosen wall
height. The diameter, centre, floor pivot and independent control values do not
move with the music. Rod and shaft endpoints follow each section's height,
preserving the closed linkage circuit through all transformations. No ceiling
or obstacle detection is claimed.

The beginning and end settle to the user's base form. These transformations are
height changes, light waves and crank motion; no new topology, room mapping,
physical-object occlusion, volumetric display or generated film is implied.

## Sources and reproduction

`analyse-wall-score.py` creates `assets/wall-score.json` and
`wall-score-analysis.json` from the original WAV using NumPy. It verifies source
SHA256 `52364f8dd70f4a149974c2350693dd09f122d67d60d4cba64ff4ff36271ac214`.
`build-wave-materials.py` creates `assets/enclosure-wave.gltf`, retaining the
exact circle mesh accessors and binary while giving each section independent
materials. `wall-score.mjs` evaluates travelling pulses and cue envelopes;
`enclosure.mjs` applies them to the panel and linkage matrices; `app.js` passes
the held/current audio time and updates section emissions. Candidate 008 entry
and module queries avoid stale enclosure code from prior releases.

## Verification and limits

40 local Node tests pass, including all prior regression tests and seven new
tests for original-audio identity and PCM contrast, impulse propagation, real
audio crests, larger cue forms, smooth boundaries, deterministic seeking,
full-song bounded/grounded circular geometry, attached linkages and independent
materials without a geometry/draw increase. Source hashes confirm the central
machine, likeness, audio, prior beat features, controls and tracking files remain.

Offline GPU contact views and an eight-second procedural preview use the saved
scene geometry and evaluated runtime matrices. The preview includes source audio
from 66–74 seconds and is an inspection excerpt, not the full experience or a
phone capture. The browser application still includes the complete original
269.32-second WAV. Browser interaction, camera tracking, physical-phone frame
rate and subjective musical timing have not been tested for this candidate.
No earlier Computer Use restriction was bypassed.

This version is local and unpublished. The separate larger looping-screen idea
is queued as the next change; it is not included here. No publication attempt
was made for this upgrade.
