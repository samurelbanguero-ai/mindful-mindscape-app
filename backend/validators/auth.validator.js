const { EMAIL_REGEX, USERNAME_REGEX } = require('../shared/regex');
const { VALID_ROLES, VALID_VISIBILITIES } = require('../shared/constants');
const ValidationError = require('../exceptions/ValidationError');

class AuthValidator {
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('La contraseña es requerida.');
    }

    if (password.length < 8) {
      throw new ValidationError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (password.length > 128) {
      throw new ValidationError('La contraseña no debe exceder 128 caracteres.');
    }

    // Contar cuántos requisitos cumple
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    // Requerir al menos 3 de los 4 requisitos
    const requirementsMet = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (requirementsMet < 3) {
      throw new ValidationError('La contraseña debe contener al menos 3 de estos requisitos: minúsculas, mayúsculas, números o caracteres especiales.');
    }

    // Validar contra espacios en blanco
    if (/\s/.test(password)) {
      throw new ValidationError('La contraseña no puede contener espacios en blanco.');
    }
  }

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

    this.validatePassword(password);

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
