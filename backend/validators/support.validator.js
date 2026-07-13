const ValidationError = require('../exceptions/ValidationError');

class SupportValidator {
  validateRequest(data) {
    const { message = '' } = data;

    if (message && message.length > 5000) {
      throw new ValidationError('El campo "message" supera el límite de 5000 caracteres.');
    }
  }

  validateMessage(message) {
    if (!message || !message.trim()) {
      throw new ValidationError('El mensaje no puede estar vacío');
    }

    if (message.length > 3000) {
      throw new ValidationError('El mensaje supera el límite de 3000 caracteres.');
    }
  }
}

module.exports = new SupportValidator();
