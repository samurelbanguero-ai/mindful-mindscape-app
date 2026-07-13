const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  loginRateLimit,
  registerRateLimit,
  verifyEmailRateLimit,
  resendVerificationRateLimit,
  recoverPasswordRateLimit
} = require('../middlewares/rate-limit.middleware');

const router = express.Router();

// Registro e Inicio de sesión
router.post('/register', registerRateLimit, authController.register);
router.post('/login', loginRateLimit, authController.login);

// Verificación OTP de correo
router.post('/verify-email', verifyEmailRateLimit, authController.verifyEmail);
router.post('/resend-verification', resendVerificationRateLimit, authController.resendVerification);

// Sesión y Tokens
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

// Recuperación de Contraseña
router.post('/recover-password', recoverPasswordRateLimit, authController.recoverPassword);
router.post('/reset-password', recoverPasswordRateLimit, authController.resetPassword);

// Perfil de sesión
router.get('/me', authMiddleware, authController.me);

module.exports = router;
