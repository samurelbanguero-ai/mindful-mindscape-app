const jwt = require('jsonwebtoken');
const config = require('../config/security');
const env = require('../config/env');
const { getClientInfo } = require('../utils/request');

const authRateLimitMap = new Map();
const loginRateLimitMap = new Map();
const registerRateLimitMap = new Map();
const verifyEmailRateLimitMap = new Map();
const resendVerificationRateLimitMap = new Map();
const recoverPasswordRateLimitMap = new Map();
const chatRateLimitMap = new Map();
const helpbotRateLimitMap = new Map();
const apiRateLimitMap = new Map();
const refreshRateLimitMap = new Map();
const accountRateLimitMap = new Map();

// Borra periódicamente las ventanas vencidas; sin esto los mapas crecen con cada IP
// distinta que llega al servidor y nunca liberan memoria.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const allMaps = [];

setInterval(() => {
  const now = Date.now();
  for (const map of allMaps) {
    for (const [key, state] of map) {
      if (now > state.resetAt) map.delete(key);
    }
  }
}, SWEEP_INTERVAL_MS).unref();

function createRateLimiter(map, limits, getClientKey) {
  allMaps.push(map);
  return (req, res, next) => {
    const key = getClientKey(req);
    const now = Date.now();
    let state = map.get(key);

    if (!state || now > state.resetAt) {
      state = { count: 0, resetAt: now + limits.windowMs };
    }

    if (state.count >= limits.max) {
      return res.status(429).json({ error: limits.message });
    }

    state.count++;
    map.set(key, state);
    next();
  };
}

const getIpKey = (req) => getClientInfo(req).ip || 'unknown';

/**
 * Con sesión válida se cuenta por usuario; sin sesión, por IP. Contar solo por IP
 * bloqueaba a todos los estudiantes que salen a internet con la misma IP (wifi de la
 * universidad). Un token inválido o vencido cae en el conteo por IP.
 */
const getUserOrIpKey = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const { id } = jwt.verify(header.slice(7), env.JWT_SECRET);
      if (id) return `user:${id}`;
    } catch (_) {
      // token inválido: se cuenta por IP
    }
  }
  return `ip:${getIpKey(req)}`;
};

const authRateLimit = createRateLimiter(
  authRateLimitMap,
  config.rateLimits.auth,
  getIpKey
);

const loginRateLimit = createRateLimiter(
  loginRateLimitMap,
  config.rateLimits.login,
  getIpKey
);

const registerRateLimit = createRateLimiter(
  registerRateLimitMap,
  config.rateLimits.register,
  getIpKey
);

const verifyEmailRateLimit = createRateLimiter(
  verifyEmailRateLimitMap,
  config.rateLimits.verifyEmail,
  getIpKey
);

const resendVerificationRateLimit = createRateLimiter(
  resendVerificationRateLimitMap,
  config.rateLimits.resendVerification,
  getIpKey
);

const recoverPasswordRateLimit = createRateLimiter(
  recoverPasswordRateLimitMap,
  config.rateLimits.recoverPassword,
  getIpKey
);

const chatRateLimit = createRateLimiter(
  chatRateLimitMap,
  config.rateLimits.chat,
  (req) => req.user?.id || 'unknown'
);

const helpbotRateLimit = createRateLimiter(
  helpbotRateLimitMap,
  config.rateLimits.helpbot,
  getIpKey
);

const refreshRateLimit = createRateLimiter(
  refreshRateLimitMap,
  config.rateLimits.refresh,
  getIpKey
);

// Por usuario: frena la adivinación de la contraseña actual con un token robado
const accountRateLimit = createRateLimiter(
  accountRateLimitMap,
  config.rateLimits.account,
  (req) => req.user?.id || getIpKey(req)
);

const apiRateLimit = createRateLimiter(
  apiRateLimitMap,
  config.rateLimits.api,
  getUserOrIpKey
);

module.exports = {
  authRateLimit,
  loginRateLimit,
  registerRateLimit,
  verifyEmailRateLimit,
  resendVerificationRateLimit,
  recoverPasswordRateLimit,
  chatRateLimit,
  helpbotRateLimit,
  refreshRateLimit,
  accountRateLimit,
  apiRateLimit
};
