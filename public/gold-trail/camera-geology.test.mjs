import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canQueryContext, loadMappedContext } from './camera-geology.mjs';
const camera = { source: 'camera', capturedAt: '2026-11-11T00:00:00Z', location: { lat: -30.818226, lng: 152.508343, accuracy: 12 } };
const collection = properties => ({ type: 'FeatureCollection', features: properties ? [{ properties }] : [] });

test('camera GPS and photo locations with recorded provenance can request mapped context', async () => {
  assert.ok(canQueryContext(camera));
  for (const source of ['embedded-exif', 'embedded-manual', 'map-pin', 'assigned-current-gps'])
    assert.ok(canQueryContext({ source: 'photo', location: { ...camera.location, accuracy: null, source } }));
  for (const context of [null, { source: 'photo', location: camera.location }, { ...camera, location: null },
    { ...camera, location: { ...camera.location, accuracy: NaN } },
    { ...camera, location: { ...camera.location, lat: 40 } }]) {
    assert.ok(!canQueryContext(context));
    let called = false;
    await assert.rejects(loadMappedContext(context, () => { called = true; }));
    assert.equal(called, false);
  }
});
test('a map pin retains unknown accuracy and its user-assigned basis', async () => {
  const result = await loadMappedContext({ source: 'photo', location: { ...camera.location, accuracy: null, source: 'map-pin' } },
    async () => ({ ok: true, json: async () => collection({ unit_name: 'Test mapped unit' }) }));
  assert.equal(result.queryPosition.gpsAccuracyM, null);
  assert.match(result.locationBasis, /user-assigned/);
  assert.equal(result.geologicalIdentification, 'unconfirmed');
});
test('mapped unit keeps provenance and never becomes a visual identification', async () => {
  let requested;
  const result = await loadMappedContext(camera, async (url, options) => {
    requested = new URL(url); assert.equal(options.credentials, 'omit');
    return { ok: true, json: async () => collection({ unit_name: 'Test mapped unit', dominant_lithology: 'Sandstone', age_range: 'Permian' }) };
  });
  assert.equal(requested.searchParams.get('query_layers'), 'geology:rock_units_nsw');
  assert.equal(result.geologicalIdentification, 'unconfirmed');
  assert.equal(result.queryPosition.lat, -30.8182);
  assert.equal(result.queryPosition.gpsAccuracyM, 12);
  assert.equal(result.unit.lithology, 'Sandstone');
  assert.match(result.limit, /visible feature/);
  assert.equal(result.sourceMapAccuracy, 'not supplied by this query');
});
test('missing or failed map data cannot imply a geological conclusion', async () => {
  const empty = await loadMappedContext(camera, async () => ({ ok: true, json: async () => collection() }));
  assert.equal(empty.unit, null); assert.equal(empty.geologicalIdentification, 'unconfirmed');
  await assert.rejects(loadMappedContext(camera, async () => ({ ok: false, status: 503 })), /HTTP 503/);
  await assert.rejects(loadMappedContext(camera, async () => ({ ok: true, json: async () => ({}) })), /Unexpected/);
});
