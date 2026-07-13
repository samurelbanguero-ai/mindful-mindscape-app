const { sendError } = require('../responses/error');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Registrar error con logger de infraestructura
  logger.error(message, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    stack: err.stack,
    user: req.user ? req.user.id : null
  });

  return sendError(res, message, statusCode);
}

module.exports = errorHandler;
