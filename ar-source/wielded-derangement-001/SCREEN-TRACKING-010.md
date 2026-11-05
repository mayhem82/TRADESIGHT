# Local screen and native-frame hardening, 010

Unpublished continuation of procedural screen checkpoint 009. Public release
008 remains unchanged. Recovered MP4s are still not installed; the supported
Library helper failed before atomic installation because Windows Python lacks
`os.setxattr`. Do not substitute raw signed downloads or remove identity checks.

## Changes

`native-frame.mjs` clears the actual native XR framebuffer to transparent colour
and depth 1 on every frame, including valid tracking frames. It temporarily
enables colour/depth writes and disables scissoring, then restores those states.
Previously the app explicitly cleared only lost-tracking frames while
`scene.clear` was false. Relying on the browser's buffer discard behaviour is
unnecessary. This is a concrete rendering weakness, not a proven explanation of
the user's screen-following report. A missing layer skips drawing safely.

The native rendering path still consumes the platform's current view transform
and projection for each eye. Actors remain children of the scene, and screens
remain children of the original machine. No actor is parented to a viewer.

`screen-plan.mjs` now checks whether a screen lies on the line of sight between
the viewer and a bright face relief. In that case the screen fades near the
face's projected region. Only opacity depends on viewer position; screen
transforms, machine form, face transforms, wall placement and independent size
controls are untouched. This is virtual face protection, not physical-room
occlusion or room mapping. The current protection uses a conservative portrait
radius rather than per-pixel silhouette intersection.

`WorldTracking.state` now exposes accepted positional-pose sample count,
current displacement and maximum displacement from the session's first valid
viewer pose. These are passive diagnostics: they do not require movement to
place content, prove real-world tracking accuracy, or rebase an anchor. Lost,
invalid and stale-session poses do not count. New sessions and origin resets
clear the measurements. No pose telemetry is transmitted or stored remotely.

## Verification

Run all tests from the repository root in PowerShell:

```powershell
$wdTests = Get-ChildItem tests/wielded-derangement-001/*.test.mjs |
  ForEach-Object FullName
& 'C:\Program Files\nodejs\node.exe' --test @wdTests
```

The new native-camera unit test executes the unchanged vendor
`Scene.prototype.drawXRFrame` method with numeric pose fixtures, actual native
scene nodes and each eye's native inverse transform. It checks fixed world
matrices and changing camera coordinates under translation and rotation.
It uses a clock-only `window.performance` dependency stub; it creates no browser,
DOM, graphics context or tracking session. Separate GL-state tests check clearing
on valid/lost poses and frame cleanup after a drawing exception.

Other new tests cover passive-motion lifecycle, screens between faces/viewer,
off-axis and foreground faces, and full-song opacity-only changes. All earlier
grounded geometry, independent controls, likeness, wave and loop checks remain.
The 009 offline GPU previews remain evidence for the unchanged shader loops;
they do not validate the new native framebuffer code on a phone.

No browser automation, physical phone testing, publication or Library upload
was performed for this checkpoint. True AR still requires a platform granting
native positional WebXR tracking, local reference space, hit testing and the
controls overlay. Camera-only mode remains explicitly untracked.
