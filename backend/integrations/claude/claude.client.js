const env = require('../../config/env');
const logger = require('../../utils/logger');
const AppError = require('../../exceptions/AppError');
const { buildLocalReply } = require('./local-fallback');

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
      return '⚠️ El asistente de IA no está disponible en este momento. Por favor intenta más tarde.';
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

    logger.error('Todos los modelos de Anthropic fallaron en chat.');
    throw new AppError('El asistente de IA no está disponible en este momento. Por favor intenta más tarde.', 503);
  }

  async helpbotChat(message, history = [], systemPrompt = '') {
    if (this.isOfflineMode()) {
      return 'El asistente de ayuda no está disponible en modo offline.';
    }

    if (!this.isConfigured()) {
      return 'El asistente de ayuda no está disponible en este momento. Por favor intenta más tarde.';
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
    throw new AppError('El asistente de ayuda no está disponible en este momento. Por favor intenta más tarde.', 503);
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
    const reply = buildLocalReply(message, history, systemPrompt);

    // Simular latencia realista de red para la simulación
    const latency = Math.floor(Math.random() * 600) + 600;
    await new Promise(r => setTimeout(r, latency));
    return reply;
  }
}

module.exports = new ClaudeClient();
