const env = require('./env');

module.exports = {
  origin: env.FRONTEND_URL,
  credentials: true
};
