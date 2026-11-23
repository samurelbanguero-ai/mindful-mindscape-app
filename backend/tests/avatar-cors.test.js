const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.FRONTEND_URL = 'http://localhost:3031,http://localhost:5173';
const cors = require('../config/cors');
const { validateAvatar } = require('../shared/avatar');

function corsAllows(origin) {
  let allowed;
  cors.origin(origin, (_err, ok) => { allowed = ok; });
  return allowed;
}

test('CORS solo acepta los orígenes de FRONTEND_URL', () => {
  assert.equal(corsAllows('http://localhost:3031'), true);
  assert.equal(corsAllows('https://sitio-malicioso.example'), false);
  assert.equal(corsAllows(undefined), true);
});

test('el avatar acepta emoji, https y fotos pequeñas sin alterar la URL', () => {
  assert.equal(validateAvatar('🧘'), '🧘');
  assert.equal(validateAvatar('https://cdn.example.com/a/b.png'), 'https://cdn.example.com/a/b.png');
  const photo = 'data:image/jpeg;base64,' + 'A'.repeat(1000);
  assert.equal(validateAvatar(photo), photo);
});

test('el avatar rechaza URLs peligrosas o fotos demasiado grandes', () => {
  assert.throws(() => validateAvatar('javascript:alert(1)'));
  assert.throws(() => validateAvatar('http://inseguro.example/a.png'));
  assert.throws(() => validateAvatar('https://x.example/"onerror="alert(1)'));
  assert.throws(() => validateAvatar('data:image/svg+xml;base64,PHN2Zz4='));
  assert.throws(() => validateAvatar('data:image/jpeg;base64,' + 'A'.repeat(300000)));
});
