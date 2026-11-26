const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'x'.repeat(64);
const { generateAccessToken } = require('../utils/tokens');
const { apiRateLimit } = require('../middlewares/rate-limit.middleware');
const config = require('../config/security');

function hit(token, ip = '203.0.113.7') {
  let status = 200;
  const req = { ip, headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = { status(code) { status = code; return this; }, json() { return this; } };
  apiRateLimit(req, res, () => {});
  return status;
}

test('el límite general cuenta por usuario: compartir IP no bloquea a los demás', () => {
  const max = config.rateLimits.api.max;
  const ana = generateAccessToken(1001);
  const beto = generateAccessToken(1002);

  for (let i = 0; i < max; i++) hit(ana);
  assert.equal(hit(ana), 429);
  assert.equal(hit(beto), 200, 'otro usuario desde la misma IP sigue pudiendo usar la app');
});

test('sin sesión o con token inválido se cuenta por IP', () => {
  const max = config.rateLimits.api.max;
  for (let i = 0; i < max; i++) hit(null, '198.51.100.9');
  assert.equal(hit(null, '198.51.100.9'), 429);
  assert.equal(hit('token-falso', '198.51.100.9'), 429);
  assert.equal(hit(null, '198.51.100.10'), 200);
});
