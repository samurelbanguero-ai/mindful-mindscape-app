const db = require('../database/connection');

class SpotifyRepository {
  findTokenByUserId(userId) {
    return db.prepare('SELECT * FROM spotify_tokens WHERE user_id = ?').get(userId);
  }

  saveToken(userId, accessToken, refreshToken, expiresAt) {
    db.prepare(`
      INSERT OR REPLACE INTO spotify_tokens (user_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, accessToken, refreshToken, expiresAt);
    return true;
  }

  deleteToken(userId) {
    db.prepare('DELETE FROM spotify_tokens WHERE user_id = ?').run(userId);
    return true;
  }
}

module.exports = new SpotifyRepository();
