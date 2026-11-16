import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCameraHardware } from './camera-hardware.mjs';

function fakeTrack({ capabilities = {}, settings = {}, constraints = {}, apply } = {}) {
  const listeners = new Map();
  const calls = [];
  const track = {
    kind: 'video', readyState: 'live', calls,
    getCapabilities: () => capabilities,
    getSettings: () => ({ ...settings }),
    getConstraints: () => constraints,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); },
    end() { this.readyState = 'ended'; listeners.get('ended')?.(); },
    async applyConstraints(value) {
      calls.push(value);
      if (apply) return apply(value, settings);
      Object.assign(settings, value.advanced.at(-1));
    }
  };
  return track;
}

test('unsupported cameras leave features unavailable and do not stop the track', async () => {
  const track = fakeTrack(), controls = createCameraHardware();
  controls.attach(track);
  assert.equal(controls.getState().attached, true);
  assert.equal(controls.getState().torchAvailable, false);
  assert.equal(controls.getState().zoom, null);
  assert.deepEqual(await controls.setTorch(true), { ok: false, reason: 'unsupported' });
  assert.deepEqual(await controls.setZoom(2), { ok: false, reason: 'unsupported' });
  assert.equal(track.calls.length, 0);
  controls.detach();
  assert.equal(track.readyState, 'live');
});

test('controls preserve camera constraints and serialize torch and zoom changes', async () => {
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const track = fakeTrack({ capabilities: { torch: true, zoom: { min: 1, max: 4, step: .5 } },
    settings: { torch: false, zoom: 1 }, constraints: { width: { ideal: 1920 }, advanced: [{ focusMode: 'continuous', zoom: 1 }] },
    apply: async (value, settings) => { if (track.calls.length === 1) await first; Object.assign(settings, value.advanced.at(-1)); } });
  const controls = createCameraHardware(); controls.attach(track);
  const light = controls.setTorch(true);
  await Promise.resolve();
  assert.equal(controls.getState().busy, true);
  const zoom = controls.setZoom(2.2);
  release();
  assert.deepEqual(await light, { ok: true });
  assert.deepEqual(await zoom, { ok: true });
  assert.deepEqual(track.calls.at(-1).width, { ideal: 1920 });
  assert.deepEqual(track.calls.at(-1).advanced, [{ focusMode: 'continuous' }, { torch: true, zoom: 2 }]);
  assert.equal(controls.getState().torchOn, true);
  assert.equal(controls.getState().zoom.value, 2);
  assert.equal(controls.getState().busy, false);
});

test('a rejected setting leaves the stream usable and later requests still work', async () => {
  const track = fakeTrack({ capabilities: { torch: [true, false], zoom: { min: 1, max: 3, step: .1 } },
    settings: { torch: false, zoom: 1 }, apply: async (value, settings) => {
      if (track.calls.length === 1) throw new Error('unsupported by camera');
      Object.assign(settings, value.advanced.at(-1));
    } });
  const controls = createCameraHardware(); controls.attach(track);
  assert.deepEqual(await controls.setTorch(true), { ok: false, reason: 'failed' });
  assert.equal(controls.getState().torchOn, false);
  assert.match(controls.getState().error, /could not apply/i);
  assert.deepEqual(await controls.setZoom(20), { ok: true });
  assert.equal(controls.getState().zoom.value, 3);
  assert.equal(controls.getState().torchOn, false);
  assert.equal(controls.getState().error, null);
  assert.equal(track.readyState, 'live');
});

test('old operations do not update a replacement or ended track', async () => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const oldTrack = fakeTrack({ capabilities: { torch: true }, settings: { torch: false }, apply: () => pending });
  const nextTrack = fakeTrack({ capabilities: { zoom: { min: 1, max: 2, step: .1 } }, settings: { zoom: 1 } });
  const controls = createCameraHardware(); controls.attach(oldTrack);
  const oldChange = controls.setTorch(true); await Promise.resolve();
  controls.attach(nextTrack);
  assert.deepEqual(await controls.setZoom(1.5), { ok: true });
  release();
  assert.deepEqual(await oldChange, { ok: false, reason: 'stale' });
  assert.equal(controls.getState().torchAvailable, false);
  assert.equal(controls.getState().zoom.value, 1.5);
  nextTrack.end();
  assert.equal(controls.getState().attached, false);
});

test('unreported device settings stay unknown, not an invented successful state', async () => {
  const track = fakeTrack({ capabilities: { torch: true, zoom: { min: 1, max: 2 } },
    constraints: { advanced: [{ torch: true }] }, apply: async () => {} });
  const controls = createCameraHardware(); controls.attach(track);
  assert.equal(controls.getState().torchOn, null);
  assert.equal(controls.getState().zoom.value, null);
  assert.deepEqual(await controls.setZoom(1.5), { ok: true });
  assert.deepEqual(track.calls[0].advanced, [{ torch: true }, { zoom: 1.5 }]);
  assert.equal(controls.getState().torchOn, null);
  assert.equal(controls.getState().zoom.value, null);
});
