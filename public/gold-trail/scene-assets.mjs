// Pinned public assets; image pixels are never sent to these hosts.
export const SCENE_ASSETS = {
  "tf": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
    "type": "text/javascript",
    "bytes": 1469843,
    "sha256": "300dfae273d20b4046f46a06d735688f03675a807561e9bcb5f664eb2f3d2831"
  },
  "wasmRuntime": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/tf-backend-wasm.min.js",
    "type": "text/javascript",
    "bytes": 149861,
    "sha256": "691bbec0ef8b5a7f17f212e9c5d85832030f90d030b46e99acb4dea1fb16f009"
  },
  "deeplab": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow-models/deeplab@0.2.2/dist/deeplab.min.js",
    "type": "text/javascript",
    "bytes": 17228,
    "sha256": "f93739f7392d081787b928e19866e7066a85e4581ef6060d18fff7007619ccb5"
  },
  "wasm": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/tfjs-backend-wasm.wasm",
    "type": "application/wasm",
    "bytes": 311123,
    "sha256": "70a5d516060464e5269f01c74bac1772d6b8ab6cb612acf16b5cdaf61f78d892"
  },
  "simd": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/tfjs-backend-wasm-simd.wasm",
    "type": "application/wasm",
    "bytes": 424594,
    "sha256": "77ebb28a6d34f371dbbf2086b7f2de8994acd8ea5a3cf1fa24d2c26c840cac7b"
  },
  "graph": {
    "url": "https://tfhub.dev/tensorflow/tfjs-model/deeplab/ade20k/1/quantized/2/1/model.json?tfjs-format=file",
    "type": "application/json",
    "bytes": 144186,
    "sha256": "e671c8ef5cfe09e81dcd4289115c77881ef91701e510cc1cc8c44a2943f30e14"
  },
  "shard1": {
    "url": "https://tfhub.dev/tensorflow/tfjs-model/deeplab/ade20k/1/quantized/2/1/group1-shard1of2?tfjs-format=file",
    "type": "application/octet-stream",
    "bytes": 4194304,
    "sha256": "f1774b6950daeeac514b2af4d090a5db907b581f67bc692f28efaf7ffeb02f91"
  },
  "shard2": {
    "url": "https://tfhub.dev/tensorflow/tfjs-model/deeplab/ade20k/1/quantized/2/1/group1-shard2of2?tfjs-format=file",
    "type": "application/octet-stream",
    "bytes": 394886,
    "sha256": "5a440596fda4801c73b9c7b8cd3ec075e8dae46ccfc0d65fdc0af49c41329a3c"
  },
  "threaded": {
    "url": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/tfjs-backend-wasm-threaded-simd.wasm",
    "type": "application/wasm",
    "bytes": 435643,
    "sha256": "c052228d4bef185c27bbe59a9e029570c78bbb9f08b3cb46b597851650373de2"
  }
};
