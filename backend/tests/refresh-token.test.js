const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateRefreshToken } = require('../utils/tokens');

test('dos refresh tokens generados en el mismo instante son distintos', () => {
  const tokens = new Set(Array.from({ length: 50 }, () => generateRefreshToken()));
  assert.equal(tokens.size, 50);
});
