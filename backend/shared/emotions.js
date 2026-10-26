// Catálogo único de emociones (shared/emotions.json en la raíz del repositorio;
// en Docker se monta en /shared). Lo comparte con el frontend.
const catalogo = require('../../shared/emotions.json');

const EMOTIONS = catalogo.emociones;
const EMOTION_IDS = new Set(EMOTIONS.map(e => e.id));

// Emociones de categoría negativa (moderación sensible al contexto, etc.)
const NEGATIVE_EMOTION_IDS = new Set(EMOTIONS.filter(e => e.categoria === 'negativa').map(e => e.id));

// Pesos de cada emoción sobre las variables del modelo de ansiedad
const ANXIETY_WEIGHTS = Object.fromEntries(
  EMOTIONS.filter(e => e.pesosAnsiedad).map(e => [e.id, e.pesosAnsiedad])
);

module.exports = {
  EMOTIONS,
  EMOTION_IDS,
  NEGATIVE_EMOTION_IDS,
  ANXIETY_WEIGHTS
};
