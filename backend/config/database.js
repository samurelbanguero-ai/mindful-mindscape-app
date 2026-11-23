const env = require('./env');
const { DATABASE_FILE } = require('./paths');

module.exports = {
  filename: DATABASE_FILE,
  options: {
    verbose: env.SQL_DEBUG ? console.log : null
  }
};
