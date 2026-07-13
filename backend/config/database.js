const path = require('path');
const env = require('./env');

module.exports = {
  filename: path.join(__dirname, '..', 'database.sqlite'),
  options: {
    verbose: env.NODE_ENV === 'development' ? console.log : null
  }
};
