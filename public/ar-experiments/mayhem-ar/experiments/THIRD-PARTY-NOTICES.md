# Third-party notices

Downloaded runtime assets are unmodified. Exact bytes, hashes and origin URLs are in `vendor-manifest.json`; upstream tag identities are in `upstream-refs.json`.

| Component | Pinned version | Licence and included notice |
| --- | --- | --- |
| OpenCV.js | 4.13.0, official docs bundle | Apache License 2.0: `licenses/OpenCV-Apache-2.0.txt` |
| AR.js, including Hiro marker and default calibration | 3.4.8 | MIT, copyright AR.js 2020: `licenses/ARjs-MIT.txt` |
| Three.js | r164 / 0.164.0 | MIT: `licenses/Three-MIT.txt` |
| ARToolkit5 JS included inside AR.js bundle | Prebuilt upstream dependency | LGPLv3 with the upstream additional permission: `licenses/ARToolkit-LGPL-3.0-with-permission.txt` |
| Zlib included inside OpenCV.js | 1.3.1, reported by the actual build | Zlib licence: `licenses/OpenCV-Zlib.txt` |
| Protobuf included inside OpenCV.js | 3.19.1, reported by the actual build | BSD licence: `licenses/OpenCV-Protobuf-BSD.txt` |
| Flatbuffers included inside OpenCV.js | 25.9.23, reported by the actual build | Apache 2.0: `licenses/OpenCV-Flatbuffers-Apache-2.0.txt` |

AR.js's MIT licence does not replace the licence of its bundled ARToolkit implementation. Its [pinned README](https://github.com/AR-js-org/AR.js/blob/3.4.8/README.md#licenses) explicitly identifies that implementation as LGPLv3 with additional permission. AR.js 3.4.8's package declares `@ar-js-org/artoolkit5-js: ^0.3.2`; an exact embedded dependency patch version is not asserted from that range. The exact shipped AR.js bundle is identified by its SHA-256 hash.

Upstream source for inspection and replacement: [OpenCV 4.13.0](https://github.com/opencv/opencv/tree/4.13.0), [AR.js 3.4.8](https://github.com/AR-js-org/AR.js/tree/3.4.8), [ARToolkit5 JS](https://github.com/AR-js-org/artoolkit5-js), [Three.js r164](https://github.com/mrdoob/three.js/tree/r164). The ARToolkit licence text was retrieved from upstream's master path; its exact downloaded bytes and hash are recorded, rather than claiming a dependency patch pin. All vendor scripts remain separate local files, allowing replacement without modifying application code. Preserve these notices and complete licence texts with any later distribution.
