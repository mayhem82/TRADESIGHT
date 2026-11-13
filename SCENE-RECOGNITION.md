# Experimental scene recognition

Gold Trail now has an **AI scene** action for an imported photo or camera frame. It uses a trained scene-segmentation model to suggest pixel regions for rock-like surfaces, vegetation, ground/soil-like surfaces, sand-like surfaces and water-like surfaces. The original contrast view remains available. Masks and numbered region boxes are drawn on the exact analysed frame, rather than on newer video frames. Camera repetition is available through Resume scan and runs only after the preceding inference completes; this is periodic frame analysis, not high-frame-rate video tracking or world-anchored AR.

The first use downloads approximately 7.54 MB of public runtime/model assets from jsDelivr and TensorFlow's TF Hub/Kaggle storage. Image pixels are processed in a dedicated worker on the device and are not sent to those providers. Exact asset URLs, byte sizes and SHA-256 hashes are pinned in `public/gold-trail/scene-assets.mjs`. Every downloaded or cached asset is checked before use. Verified assets are cached under `goldtrail-scene-assets-v1` and survive app-shell cache updates. Corrupt assets fail closed; the photo, location and contrast view remain usable.

The worker uses TensorFlow.js 4.22.0, its WebAssembly backend, and the official DeepLab v3 MobileNet-v2 ADE20K model with two-byte quantized weights. It runs single-threaded without requiring cross-origin isolation or an external inference service. Closing or cancelling terminates the worker. Tensors allocated for each inference are disposed; runtime process memory, physical Samsung performance, heat and battery use have not been measured.

## Meaning and limitations

These are general scene-model suggestions. The model is **not calibrated for geology**. It does not identify basalt, quartz or other minerals; classify rock origin or in-place bedrock; establish sediment grain size; measure water flow or depth; locate buried material; or establish gold content. To avoid crowding out a detected class, the overlay reserves a place for its largest qualifying region before filling its 12 slots by area. Regions smaller than 0.2% of the frame (or 12 pixels) and additional regions beyond the limit are omitted; omission counts appear in the model details. Taps select the actual coloured pixels rather than overlapping bounding boxes. Uncoloured areas include unsupported/other model classes and omitted or unresolved areas. They do not establish the absence of rock or an indicator. Pixel counts are image coverage, not confidence or prospectivity.

The user can mark a region as matching the visible feature or wrong/uncertain. This is recorded as a **user visual review**, with `geologicalConfirmation: false`. Model name/version, backend, image coordinates, review, photo reference, location provenance and any requested mapped context travel with the observation. User reviews are not automatically accepted as expert training labels. No training or fine-tuning occurs in this component.

The first public outcrop example under-recognised dry grass and assigned many landscape pixels to mountain or earth. The separate forest example recognised trees but assigned much of the foreground to earth and only a small portion to rock. These are material recognition limitations. The model remains experimental, with unknown field accuracy and no independently reviewed geological benchmark. A reviewed field dataset, site-separated tests, per-class error measurement and calibrated abstention are still required for stronger claims.

## Checks

Twenty-six unit tests cover the existing modules and the new scene mask geometry, grouping, unsupported labels, resizing, invalid class identifiers and unconfirmed-status contract. Ten additional browser checks exercise actual model inference on licensed public images, saved model/review provenance, offline inference, cancellation, contrast-view return, integrity failure, synthetic-camera cleanup and network requests restricted to public model/runtime GETs. Existing camera and photo-location regression checks also remain applicable. These functional checks are not geological-accuracy tests.

The public outcrop run took approximately 6.6 seconds of model time in the tested desktop browser; loading/download time is separate. This is an exploratory measurement, not a mobile frame-rate promise.

## Sources and notices

- Google/TensorFlow [DeepLab model and model card](https://www.kaggle.com/models/tensorflow/deeplab), Apache-2.0.
- Google/TensorFlow [DeepLab browser implementation](https://github.com/tensorflow/tfjs-models/tree/master/deeplab), copyright Google LLC, Apache-2.0.
- [TensorFlow.js](https://github.com/tensorflow/tfjs) and its [WebAssembly backend](https://github.com/tensorflow/tfjs/tree/master/tfjs-backend-wasm), copyright Google LLC, Apache-2.0. Cached distribution files retain their notices. [Apache licence text](https://www.apache.org/licenses/LICENSE-2.0).
- Internal functional fixture: [Rock outcrop with quartz vein, Jonathan Wilkins](https://commons.wikimedia.org/wiki/File:Rock_outcrop_with_quartz_vein_-_geograph.org.uk_-_8304304.jpg), CC BY-SA 2.0. The source caption is not an independently verified mineral label.
- Internal functional fixture: [SPHSP bedrock outcrop 01, Drdpw](https://commons.wikimedia.org/wiki/File:SPHSP_bedrock_outcrop_01.jpg), CC BY-SA 4.0.

The public fixture photographs are not bundled in the app. Personal conversation attachments are excluded from development fixtures and the published source/assets.
