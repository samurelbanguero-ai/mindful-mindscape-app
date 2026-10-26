const authService = require('../services/auth.service');
const authDTO = require('../dto/auth.dto');
const { sendSuccess } = require('../responses/success');
const { getClientInfo } = require('../utils/request');

// Cookie HttpOnly del refresh token (mismas opciones al crearla y al borrarla)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined
};
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

class AuthController {
  async register(req, res, next) {
    try {
      const { ip, userAgent } = getClientInfo(req);

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
      const { ip, userAgent } = getClientInfo(req);

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
      const { ip, userAgent } = getClientInfo(req);

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
      const { ip, userAgent } = getClientInfo(req);

      await authService.verifyEmail(email, code, ip, userAgent);
      return sendSuccess(res, { message: 'Cuenta verificada con éxito. Ya puedes iniciar sesión.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const { ip, userAgent } = getClientInfo(req);

      await authService.resendVerification(email, ip, userAgent);
      return sendSuccess(res, { message: 'Código de verificación reenviado.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { ip, userAgent } = getClientInfo(req);

      const { user, accessToken, refreshToken } = await authService.login(req.body, ip, userAgent);

      // Inyectar el Refresh Token únicamente en una cookie HttpOnly
      res.cookie('refreshToken', refreshToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE_MS });

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
      const { ip, userAgent } = getClientInfo(req);

      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token, ip, userAgent);

      // Inyectar el nuevo Refresh Token
      res.cookie('refreshToken', newRefreshToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE_MS });

      return sendSuccess(res, { accessToken }, 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      const { ip, userAgent } = getClientInfo(req);

      await authService.logout(token, ip, userAgent);

      // Limpiar cookie HttpOnly
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, { message: 'Sesión cerrada con éxito.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { ip, userAgent } = getClientInfo(req);

      await authService.logoutAll(userId, ip, userAgent);

      // Limpiar cookie
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, { message: 'Sesiones cerradas en todos tus dispositivos.' }, 200);
    } catch (err) {
      next(err);
    }
  }

  async recoverPassword(req, res, next) {
    try {
      const { email } = req.body;
      const { ip, userAgent } = getClientInfo(req);

      const result = await authService.recoverPassword(email, ip, userAgent);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, token, password } = req.body;
      const { ip, userAgent } = getClientInfo(req);

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
