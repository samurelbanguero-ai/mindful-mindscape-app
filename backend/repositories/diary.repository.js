const db = require('../database/connection');

class DiaryRepository {
  findAllByUserId(userId, limit = 365) {
    return db.prepare(`
      SELECT * FROM journal_entries
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(userId, limit);
  }

  findByIdAndUserId(id, userId) {
    return db.prepare('SELECT * FROM journal_entries WHERE id = ? AND user_id = ?').get(id, userId);
  }

  findById(id) {
    return db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(id);
  }

  findByUserIdAndDate(userId, date) {
    return db.prepare('SELECT id FROM journal_entries WHERE user_id = ? AND date = ?').get(userId, date);
  }

  create(entry) {
    const { user_id, mood, date, intensity, situations, note } = entry;
    const result = db.prepare(`
      INSERT INTO journal_entries (user_id, mood, title, content, tags, date, intensity, situations, note)
      VALUES (?, ?, '', '', '', ?, ?, ?, ?)
    `).run(user_id, mood, date, intensity, situations, note);
    return result.lastInsertRowid;
  }

  update(id, entry) {
    const { mood, intensity, situations, note } = entry;
    db.prepare(`
      UPDATE journal_entries
      SET mood = ?, intensity = ?, situations = ?, note = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(mood, intensity, situations, note, id);
    return true;
  }
}

module.exports = new DiaryRepository();
