# AR Sound Vision: Autostereography 001

Separate phone-test entry. The existing single-wall-010 and all other projects remain preserved. Source modules are beside this page: app.js, wall-set.js, capture-wall.js, autostereogram.js, depth-contract.js, stereo-surface.js, stereo-controls.js, depth-estimator.js, midas-preprocess.js and midas-worker.js.

Place using the accepted surface hit, capture the current granted XR camera image, then estimate relative depth using Intel ISL MiDaS Small v2.1 with Microsoft ONNX Runtime Web 1.23.2. Processing runs locally in a WASM CPU worker (one thread); photos are not uploaded. The 66,764,249-byte model and matching runtime are hosted with this site. Model SHA256: 2d8c6cb8f415229daf1eb041024208e2608c9f98e17c81cc7c6ecb449c56fd58.

Model source: https://github.com/isl-org/MiDaS/releases/tag/v2_1 ; tag commit 94afff70fe0873c3af70355e5388e4d482bfc807. MiDaS MIT notice: models/MiDaS-LICENSE.txt. The archived Intel source is not represented as actively maintained. Preprocessing follows v2_1 tf/run_onnx.py and tf/utils.py: RGB/255, cubic resize to 256-square, float32 NCHW [1,3,256,256], no additional mean/std. Higher inverse depth becomes nearer; normalization is relative per image, not measured distance.

Runtime: https://onnxruntime.ai/docs/get-started/with-javascript/web.html ; npm onnxruntime-web@1.23.2. Its matching WASM modules, Microsoft MIT licence and ThirdPartyNotices are in vendor/ort/. Package integrity was checked against official npm SHA512 metadata before extraction; no install scripts ran. Existing Immersive Web/gl-matrix notices remain in vendor/. Source/licence review is recorded; this is not a legal-clearance claim. No branded image patterns were copied. The seeded generator and palette are algorithmic.

Both crossed-eye and parallel modes encode one repeating image; they use opposite disparity directions. Captured photo/depth/pattern stay frozen in wall coordinates through translation, height/yaw, explicit reposition and cloning. Photo comparison, Pattern and Capture baseline do not clear data. Existing controls/defaults remain; small baseline text increased once by four CSS pixels. Nearer/Farther stop on release and Nearer is bounded at 0.75 m horizontal center distance. Face me applies one horizontal yaw, not camera following or pitch/roll. User-supplied aligned grayscale PNG depth remains an alternative. Clear/resize/reset/exit intentionally release corresponding stored data; failures keep the original photo.

Depth sensing remains an independently gated optional diagnostic, not this estimator's source. No measured-depth, persistent-across-session anchoring, 3D scene reconstruction, phone-performance or guaranteed-fusion claim is made. Full-wall camera coverage is required.

Local validation: 30 pure checks plus baseline GPU/mobile control tests, stereo GPU/control tests, real MiDaS browser inference on two local landscape photograph crops, source/default inventory and font-size comparison (70 recorded checks in total). Actual S25 FE / Chrome tracking, permission grants, camera alignment, latency, memory/thermal behavior and human fusion remain pending. Desktop timings do not predict phone results.

Preserved local baseline: baseline-010.html and single-wall-010.bundle.js (its historical navigation can refer to the earlier project layout). Collection's original baseline remains ../single-wall-010/index.html.

Authoritative camera/depth API references: https://immersive-web.github.io/raw-camera-access/ and https://immersive-web.github.io/depth-sensing/ . Single-image disparity background: Thimbleby, Inglis & Witten (1994), https://researchcommons.waikato.ac.nz/bitstreams/d07fd4ff-d122-4c2b-84cc-b3e345499f9d/download ; no paper text, figures or code listing copied.
