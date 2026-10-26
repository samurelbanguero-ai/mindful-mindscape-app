require('dotenv').config();

const crypto = require('crypto');

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'dev_jwt_secret_change_me') {
  JWT_SECRET = crypto.randomBytes(64).toString('hex');
}

let JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.includes('samuelbanguero')) {
  JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('hex');
}



module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/spotify/callback',
  NODE_ENV: process.env.NODE_ENV || 'development',
  AI_MODE: process.env.AI_MODE || 'online',
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
