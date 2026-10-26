const env = require('./env');
const { DATABASE_FILE } = require('./paths');

module.exports = {
  filename: DATABASE_FILE,
  options: {
    verbose: env.NODE_ENV === 'development' ? console.log : null
  }
};
