const config = require('../config/security');

const authRateLimitMap = new Map();
const loginRateLimitMap = new Map();
const registerRateLimitMap = new Map();
const verifyEmailRateLimitMap = new Map();
const resendVerificationRateLimitMap = new Map();
const recoverPasswordRateLimitMap = new Map();
const chatRateLimitMap = new Map();
const helpbotRateLimitMap = new Map();

function createRateLimiter(map, limits, getClientKey) {
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

const getIpKey = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

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

module.exports = {
  authRateLimit,
  loginRateLimit,
  registerRateLimit,
  verifyEmailRateLimit,
  resendVerificationRateLimit,
  recoverPasswordRateLimit,
  chatRateLimit,
  helpbotRateLimit
};
