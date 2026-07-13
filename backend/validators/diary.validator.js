const { DATE_REGEX } = require('../shared/regex');
const ValidationError = require('../exceptions/ValidationError');

class DiaryValidator {
  validateEntry(data) {
    const { date, mood, intensity = 5, note = '' } = data;

    if (!mood || !date) {
      throw new ValidationError('Date y mood son requeridos');
    }

    if (!DATE_REGEX.test(date)) {
      throw new ValidationError('Formato de fecha inválido (debe ser YYYY-MM-DD)');
    }

    const numIntensity = Number(intensity);
    if (isNaN(numIntensity) || numIntensity < 1 || numIntensity > 10) {
      throw new ValidationError('La intensidad debe ser un número entero entre 1 y 10');
    }

    if (typeof mood !== 'string' || mood.length > 30) {
      throw new ValidationError('Estado de ánimo inválido');
    }

    if (note && note.length > 3000) {
      throw new ValidationError('El campo "note" supera el límite de 3000 caracteres.');
    }
  }

  validateUpdate(data) {
    const { mood, intensity, note } = data;

    if (mood !== undefined) {
      if (typeof mood !== 'string' || mood.length > 30) {
        throw new ValidationError('Estado de ánimo inválido');
      }
    }

    if (intensity !== undefined) {
      const numIntensity = Number(intensity);
      if (isNaN(numIntensity) || numIntensity < 1 || numIntensity > 10) {
        throw new ValidationError('La intensidad debe ser un número entero entre 1 y 10');
      }
    }

    if (note && note.length > 3000) {
      throw new ValidationError('El campo "note" supera el límite de 3000 caracteres.');
    }
  }
}

module.exports = new DiaryValidator();
