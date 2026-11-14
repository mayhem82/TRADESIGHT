import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessGoldChecks } from './gold-field-check.mjs';

test('untested specimens are not identified or silently treated as negative', () => {
  const r = assessGoldChecks();
  assert.deepEqual(r.observations, []);
  assert.deepEqual(r.possibilities, []);
  assert.match(r.next.join(' '), /streak/i);
  assert.match(r.status, /unconfirmed/);
});
test('yellow streak and denting support a gold possibility, not a confirmation', () => {
  const r = assessGoldChecks({ streak: 'yellow', response: 'dents' });
  assert.match(r.possibilities.join(' '), /gold.*possibility/i);
  assert.match(r.possibilities.join(' '), /neither result proves gold/i);
  assert.equal(r.cautions.length, 0);
});
test('dark brittle and white flaky observations surface lookalikes', () => {
  assert.match(assessGoldChecks({ streak: 'dark', response: 'crumbles' }).possibilities.join(' '), /pyrite or chalcopyrite/i);
  assert.match(assessGoldChecks({ streak: 'white', response: 'flakes' }).possibilities.join(' '), /mica/i);
});
test('conflicting checks remain unresolved and invalid inputs fail', () => {
  const r = assessGoldChecks({ streak: 'yellow', response: 'crumbles' });
  assert.match(r.cautions.join(' '), /mixed|repeating/i);
  assert.ok(r.possibilities.length >= 2);
  assert.throws(() => assessGoldChecks({ streak: 'gold confirmed' }), RangeError);
});
