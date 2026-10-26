const anxietyService = require('../services/anxiety.service');
const { DATE_REGEX } = require('../shared/regex');
const { sendSuccess } = require('../responses/success');

// El cliente envía su fecha local para que la ventana de días coincida con
// las fechas guardadas en el diario; si no llega o es inválida, se usa la del servidor.
function resolveToday(query) {
  const today = query.today;
  return typeof today === 'string' && DATE_REGEX.test(today)
    ? today
    : new Date().toISOString().slice(0, 10);
}

class MlController {
  async getMyAnxiety(req, res, next) {
    try {
      const estimate = await anxietyService.estimateForUser(req.user.id, resolveToday(req.query));
      return sendSuccess(res, estimate, 200);
    } catch (err) {
      next(err);
    }
  }

  async getRequestAnxiety(req, res, next) {
    try {
      const requestId = Number(req.params.requestId);
      const estimate = await anxietyService.estimateForSupportRequest(req.user, requestId, resolveToday(req.query));
      return sendSuccess(res, estimate, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MlController();
