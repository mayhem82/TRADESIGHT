Dog AR uses the corrected Meshy lying dog, with a reduced 200,000-triangle phone copy and 2048-pixel textures. Default length is 150 mm.

Still hand is manual camera-ray placement: align distance and the right turn/height joystick, then Place here. The committed position stays fixed. Floor/table uses WebXR surface hits. Height is an independent offset, so ground following cannot pull still-hand placement down to the floor.

Exposure, transparency/size, routes, ground following and invisible-wall/doorway masks are adapted from the existing Bellbrook Yowie controls under ../stone-room/reference/. Dog preferences use separate storage keys. The original model geometry and texture file are unchanged in this update. The lying dog stays still: its walking joystick and route playback are disabled until an animated walking model is available. Placement, turning, height, route planning and appearance controls remain available.

Browser verification includes GPU pixels for exposure, opacity and occlusion; real touch input for joystick height; manual hand placement without a floor hit; mode switching; route planning with playback blocked for the static model; doorway visibility; and persistent actions in portrait/landscape. Actual hand alignment and tracking still require a phone check.

Walking-model integration: app.js has a single walkingReady capability, currently false. Keep it false until the walking asset and real gait playback are connected. PointRoute also guards play/input so route planning cannot accidentally slide the lying model. The walking build must drive the gait from distance travelled and stop it when input, AR visibility or tracking stops.
