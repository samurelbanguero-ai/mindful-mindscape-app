const { BAD_WORDS_REGEX } = require('../shared/regex');
const claudeClient = require('../integrations/claude/claude.client');
const logger = require('../utils/logger');

// Frases y patrones comunes que indican acoso, toxicidad o desprecio en un entorno de salud mental
const TOXIC_PHRASES = [
  /\bte lo mereces\b/i,
  /\bque tont[oa]\b/i,
  /\bno sirves\b/i,
  /\binutil\b/i,
  /\binútil\b/i,
  /\bmuerete\b/i,
  /\bmuérete\b/i,
  /\bsuicidate\b/i,
  /\bsuicídate\b/i,
  /\bcallate\b/i,
  /\bcállate\b/i,
  /\bllor[oó]n\b/i,
  /\bexagerad[oa]\b/i,
  /\bno vales nada\b/i,
  /\bno vales\b/i,
  /\bes tu culpa\b/i,
  /\bpor tu culpa\b/i,
  /\bridicul[oa]\b/i,
  /\bno sirves para nada\b/i,
  /\bbuscate una vida\b/i,
  /\bbúscate una vida\b/i,
  /\bestupid[oa]\b/i,
  /\bestúpid[oa]\b/i,
  /\ba qui[eé]n le importa\b/i,
  /\bno me importa\b/i,
  /\bno le importa a nadie\b/i,
  /\ba nadie le importa\b/i,
  /\bque ridiculo\b/i,
  /\bqué ridículo\b/i,
  /\bjodete\b/i,
  /\bjódete\b/i
];

// Emociones y estados negativos para el filtro contextual
const NEGATIVE_MOODS = new Set([
  'ansiedad', 'preocupacion', 'miedo', 'tristeza', 'cansancio', 'frustracion', 'enojo', 'soledad',
  'inquieto', 'cansado', 'triste', 'molesto', 'solo'
]);

// Respuestas cortas insensibles comunes
const SHORT_INSENSITIVE_PATTERNS = [
  /^y\??$/i,
  /^ok\??$/i,
  /^aja$/i,
  /^ajá$/i,
  /^bah$/i,
  /^x$/i,
  /^equis$/i,
  /^jaja+$/i,
  /^lol$/i,
  /^xd$/i,
  /^bueno\.\.\.*$/i,
  /^as[ií] es la vida$/i,
  /^drama$/i,
  /^que exagerad[oa]$/i,
  /^qué exagerad[oa]$/i,
  /^payas[oa]$/i,
  /^ridicul[oa]$/i,
  /^¿?y qué\??$/i,
  /^y que$/i
];

class ModeratorService {
  /**
   * Verifica si un texto es tóxico o inapropiado, opcionalmente usando el contexto del post original.
   * @param {string} text - El texto a evaluar.
   * @param {object} [parentPost] - Publicación original (para moderación por contexto).
   * @returns {Promise<boolean>} - True si es inapropiado/tóxico, False si es seguro.
   */
  async isToxic(text, parentPost = null) {
    if (!text || typeof text !== 'string') return false;
    const cleanText = text.trim();

    // 1. Filtro local rápido (Regex de insultos explícitos)
    if (BAD_WORDS_REGEX.test(cleanText)) {
      logger.info(`Moderación: Texto bloqueado localmente por coincidencia en BAD_WORDS_REGEX.`);
      return true;
    }

    // 2. Filtro local rápido (Lista de frases dañinas/tóxicas comunes)
    for (const pattern of TOXIC_PHRASES) {
      if (pattern.test(cleanText)) {
        logger.info(`Moderación: Texto bloqueado localmente por frase tóxica identificada: ${pattern}.`);
        return true;
      }
    }

    // 3. Filtro local para respuestas cortas e insensibles basadas en la vulnerabilidad del post original
    if (parentPost && cleanText.length <= 18) {
      const postMood = String(parentPost.mood || '').toLowerCase();
      const isNegativePost = NEGATIVE_MOODS.has(postMood) || 
                             /morir|mal|triste|cansad|ansied|sola|solo|frustra|odio/i.test(String(parentPost.title || '') + ' ' + String(parentPost.body || parentPost.content || ''));

      if (isNegativePost) {
        for (const pattern of SHORT_INSENSITIVE_PATTERNS) {
          if (pattern.test(cleanText)) {
            logger.info(`Moderación: Respuesta corta bloqueada localmente por insensibilidad ante publicación vulnerable.`);
            return true;
          }
        }
      }
    }

    // 4. Moderación inteligente con Claude AI (si está configurado y online)
    if (claudeClient.isConfigured() && !claudeClient.isOfflineMode()) {
      // Evitar falsos positivos y llamadas a la API en respuestas cortas y neutras en posts positivos
      if (parentPost && cleanText.length <= 18) {
        const postMood = String(parentPost.mood || '').toLowerCase();
        const isNegativePost = NEGATIVE_MOODS.has(postMood) || 
                               /morir|mal|triste|cansad|ansied|sola|solo|frustra|odio/i.test(String(parentPost.title || '') + ' ' + String(parentPost.body || parentPost.content || ''));

        if (!isNegativePost) {
          return false; // Permitir respuestas breves neutras en posts alegres/calmados
        }
      }

      try {
        let contextPrompt = '';
        if (parentPost) {
          contextPrompt = `
Contexto de la publicación original a la que se está respondiendo:
- Título: "${parentPost.title || ''}"
- Contenido: "${parentPost.body || parentPost.content || ''}"
- Emoción asociada: "${parentPost.mood || ''}"
`;
        }

        const systemPrompt = `Eres un moderador experto de Emowave, una comunidad segura de salud mental, apoyo y bienestar.
Tu única tarea es analizar si el comentario en español redactado por un usuario es tóxico, grosero, de desprecio, hiriente, insensible, pasivo-agresivo o descalificador hacia otra persona que comparte su vulnerabilidad.

${contextPrompt}

Criterios importantes para respuestas cortas o pasivo-agresivas:
- Si la publicación original expresa vulnerabilidad, tristeza, cansancio o dolor, y la respuesta es muy corta y despectiva, burlona, sarcástica, desinteresada o insensible (ej. "jaja", "lol", "xd", "y?", "ok", "bah", "así es la vida", "equis", "exagerado"), DEBES clasificarla como "TOXIC".
- Si la respuesta es de apoyo o empática, clasifícala como "SAFE".

Responde ÚNICAMENTE con la palabra "TOXIC" si el comentario es tóxico, de desprecio o inapropiado, o con la palabra "SAFE" si el comentario es seguro y respetuoso. No incluyas explicaciones ni otros caracteres.`;

        const response = await claudeClient.chat(cleanText, [], systemPrompt);
        const classification = response.trim().toUpperCase();

        if (classification.includes('TOXIC')) {
          logger.info(`Moderación: Texto bloqueado por Claude AI.`);
          return true;
        }
      } catch (err) {
        logger.error(`Error durante la moderación por IA, cayendo a resultado local.`, { error: err.message });
      }
    }

    return false;
  }
}

module.exports = new ModeratorService();
