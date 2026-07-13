const { EMAIL_REGEX, USERNAME_REGEX } = require('../shared/regex');
const { VALID_ROLES, VALID_VISIBILITIES } = require('../shared/constants');
const ValidationError = require('../exceptions/ValidationError');

class AuthValidator {
  validateRegister(data) {
    const { email = '', username = '', password = '', role = 'usuario', visibility = 'publico' } = data;

    if (!email.trim() || !username.trim() || !password) {
      throw new ValidationError('Email, username y password son requeridos');
    }

    if (email.length > 100 || !EMAIL_REGEX.test(email)) {
      throw new ValidationError('Formato de email inválido o demasiado largo');
    }

    if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) {
      throw new ValidationError('El nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos, guiones bajos o puntos.');
    }

    if (password.length < 6 || password.length > 100) {
      throw new ValidationError('La contraseña debe tener entre 6 y 100 caracteres.');
    }

    if (!VALID_ROLES.includes(role)) {
      throw new ValidationError('Rol inválido');
    }

    if (!VALID_VISIBILITIES.includes(visibility)) {
      throw new ValidationError('Tipo de visibilidad inválido');
    }
  }

  validateLogin(data) {
    const { email = '', password = '' } = data;

    if (!email.trim() || !password) {
      throw new ValidationError('Email y password son requeridos');
    }
  }
}

module.exports = new AuthValidator();
