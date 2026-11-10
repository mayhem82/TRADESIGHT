import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyseFrame, fitInside } from './vision-core.mjs';
function image(width = 160, height = 120, background = [95, 95, 95]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([...background, 255], i);
  return { data, width, height };
}
function paint(frame, x, y, w, h, color) {
  for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++)
    frame.data.set([...color, 255], (row * frame.width + col) * 4);
}
test('uniform light, dark and neutral frames abstain', () => {
  for (const level of [0, 30, 95, 180, 255]) assert.equal(analyseFrame(image(160, 120, [level, level, level])).cues.length, 0);
});
test('localises a pale strip and keeps pixel mask inside that strip', () => {
  const frame = image(); paint(frame, 65, 20, 4, 75, [225, 225, 225]);
  const result = analyseFrame(frame, ['pale']);
  assert.equal(result.cues.length, 1);
  assert.equal(result.cues[0].kind, 'pale');
  const box = result.cues[0].box;
  assert.equal(box.x, 65 / 160); assert.equal(box.width, 4 / 160);
  assert.equal(box.y, 20 / 120); assert.equal(box.height, 75 / 120);
  assert.ok(result.mask[(20 * 160 + 65) * 4 + 3] > 0);
  assert.equal(result.mask[(20 * 160 + 64) * 4 + 3], 0);
});
test('dark band stays an unconfirmed appearance cue, including on a manufactured image', () => {
  const frame = image(160, 120, [170, 170, 170]); paint(frame, 20, 60, 100, 3, [30, 30, 30]);
  const { cues } = analyseFrame(frame, ['dark']);
  assert.equal(cues.length, 1); assert.equal(cues[0].kind, 'dark');
  assert.equal(cues[0].status, 'unconfirmed visual cue');
  assert.equal(cues[0].confidence, undefined); assert.equal(cues[0].mineral, undefined);
});
test('filtering, saturated colour and transparent pixels do not invent pale cues', () => {
  const frame = image(); paint(frame, 65, 20, 4, 75, [225, 225, 225]);
  assert.equal(analyseFrame(frame, []).cues.length, 0);
  paint(frame, 65, 20, 4, 75, [0, 255, 0]);
  assert.equal(analyseFrame(frame, ['pale']).cues.length, 0);
  paint(frame, 65, 20, 4, 75, [255, 255, 255]);
  for (let i = 3; i < frame.data.length; i += 4) frame.data[i] = 0;
  assert.equal(analyseFrame(frame).cues.length, 0);
});
test('diagonal strips remain connected and border pixels do not wrap', () => {
  const frame = image();
  for (let p = 15; p < 95; p++) paint(frame, p, p, 2, 1, [240, 240, 240]);
  const { cues } = analyseFrame(frame, ['pale']); assert.equal(cues.length, 1);
  assert.ok(cues[0].box.x > 0 && cues[0].box.y > 0);
});
test('letterbox geometry remains correct after portrait and landscape resize', () => {
  assert.deepEqual(fitInside(1920, 1080, 400, 400), { x: 0, y: 87.5, width: 400, height: 225 });
  assert.deepEqual(fitInside(300, 600, 800, 400), { x: 300, y: 0, width: 200, height: 400 });
  assert.equal(fitInside(0, 600, 400, 400), null);
});
test('invalid or oversized frames fail explicitly', () => {
  assert.throws(() => analyseFrame({ width: 640, height: 640, data: [] }), RangeError);
  assert.throws(() => analyseFrame(image(641, 20)), RangeError);
});
