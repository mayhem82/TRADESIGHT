import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupVision } from './vision.mjs';

test('field checks attach user observations and camera location without claiming an identification', async () => {
  const previous = { document: globalThis.document, Worker: globalThis.Worker, ImageData: globalThis.ImageData };
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
    getContext() {
      return { drawImage() {}, putImageData() {}, getImageData: () => ({ data: new Uint8ClampedArray(this.width * this.height * 4) }) };
    }
  }
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  globalThis.document = { hidden: false, getElementById: get, createElement: () => new Element(), addEventListener() {} };
  globalThis.ImageData = class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } };
  globalThis.Worker = class {
    postMessage(data) {
      const { width, height } = data.frame;
      queueMicrotask(() => this.onmessage({ data: { id: data.id, result: {
        width, height, cues: [], mask: new Uint8ClampedArray(width * height * 4)
      } } }));
    }
    terminate() {}
  };
  let saved;
  const location = { lat: -30.818226, lng: 152.508343, accuracy: 8, source: 'gps' };
  const view = new Element();
  const vision = setupVision({ video: { videoWidth: 32, videoHeight: 32 }, view,
    releaseCamera() {}, openCamera() {}, captureContext: () => ({ location, leadId: null }),
    selectCue: (record, text) => { saved = { record, text }; }, toast() {},
    pickPhotoLocation() {}, cancelPhotoPin() {}, assignPhotoGps() {}, onPhotosChanged() {}, showPhotoOnMap() {} });
  try {
    vision.setCameraActive(true);
    get('scanCamera').onclick();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(get('goldCheckSave').disabled, true);
    get('goldStreak').value = 'yellow'; get('goldResponse').value = 'dents';
    get('goldStreak').onchange();
    assert.equal(get('goldCheckSave').disabled, false);
    await get('goldCheckSave').onclick();
    assert.equal(saved.record.kind, 'field-property-check');
    assert.deepEqual(saved.record.location, location);
    assert.equal(saved.record.fieldChecks.inputs.streak, 'yellow');
    assert.equal(saved.record.geologicalIdentification, 'unconfirmed');
    assert.match(saved.text, /Neither result proves gold/);
  } finally {
    vision.reset();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
