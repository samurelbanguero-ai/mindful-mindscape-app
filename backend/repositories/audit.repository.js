const db = require('../database/connection');

class AuditRepository {
  createLog(userId, action, details) {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(userId, action, details);
    return true;
  }

  findAllLogs(limit = 200) {
    return db.prepare(`
      SELECT a.*, u.username, u.role
      FROM audit_logs a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = new AuditRepository();
