# Recovered mechanical screens, local 011

This unpublished candidate includes local 009 screens and 010 native-frame
hardening. Public release 008 has not changed. No phone or browser interaction
test was performed: the earlier Computer Use restriction remains respected.

## Experience

At most two larger screens appear in face-free machine slots. They show distinct
pairs of Mercury Loom, Hydraulic Bloom, Suspended Foundry and Pressure Skin,
cycling every twelve song seconds. Screen placement, fade envelopes and all
machine/wall geometry remain as before. Screens share the machine's world
transform, never the viewer camera. Faces continue forming and fading.

The new **Use recovered clips** checkbox selects video or the three existing
procedural loops. **Show animation screens** still hides both modes. Loading,
decode, playback-policy or GPU-upload failures leave the scene responsive with
procedural animation. The status line reports loading/readiness or fallback.
Recovery from playback-policy failure can be retried by pressing Play again.

Two muted, inline HTML video elements are reused across the four sources; no
third or fourth simultaneous element is created. Sources are same-origin static
files. Videos load only when their assigned screens appear. Full song audio is
the only audible track. Song time determines loop position, with drift corrected
when larger than 180 ms during playback. Pause and Hold use tighter seeking;
Hold freezes clips along with the form while the original song continues.
Hidden screens and tracking loss pause playback. Resume or seeking catches up.

Each screen has a complete one-pixel placeholder, so video loading cannot block
machine startup. The unchanged native renderer receives a local extension for
active texture updates; there are no vendor edits. Texture uploads are capped
to changes in the 24 fps clip frame index and skip undecoded/seeking media.
Paused seeks can upload a new frame, unlike the inherited playing-only helper.

The whole-screen face fade introduced in 010 proved too broad in full-scene
review. 011 replaces it with at most twelve soft elliptical cutouts around the
projected positions of bright, viewer-facing portraits. The remainder of a
screen stays visible. This approximates relief silhouettes and does not provide
room mapping, real-object occlusion, or a measured 3D face reconstruction.

## Transfer and provenance

The four user-owned recovered MP4s were explicitly transferred through the
connected Google Drive plugin, independently of the failed Library transfer.
The exact URLs, IDs, source sizes and SHA-256 hashes are in
`CLIP-PROVENANCE.json`. Original Library IDs are retained as provenance only.

Successful method:

1. `google_drive_get_file_metadata` on each exact Drive ID verified `video/mp4`,
   filename and size.
2. `google_drive_fetch` with each exact Drive URL,
   `download_raw_file=true, include_base64=false` returned authenticated
   top-level `file_uri` objects.
3. PowerShell `Invoke-WebRequest -Uri <file_uri.download_url> -OutFile
   <task-5\drive-clips-011\exact-name.mp4>` downloaded those Drive responses.
   Restricted-network DNS failed initially; approved network execution succeeded.
   Bearer download URLs are temporary and intentionally not stored here.
4. Python `hashlib.sha256` verified every source against the pre-upload hashes;
   file sizes matched exactly. FFmpeg decoded every full stream successfully;
   `imageio_ffmpeg.count_frames_and_secs` measured 157 frames, 24 fps, 6.54 s.

Originals remain unchanged in `task-5/drive-clips-011/`. This did not retry or
patch the Library helper, use inline base64, send email or automate a browser.

## Playback copies and reproduction

The originals total 5,581,604 bytes. The four playback derivatives total
2,592,623 bytes: 512x384 H.264/yuv420p at 24 fps with fast-start metadata and no
audio. Source composition is letterboxed rather than cropped or stretched.
The shader then fits each 4:3 derivative inside its larger 16:9 screen.

A twelve-frame overlap blends the ending and beginning into a cyclic join.
Each derivative is 145 frames (6.041667 s), rather than the original 157 frames.
Original frames all participate, with the overlapping parts combined. The seam
pixel delta is below the largest ordinary adjacent-frame delta for every clip;
this is a measured improvement, not a promise of an imperceptible artistic join.
Hashes, sizes, frame counts and seam metrics are in `assets/clips/manifest.json`.

```powershell
# NumPy and an FFmpeg executable with libx264 are required.
python ar-source/wielded-derangement-001/build-clips.py `
  C:\Users\minko\Documents\Codex\2026-11-05\task-5\drive-clips-011 `
  --ffmpeg C:\path\to\ffmpeg.exe
$wdTests = Get-ChildItem tests/wielded-derangement-001/*.test.mjs |
  ForEach-Object FullName
& 'C:\Program Files\nodejs\node.exe' --test @wdTests
```

The build checks source hashes before processing and never overwrites sources.
The deployed WAV and Julian's PNG remain byte-identical. Renderer notices and
all earlier suite project assets remain untouched.

## Verification limits

62 local tests cover playback lifecycle with injected media objects, distinct
assignments, bounded looping, decoder reuse, synchronization, failed playback,
late promises, paused texture uploads and fallback. The actual native renderer's
texture-cache/update path is exercised with a GL-state fixture. Earlier full-song
ground clearance, independent controls, music waves, likeness and native camera
transform tests still pass.

The actual screen shader compiled and displayed decoded frames from all four
clips in standalone ModernGL on Intel UHD. A six-second offline movie and
representative full-scene renders were inspected. Video/procedural branches,
static backs and transparent face-cutout pixels were checked. This verifies
decoded playback copies and shader output, not HTML media policy or live camera
compositing. Physical-phone frame rate, browser video texture behaviour and the
reported screen-following behaviour still need on-device verification.

No public push, deployment, sharing change or Library upload occurred. Publishing
this new clip content requires the user's explicit publication approval.
