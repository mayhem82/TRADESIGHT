import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPhotoLocation, embedPhotoLocation, locationLabel } from './photo-metadata.mjs';
const jpeg = new Uint8Array([255, 216, 255, 218, 0, 2, 0x11, 0x22, 255, 217]);
const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64'));
const point = { lat: -30.818226, lng: 152.508343, accuracy: null, source: 'map-pin' };
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} vs ${expected}`); }
function jpegWithExif(tiff) { const bytes = new Uint8Array(tiff.length + 20); const len = tiff.length + 8;
  bytes.set([255, 216, 255, 225, len >> 8, len & 255, 69, 120, 105, 102, 0, 0]); bytes.set(tiff, 12); bytes.set(jpeg.subarray(2), tiff.length + 12); return bytes; }
function exif(little) {
  const tiff = new Uint8Array(64), view = new DataView(tiff.buffer);
  tiff.set(little ? [73, 73] : [77, 77]); view.setUint16(2, 42, little); view.setUint32(4, 8, little);
  view.setUint16(8, 2, little);
  view.setUint16(10, 0x0112, little); view.setUint16(12, 3, little); view.setUint32(14, 1, little); view.setUint16(18, 6, little);
  view.setUint16(22, 0xc711, little); view.setUint16(24, 7, little); view.setUint32(26, 12, little); view.setUint32(30, 40, little);
  tiff.set(new TextEncoder().encode('keep-unknown'), 40); return tiff;
}
test('JPEG and PNG exports carry real EXIF GPS with hemispheres and manual provenance', () => {
  for (const file of [jpeg, png]) {
    const encoded = embedPhotoLocation(file, point), result = readPhotoLocation(encoded);
    near(result.location.lat, point.lat); near(result.location.lng, point.lng);
    assert.equal(result.location.accuracy, null); assert.equal(result.location.source, 'embedded-manual');
    assert.equal(result.location.processingMethod, 'MANUAL'); assert.equal(result.location.datum, 'WGS-84');
    assert.equal(result.location.datumAssumed, false);
  }
});
test('zero coordinates, both hemispheres and degree carry round trip correctly', () => {
  for (const [lat, lng] of [[0, 0], [51.512345, -0.112345], [-90, -180], [90, 180], [30.99999999999, 151.99999999999]]) {
    const actual = readPhotoLocation(embedPhotoLocation(jpeg, { lat, lng, accuracy: 6.25, source: 'embedded-exif' })).location;
    near(actual.lat, lat); near(actual.lng, lng); assert.equal(actual.accuracy, 6.25);
  }
});
test('rewriting GPS preserves unrelated EXIF bytes and orientation in both byte orders', () => {
  for (const little of [true, false]) {
    const original = exif(little), encoded = embedPhotoLocation(jpegWithExif(original), point);
    const tiff = encoded.subarray(12), view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
    assert.deepEqual(tiff.subarray(8, original.length), original.subarray(8));
    const root = view.getUint32(4, little), count = view.getUint16(root, little);
    const entries = Array.from({ length: count }, (_, i) => root + 2 + i * 12);
    const orientation = entries.find(offset => view.getUint16(offset, little) === 0x0112);
    assert.equal(view.getUint16(orientation + 8, little), 6);
    near(readPhotoLocation(encoded).location.lat, point.lat);
    assert.deepEqual(encoded.subarray(encoded.length - 8), jpeg.subarray(2));
  }
});
test('reassigned location replaces previous GPS instead of keeping its accuracy', () => {
  const first = embedPhotoLocation(jpeg, { lat: 50, lng: 20, accuracy: 3, source: 'embedded-exif' });
  const second = readPhotoLocation(embedPhotoLocation(first, point)).location;
  near(second.lat, point.lat); assert.equal(second.accuracy, null); assert.equal(second.source, 'embedded-manual');
});
test('missing and malformed GPS stay missing without an inferred location', () => {
  for (const file of [jpeg, png, new Uint8Array([255, 216, 255, 225, 255, 255])]) assert.equal(readPhotoLocation(file).location, null);
  const broken = exif(true), view = new DataView(broken.buffer); view.setUint32(4, 99999, true);
  assert.equal(readPhotoLocation(jpegWithExif(broken)).location, null);
});
test('invalid locations, unsupported formats and oversized EXIF fail explicitly', () => {
  for (const p of [{ lat: 91, lng: 1 }, { lat: NaN, lng: 0 }, { lat: 1, lng: Infinity }]) assert.throws(() => embedPhotoLocation(jpeg, p), /Valid coordinates/);
  assert.throws(() => embedPhotoLocation(new Uint8Array(), point), /JPEG and PNG/);
  const large = new Uint8Array(65400); large.set(exif(true));
  assert.throws(() => embedPhotoLocation(jpegWithExif(large), point), /too large/);
});
test('unknown map-pin accuracy is never shown as zero metres', () => {
  assert.match(locationLabel(point), /accuracy unknown/); assert.match(locationLabel(point), /user assigned/);
  assert.doesNotMatch(locationLabel(point), /±0 m/);
});
