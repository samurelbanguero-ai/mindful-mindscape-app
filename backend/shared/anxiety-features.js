// Lógica pura (sin base de datos) que traduce el diario emocional a las
// variables de entrada del modelo de ansiedad.

const { ANXIETY_WEIGHTS } = require('./emotions');

const WINDOW_DAYS = 14;
const MIN_ENTRIES = 3;

// Peso de cada emoción sobre las 3 variables del modelo (stress, panic_attacks,
// depression), entre 0 y 1. Viven en el catálogo único (pesosAnsiedad); las
// emociones agradables o neutras no aportan carga y diluyen el promedio.
const MOOD_WEIGHTS = ANXIETY_WEIGHTS;

const FEATURES = ['stress', 'panic_attacks', 'depression'];

function shiftDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Convierte las entradas del diario dentro de [from, to] (fechas YYYY-MM-DD,
 * inclusivas) en las variables del modelo, en escala 0–100.
 * Devuelve null si no hay suficientes registros.
 */
function buildFeatures(entries, from, to) {
  const inWindow = entries.filter(e => e.date >= from && e.date <= to);
  if (inWindow.length < MIN_ENTRIES) return null;

  const totals = { stress: 0, panic_attacks: 0, depression: 0 };
  for (const entry of inWindow) {
    const weights = MOOD_WEIGHTS[entry.mood];
    if (!weights) continue;
    const intensity = Math.min(10, Math.max(1, Number(entry.intensity) || 5));
    for (const f of FEATURES) {
      totals[f] += weights[f] * intensity * 10;
    }
  }

  const features = {};
  for (const f of FEATURES) {
    features[f] = Math.round((totals[f] / inWindow.length) * 100) / 100;
  }
  return { features, entriesUsed: inWindow.length };
}

function trendBetween(current, previous) {
  if (!previous) return null;
  const delta = Math.round((current.ansiedad_predicha - previous.ansiedad_predicha) * 100) / 100;
  let direction = 'estable';
  if (delta >= 3) direction = 'sube';
  else if (delta <= -3) direction = 'baja';
  return { direction, delta, previousScore: previous.ansiedad_predicha };
}

module.exports = {
  WINDOW_DAYS,
  MIN_ENTRIES,
  MOOD_WEIGHTS,
  shiftDate,
  buildFeatures,
  trendBetween
};
