const userRepository = require('../repositories/user.repository');
const authDTO = require('../dto/auth.dto');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');
const { sendSuccess } = require('../responses/success');
const { sanitizeText } = require('../utils/sanitizer');
const { toPublicProfile } = require('../shared/helpers');
const { VALID_VISIBILITIES } = require('../shared/constants');
const authService = require('../services/auth.service');
const { getClientInfo } = require('../utils/request');
const { setRefreshCookie } = require('../utils/cookies');
const { validateAvatar, MAX_AVATAR_IMAGE_LENGTH } = require('../shared/avatar');

const MAX_PROFILE_DATA_LENGTH = 20000;

/** Texto opcional del perfil: null si no llegó; error si no es texto o es muy largo. */
function optionalText(value, field, maxLength) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ValidationError(`El campo "${field}" debe ser texto.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`El campo "${field}" supera el límite de ${maxLength} caracteres.`);
  }
  return trimmed;
}

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const userId = Number(req.params.userId);
      const user = userRepository.findById(userId);

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      return sendSuccess(res, { user: toPublicProfile(user) }, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, bio, avatar, alias, visibility, profile_data } = req.body || {};

      const name_ = optionalText(name, 'nombre', 80);
      const bio_ = optionalText(bio, 'bio', 500);
      const alias_ = optionalText(alias, 'alias', 40);
      const avatar_ = validateAvatar(optionalText(avatar, 'avatar', MAX_AVATAR_IMAGE_LENGTH));

      if (visibility !== undefined && !VALID_VISIBILITIES.includes(visibility)) {
        throw new ValidationError('Tipo de visibilidad inválido');
      }

      let profileDataStr = null;
      if (profile_data !== undefined && profile_data !== null) {
        if (typeof profile_data !== 'object' || Array.isArray(profile_data)) {
          throw new ValidationError('profile_data debe ser un objeto.');
        }
        profileDataStr = JSON.stringify(profile_data);
        if (profileDataStr.length > MAX_PROFILE_DATA_LENGTH) {
          throw new ValidationError('Las preferencias del perfil son demasiado grandes.');
        }
      }

      userRepository.update(req.user.id, {
        name: name_ !== null ? sanitizeText(name_) : req.user.name,
        bio: bio_ !== null ? sanitizeText(bio_) : req.user.bio,
        avatar: avatar_ !== null ? avatar_ : req.user.avatar,
        alias: alias_ ? sanitizeText(alias_) : req.user.alias,
        visibility: visibility ?? req.user.visibility,
        profile_data: profileDataStr ?? req.user.profile_data
      });

      const updatedUser = userRepository.findById(req.user.id);
      const responseData = {
        user: authDTO.toUserResponse(updatedUser).user,
        updated: true
      };

      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateAccount(req, res, next) {
    try {
      const { ip, userAgent } = getClientInfo(req);
      const { user, refreshToken } = await authService.changeAccount(req.user.id, req.body, ip, userAgent);

      // Cambió la contraseña: esta sesión sigue con un refresh token nuevo
      if (refreshToken) setRefreshCookie(res, refreshToken);

      return sendSuccess(res, { user: authDTO.toUserResponse(user).user, updated: true }, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();
