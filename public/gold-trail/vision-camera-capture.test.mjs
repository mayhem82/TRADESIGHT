import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupVision } from './vision.mjs';
import { readPhotoLocation } from './photo-metadata.mjs';

test('captured photo is saved locally with the shutter GPS and keeps capture provenance', async () => {
  const previous = Object.fromEntries(['document', 'Worker', 'ImageData', 'indexedDB', 'createImageBitmap'].map(k => [k, globalThis[k]]));
  let failFrameDrawing = false;
  class Element {
    constructor() {
      this.value = ''; this.checked = true; this.hidden = false; this.disabled = false;
      this.textContent = ''; this.style = {}; this.width = 1; this.height = 1;
      const names = new Set();
      this.classList = { add: n => names.add(n), remove: n => names.delete(n), contains: n => names.has(n) };
    }
    setAttribute() {}
    replaceChildren(...children) { this.children = children; }
    append(...children) { (this.children ||= []).push(...children); }
    focus() {}
    getContext() { return { drawImage() { if (failFrameDrawing) throw new Error('Canvas unavailable'); }, putImageData() {}, getImageData: () => ({ data: new Uint8ClampedArray(this.width * this.height * 4) }) }; }
  }
  const elements = new Map(), get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const photos = new Map();
  const database = {
    createObjectStore() {},
    transaction() {
      const tx = {};
      function request(result) {
        const req = {};
        queueMicrotask(() => { req.result = result; req.onsuccess?.(); tx.oncomplete?.(); });
        return req;
      }
      tx.objectStore = () => ({ put: value => { photos.set(value.id, value); return request(value.id); },
        getAll: () => request([...photos.values()]), get: id => request(photos.get(id)) });
      return tx;
    }
  };
  globalThis.document = { hidden: false, getElementById: get, createElement: () => new Element(), addEventListener() {} };
  globalThis.indexedDB = { open() { const req = {}; queueMicrotask(() => { req.result = database; req.onupgradeneeded?.(); req.onsuccess?.(); }); return req; } };
  globalThis.createImageBitmap = async () => ({ width: 1920, height: 1080, close() {} });
  globalThis.ImageData = class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } };
  globalThis.Worker = class {
    postMessage(data) { const { width, height } = data.frame; queueMicrotask(() => this.onmessage({ data: { id: data.id,
      result: { width, height, cues: [], mask: new Uint8ClampedArray(width * height * 4) } } })); }
    terminate() {}
  };
  get('isolateColour').value = 'off'; get('outlineEnabled').checked = false;
  const view = new Element();
  const vision = setupVision({ video: { videoWidth: 32, videoHeight: 32 }, view,
    releaseCamera() {}, openCamera() {}, captureContext: () => ({}), selectCue() {}, toast() {},
    pickPhotoLocation() {}, cancelPhotoPin() {}, assignPhotoGps() {}, onPhotosChanged() {}, showPhotoOnMap() {} });
  const location = { lat: -30.818226, lng: 152.508343, accuracy: 8, source: 'camera-gps', datum: 'WGS-84', fixAt: '2026-11-16T00:00:00.000Z' };
  const jpg = new Uint8Array([255, 216, 255, 218, 0, 2, 17, 34, 255, 217]);
  try {
    vision.setCameraActive(true);
    vision.setCapturePending(true);
    assert.equal(get('scanStart').disabled, true);
    assert.equal(get('analyseScene').disabled, true);
    vision.setCapturePending(false);
    assert.equal(get('scanStart').disabled, false);
    const file = new File([jpg], 'generated.jpg', { type: 'image/jpeg' });
    await vision.openCapturedPhoto(file, { location, capturedAt: '2026-11-16T00:00:01.000Z', method: 'video-frame', width: 1920, height: 1080 });
    assert.equal(photos.size, 1);
    const record = [...photos.values()][0];
    assert.equal(record.saved, true); assert.equal(record.captureMethod, 'video-frame');
    assert.deepEqual(new Uint8Array(await record.sourceBlob.arrayBuffer()), jpg);
    assert.equal(record.sourceName, 'generated.jpg');
    assert.match(record.sourceHash, /^[0-9a-f]{64}$/);
    assert.equal(record.capturedAt, '2026-11-16T00:00:01.000Z'); assert.deepEqual(record.location, location);
    const embedded = readPhotoLocation(new Uint8Array(await record.blob.arrayBuffer()));
    assert.ok(Math.abs(embedded.location.lat - location.lat) < 1e-8);
    assert.match(get('photoCaptureStatus').textContent, /saved on this device with its location/i);
    assert.match(get('photoLocationSummary').textContent, /location set.*saved/i);

    await vision.openCapturedPhoto(new File([jpg], 'unlocated.jpg', { type: 'image/jpeg' }),
      { location: null, capturedAt: '2026-11-16T00:00:30.000Z', method: 'camera-still' });
    assert.equal(photos.size, 2);
    const unlocated = [...photos.values()].find(photo => photo.name === 'unlocated.jpg');
    assert.equal(unlocated.location, null);
    assert.equal(readPhotoLocation(new Uint8Array(await unlocated.blob.arrayBuffer())).location, null);
    assert.match(get('photoLocationSummary').textContent, /no location.*saved/i);

    const originalTransaction = database.transaction;
    database.transaction = (name, mode) => {
      if (mode === 'readwrite') throw new Error('Storage unavailable');
      return originalTransaction(name, mode);
    };
    await vision.openCapturedPhoto(new File([jpg], 'no-location.jpg', { type: 'image/jpeg' }),
      { location: null, capturedAt: '2026-11-16T00:01:00.000Z', method: 'camera-still' });
    assert.equal(photos.size, 2);
    assert.match(get('photoCaptureStatus').textContent, /not saved/i);
    assert.equal(get('photoLocationPanel').open, true);
    assert.match(get('photoLocationSummary').textContent, /no location.*not saved/i);

    let bitmapClosed = false;
    const bitmap = { width: 1200, height: 800, close() { bitmapClosed = true; } };
    globalThis.createImageBitmap = async () => { throw new Error('A second decode should not occur'); };
    globalThis.Worker = class { constructor() { throw new Error('Worker unavailable'); } };
    await vision.openCapturedPhoto(new File([jpg], 'recoverable.jpg', { type: 'image/jpeg' }),
      { location: null, capturedAt: '2026-11-16T00:02:00.000Z', method: 'camera-still', bitmap });
    assert.equal(bitmapClosed, true);
    assert.equal(view.hidden, false);
    assert.equal(get('photoLocationPanel').hidden, false);
    assert.equal(get('photoOriginal').disabled, false);
    assert.match(get('photoCaptureStatus').textContent, /not saved/i);
    assert.match(get('scanStatus').textContent, /photo remains available/i);

    // A preview allocation/draw failure must not discard the user's capture,
    // even when device storage has failed as well.
    failFrameDrawing = true;
    let failedPreviewBitmapClosed = false;
    await vision.openCapturedPhoto(new File([jpg], 'preview-failed-unsaved.jpg', { type: 'image/jpeg' }), {
      location: null, method: 'camera-still',
      bitmap: { width: 1200, height: 800, close() { failedPreviewBitmapClosed = true; } }
    });
    assert.equal(failedPreviewBitmapClosed, true);
    assert.equal(view.hidden, false);
    assert.equal(get('photoLocationPanel').hidden, false);
    assert.equal(get('photoLocationPanel').open, true);
    assert.equal(get('photoOriginal').disabled, false);
    assert.match(get('photoCaptureStatus').textContent, /not saved/i);
    assert.match(get('scanStatus').textContent, /preview unavailable/i);
    assert.equal(photos.size, 2);

    database.transaction = originalTransaction;
    let savedPreviewBitmapClosed = false;
    await vision.openCapturedPhoto(new File([jpg], 'preview-failed-saved.jpg', { type: 'image/jpeg' }), {
      location: null, method: 'camera-still',
      bitmap: { width: 1200, height: 800, close() { savedPreviewBitmapClosed = true; } }
    });
    assert.equal(savedPreviewBitmapClosed, true);
    assert.equal(view.hidden, false);
    assert.equal(get('photoOriginal').disabled, false);
    assert.match(get('photoCaptureStatus').textContent, /saved/i);
    assert.match(get('scanStatus').textContent, /preview unavailable/i);
    assert.ok([...photos.values()].some(photo => photo.name === 'preview-failed-saved.jpg'));
  } finally {
    vision.reset();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
