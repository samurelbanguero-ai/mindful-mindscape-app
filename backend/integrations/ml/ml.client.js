const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const env = require('../../config/env');
const logger = require('../../utils/logger');

const WORKER_PATH = path.join(__dirname, '..', '..', 'ml', 'worker.py');
const STARTUP_TIMEOUT_MS = 30000;
const REQUEST_TIMEOUT_MS = 10000;
const RESTART_COOLDOWN_MS = 30000;

/**
 * Cliente del modelo de ansiedad (Random Forest en Python).
 * Mantiene un único proceso worker.py vivo que carga el modelo una vez y
 * responde peticiones JSON por stdin/stdout.
 */
class MlClient {
  constructor() {
    this.pythonBin = env.ML_PYTHON;
    this.proc = null;
    this.readyPromise = null;
    this.pending = new Map();
    this.nextId = 1;
    this.lastError = null;
    this.lastFailureAt = 0;
  }

  isReady() {
    return !!this.proc && this.proc.mlReady === true;
  }

  getStatus() {
    return {
      ready: this.isReady(),
      error: this.isReady() ? null : this.lastError
    };
  }

  start() {
    if (this.readyPromise) return this.readyPromise;

    if (Date.now() - this.lastFailureAt < RESTART_COOLDOWN_MS) {
      return Promise.reject(new Error(this.lastError || 'Modelo de ML no disponible'));
    }

    this.readyPromise = new Promise((resolve, reject) => {
      let settled = false;
      const fail = (message) => {
        this.lastError = message;
        this.lastFailureAt = Date.now();
        if (!settled) {
          settled = true;
          reject(new Error(message));
        }
      };

      let proc;
      try {
        proc = spawn(this.pythonBin, [WORKER_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (err) {
        this.readyPromise = null;
        return fail(`No se pudo iniciar Python (${this.pythonBin}): ${err.message}`);
      }
      this.proc = proc;

      const startupTimer = setTimeout(() => {
        fail('El modelo de ML tardó demasiado en cargar');
        proc.kill();
      }, STARTUP_TIMEOUT_MS);

      readline.createInterface({ input: proc.stdout }).on('line', (line) => {
        let msg;
        try {
          msg = JSON.parse(line);
        } catch (_) {
          return logger.warn('ML worker: línea no JSON ignorada', { line: line.slice(0, 200) });
        }

        if (msg.ready !== undefined && msg.id === undefined) {
          clearTimeout(startupTimer);
          if (msg.ready) {
            proc.mlReady = true;
            this.lastError = null;
            logger.info(`Modelo de ML cargado: ${msg.modelo}`);
            settled = true;
            resolve();
          } else {
            fail(`El modelo de ML no pudo cargarse: ${msg.error}`);
          }
          return;
        }

        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        clearTimeout(entry.timer);
        if (msg.error) entry.reject(new Error(msg.error));
        else entry.resolve(msg.results);
      });

      let stderrTail = '';
      proc.stderr.on('data', (chunk) => {
        stderrTail = (stderrTail + chunk.toString()).slice(-2000);
      });

      proc.on('error', (err) => {
        clearTimeout(startupTimer);
        fail(`No se pudo iniciar Python (${this.pythonBin}): ${err.message}`);
      });

      proc.on('exit', (code) => {
        clearTimeout(startupTimer);
        const reason = stderrTail.trim().split('\n').pop() || `código ${code}`;
        if (proc.mlReady) {
          logger.warn(`ML worker terminó (${reason}); se reiniciará en la próxima petición`);
        } else {
          logger.error('ML worker no pudo arrancar', { reason });
          fail(`El modelo de ML no pudo cargarse: ${reason}`);
        }
        for (const entry of this.pending.values()) {
          clearTimeout(entry.timer);
          entry.reject(new Error('El proceso del modelo de ML terminó inesperadamente'));
        }
        this.pending.clear();
        if (this.proc === proc) {
          this.proc = null;
          this.readyPromise = null;
        }
      });
    });

    return this.readyPromise;
  }

  /**
   * @param {Array<{stress:number, panic_attacks:number, depression:number}>} inputs
   * @returns {Promise<Array<object>>} una predicción por cada entrada
   */
  async predict(inputs) {
    await this.start();

    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('El modelo de ML no respondió a tiempo'));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timer });
      this.proc.stdin.write(JSON.stringify({ id, inputs }) + '\n');
    });
  }
}

module.exports = new MlClient();
