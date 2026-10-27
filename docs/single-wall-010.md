# Separate two-joystick wall010

Public route: https://mayhem82.github.io/TRADESIGHT/ar-experiments/mayhem-ar/single-wall-010/index.html

Based on009;009 and three-wall models unchanged. First joystick retains camera-relative horizontal movement. Second: up raises, down lowers, right turns right, left turns left about the panel vertical center. Speeds0.35m/s and36degrees/s, diagonal normalized, frame delta capped50ms. Both sticks accept separate touch pointer IDs. Release/cancel/lost capture stops the affected stick; hide/blur/tracking or visibility loss/selection/reset/session end stop both. Stops do not restart on resume.

Only selected wall changes; clones keep independent transforms and share immutable photo textures under4wall/16MiB limits. Transform updates model/base/world consistently. Original camera pose/projection records never mutate; derived projective mapping attaches frozen snapshots through height/yaw. This is an image plane, not reconstructed unseen scenery. Clear photos and Add photo at a new pose for background alignment. Existing camera capability gates, placement, menu and lifecycle retained.

27logic,17mobile DOM/emulated XR/CDP touch and4GPU pixel checks passed. Includes simultaneous two-finger movement, independent finger release, selected-clone elevation/yaw, frozen image through rotation/elevation and original capture matrix retention. Physical phone testing pending. No recording/upload/backend. Build source ar-source/single-wall-010; portable build uses existing pinned rolldown1.2.13. Tests use installed Playwright/Chrome test environment as documented in009; no physical camera assertion.
