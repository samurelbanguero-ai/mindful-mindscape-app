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
const ANONYMOUS_NAME = 'Anónimo/a';

/**
 * Nombre que ven otras personas según la visibilidad elegida: anónimo, alias o
 * nombre de usuario. Si eligió alias pero no tiene uno, se muestra como anónimo
 * (nunca se cae al nombre de usuario).
 */
function publicDisplayName({ visibility = 'publico', alias, username }) {
  if (visibility === 'anonimo') return ANONYMOUS_NAME;
  if (visibility === 'alias') return alias || ANONYMOUS_NAME;
  return username || ANONYMOUS_NAME;
}

function toPublicProfile(user) {
  if (!user) return null;

  const visibility = user.visibility || 'publico';
  if (visibility === 'anonimo') {
    return { id: user.id, displayName: ANONYMOUS_NAME, visibility, avatar: '', bio: '' };
  }

  return {
    id: user.id,
    displayName: publicDisplayName(user),
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
  ANONYMOUS_NAME,
  serializeUser,
  publicDisplayName,
  toPublicProfile,
  hashValue,
  compareConstantTime
};
