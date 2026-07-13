const supportService = require('../services/support.service');
const supportDTO = require('../dto/support.dto');
const { sendSuccess } = require('../responses/success');

class SupportController {
  async requestSupport(req, res, next) {
    try {
      const request = await supportService.requestSupport(req.user.id, req.body);
      const responseData = {
        success: true,
        request: supportDTO.toRequestResponse(request).request
      };
      return sendSuccess(res, responseData, 201);
    } catch (err) {
      next(err);
    }
  }

  async getMyRequest(req, res, next) {
    try {
      const { request, messages } = await supportService.getMyRequest(req.user.id);
      const responseData = supportDTO.toRequestResponse(request, messages);
      
      if (!responseData) {
        return sendSuccess(res, { request: null, messages: [] }, 200);
      }
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async getAllRequests(req, res, next) {
    try {
      const requests = await supportService.getAllRequests(
        req.user,
        req.query.status,
        req.query.search
      );

      const formatted = requests.map(r => {
        return supportDTO.toRequestResponse(r, r.messages, r.journal_entries);
      });

      return sendSuccess(res, { requests: formatted }, 200);
    } catch (err) {
      next(err);
    }
  }

  async getRequestMessages(req, res, next) {
    try {
      const requestId = Number(req.params.id);
      const messages = await supportService.getRequestMessages(req.user, requestId);
      const formatted = messages.map(m => supportDTO.toMessageResponse(m));
      return sendSuccess(res, { messages: formatted }, 200);
    } catch (err) {
      next(err);
    }
  }

  async sendSupportMessage(req, res, next) {
    try {
      const requestId = Number(req.params.id);
      await supportService.sendSupportMessage(req.user, requestId, req.body);
      return sendSuccess(res, { success: true, message: 'Mensaje enviado' }, 201);
    } catch (err) {
      next(err);
    }
  }

  async resolveSupportRequest(req, res, next) {
    try {
      const requestId = Number(req.params.id);
      await supportService.resolveSupportRequest(req.user, requestId);
      return sendSuccess(res, { success: true, message: 'Caso de apoyo resuelto' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await supportService.getUnreadCount(req.user);
      return sendSuccess(res, { count }, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SupportController();
