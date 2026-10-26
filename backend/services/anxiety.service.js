const diaryRepository = require('../repositories/diary.repository');
const supportRepository = require('../repositories/support.repository');
const mlClient = require('../integrations/ml/ml.client');
const AppError = require('../exceptions/AppError');
const NotFoundError = require('../exceptions/NotFoundError');

const {
  WINDOW_DAYS,
  MIN_ENTRIES,
  shiftDate,
  buildFeatures,
  trendBetween
} = require('../shared/anxiety-features');
const { canAccessRequest } = require('../shared/support-permissions');

const DISCLAIMER = 'Estimación orientativa generada por un modelo estadístico a partir de tus registros. No es un diagnóstico clínico.';

class AnxietyService {
  /**
   * @param {number} userId
   * @param {string} today fecha local del cliente (YYYY-MM-DD)
   */
  async estimateForUser(userId, today) {
    const entries = diaryRepository.findAllByUserId(userId, 60);

    const from = shiftDate(today, -(WINDOW_DAYS - 1));
    const current = buildFeatures(entries, from, today);
    const window = { from, to: today, days: WINDOW_DAYS, minEntries: MIN_ENTRIES };

    if (!current) {
      const entriesInWindow = entries.filter(e => e.date >= from && e.date <= today).length;
      return { available: false, reason: 'insufficient_data', entriesInWindow, window, disclaimer: DISCLAIMER };
    }

    const previous = buildFeatures(entries, shiftDate(from, -WINDOW_DAYS), shiftDate(from, -1));
    const inputs = previous ? [current.features, previous.features] : [current.features];

    let results;
    try {
      results = await mlClient.predict(inputs);
    } catch (err) {
      throw new AppError(`El modelo de ML no está disponible: ${err.message}`, 503);
    }

    return {
      available: true,
      prediction: results[0],
      trend: trendBetween(results[0], results[1]),
      entriesUsed: current.entriesUsed,
      window,
      disclaimer: DISCLAIMER
    };
  }

  /** Estimación de un paciente para su psicólogo asignado (o un admin), solo si compartió su diario. */
  async estimateForSupportRequest(currentUser, requestId, today) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }
    if (!canAccessRequest(currentUser, request)) {
      throw new AppError('No tienes acceso a este caso de apoyo.', 403);
    }
    if (request.share_journal !== 1) {
      throw new AppError('El paciente no compartió su diario en esta solicitud', 403);
    }
    return this.estimateForUser(request.user_id, today);
  }
}

module.exports = new AnxietyService();
