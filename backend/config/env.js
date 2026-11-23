require('dotenv').config();

const crypto = require('crypto');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Valores de ejemplo que nunca deben usarse como secreto real
const PLACEHOLDER_SECRETS = ['dev_jwt_secret_change_me', 'change_me', 'changeme', 'secret'];

/**
 * En producción un secreto JWT ausente o débil detiene el arranque: generar uno
 * aleatorio cerraría todas las sesiones en cada reinicio sin que nadie lo note.
 * En desarrollo se genera uno temporal para no bloquear el trabajo local.
 */
function resolveSecret(name) {
  const value = process.env[name];
  const isWeak = !value || value.length < 32 || PLACEHOLDER_SECRETS.includes(value);
  if (!isWeak) return value;

  if (IS_PRODUCTION) {
    throw new Error(`${name} falta o es demasiado corto (mínimo 32 caracteres). Defínelo en backend/.env.`);
  }
  return crypto.randomBytes(64).toString('hex');
}

const JWT_SECRET = resolveSecret('JWT_SECRET');
const JWT_REFRESH_SECRET = resolveSecret('JWT_REFRESH_SECRET');

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Primer origen de FRONTEND_URL: a donde se redirige al usuario tras un flujo externo (Spotify)
  FRONTEND_ORIGIN: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim(),
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/spotify/callback',
  NODE_ENV,
  IS_PRODUCTION,
  // Imprime cada consulta SQL en consola. Solo para depurar: vuelca datos de usuarios.
  SQL_DEBUG: process.env.SQL_DEBUG === 'true',
  AI_MODE: process.env.AI_MODE || 'online',
  ML_PYTHON: process.env.ML_PYTHON || 'python3',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  OTP_EXPIRATION_MINUTES: process.env.OTP_EXPIRATION_MINUTES || 10,
  MAX_LOGIN_ATTEMPTS: process.env.MAX_LOGIN_ATTEMPTS || 5,
  ACCOUNT_LOCK_MINUTES: process.env.ACCOUNT_LOCK_MINUTES || 15
};
