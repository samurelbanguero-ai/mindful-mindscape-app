const { sendError } = require('../responses/error');
const logger = require('../utils/logger');

const GENERIC_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo en unos minutos.';

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  // Solo los errores esperados (AppError) muestran su mensaje; los demás (SQLite,
  // librerías, bugs) podrían revelar detalles internos y se quedan en el log.
  // `expose` lo marcan los errores 4xx de Express (p. ej. JSON mal formado).
  const publicMessage = err.isOperational || err.expose ? message : GENERIC_MESSAGE;

  // Registrar error con logger de infraestructura
  logger.error(message, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    stack: err.stack,
    user: req.user ? req.user.id : null
  });

  return sendError(res, publicMessage, statusCode);
}

module.exports = errorHandler;
