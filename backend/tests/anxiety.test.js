const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildFeatures, MOOD_WEIGHTS } = require('../shared/anxiety-features');

const entry = (date, mood, intensity) => ({ date, mood, intensity });

test('buildFeatures devuelve null con menos de 3 registros en la ventana', () => {
  const entries = [
    entry('2026-10-01', 'ansiedad', 8),
    entry('2026-10-02', 'tristeza', 6),
    entry('2026-09-01', 'miedo', 9) // fuera de la ventana
  ];
  assert.equal(buildFeatures(entries, '2026-09-24', '2026-10-07'), null);
});

test('buildFeatures promedia peso × intensidad en escala 0–100', () => {
  const entries = [
    entry('2026-10-05', 'ansiedad', 10),
    entry('2026-10-06', 'ansiedad', 10),
    entry('2026-10-07', 'alegria', 10) // emoción agradable: no suma carga, pero cuenta en el promedio
  ];
  const result = buildFeatures(entries, '2026-09-24', '2026-10-07');
  assert.equal(result.entriesUsed, 3);
  const w = MOOD_WEIGHTS.ansiedad;
  assert.equal(result.features.panic_attacks, Math.round((w.panic_attacks * 100 * 2 / 3) * 100) / 100);
  assert.equal(result.features.stress, Math.round((w.stress * 100 * 2 / 3) * 100) / 100);
});

test('buildFeatures mantiene las variables dentro de 0–100', () => {
  const entries = ['2026-10-05', '2026-10-06', '2026-10-07'].map(d => entry(d, 'tristeza', 99));
  const { features } = buildFeatures(entries, '2026-09-24', '2026-10-07');
  for (const value of Object.values(features)) {
    assert.ok(value >= 0 && value <= 100, `fuera de rango: ${value}`);
  }
});
