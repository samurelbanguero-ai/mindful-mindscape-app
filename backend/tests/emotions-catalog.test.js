const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EMOTIONS, EMOTION_IDS, NEGATIVE_EMOTION_IDS, ANXIETY_WEIGHTS } = require('../shared/emotions');

test('el catálogo no repite ids y cada emoción tiene los campos básicos', () => {
  assert.equal(EMOTION_IDS.size, EMOTIONS.length);
  for (const e of EMOTIONS) {
    assert.ok(e.nombre && e.emoji && e.definicion, e.id);
    assert.ok(['positiva', 'neutra', 'negativa'].includes(e.categoria), e.id);
    assert.equal(e.ejemplos.length, 3, e.id);
  }
});

test('las emociones negativas del moderador existen en el catálogo', () => {
  assert.ok(NEGATIVE_EMOTION_IDS.size > 0);
  for (const id of NEGATIVE_EMOTION_IDS) assert.ok(EMOTION_IDS.has(id), id);
  // Antes el moderador usaba ids inexistentes como 'triste', 'solo' o 'cansado'
  for (const id of ['triste', 'solo', 'cansado', 'inquieto', 'molesto']) {
    assert.equal(NEGATIVE_EMOTION_IDS.has(id), false, id);
  }
});

test('los pesos de ansiedad apuntan a emociones existentes y están entre 0 y 1', () => {
  for (const [id, pesos] of Object.entries(ANXIETY_WEIGHTS)) {
    assert.ok(EMOTION_IDS.has(id), id);
    for (const v of Object.values(pesos)) assert.ok(v >= 0 && v <= 1, `${id}: ${v}`);
  }
});
