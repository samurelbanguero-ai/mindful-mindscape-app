const Database = require('better-sqlite3');
const config = require('../config/database');
const logger = require('../utils/logger');

let db;

try {
  db = new Database(config.filename, config.options);
  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');
  logger.info(`Conexión exitosa a la base de datos: ${config.filename}`);
} catch (err) {
  logger.error('Error al inicializar la base de datos', { error: err.message, stack: err.stack });
  throw err;
}

module.exports = db;
