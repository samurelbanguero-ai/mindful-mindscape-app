const ValidationError = require('../exceptions/ValidationError');
const { sanitizeText } = require('../utils/sanitizer');

const MAX_AVATAR_IMAGE_LENGTH = 250000; // ~180 KB de imagen en base64
const AVATAR_DATA_URL_REGEX = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const AVATAR_HTTPS_URL_REGEX = /^https:\/\/[^\s"'<>]+$/;

/**
 * El avatar puede ser un emoji, una URL https o una imagen en base64. Las URLs no pasan
 * por sanitizeText (convertiría "/" en "&#x2F;" y la imagen dejaría de cargar); en su
 * lugar se validan con un patrón estricto que no admite comillas ni etiquetas.
 */
function validateAvatar(value) {
  if (value === null) return null;
  if (value.startsWith('data:')) {
    if (value.length > MAX_AVATAR_IMAGE_LENGTH || !AVATAR_DATA_URL_REGEX.test(value)) {
      throw new ValidationError('La foto debe ser PNG, JPEG o WebP y pesar menos de 180 KB.');
    }
    return value;
  }
  if (value.startsWith('http')) {
    if (value.length > 500 || !AVATAR_HTTPS_URL_REGEX.test(value)) {
      throw new ValidationError('La URL de la foto debe empezar por https:// y no tener espacios.');
    }
    return value;
  }
  if (value.length > 16) {
    throw new ValidationError('El avatar no es válido.');
  }
  return sanitizeText(value);
}

module.exports = { validateAvatar, MAX_AVATAR_IMAGE_LENGTH };
