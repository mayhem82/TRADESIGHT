import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { sourceDigest } from './source-integrity.mjs';
test('hashes original bytes without altering them', async () => {
  const bytes = new TextEncoder().encode('abc');
  assert.equal(await sourceDigest(bytes, webcrypto.subtle), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(new TextDecoder().decode(bytes), 'abc');
});
test('reports unavailable when hashing is unsupported', async () => {
  assert.equal(await sourceDigest(new Uint8Array(), null), null);
});
