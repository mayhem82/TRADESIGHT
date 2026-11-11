import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneResult } from './scene-core.mjs';
const labels = ['background', 'rock', 'plant', 'grass', 'earth', 'sand', 'water', 'person'];
function frame(width = 20, height = 20) { return { width, height, targetWidth: width, targetHeight: height,
  predictions: new Uint8Array(width * height), labels, model: { name: 'test fixture', calibratedForGeology: false }, elapsedMs: 5 }; }
function paint(f, x, y, w, h, value) { for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) f.predictions[row * f.width + col] = value; }
test('rock region mask and coordinates correspond to the actual classified pixels', () => {
  const f = frame(); paint(f, 4, 6, 5, 4, 1); const r = buildSceneResult(f);
  assert.equal(r.cues.length, 1); assert.equal(r.cues[0].kind, 'scene-rock');
  assert.deepEqual(r.cues[0].box, { x: .2, y: .3, width: .25, height: .2 });
  assert.ok(r.mask[(6 * 20 + 4) * 4 + 3] > 0); assert.equal(r.mask[(6 * 20 + 3) * 4 + 3], 0);
  assert.equal(r.cues[0].confidence, null); assert.equal(r.geologicalIdentification, 'unconfirmed');
});
test('grass and plant are grouped as vegetation without asserting a plant species', () => {
  const f = frame(); paint(f, 0, 0, 4, 4, 2); paint(f, 4, 0, 4, 4, 3);
  const r = buildSceneResult(f); assert.equal(r.cues.length, 1); assert.equal(r.cues[0].kind, 'scene-vegetation');
  assert.equal(r.rawClassCounts.plant, 16); assert.equal(r.rawClassCounts.grass, 16);
});
test('unsupported classes remain unresolved rather than becoming geological features', () => {
  const f = frame(); f.predictions.fill(7); const r = buildSceneResult(f);
  assert.equal(r.cues.length, 0); assert.equal(r.rawClassCounts.person, 400); assert.ok(r.mask.every(n => n === 0));
  assert.equal(r.geologicalIdentification, 'unconfirmed');
});
test('nearest-neighbour mask resize preserves alignment at image edges', () => {
  const f = frame(10, 10); paint(f, 8, 0, 2, 10, 1); f.targetWidth = 20; f.targetHeight = 40;
  const r = buildSceneResult(f); assert.deepEqual(r.cues[0].box, { x: .8, y: 0, width: .2, height: 1 });
  assert.equal(r.mask[(39 * 20 + 15) * 4 + 3], 0); assert.ok(r.mask[(39 * 20 + 16) * 4 + 3] > 0);
});
test('ground, sand and water remain broad suggestions, not mineral identification', () => {
  const f = frame(); paint(f, 0, 0, 4, 4, 4); paint(f, 8, 0, 4, 4, 5); paint(f, 0, 8, 4, 4, 6);
  const r = buildSceneResult(f); assert.deepEqual(new Set(r.cues.map(c => c.kind)), new Set(['scene-ground', 'scene-sand', 'scene-water']));
  assert.ok(r.cues.every(c => c.status === 'unconfirmed model suggestion'));
});
test('invalid dimensions and class identifiers fail explicitly', () => {
  assert.throws(() => buildSceneResult({ ...frame(), targetWidth: 0 }), RangeError);
  assert.throws(() => buildSceneResult({ ...frame(), predictions: [] }), RangeError);
  const f = frame(); f.predictions[0] = 255; assert.throws(() => buildSceneResult(f), RangeError);
});
