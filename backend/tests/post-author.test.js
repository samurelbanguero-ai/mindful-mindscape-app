const { test } = require('node:test');
const assert = require('node:assert/strict');
const postDTO = require('../dto/post.dto');

const row = (over) => ({
  id: 1, content: 'Ánimo', is_anonymous: 0, created_at: '2026-10-26 22:15:00',
  author_visibility: 'publico', author_alias: 'Nube', author_username: 'juanp', ...over
});

test('publicación anónima nunca muestra el autor', () => {
  assert.equal(postDTO.toReplyResponse(row({ is_anonymous: 1 })).author, 'Anónimo/a');
  assert.equal(postDTO.toResponse(row({ is_anonymous: 1 })).author, 'Anónimo/a');
});

test('el autor respeta la visibilidad de la persona', () => {
  assert.equal(postDTO.toReplyResponse(row({ author_visibility: 'publico' })).author, 'juanp');
  assert.equal(postDTO.toReplyResponse(row({ author_visibility: 'alias' })).author, 'Nube');
  assert.equal(postDTO.toReplyResponse(row({ author_visibility: 'anonimo' })).author, 'Anónimo/a');
});

test('con visibilidad alias y sin alias no se cae al nombre de usuario', () => {
  assert.equal(postDTO.toReplyResponse(row({ author_visibility: 'alias', author_alias: '' })).author, 'Anónimo/a');
});

test('la fecha de SQLite se interpreta como UTC', () => {
  assert.equal(postDTO.toReplyResponse(row()).createdAt, Date.UTC(2026, 9, 26, 22, 15));
});
