const authService = require('../services/auth.service');
const authDTO = require('../dto/auth.dto');
const { sendSuccess } = require('../responses/success');
const { ValidationError } = require('../exceptions/ValidationError');

class AuthController {
  async register(req, res, next) {
    try {
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const user = await authService.register(req.body, ip, userAgent);
      return sendSuccess(res, {
        message: 'Usuario registrado. Hemos enviado un código OTP de verificación a tu correo.',
        user: authDTO.toResponse(user).user
      }, 201);
    } catch (err) {
      next(err);
    }
  }

  async createPsychologist(req, res, next) {
    try {
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const user = await authService.createPsychologist(req.body, ip, userAgent);
      return sendSuccess(res, {
        message: 'Psicólogo creado exitosamente.',
        id: user.id
      }, 201);
    } catch (err) {
      next(err);
    }
  }

  async createUserAdmin(req, res, next) {
    try {
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const user = await authService.createUserAdmin(req.body, ip, userAgent);
      return sendSuccess(res, {
        message: `Usuario (${user.role}) creado exitosamente.`,
        id: user.id
      }, 201);
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { email, code } = req.body;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await authService.verifyEmail(email, code, ip, userAgent);
      return sendSuccess(res, { message: 'Cuenta verificada con éxito. Ya puedes iniciar sesión.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await authService.resendVerification(email, ip, userAgent);
      return sendSuccess(res, { message: 'Código de verificación reenviado.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const { user, accessToken, refreshToken } = await authService.login(req.body, ip, userAgent);

      // Inyectar el Refresh Token únicamente en una cookie HttpOnly
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      const responseData = authDTO.toResponse(user, accessToken);
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      // Extraer el refresh token de la cookie
      const token = req.cookies?.refreshToken;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token, ip, userAgent);

      // Inyectar el nuevo Refresh Token
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, { accessToken }, 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await authService.logout(token, ip, userAgent);

      // Limpiar cookie HttpOnly
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined
      });

      return sendSuccess(res, { message: 'Sesión cerrada con éxito.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await authService.logoutAll(userId, ip, userAgent);

      // Limpiar cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined
      });

      return sendSuccess(res, { message: 'Sesiones cerradas en todos tus dispositivos.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async recoverPassword(req, res, next) {
    try {
      const { email } = req.body;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.recoverPassword(email, ip, userAgent);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, token, password } = req.body;
      const ip = req.ip || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await authService.resetPassword(email, token, password, ip, userAgent);
      return sendSuccess(res, { message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const responseData = authDTO.toResponse(req.user);
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
