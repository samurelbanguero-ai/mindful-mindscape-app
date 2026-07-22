const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/user.repository');
const authRepository = require('../repositories/auth.repository');
const auditRepository = require('../repositories/audit.repository');
const authValidator = require('../validators/auth.validator');
const mailerClient = require('../integrations/nodemailer/mailer.client');
const ValidationError = require('../exceptions/ValidationError');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const AppError = require('../exceptions/AppError');
const { sanitizeText } = require('../utils/sanitizer');
const { compareConstantTime, hashValue } = require('../shared/helpers');

class AuthService {
  async register(data, ip = '', userAgent = '') {
    authValidator.validateRegister(data);

    const { email, username, password, name = '', role = 'usuario', visibility = 'publico', alias = '' } = data;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const exists = userRepository.findByEmailOrUsername(cleanEmail, cleanUsername);
    if (exists) {
      throw new ValidationError('Email o username ya existen');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    const cleanName = sanitizeText(name.trim());
    const cleanAlias = sanitizeText(alias.trim() || cleanUsername);

    const verifiedStatus = mailerClient.transporter ? 0 : 1;

    const userId = userRepository.create({
      email: cleanEmail,
      username: cleanUsername,
      password_hash: passwordHash,
      name: cleanName,
      role,
      visibility,
      alias: cleanAlias,
      email_verified: verifiedStatus
    });

    if (mailerClient.transporter) {
      // Generar OTP de 6 dígitos aleatorio
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpMins = Number(process.env.OTP_EXPIRATION_MINUTES) || 10;
      const expiresAt = Date.now() + otpExpMins * 60 * 1000;

      authRepository.saveOtp(userId, otp, expiresAt);

      // Enviar código OTP por correo real
      await mailerClient.sendMail({
        to: cleanEmail,
        subject: 'Código de verificación — Emowave 🌿',
        text: `Hola ${cleanName || cleanUsername},\n\nTu código de verificación de 6 dígitos para Emowave es: ${otp}\n\nEste código expira en ${otpExpMins} minutos.`,
        html: `<p>Hola <strong>${cleanName || cleanUsername}</strong>,</p><p>Tu código de verificación de 6 dígitos para Emowave es:</p><h2>${otp}</h2><p>Este código expira en <strong>${otpExpMins}</strong> minutos.</p>`
      });

      auditRepository.createLog(userId, 'register', `Usuario registrado. OTP enviado a: ${cleanEmail}`, ip, userAgent);
      auditRepository.createLog(userId, 'otp_sent', `Código OTP enviado. Expira en ${otpExpMins} mins`, ip, userAgent);
    } else {
      auditRepository.createLog(userId, 'register', `Usuario registrado y auto-activado en desarrollo (sin SMTP)`, ip, userAgent);
    }

    const user = userRepository.findById(userId);
    return user;
  }

  async createPsychologist(data, ip = '', userAgent = '') {
    authValidator.validateRegister(data);

    const { email, username, password, name = '' } = data;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const exists = userRepository.findByEmailOrUsername(cleanEmail, cleanUsername);
    if (exists) {
      throw new ValidationError('Email o username ya existen');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    const cleanName = sanitizeText(name.trim());

    const userId = userRepository.create({
      email: cleanEmail,
      username: cleanUsername,
      password_hash: passwordHash,
      name: cleanName,
      role: 'psicologo',
      visibility: 'publico',
      alias: cleanUsername
    });

    // Las cuentas de psicólogos creadas por el admin están verificadas por defecto
    userRepository.updateEmailVerified(userId, true);

    auditRepository.createLog(userId, 'register', `Psicólogo creado por el administrador. Correo: ${cleanEmail}`, ip, userAgent);

    const user = userRepository.findById(userId);
    return user;
  }

  async createUserAdmin(data, ip = '', userAgent = '') {
    if (data && data.role === 'user') {
      data.role = 'usuario';
    }
    authValidator.validateRegister(data);

    const { email, username, password, name = '', role = 'usuario' } = data;

    const validRoles = ['usuario', 'psicologo'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Rol de usuario inválido');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const exists = userRepository.findByEmailOrUsername(cleanEmail, cleanUsername);
    if (exists) {
      throw new ValidationError('Email o username ya existen');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    const cleanName = sanitizeText(name.trim());

    const userId = userRepository.create({
      email: cleanEmail,
      username: cleanUsername,
      password_hash: passwordHash,
      name: cleanName,
      role: role,
      visibility: 'publico',
      alias: cleanUsername
    });

    userRepository.updateEmailVerified(userId, true);

    auditRepository.createLog(userId, 'register', `Usuario (${role}) creado por el administrador. Correo: ${cleanEmail}`, ip, userAgent);

    const user = userRepository.findById(userId);
    return user;
  }

  async verifyEmail(email, code, ip = '', userAgent = '') {
    if (!email || !code) {
      throw new ValidationError('Email y código son requeridos');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = userRepository.findByEmailOrUsername(cleanEmail, cleanEmail);
    if (!user) {
      throw new ValidationError('Usuario no encontrado');
    }

    const otpRecord = authRepository.findOtpRecordByUserId(user.id);
    if (!otpRecord) {
      throw new ValidationError('Código OTP no válido o expirado. Solicita uno nuevo.');
    }

    const now = Date.now();

    // Validar bloqueo temporal de OTP
    if (otpRecord.locked_until > now) {
      const remainingMins = Math.ceil((otpRecord.locked_until - now) / 60000);
      throw new ValidationError(`Has superado los intentos de verificación. Bloqueado por ${remainingMins} minutos.`);
    }

    // Validar expiración
    if (otpRecord.expires_at < now) {
      authRepository.deleteOtp(user.id);
      auditRepository.createLog(user.id, 'otp_expired', 'OTP expirado intentado', ip, userAgent);
      throw new ValidationError('El código OTP ha expirado. Solicita uno nuevo.');
    }

    // Comparar en tiempo constante contra el hash guardado en base de datos
    const isCodeValid = compareConstantTime(code.trim(), otpRecord.code_hash);

    if (!isCodeValid) {
      authRepository.incrementOtpAttempts(user.id);
      const currentAttempts = otpRecord.attempts + 1;
      const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

      auditRepository.createLog(user.id, 'otp_failure', `Intento OTP fallido (${currentAttempts}/${maxAttempts})`, ip, userAgent);

      if (currentAttempts >= maxAttempts) {
        const lockMins = Number(process.env.ACCOUNT_LOCK_MINUTES) || 15;
        authRepository.lockOtp(user.id, now + lockMins * 60 * 1000);
        throw new ValidationError(`Código incorrecto. Has alcanzado el límite de intentos. Bloqueado por ${lockMins} minutos.`);
      }

      throw new ValidationError(`Código de verificación incorrecto. Intentos restantes: ${maxAttempts - currentAttempts}`);
    }

    // Código válido: limpiar OTP y activar cuenta
    authRepository.deleteOtp(user.id);
    userRepository.updateEmailVerified(user.id, true);
    auditRepository.createLog(user.id, 'otp_verified', 'Correo electrónico verificado exitosamente', ip, userAgent);

    return true;
  }

  async resendVerification(email, ip = '', userAgent = '') {
    if (!email) {
      throw new ValidationError('Email es requerido');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = userRepository.findByEmailOrUsername(cleanEmail, cleanEmail);
    if (!user) {
      throw new ValidationError('Usuario no encontrado');
    }

    const otpRecord = authRepository.findOtpRecordByUserId(user.id);
    const now = Date.now();

    if (otpRecord && otpRecord.locked_until > now) {
      const remainingMins = Math.ceil((otpRecord.locked_until - now) / 60000);
      throw new ValidationError(`Verificación bloqueada temporalmente. Espera ${remainingMins} minutos.`);
    }

    // Generar nuevo OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpMins = Number(process.env.OTP_EXPIRATION_MINUTES) || 10;
    const expiresAt = now + otpExpMins * 60 * 1000;

    authRepository.saveOtp(user.id, otp, expiresAt);
    if (otpRecord) {
      authRepository.incrementOtpResendCount(user.id);
    }

    await mailerClient.sendMail({
      to: cleanEmail,
      subject: 'Nuevo código de verificación — Emowave 🌿',
      text: `Hola ${user.name || user.username},\n\nTu nuevo código de verificación es: ${otp}\n\nEste código expira en ${otpExpMins} minutos.`,
      html: `<p>Hola <strong>${user.name || user.username}</strong>,</p><p>Tu nuevo código de verificación es:</p><h2>${otp}</h2><p>Este código expira en <strong>${otpExpMins}</strong> minutos.</p>`
    });

    auditRepository.createLog(user.id, 'otp_sent', `Nuevo código OTP reenviado a: ${cleanEmail}`, ip, userAgent);

    return true;
  }

  async login(data, ip = '', userAgent = '') {
    authValidator.validateLogin(data);

    const { email, password } = data;
    const inputClean = email.trim();
    const emailClean = inputClean.toLowerCase();

    const user = userRepository.findByEmailOrUsername(emailClean, inputClean);
    if (!user) {
      console.warn(`[WARNING] Intento de login fallido para usuario inexistente: ${inputClean}`);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const now = Date.now();

    // Validar bloqueo temporal de cuenta
    if (user.locked_until > now) {
      const remainingMins = Math.ceil((user.locked_until - now) / 60000);
      throw new UnauthorizedError(`Esta cuenta ha sido bloqueada temporalmente por excesivos intentos fallidos. Intenta en ${remainingMins} minutos.`);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const currentAttempts = user.login_attempts + 1;
      const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;

      userRepository.updateLoginAttempts(user.id, currentAttempts);
      auditRepository.createLog(user.id, 'login_failure', `Intento fallido (${currentAttempts}/${maxAttempts})`, ip, userAgent);

      if (currentAttempts >= maxAttempts) {
        const lockMins = Number(process.env.ACCOUNT_LOCK_MINUTES) || 15;
        userRepository.lockAccount(user.id, now + lockMins * 60 * 1000);
        throw new UnauthorizedError(`Credenciales inválidas. Cuenta bloqueada temporalmente por ${lockMins} minutos.`);
      }

      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Validar que el correo esté verificado
    if (user.email_verified === 0) {
      auditRepository.createLog(user.id, 'login_failure', 'Intento de login abortado — correo no verificado', ip, userAgent);
      throw new AppError('Debes verificar tu correo antes de iniciar sesión. Ingresa el código OTP enviado.', 403);
    }

    // Login exitoso: limpiar intentos fallidos y bloqueos
    userRepository.updateLoginAttempts(user.id, 0);
    userRepository.lockAccount(user.id, 0);

    // Rotación de Refresh Token: eliminar tokens anteriores (Punto 5 del plan: solo 1 sesión activa por dispositivo)
    authRepository.deleteUserRefreshTokens(user.id);

    // Generar tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken();

    // Guardar hash del Refresh Token
    const refreshExpDays = 7; // por defecto 7 días
    const expiresAt = now + refreshExpDays * 24 * 60 * 60 * 1000;
    authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    auditRepository.createLog(user.id, 'login_success', 'Inicio de sesión exitoso', ip, userAgent);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token, ip = '', userAgent = '') {
    if (!token) {
      throw new UnauthorizedError('Refresh token requerido');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (_) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    const tokenHash = hashValue(token);
    const tokenRecord = authRepository.findRefreshTokenRecord(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedError('Refresh token no registrado o revocado');
    }

    if (tokenRecord.expires_at < Date.now()) {
      authRepository.deleteRefreshToken(tokenHash);
      throw new UnauthorizedError('Refresh token expirado');
    }

    const userId = tokenRecord.user_id;

    // Generar nuevos tokens (Rotación)
    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken();

    // Invalidar el refresh token anterior
    authRepository.deleteRefreshToken(tokenHash);

    // Registrar el nuevo refresh token
    const refreshExpDays = 7;
    const expiresAt = Date.now() + refreshExpDays * 24 * 60 * 60 * 1000;
    authRepository.saveRefreshToken(userId, newRefreshToken, expiresAt);

    auditRepository.createLog(userId, 'refresh_token_used', 'Refresh token rotado con éxito', ip, userAgent);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token, ip = '', userAgent = '') {
    if (!token) return false;

    const tokenHash = hashValue(token);
    const tokenRecord = authRepository.findRefreshTokenRecord(tokenHash);
    if (tokenRecord) {
      authRepository.deleteRefreshToken(tokenHash);
      auditRepository.createLog(tokenRecord.user_id, 'logout', 'Cierre de sesión exitoso', ip, userAgent);
    }
    return true;
  }

  async logoutAll(userId, ip = '', userAgent = '') {
    authRepository.deleteUserRefreshTokens(userId);
    auditRepository.createLog(userId, 'logout', 'Sesiones cerradas en todos los dispositivos', ip, userAgent);
    return true;
  }

  async recoverPassword(email, ip = '', userAgent = '') {
    if (!email) {
      throw new ValidationError('Email es requerido');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = userRepository.findByEmailOrUsername(cleanEmail, cleanEmail);

    // OWASP: Protección contra enumeración de cuentas
    // Si no existe, simulamos la latencia y respondemos éxito igualmente
    if (!user) {
      await new Promise(r => setTimeout(r, crypto.randomInt(200, 600)));
      return { success: true, message: 'Si el correo está registrado, recibirás un código de recuperación.' };
    }

    // Verificar si el servidor SMTP real está configurado
    if (!mailerClient.transporter) {
      throw new ValidationError('El servicio de recuperación de contraseña no está configurado en el servidor (SMTP ausente).');
    }

    // Generar OTP criptográficamente seguro de 6 dígitos
    const otp = String(crypto.randomInt(100000, 999999));
    const resetExpMins = 10; // Expiración obligatoria de 10 minutos
    const expiresAt = Date.now() + resetExpMins * 60 * 1000;

    authRepository.saveResetToken(user.id, otp, expiresAt);

    // Enviar correo real por SMTP
    const subject = 'Restablece tu contraseña — Emowave 🌿';
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4A90E2; font-family: Georgia, serif; margin: 0;">Emowave</h2>
          <p style="color: #888888; font-size: 14px; margin: 5px 0 0 0;">Tu espacio de calma</p>
        </div>
        <p>Hola <strong>${user.name || user.username}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código OTP de verificación:</p>
        <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f7f9fc; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #333333;">${otp}</span>
        </div>
        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          Este código expira en <strong>${resetExpMins} minutos</strong>. Por seguridad, tienes un máximo de 5 intentos para ingresarlo.
        </p>
        <p style="color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 25px;">
          Este código es de uso exclusivo para la recuperación de tu contraseña en Emowave. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </p>
      </div>
    `;

    await mailerClient.sendMail({
      to: cleanEmail,
      subject,
      text: `Hola ${user.name || user.username},\n\nTu código OTP para restablecer la contraseña en Emowave es: ${otp}\n\nEste código expira en ${resetExpMins} minutos. Si no solicitaste esto, ignora este correo.`,
      html: htmlContent
    });

    auditRepository.createLog(user.id, 'password_recovery_request', 'Solicitud de recuperación de contraseña iniciada', ip, userAgent);

    return { success: true, message: 'Si el correo está registrado, recibirás un código de recuperación.' };
  }

  async resetPassword(email, token, password, ip = '', userAgent = '') {
    if (!email || !token || !password) {
      throw new ValidationError('Email, código OTP y nueva contraseña son requeridos');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = userRepository.findByEmailOrUsername(cleanEmail, cleanEmail);
    if (!user) {
      throw new ValidationError('El código de recuperación es incorrecto o ha expirado.');
    }

    const resetRecord = authRepository.findResetRecordByUserId(user.id);
    if (!resetRecord) {
      throw new ValidationError('El código de recuperación es incorrecto o ha expirado.');
    }

    const now = Date.now();
    if (resetRecord.expires_at < now) {
      authRepository.deleteResetToken(user.id);
      throw new ValidationError('El código de recuperación ha expirado. Solicita uno nuevo.');
    }

    if (resetRecord.attempts >= 5) {
      authRepository.deleteResetToken(user.id);
      throw new ValidationError('Has superado el límite de intentos permitidos. Solicita un nuevo código.');
    }

    // Comparar hash del OTP en tiempo constante
    const inputHash = hashValue(token.trim());
    const isTokenValid = compareConstantTime(inputHash, resetRecord.token_hash);

    if (!isTokenValid) {
      authRepository.incrementResetAttempts(user.id);
      const remaining = 5 - (resetRecord.attempts + 1);
      if (remaining <= 0) {
        authRepository.deleteResetToken(user.id);
        throw new ValidationError('Has superado el límite de intentos permitidos. Solicita un nuevo código.');
      }
      throw new ValidationError(`Código de verificación incorrecto. Intentos restantes: ${remaining}`);
    }

    // Validar fortaleza de la nueva contraseña
    authValidator.validatePassword(password);

    // Hashing y actualización
    const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    userRepository.updatePassword(user.id, passwordHash);
    authRepository.deleteResetToken(user.id);

    // Cerrar todas las sesiones activas invalidando los refresh tokens por seguridad
    authRepository.deleteUserRefreshTokens(user.id);

    auditRepository.createLog(user.id, 'password_reset_success', 'Contraseña restablecida exitosamente', ip, userAgent);

    return true;
  }

  generateAccessToken(userId) {
    const expires = process.env.ACCESS_TOKEN_EXPIRES || '15m';
    return jwt.sign({ id: userId }, jwtConfig.secret, { expiresIn: expires });
  }

  generateRefreshToken() {
    const expires = process.env.REFRESH_TOKEN_EXPIRES || '7d';
    // Firmar con payload básico y secreto de refresh
    return jwt.sign({ type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: expires });
  }
}

module.exports = new AuthService();
