const auditRepository = require('../repositories/audit.repository');
const { sendSuccess } = require('../responses/success');

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const logs = auditRepository.findAllLogs();
      return sendSuccess(res, { logs }, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
