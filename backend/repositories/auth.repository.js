const db = require('../database/connection');
const { hashValue } = require('../shared/helpers');

class AuthRepository {
  // --- OTP (EMAIL VERIFICATIONS) ---
  saveOtp(userId, code, expiresAt) {
    const codeHash = hashValue(code);
    db.prepare(`
      INSERT OR REPLACE INTO email_verifications (user_id, code_hash, attempts, locked_until, expires_at, created_at)
      VALUES (?, ?, 0, 0, ?, ?)
    `).run(userId, codeHash, expiresAt, Date.now());
    return true;
  }

  findOtpRecordByUserId(userId) {
    return db.prepare('SELECT * FROM email_verifications WHERE user_id = ?').get(userId);
  }

  incrementOtpAttempts(userId) {
    db.prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE user_id = ?').run(userId);
    return true;
  }

  lockOtp(userId, lockedUntil) {
    db.prepare('UPDATE email_verifications SET locked_until = ? WHERE user_id = ?').run(lockedUntil, userId);
    return true;
  }

  incrementOtpResendCount(userId) {
    db.prepare('UPDATE email_verifications SET resend_count = resend_count + 1 WHERE user_id = ?').run(userId);
    return true;
  }

  deleteOtp(userId) {
    db.prepare('DELETE FROM email_verifications WHERE user_id = ?').run(userId);
    return true;
  }

  // --- PASSWORD RESET ---
  saveResetToken(userId, token, expiresAt) {
    const tokenHash = hashValue(token);
    db.prepare(`
      INSERT OR REPLACE INTO password_resets (user_id, token_hash, attempts, expires_at)
      VALUES (?, ?, 0, ?)
    `).run(userId, tokenHash, expiresAt);
    return true;
  }

  findResetRecordByTokenHash(tokenHash) {
    return db.prepare('SELECT * FROM password_resets WHERE token_hash = ?').get(tokenHash);
  }

  findResetRecordByUserId(userId) {
    return db.prepare('SELECT * FROM password_resets WHERE user_id = ?').get(userId);
  }

  incrementResetAttempts(userId) {
    db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = ?').run(userId);
    return true;
  }

  deleteResetToken(userId) {
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId);
    return true;
  }

  // --- REFRESH TOKENS ---
  saveRefreshToken(userId, token, expiresAt) {
    const tokenHash = hashValue(token);
    db.prepare(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, tokenHash, expiresAt);
    return true;
  }

  findRefreshTokenRecord(tokenHash) {
    return db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').get(tokenHash);
  }

  deleteRefreshToken(tokenHash) {
    db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').run(tokenHash);
    return true;
  }

  deleteUserRefreshTokens(userId) {
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
    return true;
  }

  // --- LIMPIEZA AUTOMÁTICA DE EXPIRADOS ---
  clearExpiredRecords() {
    const now = Date.now();
    // 1. Borrar OTPs expirados
    const res1 = db.prepare('DELETE FROM email_verifications WHERE expires_at < ?').run(now);
    // 2. Borrar resets de contraseña expirados
    const res2 = db.prepare('DELETE FROM password_resets WHERE expires_at < ?').run(now);
    // 3. Borrar refresh tokens expirados
    const res3 = db.prepare('DELETE FROM refresh_tokens WHERE expires_at < ?').run(now);

    return {
      deletedOtps: res1.changes,
      deletedResets: res2.changes,
      deletedRefreshTokens: res3.changes
    };
  }
}

module.exports = new AuthRepository();
