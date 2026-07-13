const crypto = require('crypto');

function serializeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;

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
  hashValue,
  compareConstantTime
};
