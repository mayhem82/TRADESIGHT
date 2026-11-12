Standing dog AR uses the user's standing photo and the successful Meshy Quadruped Dog rig, named Dog - Walking - Black Coat in Meshy Workspace. The lying version remains separate.

The mobile model has 39,999 triangles, a 150 mm longest rest dimension, 2048-pixel JPEG textures, 27 joints and a one-second walking clip. A common bind transform is baked into vertices and inverse-bind matrices so the existing MAYHEM renderer can skin it with the native Yowie CPU-animation approach. No shared renderer or Yowie page is changed.

The left joystick walks; the right joystick turns and adjusts height. Walk phase follows actual horizontal travel, with stride scaled to model size. Release, Stop, lost tracking, session visibility changes and blur stop walking. Routes use the same gait. Still-hand placement stays independent of floor hits.

Head yaw and pitch operate independently of walking and body placement. Reset head restores the reference pose. The rig has no jaw bone and the mesh has a closed mouth, so mouth opening stays disabled until a jaw rig and mouth interior are modelled.

Build scripts and measured reports are in outputs/dog-ar-build/ and outputs/dog-walking-build/ outside the deployment. Browser checks use real GPU rendering and touch input with emulated XR poses; physical phone tracking remains a separate check.

Preview walking plays the real gait without AR. The shared speed adapter accepts an optional per-page base speed; existing page defaults remain the same. Fur uses the reference texture with a matte, nonmetallic material.
