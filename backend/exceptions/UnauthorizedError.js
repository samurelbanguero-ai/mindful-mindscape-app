const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

module.exports = UnauthorizedError;
