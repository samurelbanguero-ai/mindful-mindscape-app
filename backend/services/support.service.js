const supportRepository = require('../repositories/support.repository');
const auditRepository = require('../repositories/audit.repository');
const diaryRepository = require('../repositories/diary.repository');
const supportValidator = require('../validators/support.validator');
const ValidationError = require('../exceptions/ValidationError');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { sanitizeText } = require('../utils/sanitizer');
const { canAccessRequest, canClaimRequest, isUnassignedPending } = require('../shared/support-permissions');

const ACCESS_DENIED = 'No tienes acceso a este caso de apoyo.';

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

  /**
   * Admin: todos los casos. Psicólogo: sus casos asignados (completos) y la cola
   * de pendientes sin asignar, con datos mínimos (sin mensajes, diario ni identidad).
   */
  async getAllRequests(currentUser, statusFilter, search) {
    const psychologistId = currentUser.role === 'admin' ? null : currentUser.id;
    const requests = supportRepository.findAllRequests(statusFilter, search, psychologistId);

    return requests.map(r => {
      if (!canAccessRequest(currentUser, r)) {
        return {
          ...r,
          user_id: null,
          username: null,
          user_name: null,
          alias: r.visibility === 'publico' ? null : r.alias,
          messages: [],
          journal_entries: []
        };
      }

      return {
        ...r,
        messages: supportRepository.findRequestMessages(r.id),
        journal_entries: r.share_journal === 1 ? diaryRepository.findAllByUserId(r.user_id, 5) : []
      };
    });
  }

  findAccessibleRequest(currentUser, requestId) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }
    if (!canAccessRequest(currentUser, request)) {
      throw new AppError(ACCESS_DENIED, 403);
    }
    return request;
  }

  async getRequestMessages(currentUser, requestId) {
    this.findAccessibleRequest(currentUser, requestId);

    const messages = supportRepository.findRequestMessages(requestId);
    supportRepository.markMessagesAsRead(requestId, currentUser.id);

    return messages;
  }

  /** Asigna el caso al profesional; atómico para que dos psicólogos no tomen el mismo caso. */
  async claimRequest(currentUser, requestId) {
    const request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }
    if (!canClaimRequest(currentUser, request)) {
      throw new AppError('Este caso ya fue tomado por otro profesional o no está pendiente.', 409);
    }
    if (!supportRepository.claimRequest(requestId, currentUser.id)) {
      throw new AppError('Este caso ya fue tomado por otro profesional.', 409);
    }

    auditRepository.createLog(currentUser.id, 'claim_support_request', JSON.stringify({ requestId }));
    return supportRepository.findRequestById(requestId);
  }

  async sendSupportMessage(currentUser, requestId, data) {
    let request = supportRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    // Responder un caso pendiente sin asignar equivale a tomarlo
    if (isUnassignedPending(request) && canClaimRequest(currentUser, request)) {
      request = await this.claimRequest(currentUser, requestId);
    }

    if (!canAccessRequest(currentUser, request)) {
      throw new AppError(ACCESS_DENIED, 403);
    }

    const { message = '' } = data;
    supportValidator.validateMessage(message);
    const cleanMsg = sanitizeText(message.trim());

    supportRepository.createMessage(requestId, currentUser.id, cleanMsg);
    return true;
  }

  async resolveSupportRequest(currentUser, requestId) {
    this.findAccessibleRequest(currentUser, requestId);

    supportRepository.resolveRequest(requestId);
    auditRepository.createLog(currentUser.id, 'resolve_support_request', JSON.stringify({ requestId, resolvedBy: currentUser.username }));
    return true;
  }

  async getUnreadCount(currentUser) {
    if (currentUser.role === 'admin') {
      return supportRepository.getUnreadCountPro(null);
    }
    if (currentUser.role === 'psicologo') {
      return supportRepository.getUnreadCountPro(currentUser.id);
    }
    return supportRepository.getUnreadCountUser(currentUser.id);
  }
}

module.exports = new SupportService();
