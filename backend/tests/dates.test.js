const { test } = require('node:test');
const assert = require('node:assert/strict');
const { todayKey } = require('../shared/dates');

test('todayKey usa la hora de Colombia: a las 8 p. m. sigue siendo el mismo día', () => {
  // 2026-10-26 20:00 en Bogotá = 2026-10-27 01:00 UTC
  assert.equal(todayKey(new Date('2026-10-27T01:00:00Z')), '2026-10-26');
  assert.equal(todayKey(new Date('2026-10-27T05:00:00Z')), '2026-10-27');
});
