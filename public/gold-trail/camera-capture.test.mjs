import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureCameraPhoto, isCurrentCapture, cameraPhotoLocation } from './camera-capture.mjs';
import { embedPhotoLocation, readPhotoLocation } from './photo-metadata.mjs';

test('uses a still from the existing camera track when available', async () => {
  const track = { readyState: 'live' }, photo = new Blob(['still'], { type: 'image/jpeg' });
  class FakeImageCapture { constructor(t) { assert.equal(t, track); } async takePhoto() { return photo; } }
  const r = await captureCameraPhoto(track, {}, { ImageCaptureClass: FakeImageCapture,
    createBitmap: async () => ({ width: 1200, height: 800, close() {} }) });
  assert.equal(r.blob, photo); assert.equal(r.method, 'camera-still');
});
test('can hand the already decoded still to the photo workflow without a second decode', async () => {
  const track = { readyState: 'live' }, photo = new Blob(['still'], { type: 'image/jpeg' });
  let closed = false;
  const bitmap = { width: 1200, height: 800, close() { closed = true; } };
  class FakeImageCapture { async takePhoto() { return photo; } }
  const r = await captureCameraPhoto(track, {}, { ImageCaptureClass: FakeImageCapture,
    createBitmap: async () => bitmap, retainBitmap: true });
  assert.equal(r.bitmap, bitmap); assert.equal(closed, false);
  r.bitmap.close(); assert.equal(closed, true);
});
test('falls back to the full video frame when still capture fails', async () => {
  const track = { readyState: 'live' }, video = { videoWidth: 1920, videoHeight: 1080 }, drawn = [];
  class FailingCapture { async takePhoto() { throw Error('unsupported'); } }
  const canvas = { getContext: () => ({ drawImage: (...args) => drawn.push(args) }),
    toBlob: fn => fn(new Blob(['frame'], { type: 'image/jpeg' })) };
  const r = await captureCameraPhoto(track, video, { ImageCaptureClass: FailingCapture, createCanvas: () => canvas,
    createBitmap: async () => ({ width: 1920, height: 1080, close() {} }) });
  assert.equal(r.method, 'video-frame'); assert.equal(canvas.width, 1920); assert.equal(canvas.height, 1080);
  assert.equal(drawn[0][0], video);
  await assert.rejects(() => captureCameraPhoto({ readyState: 'ended' }, video), /not active/i);
});
test('oversized or undecodable native still falls back without closing the camera', async () => {
  const track = { readyState: 'live' }, native = new Blob(['native'], { type: 'image/jpeg' });
  const frame = new Blob(['frame'], { type: 'image/jpeg' });
  class NativeCapture { async takePhoto() { return native; } }
  const canvas = { getContext: () => ({ drawImage() {} }), toBlob: fn => fn(frame) };
  for (const tooLarge of [true, false]) {
    const createBitmap = async blob => {
      if (blob === native && !tooLarge) throw new Error('decode failed');
      return { width: blob === native ? 10000 : 1920, height: blob === native ? 6000 : 1080, close() {} };
    };
    const r = await captureCameraPhoto(track, { videoWidth: 1920, videoHeight: 1080 },
      { ImageCaptureClass: NativeCapture, createCanvas: () => canvas, createBitmap });
    assert.equal(r.blob, frame); assert.equal(r.method, 'video-frame');
    assert.equal(track.readyState, 'live');
  }
});
test('stale, hidden or stopped camera captures are rejected', () => {
  const stream = {}, track = { readyState: 'live' }, capture = { generation: 3, stream, track };
  assert.equal(isCurrentCapture(capture, { generation: 3, stream, hidden: false }), true);
  assert.equal(isCurrentCapture(capture, { generation: 4, stream, hidden: false }), false);
  assert.equal(isCurrentCapture(capture, { generation: 3, stream: {}, hidden: false }), false);
  assert.equal(isCurrentCapture(capture, { generation: 3, stream, hidden: true }), false);
  track.readyState = 'ended'; assert.equal(isCurrentCapture(capture, { generation: 3, stream, hidden: false }), false);
});
test('a still that finishes after the track ends is discarded', async () => {
  let finish;
  const track = { readyState: 'live' };
  class DeferredCapture { takePhoto() { return new Promise(resolve => { finish = resolve; }); } }
  const pending = captureCameraPhoto(track, { videoWidth: 1920, videoHeight: 1080 },
    { ImageCaptureClass: DeferredCapture, createBitmap: async () => ({ width: 1920, height: 1080, close() {} }) });
  track.readyState = 'ended';
  finish(new Blob(['still'], { type: 'image/jpeg' }));
  await assert.rejects(pending, /not active/i);
});
test('camera GPS is optional, has capture provenance, and can be written to photo metadata', () => {
  assert.equal(cameraPhotoLocation(null), null);
  const gps = cameraPhotoLocation({ lat: -30.818226, lng: 152.508343, accuracy: 8 });
  assert.equal(gps.source, 'camera-gps');
  const jpg = new Uint8Array([255, 216, 255, 218, 0, 2, 17, 34, 255, 217]);
  const read = readPhotoLocation(embedPhotoLocation(jpg, gps));
  assert.ok(Math.abs(read.location.lat - gps.lat) < 1e-8);
  assert.ok(Math.abs(read.location.lng - gps.lng) < 1e-8);
});
