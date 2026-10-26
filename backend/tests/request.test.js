const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getClientInfo } = require('../utils/request');

test('getClientInfo devuelve la IP sin el prefijo IPv6 mapeado', () => {
  const info = getClientInfo({ ip: '::ffff:181.49.10.5', headers: { 'user-agent': 'Mozilla/5.0' } });
  assert.deepEqual(info, { ip: '181.49.10.5', userAgent: 'Mozilla/5.0' });
});

test('getClientInfo usa la IP del socket si no hay req.ip y tolera la falta de user-agent', () => {
  const info = getClientInfo({ socket: { remoteAddress: '10.0.0.8' }, headers: {} });
  assert.deepEqual(info, { ip: '10.0.0.8', userAgent: '' });
});

test('getClientInfo recorta user-agents muy largos', () => {
  const info = getClientInfo({ ip: '1.1.1.1', headers: { 'user-agent': 'x'.repeat(1000) } });
  assert.equal(info.userAgent.length, 300);
});
