const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateAccessToken(userId) {
  const expires = process.env.ACCESS_TOKEN_EXPIRES || '15m';
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: expires });
}

function generateRefreshToken() {
  const expires = process.env.REFRESH_TOKEN_EXPIRES || '7d';
  // jti aleatorio: sin él, dos inicios de sesión en el mismo segundo producían el
  // mismo token y el segundo fallaba por la restricción UNIQUE de refresh_tokens
  return jwt.sign({ type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: expires, jwtid: crypto.randomUUID() });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
