Dog AR uses the corrected Meshy lying dog, with a reduced 200,000-triangle phone copy and 2048-pixel textures. Default length is 150 mm.

Still hand is manual camera-ray placement: align distance and the right turn/height joystick, then Place here. The committed position stays fixed. Floor/table uses WebXR surface hits. Height is an independent offset, so ground following cannot pull still-hand placement down to the floor.

Exposure, transparency/size, routes, ground following and invisible-wall/doorway masks are adapted from the existing Bellbrook Yowie controls under ../stone-room/reference/. Dog preferences use separate storage keys. The original model geometry and texture file are unchanged in this update. The lying dog retains its static pose when a route moves it.

Browser verification includes GPU pixels for exposure, opacity and occlusion; real touch input for joystick height; manual hand placement without a floor hit; mode switching; route traversal; doorway visibility; and persistent actions in portrait/landscape. Actual hand alignment and tracking still require a phone check.

Photo uses the Colour Vision PNG download / native-share flow, with a persistent photo preview and Save photo link. During immersive AR it requests optional camera-access and combines the granted frame-aligned camera texture with the dog in a separate framebuffer; it does not open a second camera stream. Without granted camera pixels, the AR photo button is unavailable and the page explains the limitation. Preview photos remain available outside AR. Physical camera alignment still needs a phone test.
