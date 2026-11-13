import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneResult, sceneCueAt } from './scene-core.mjs';
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


test('each represented class has a region even when larger regions fill the limit', () => {
  const f = frame(100, 100);
  for (let i = 0; i < 13; i++) paint(f, (i % 7) * 14, Math.floor(i / 7) * 16, 9, 9, 2);
  paint(f, 92, 70, 5, 5, 1);
  paint(f, 0, 95, 2, 2, 1);
  const r = buildSceneResult(f);
  assert.equal(r.cues.length, 12);
  assert.ok(r.cues.some(c => c.kind === 'scene-rock'));
  assert.equal(r.suppressed.overLimit, 2);
  assert.equal(r.suppressed.belowThreshold, 1);
  assert.equal(r.suppressed.belowThresholdPixels, 4);
});

test('scene hit testing follows the actual mask, including holes and image edges', () => {
  const f = frame(30, 30);
  paint(f, 2, 2, 24, 24, 1); paint(f, 8, 8, 12, 12, 2); paint(f, 12, 12, 4, 4, 0);
  const r = buildSceneResult(f);
  assert.equal(sceneCueAt(r, 3/30, 3/30).kind, 'scene-rock');
  assert.equal(sceneCueAt(r, 9/30, 9/30).kind, 'scene-vegetation');
  assert.equal(sceneCueAt(r, 13/30, 13/30), null);
  assert.equal(sceneCueAt(r, 0, 0), null);
  assert.equal(sceneCueAt(r, 1, .5), null);
  assert.equal(sceneCueAt(r, -.01, .5), null);
  assert.equal(sceneCueAt({ ...r, regionMap: null }, .1, .1), null);
});
