const db = require('../database/connection');

class UserRepository {
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  findByEmailOrUsername(email, username) {
    return db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
  }

  create(user) {
    const { email, username, password_hash, name, role, visibility, alias, email_verified = 0 } = user;
    const result = db.prepare(`
      INSERT INTO users (email, username, password_hash, name, role, visibility, alias, email_verified, login_attempts, locked_until, profile_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '{}')
    `).run(email, username, password_hash, name, role, visibility, alias, email_verified);
    return result.lastInsertRowid;
  }

  update(id, user) {
    const { name, bio, avatar, alias, visibility, profile_data } = user;
    db.prepare(`
      UPDATE users
      SET name = ?, bio = ?, avatar = ?, alias = ?, visibility = ?, profile_data = ?
      WHERE id = ?
    `).run(name, bio, avatar, alias, visibility, profile_data, id);
    return true;
  }

  updateEmailVerified(userId, verified) {
    db.prepare('UPDATE users SET email_verified = ? WHERE id = ?').run(verified ? 1 : 0, userId);
    return true;
  }

  updateLoginAttempts(userId, attempts) {
    db.prepare('UPDATE users SET login_attempts = ? WHERE id = ?').run(attempts, userId);
    return true;
  }

  lockAccount(userId, lockedUntil) {
    db.prepare('UPDATE users SET locked_until = ? WHERE id = ?').run(lockedUntil, userId);
    return true;
  }

  updatePassword(userId, passwordHash) {
    db.prepare('UPDATE users SET password_hash = ?, login_attempts = 0, locked_until = 0 WHERE id = ?').run(passwordHash, userId);
    return true;
  }

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  updateAccountDetails(id, username, passwordHash) {
    if (passwordHash) {
      db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(username, passwordHash, id);
    } else {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, id);
    }
    return true;
  }
}

module.exports = new UserRepository();
