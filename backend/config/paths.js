const fs = require('fs');
const path = require('path');

// Datos persistentes (base de datos y logs) fuera del código y fuera de git.
// En Docker es el volumen montado en /data; en local, la carpeta data/ de la raíz del repositorio.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const LOGS_DIR = path.join(DATA_DIR, 'logs');

fs.mkdirSync(LOGS_DIR, { recursive: true });

module.exports = {
  DATA_DIR,
  LOGS_DIR,
  DATABASE_FILE: path.join(DATA_DIR, 'database.sqlite')
};
