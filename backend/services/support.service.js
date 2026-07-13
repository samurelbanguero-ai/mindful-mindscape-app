const supportRepository = require('../repositories/support.repository');
const auditRepository = require('../repositories/audit.repository');
const diaryRepository = require('../repositories/diary.repository');
const supportValidator = require('../validators/support.validator');
const ValidationError = require('../exceptions/ValidationError');
const NotFoundError = require('../exceptions/NotFoundError');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const { sanitizeText } = require('../utils/sanitizer');

class SupportService {
  async requestSupport(userId, data) {
    supportValidator.validateRequest(data);

    const { message = '', share_journal = false } = data;
    const cleanMsg = sanitizeText(message.trim());

    const active = supportRepository.findActiveByUserId(userId);
    if (active) {
      throw new ValidationError('Ya tienes una solicitud de apoyo activa.');
    }

    // Ejecutar atómicamente la inserción de la solicitud y el mensaje inicial
    const transaction = supportRepository.getTransaction(() => {
      const requestId = supportRepository.createRequest(userId, cleanMsg, share_journal);
      if (cleanMsg) {
        supportRepository.createMessage(requestId, userId, cleanMsg);
      }
      return requestId;
    });

    const requestId = transaction();
    return supportRepository.findRequestById(requestId);
  }

  async getMyRequest(userId) {
    const request = supportRepository.findActiveByUserId(userId);
    if (!request) {
      return { request: null, messages: [] };
    }

    const messages = supportRepository.findRequestMessages(request.id);
    supportRepository.markMessagesAsRead(request.id, userId);

    return { request, messages };
  }

  async getAllRequests(currentUser, statusFilter, search) {
    const requests = supportRepository.findAllRequests(statusFilter, search);

    for (const r of requests) {
      r.messages = supportRepository.findRequestMessages(r.id);

      if (r.share_journal === 1) {
        r.journal_entries = diaryRepository.findAllByUserId(r.user_id, 5);
      } else {
        r.journal_entries = [];
      }
    }

    return requests;
  }

  async getRequestMessages(currentUser, requestId) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    const isOwner = request.user_id === currentUser.id;
    const isPro = currentUser.role === 'psicologo' || currentUser.role === 'admin';
    if (!isOwner && !isPro) {
      throw new UnauthorizedError('Acceso denegado');
    }

    const messages = supportRepository.findRequestMessages(requestId);
    supportRepository.markMessagesAsRead(requestId, currentUser.id);

    return messages;
  }

  async sendSupportMessage(currentUser, requestId, data) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    const isOwner = request.user_id === currentUser.id;
    const isPro = currentUser.role === 'psicologo' || currentUser.role === 'admin';
    if (!isOwner && !isPro) {
      throw new UnauthorizedError('Acceso denegado');
    }

    const { message = '' } = data;
    supportValidator.validateMessage(message);
    const cleanMsg = sanitizeText(message.trim());

    const transaction = supportRepository.getTransaction(() => {
      // Si responde un profesional y está pendiente, cambiar estado a activo
      if (isPro && request.status === 'pending') {
        supportRepository.assignPsychologist(requestId, currentUser.id);
      }
      supportRepository.createMessage(requestId, currentUser.id, cleanMsg);
    });

    transaction();
    return true;
  }

  async resolveSupportRequest(currentUser, requestId) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    const isOwner = request.user_id === currentUser.id;
    const isPro = currentUser.role === 'psicologo' || currentUser.role === 'admin';
    if (!isOwner && !isPro) {
      throw new UnauthorizedError('Acceso denegado');
    }

    supportRepository.resolveRequest(requestId);
    auditRepository.createLog(currentUser.id, 'resolve_support_request', JSON.stringify({ requestId, resolvedBy: currentUser.username }));
    return true;
  }

  async getUnreadCount(currentUser) {
    const isPro = currentUser.role === 'psicologo' || currentUser.role === 'admin';
    if (isPro) {
      return supportRepository.getUnreadCountPro();
    } else {
      return supportRepository.getUnreadCountUser(currentUser.id);
    }
  }
}

module.exports = new SupportService();
