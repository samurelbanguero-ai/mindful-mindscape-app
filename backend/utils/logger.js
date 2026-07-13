const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');

// Asegurar que el directorio de logs exista de forma nativa
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const paths = {
  app: path.join(logsDir, 'app.log'),
  error: path.join(logsDir, 'error.log'),
  audit: path.join(logsDir, 'audit.log')
};

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

function writeToFile(fileKey, level, message, meta) {
  const logMessage = formatMessage(level, message, meta);
  
  // Escribir en consola
  if (level === 'error') {
    console.error(logMessage.trim());
  } else if (level === 'audit') {
    console.log(`\x1b[33m${logMessage.trim()}\x1b[0m`); // Amarillo para auditoría
  } else {
    console.log(logMessage.trim());
  }

  // Escribir en archivo correspondiente de forma asíncrona pero segura
  try {
    fs.appendFileSync(paths[fileKey], logMessage, 'utf8');
  } catch (err) {
    console.error(`Error al escribir log en ${fileKey}:`, err);
  }
}

const logger = {
  info: (message, meta) => {
    writeToFile('app', 'info', message, meta);
  },
  warn: (message, meta) => {
    writeToFile('app', 'warn', message, meta);
  },
  error: (message, meta) => {
    // Los errores se registran tanto en app.log como en error.log
    writeToFile('app', 'error', message, meta);
    writeToFile('error', 'error', message, meta);
  },
  audit: (message, meta) => {
    // Los logs de auditoría administrativa se registran en audit.log
    writeToFile('audit', 'audit', message, meta);
  }
};

module.exports = logger;
