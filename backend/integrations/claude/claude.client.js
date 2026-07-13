const env = require('../../config/env');
const logger = require('../../utils/logger');

class ClaudeClient {
  constructor() {
    this.apiKey = env.ANTHROPIC_API_KEY;
  }

  isOfflineMode() {
    return env.AI_MODE === 'offline';
  }

  isConfigured() {
    return !!(this.apiKey && this.apiKey !== 'tu_clave_de_claude');
  }

  async chat(message, history = [], systemPrompt = '') {
    // Si el modo offline está explícitamente activado, usar el fallback local
    if (this.isOfflineMode()) {
      return this.getLocalFallbackReply(message, history, systemPrompt);
    }

    if (!this.isConfigured()) {
      return '⚠️ Nota de Emowave: No he podido conectar con el asistente real porque la clave de Anthropic (ANTHROPIC_API_KEY) no está configurada o sigue siendo la clave de ejemplo en tu archivo `.env`. Por favor, registra tu clave API real en el archivo `.env` del backend (o en el entorno del sistema) y reinicia el servidor.';
    }

    const historyMessages = this.formatHistory(history, 10);
    const modelsToTry = [
      'claude-haiku-4-5',
      'claude-sonnet-4-6'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        logger.info(`Intentando llamada a Anthropic con modelo: ${model}`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 600,
            system: systemPrompt,
            messages: [
              ...historyMessages,
              { role: 'user', content: message }
            ]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error?.message || `Error de Anthropic (${response.status}): ${JSON.stringify(data)}`);
        }

        logger.info(`Llamada exitosa con modelo: ${model}`);
        return data?.content?.[0]?.text || 'No pude generar una respuesta en este momento.';
      } catch (err) {
        lastError = err;
        logger.warn(`Fallo al invocar el modelo ${model}: ${err.message}. Intentando siguiente modelo...`);
      }
    }

    logger.error('Todos los modelos de Anthropic fallaron en chat.', { error: lastError?.message });
    throw new Error(`Error en la API de Anthropic: ${lastError?.message}. Verifica que tu clave API tenga saldo y acceso a los modelos en console.anthropic.com.`);
  }

  async helpbotChat(message, history = [], systemPrompt = '') {
    if (this.isOfflineMode()) {
      return 'El asistente de ayuda no está disponible en modo offline.';
    }

    if (!this.isConfigured()) {
      return 'El asistente de ayuda de Emowave requiere configurar la clave de Anthropic (ANTHROPIC_API_KEY) en tu archivo `.env`.';
    }

    const historyMessages = this.formatHistory(history, 8);
    const modelsToTry = [
      'claude-haiku-4-5',
      'claude-sonnet-4-6'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        logger.info(`Intentando llamada a Anthropic (helpbot) con modelo: ${model}`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 400,
            system: systemPrompt,
            messages: [
              ...historyMessages,
              { role: 'user', content: message }
            ]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error?.message || `Error de Anthropic (${response.status}): ${JSON.stringify(data)}`);
        }

        logger.info(`Llamada exitosa (helpbot) con modelo: ${model}`);
        return data?.content?.[0]?.text || 'No pude generar una respuesta.';
      } catch (err) {
        lastError = err;
        logger.warn(`Fallo al invocar el modelo (helpbot) ${model}: ${err.message}. Intentando siguiente modelo...`);
      }
    }

    logger.error('Todos los modelos de Anthropic fallaron en helpbotChat.', { error: lastError?.message });
    throw new Error(`Error en la API de Anthropic (helpbot): ${lastError?.message}`);
  }

  formatHistory(history, limit) {
    return (Array.isArray(history) ? history : [])
      .slice(-limit)
      .filter(m => m.role && m.content)
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content)
      }));
  }

  async getLocalFallbackReply(message, history = [], systemPrompt = '') {
    const t = message.trim().toLowerCase();
    
    // 1. Extraer nombre o alias del usuario
    let userName = 'amigo';
    if (systemPrompt) {
      const nameMatch = systemPrompt.match(/- nombre:\s*([^\n]+)/);
      if (nameMatch && nameMatch[1]) {
        userName = nameMatch[1].trim();
      }
    }

    // 2. Extraer emociones recientes registradas en el diario
    let recentMoods = [];
    if (systemPrompt) {
      const moodMatches = [...systemPrompt.matchAll(/Emoción:\s*([^\s|]+)/g)];
      recentMoods = moodMatches.map(m => m[1].toLowerCase());
    }

    // 3. Determinar si ya hubo saludo en la sesión para evitar redundancias
    const hasSpokenBefore = history && history.length > 1;

    let reply = '';

    // 4. Mapear respuestas dinámicas basadas en intención del mensaje
    if (/(hola|buenas|buen dia|buenos dias|buenas tardes|que tal|como estas|holaa)/.test(t)) {
      if (hasSpokenBefore) {
        reply = `Hola de nuevo, ${userName}. Sigo aquí acompañándote. Cuéntame, ¿qué más ronda por tu mente en este momento?`;
      } else if (recentMoods.length > 0) {
        const lastMood = recentMoods[0];
        reply = `¡Hola, ${userName}! Qué gusto saludarte en tu espacio privado. Veo en tu diario que hoy te has sentido con un estado de ${lastMood}. Me encantaría escucharte, ¿cómo te va con eso?`;
      } else {
        reply = `¡Hola, ${userName}! Es un placer saludarte en tu espacio privado de Emowave. Estoy aquí para escucharte sin juicios de ningún tipo. ¿Cómo te has sentido el día de hoy?`;
      }
    } else if (/(gracias|agradecido|gracia|excelente|perfecto|genial|buenísimo|buenisimo|super|graciass)/.test(t)) {
      const closures = [
        `Con todo el gusto, ${userName}. Saber que esto te ayuda es muy reconfortante. ¿Hay algo más de lo que te gustaría hablar?`,
        `De nada, ${userName}. Recuerda que siempre puedes volver a este diario cuando necesites un momento para conectar contigo mismo.`,
        `¡No hay de qué, ${userName}! Me alegra poder acompañarte en tu proceso. Tómate el tiempo que necesites para descansar hoy.`
      ];
      reply = closures[Math.floor(Math.random() * closures.length)];
    } else if (/(adios|adiós|chau|chao|hasta luego|bye|nos vemos)/.test(t)) {
      reply = `Hasta luego, ${userName}. Que tengas un resto de día muy tranquilo. Cuídate mucho y recuerda darte espacio para sentir 🌿.`;
    } else if (/(triste|llor|bajón|bajon|deprim|vacío|vacio|desanim|soledad|solo|sola|tristeza)/.test(t)) {
      reply = `Lamento mucho escuchar eso, ${userName}. La tristeza es una emoción muy pesada y a veces asusta, pero está bien sentirla y darle un espacio en lugar de reprimirla. ¿Sientes que esta emoción surgió por algún suceso en particular hoy, o ha sido una sensación acumulada?`;
    } else if (/(ansie|nervios|estres|estrés|preocup|miedo|presión|presion|asustad|angustia)/.test(t)) {
      reply = `Noto bastante inquietud en tus palabras, ${userName}. La ansiedad se siente como si todo fuera a mil por hora. Te sugiero detenerte un instante, poner los pies en el suelo, inhalar en 4 segundos y exhalar en 6. Cuando te sientas un poco más en el presente, cuéntame: ¿qué es lo que más te preocupa de esta situación?`;
    } else if (/(cansad|agotad|sin energía|sin energia|exhaust|sueño|fatiga|abrumad)/.test(t)) {
      reply = `Suena a que has estado llevando una carga muy pesada últimamente, ${userName}. El cansancio mental es tan real como el físico, y descansar no es perder el tiempo, es necesario para sanar. ¿Crees que hay alguna pequeña tarea o presión que puedas soltar o delegar el día de hoy para darte un respiro?`;
    } else if (/(feliz|content|aleg|bien|genial|excelente|súper|super|emocionad|alegría)/.test(t)) {
      reply = `¡Qué alegría tan grande leer esto, ${userName}! Es maravilloso detenerse a celebrar y registrar los días bonitos; estos momentos son anclas emocionales increíbles para los días difíciles. ¿Hubo algo en especial que haya sumado a tu bienestar hoy o que quieras atesorar?`;
    } else if (/(enoj|rabia|ira|furi|molest|bronca|injust|odio)/.test(t)) {
      reply = `El enojo es una emoción muy poderosa y completamente válida, ${userName}. Muchas veces nos avisa que se ha cruzado un límite importante para nosotros. Desahogarte ayuda a bajar la intensidad. ¿Quieres contarme con calma qué fue exactamente lo que desencadenó esta molestia?`;
    } else {
      // 5. Fallback dinámico genérico para respuestas abiertas e interactivas
      const genericReplies = [
        `Gracias por compartir esto conmigo, ${userName}. Me gustaría comprender un poco mejor lo que estás viviendo. ¿Qué pensamientos o sensaciones físicas notas en tu cuerpo en este momento al respecto?`,
        `Entiendo tu punto, ${userName}. A veces dar el primer paso para expresar lo que sentimos es lo más retador. ¿Cómo crees que esta situación está afectando tu bienestar o tu paz mental el día de hoy?`,
        `Te escucho atentamente, ${userName}. Siento que hay mucho por procesar aquí. Si pudieras definir tu principal necesidad emocional en este instante, ¿cuál dirías que es?`
      ];
      reply = genericReplies[Math.floor(Math.random() * genericReplies.length)];
    }

    // 6. Simular latencia realista de red para la simulación
    const latency = Math.floor(Math.random() * 600) + 600;
    await new Promise(r => setTimeout(r, latency));
    return reply;
  }
}

module.exports = new ClaudeClient();
