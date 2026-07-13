const { VALID_REACTIONS } = require('../shared/constants');
const ValidationError = require('../exceptions/ValidationError');

class PostValidator {
  validatePost(data) {
    const { title = '', body = '', content = '' } = data;
    const postBody = body || content;

    if (!postBody.trim()) {
      throw new ValidationError('El contenido del post es requerido');
    }

    if (title && title.length > 200) {
      throw new ValidationError('El campo "title" supera el límite de 200 caracteres.');
    }

    if (postBody.length > 5000) {
      throw new ValidationError('El campo "body" supera el límite de 5000 caracteres.');
    }
  }

  validateReply(data) {
    const { content = '' } = data;

    if (!content.trim()) {
      throw new ValidationError('El comentario no puede estar vacío');
    }

    if (content.length > 1000) {
      throw new ValidationError('El campo "comment" supera el límite de 1000 caracteres.');
    }
  }

  validateReaction(reaction) {
    if (!reaction) {
      throw new ValidationError('Reacción es requerida');
    }

    if (!VALID_REACTIONS.includes(reaction)) {
      throw new ValidationError('Reacción no válida');
    }
  }
}

module.exports = new PostValidator();
