# Shed Magic

Separate building AR experiment using the existing MAYHEM WebXR renderer.

- Door height: user supplied 6 ft, exactly 1.8288 m.
- Front textures: projected original supplied photograph. Foreground foliage and the chair visible in that photograph remain baked into some areas; they are not recovered building surfaces.
- Estimates: door width 0.8 m, shed depth 2.1 m, roof surfaces and unseen sides. The neighbouring second shed is not reconstructed.
- Tank: separate Meshy photo-reference model, reduced to about 50,000 triangles and 2K textures. Its height and relative placement are estimated. Hidden by default to allow alignment to the real shed first.
- Separate door hinge, roof lift and wall panels; procedural opaque portal, energy, sequence, pause and restore.
- Manual alignment each AR session. Place the model at the door threshold, adjust with both joysticks, and Lock alignment. Optional WebXR anchors are used when available; local reference-space placement is the fallback. Neither provides automatic building recognition or persistent localization across visits.
- A dark opaque backing covers the physical facade during the reveal. This is a designed magical scene, not reconstruction of the hidden real interior. Effects are intended for a limited frontal viewing area.
- Lost tracking hides the overlay and pauses effects. Tracking-origin reset clears placement. Release, blur and session visibility changes stop joystick movement.
- Browser verification uses real WebGL, touch input and emulated XR poses. Physical Android tracking, facade fit, occlusion, colour match and performance still require a site test.

Meshy Workspace contains a separate viewing copy with a single baked photo atlas. The deployed model retains its individual parts. Generation produced the tank, but failed to reconstruct the shed; the shed therefore uses measured geometry and photo projection.
