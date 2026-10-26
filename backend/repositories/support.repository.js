const db = require('../database/connection');

class SupportRepository {
  findActiveByUserId(userId) {
    return db.prepare("SELECT * FROM support_requests WHERE user_id = ? AND status != 'resolved'").get(userId);
  }

  createRequest(userId, message, shareJournal) {
    // Retorna una función para ejecutar dentro de una transacción o lo maneja internamente
    const result = db.prepare(`
      INSERT INTO support_requests (user_id, status, message, share_journal)
      VALUES (?, 'pending', ?, ?)
    `).run(userId, message, shareJournal ? 1 : 0);
    return result.lastInsertRowid;
  }

  createMessage(requestId, senderId, message) {
    db.prepare(`
      INSERT INTO support_messages (request_id, sender_id, message)
      VALUES (?, ?, ?)
    `).run(requestId, senderId, message);
    return true;
  }

  markMessagesAsRead(requestId, excludeSenderId) {
    db.prepare("UPDATE support_messages SET is_read = 1 WHERE request_id = ? AND sender_id != ?").run(requestId, excludeSenderId);
    return true;
  }

  findRequestById(id) {
    return db.prepare('SELECT * FROM support_requests WHERE id = ?').get(id);
  }

  findRequestMessages(requestId) {
    return db.prepare(`
      SELECT m.*, u.username AS sender_username
      FROM support_messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.request_id = ?
      ORDER BY m.created_at ASC
    `).all(requestId);
  }

  /**
   * @param {number|null} psychologistId si se indica, solo los casos asignados a ese
   *   psicólogo y los pendientes sin asignar; null = todos (administrador).
   */
  findAllRequests(statusFilter = '', search = '', psychologistId = null) {
    let query = `
      SELECT r.*, u.username, u.alias, u.visibility, u.name AS user_name
      FROM support_requests r
      JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];

    if (psychologistId !== null) {
      query += " AND (r.psychologist_id = ? OR (r.psychologist_id IS NULL AND r.status = 'pending'))";
      params.push(psychologistId);
    }

    if (statusFilter) {
      query += " AND r.status = ?";
      params.push(statusFilter);
    }
    if (search) {
      // Un psicólogo solo busca por nombre dentro de sus casos: buscar en la cola
      // de pendientes permitiría deducir quién pidió apoyo.
      query += " AND (u.username LIKE ? OR u.alias LIKE ? OR u.name LIKE ?)";
      const likeVal = `%${search}%`;
      params.push(likeVal, likeVal, likeVal);
      if (psychologistId !== null) {
        query += " AND r.psychologist_id = ?";
        params.push(psychologistId);
      }
    }

    query += " ORDER BY r.created_at DESC";
    return db.prepare(query).all(...params);
  }

  /** Devuelve true solo si este psicólogo tomó el caso (nadie lo había tomado antes). */
  claimRequest(requestId, psychologistId) {
    const result = db.prepare(`
      UPDATE support_requests SET psychologist_id = ?, status = 'active'
      WHERE id = ? AND psychologist_id IS NULL AND status = 'pending'
    `).run(psychologistId, requestId);
    return result.changes === 1;
  }

  resolveRequest(requestId) {
    db.prepare("UPDATE support_requests SET status = 'resolved' WHERE id = ?").run(requestId);
    return true;
  }

  /** Mensajes de pacientes sin leer: de los casos del psicólogo indicado, o de todos si es null. */
  getUnreadCountPro(psychologistId = null) {
    const byPsychologist = psychologistId !== null ? 'AND r.psychologist_id = ?' : '';
    const params = psychologistId !== null ? [psychologistId] : [];
    return db.prepare(`
      SELECT COUNT(*) AS count
      FROM support_messages m
      JOIN support_requests r ON r.id = m.request_id
      WHERE m.sender_id = r.user_id AND m.is_read = 0 AND r.status != 'resolved' ${byPsychologist}
    `).get(...params).count;
  }

  getUnreadCountUser(userId) {
    return db.prepare(`
      SELECT COUNT(*) AS count
      FROM support_messages m
      JOIN support_requests r ON r.id = m.request_id
      WHERE r.user_id = ? AND m.sender_id != ? AND m.is_read = 0 AND r.status != 'resolved'
    `).get(userId, userId).count;
  }

  getTransaction(fn) {
    return db.transaction(fn);
  }
}

module.exports = new SupportRepository();
