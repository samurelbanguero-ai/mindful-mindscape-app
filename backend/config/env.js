require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido en las variables de entorno.');
  process.exit(1);
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT_REFRESH_SECRET no está definido en las variables de entorno.');
  process.exit(1);
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
  AI_MODE: process.env.AI_MODE || 'online'
};
