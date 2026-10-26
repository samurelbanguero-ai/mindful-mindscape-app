const crypto = require('crypto');

// Datos de la propia cuenta (login, /auth/me, edición de perfil): sin hash ni contadores internos de bloqueo
function serializeUser(user) {
  if (!user) return null;
  const { password_hash, login_attempts, locked_until, ...safeUser } = user;

  if (safeUser.profile_data) {
    try {
      safeUser.profile_data = typeof safeUser.profile_data === 'string'
        ? JSON.parse(safeUser.profile_data)
        : safeUser.profile_data;
    } catch (_) {
      safeUser.profile_data = {};
    }
  } else {
    safeUser.profile_data = {};
  }

  return safeUser;
}

/**
 * Perfil visible para otras personas: nunca incluye email, nombre real, rol ni
 * datos de perfil, y respeta la visibilidad elegida por el usuario.
 */
function toPublicProfile(user) {
  if (!user) return null;

  const visibility = user.visibility || 'publico';
  if (visibility === 'anonimo') {
    return { id: user.id, displayName: 'Anónimo/a', visibility, avatar: '', bio: '' };
  }

  const displayName = visibility === 'alias'
    ? (user.alias || 'Anónimo/a')
    : user.username;

  return {
    id: user.id,
    displayName,
    visibility,
    avatar: user.avatar || '',
    bio: user.bio || ''
  };
}

function hashValue(value) {
  if (typeof value !== 'string') return '';
  return crypto.createHash('sha256').update(value).digest('hex');
}

function compareConstantTime(plainValue, storedHash) {
  if (typeof plainValue !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  const plainHash = hashValue(plainValue);
  const bufferA = Buffer.from(plainHash, 'hex');
  const bufferB = Buffer.from(storedHash, 'hex');

  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

module.exports = {
  serializeUser,
  toPublicProfile,
  hashValue,
  compareConstantTime
};
