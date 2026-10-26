const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeText } = require('../utils/sanitizer');

test('sanitizeText escapa caracteres HTML', () => {
  assert.equal(sanitizeText('<b>"hola"</b>'), '&lt;b&gt;&quot;hola&quot;&lt;&#x2F;b&gt;');
});

test('sanitizeText devuelve cadena vacía si no recibe texto', () => {
  assert.equal(sanitizeText(undefined), '');
  assert.equal(sanitizeText(42), '');
});
