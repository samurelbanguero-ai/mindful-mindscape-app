const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { appendWithRotation } = require('../utils/log-rotation');

test('rota el log al superar el tamaño máximo y conserva solo maxFiles copias', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logs-'));
  const file = path.join(dir, 'app.log');
  const line = 'x'.repeat(99) + '\n'; // 100 bytes

  for (let i = 0; i < 25; i++) {
    appendWithRotation(file, line, { maxBytes: 300, maxFiles: 2 });
  }

  assert.ok(fs.statSync(file).size <= 300);
  assert.ok(fs.existsSync(`${file}.1`));
  assert.ok(fs.existsSync(`${file}.2`));
  assert.equal(fs.existsSync(`${file}.3`), false);
  fs.rmSync(dir, { recursive: true, force: true });
});
