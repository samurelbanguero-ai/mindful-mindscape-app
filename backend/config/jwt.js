const env = require('./env');

module.exports = {
  secret: env.JWT_SECRET,
  options: {
    expiresIn: '7d'
  }
};
