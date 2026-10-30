const test = require('node:test');
const assert = require('node:assert/strict');

const { buildLocalReply } = require('../integrations/claude/local-fallback');

const prompt = '\n\nUsuario:\n- nombre: MAYK\n';

test('no repite una respuesta que ya está en el historial', () => {
  const history = [];
  const replies = [];
  for (const msg of ['no sé', 'no sabría', 'ni idea']) {
    const reply = buildLocalReply(msg, history, prompt);
    replies.push(reply);
    history.push({ role: 'user', content: msg }, { role: 'assistant', content: reply });
  }
  assert.equal(new Set(replies).size, 3);
});

test('responde al tema de concentración', () => {
  const reply = buildLocalReply('no logro concentrarme', [], prompt);
  assert.match(reply, /concentr|cabeza|mente/i);
  assert.match(reply, /MAYK/);
});

test('"no estoy bien" no se toma como alegría', () => {
  const reply = buildLocalReply('no estoy bien', [], prompt);
  assert.doesNotMatch(reply, /Qué bueno|Me alegra/);
});

test('las señales de crisis dan líneas de ayuda', () => {
  const reply = buildLocalReply('a veces quiero morir', [], prompt);
  assert.match(reply, /192/);
});

test('ignora tildes al detectar el tema', () => {
  assert.equal(
    buildLocalReply('estoy con mucho estrés', [], prompt),
    buildLocalReply('estoy con mucho estres', [], prompt),
  );
});
