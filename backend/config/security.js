module.exports = {
  helmetOptions: {},
  rateLimits: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 15,
      message: 'Demasiados intentos de inicio de sesión o registro. Por favor, intenta de nuevo en 15 minutos.'
    },
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 10,
      message: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 5,
      message: 'Límite de registros alcanzado. Por favor, intenta de nuevo más tarde.'
    },
    verifyEmail: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 20,
      message: 'Demasiados intentos de verificación de OTP. Por favor, intenta de nuevo en 15 minutos.'
    },
    resendVerification: {
      windowMs: 30 * 60 * 1000, // 30 minutos
      max: 3,
      message: 'Has alcanzado el límite de reenvíos de código OTP. Por favor, espera 30 minutos.'
    },
    recoverPassword: {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 3,
      message: 'Has alcanzado el límite de solicitudes de recuperación de contraseña. Intenta en 1 hora.'
    },
    chat: {
      windowMs: 60 * 1000, // 1 minuto
      max: 25,
      message: 'Límite de mensajes alcanzado. Espera 1 minuto antes de continuar.'
    },
    helpbot: {
      windowMs: 60 * 1000, // 1 minuto
      max: 15,
      message: 'Demasiadas preguntas. Espera 1 minuto antes de continuar.'
    }
  }
};
