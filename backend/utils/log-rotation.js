const fs = require('fs');

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB por archivo
const DEFAULT_MAX_FILES = 5; // app.log.1 … app.log.5

// Tamaño conocido de cada archivo, para no consultar el disco en cada escritura
const sizes = new Map();

function currentSize(file) {
  if (!sizes.has(file)) {
    try {
      sizes.set(file, fs.statSync(file).size);
    } catch (_) {
      sizes.set(file, 0);
    }
  }
  return sizes.get(file);
}

/** app.log → app.log.1, app.log.1 → app.log.2 … y se descarta el más antiguo. */
function rotate(file, maxFiles) {
  const oldest = `${file}.${maxFiles}`;
  if (fs.existsSync(oldest)) fs.unlinkSync(oldest);
  for (let i = maxFiles - 1; i >= 1; i--) {
    if (fs.existsSync(`${file}.${i}`)) fs.renameSync(`${file}.${i}`, `${file}.${i + 1}`);
  }
  if (fs.existsSync(file)) fs.renameSync(file, `${file}.1`);
  sizes.set(file, 0);
}

/** Agrega texto al archivo y lo rota antes si con esta línea superaría el tamaño máximo. */
function appendWithRotation(file, text, { maxBytes = DEFAULT_MAX_BYTES, maxFiles = DEFAULT_MAX_FILES } = {}) {
  const bytes = Buffer.byteLength(text, 'utf8');
  if (currentSize(file) > 0 && currentSize(file) + bytes > maxBytes) {
    rotate(file, maxFiles);
  }
  fs.appendFileSync(file, text, 'utf8');
  sizes.set(file, currentSize(file) + bytes);
}

module.exports = {
  appendWithRotation
};
