const anxietyService = require('../services/anxiety.service');
const { DATE_REGEX } = require('../shared/regex');
const { todayKey } = require('../shared/dates');
const { sendSuccess } = require('../responses/success');

// El cliente envía su fecha para que la ventana de días coincida con las fechas
// del diario; si no llega o es inválida, se usa el día actual en Colombia.
function resolveToday(query) {
  const today = query.today;
  return typeof today === 'string' && DATE_REGEX.test(today) ? today : todayKey();
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
