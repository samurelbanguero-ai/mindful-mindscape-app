const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/user.repository');
const UnauthorizedError = require('../exceptions/UnauthorizedError');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new UnauthorizedError('Token requerido'));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = userRepository.findById(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('Usuario inválido'));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }
}

module.exports = authMiddleware;
