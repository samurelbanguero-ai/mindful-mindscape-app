const userRepository = require('../repositories/user.repository');
const authDTO = require('../dto/auth.dto');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');
const { sendSuccess } = require('../responses/success');
const { sanitizeText } = require('../utils/sanitizer');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const userId = Number(req.params.userId);
      const user = userRepository.findById(userId);

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const responseData = authDTO.toUserResponse(user);
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, bio, avatar, alias, visibility, profile_data } = req.body;

      if (bio && bio.length > 500) {
        throw new ValidationError('El campo "bio" supera el límite de 500 caracteres.');
      }

      if (visibility) {
        const validVisibility = ['publico', 'alias', 'anonimo'];
        if (!validVisibility.includes(visibility)) {
          throw new ValidationError('Tipo de visibilidad inválido');
        }
      }

      const cleanName = name ? sanitizeText(name.trim()) : req.user.name;
      const cleanBio = bio ? sanitizeText(bio.trim()) : req.user.bio;
      const cleanAlias = alias ? sanitizeText(alias.trim()) : req.user.alias;
      const cleanAvatar = avatar ? sanitizeText(avatar.trim()) : req.user.avatar;
      const profileDataStr = profile_data ? JSON.stringify(profile_data) : null;

      userRepository.update(req.user.id, {
        name: cleanName,
        bio: cleanBio,
        avatar: cleanAvatar,
        alias: cleanAlias,
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
      const { username, password } = req.body;

      if (!username || username.trim().length < 3) {
        throw new ValidationError('El nombre de usuario debe tener al menos 3 caracteres.');
      }

      const cleanUsername = username.trim().toLowerCase();
      
      const existingUser = userRepository.findByUsername(cleanUsername);
      if (existingUser && existingUser.id !== req.user.id) {
        throw new ValidationError('El nombre de usuario ya está ocupado.');
      }

      let passwordHash = null;
      if (password) {
        if (password.length < 6) {
          throw new ValidationError('La contraseña debe tener al menos 6 caracteres de longitud.');
        }
        const bcrypt = require('bcryptjs');
        passwordHash = await bcrypt.hash(password, 10);
      }

      userRepository.updateAccountDetails(req.user.id, cleanUsername, passwordHash);

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
}

module.exports = new ProfileController();
