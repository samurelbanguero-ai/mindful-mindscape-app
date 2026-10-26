const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toPublicProfile, serializeUser } = require('../shared/helpers');

const user = {
  id: 7,
  email: 'estudiante@uniajc.edu.co',
  username: 'juanp',
  name: 'Juan Pérez',
  alias: 'Nube',
  bio: 'Me gusta caminar',
  avatar: 'https://ejemplo.com/a.png',
  role: 'usuario',
  profile_data: '{"interests":["Música"]}',
  password_hash: 'x',
  login_attempts: 2,
  locked_until: 0
};

const PRIVATE_FIELDS = ['email', 'name', 'role', 'profile_data', 'password_hash', 'login_attempts', 'locked_until', 'username', 'alias'];

for (const visibility of ['publico', 'alias', 'anonimo']) {
  test(`toPublicProfile (${visibility}) no expone datos personales`, () => {
    const profile = toPublicProfile({ ...user, visibility });
    for (const field of PRIVATE_FIELDS) {
      assert.equal(field in profile, false, `expone ${field}`);
    }
    assert.ok(!JSON.stringify(profile).includes('uniajc.edu.co'));
    assert.ok(!JSON.stringify(profile).includes('Juan Pérez'));
  });
}

test('toPublicProfile muestra el nombre según la visibilidad', () => {
  assert.equal(toPublicProfile({ ...user, visibility: 'publico' }).displayName, 'juanp');
  assert.equal(toPublicProfile({ ...user, visibility: 'alias' }).displayName, 'Nube');
  const anon = toPublicProfile({ ...user, visibility: 'anonimo' });
  assert.equal(anon.displayName, 'Anónimo/a');
  assert.equal(anon.bio, '');
  assert.equal(anon.avatar, '');
});

test('serializeUser no devuelve hash ni contadores de bloqueo', () => {
  const self = serializeUser(user);
  assert.equal('password_hash' in self, false);
  assert.equal('login_attempts' in self, false);
  assert.equal('locked_until' in self, false);
  assert.equal(self.email, user.email);
});
