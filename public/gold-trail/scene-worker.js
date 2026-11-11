// Dedicated classic worker: model and image pixels stay on this device.
let loading = null, model = null, sceneHelpers = null, busy = false;
const temporaryUrls = [], cacheName = 'goldtrail-scene-assets-v1';
async function verifiedAsset(asset) {
  const cache = await caches.open(cacheName);
  let response = await cache.match(asset.url), downloaded = false;
  if (!response) { response = await fetch(asset.url, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(60000) }); downloaded = true; }
  if (!response.ok) throw new Error('Model asset unavailable: HTTP ' + response.status);
  const bytes = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (digest !== asset.sha256) { await cache.delete(asset.url); throw new Error('Model asset changed; its integrity check failed'); }
  if (downloaded) await cache.put(asset.url, new Response(bytes, { headers: { 'Content-Type': asset.type || 'application/octet-stream' } }));
  return bytes;
}
function blobUrl(bytes, type) { const url = URL.createObjectURL(new Blob([bytes], { type })); temporaryUrls.push(url); return url; }
function combine(buffers) { const bytes = new Uint8Array(buffers.reduce((n, b) => n + b.byteLength, 0)); let at = 0; for (const buffer of buffers) { bytes.set(new Uint8Array(buffer), at); at += buffer.byteLength; } return bytes.buffer; }
async function loadModel(id) {
  if (model) return;
  if (loading) return loading;
  loading = (async () => {
    const module = await import('./scene-assets.mjs'); sceneHelpers = await import('./scene-core.mjs');
    let completed = 0;
    const entries = await Promise.all(Object.entries(module.SCENE_ASSETS).map(async ([name, asset]) => {
      const bytes = await verifiedAsset(asset); self.postMessage({ id, progress: `Preparing scene recogniser ${++completed}/${Object.keys(module.SCENE_ASSETS).length}…` }); return [name, bytes];
    }));
    const assets = Object.fromEntries(entries);
    importScripts(blobUrl(assets.tf, 'text/javascript'), blobUrl(assets.wasmRuntime, 'text/javascript'), blobUrl(assets.deeplab, 'text/javascript'));
    tf.wasm.setWasmPaths({ 'tfjs-backend-wasm.wasm': blobUrl(assets.wasm, 'application/wasm'),
      'tfjs-backend-wasm-simd.wasm': blobUrl(assets.simd, 'application/wasm'),
      'tfjs-backend-wasm-threaded-simd.wasm': blobUrl(assets.threaded, 'application/wasm') });
    tf.wasm.setThreadsCount(1); tf.env().set('WASM_HAS_MULTITHREAD_SUPPORT', false);
    await tf.setBackend('wasm'); await tf.ready();
    const document = JSON.parse(new TextDecoder().decode(assets.graph));
    const graph = await tf.loadGraphModel({ load: async () => ({ modelTopology: document.modelTopology,
      weightSpecs: document.weightsManifest.flatMap(group => group.weights), weightData: combine([assets.shard1, assets.shard2]) }) });
    model = new deeplab.SemanticSegmentation(graph, 'ade20k');
    for (const url of temporaryUrls.splice(0)) URL.revokeObjectURL(url);
  })();
  try { await loading; } catch (error) { loading = null; throw error; }
}
self.onmessage = async ({ data }) => {
  if (busy) { self.postMessage({ id: data.id, error: 'Scene recogniser is busy' }); return; }
  busy = true; let input, prediction;
  try {
    await loadModel(data.id); self.postMessage({ id: data.id, progress: 'Recognising visible scene regions on this device…' });
    const started = performance.now(), frame = data.frame;
    if (frame.width < 1 || frame.height < 1 || frame.width > 640 || frame.height > 640 || frame.data.length !== frame.width * frame.height * 4) throw new Error('Invalid image frame');
    input = tf.browser.fromPixels(new ImageData(frame.data, frame.width, frame.height)); prediction = model.predict(input);
    const [height, width] = prediction.shape, predictions = new Uint8Array(await prediction.data());
    const result = sceneHelpers.buildSceneResult({ predictions, width, height, labels: deeplab.getLabels('ade20k'),
      targetWidth: frame.width, targetHeight: frame.height, elapsedMs: Math.round(performance.now() - started),
      model: { name: 'DeepLab v3 MobileNet-v2 ADE20K', version: 'tfhub-ade20k-1-quantized-2', backend: 'wasm',
        source: 'https://www.kaggle.com/models/tensorflow/deeplab', calibratedForGeology: false } });
    self.postMessage({ id: data.id, result }, [result.mask.buffer]);
  } catch (error) { self.postMessage({ id: data.id, error: error.message }); }
  finally { input?.dispose(); prediction?.dispose(); busy = false; }
};
