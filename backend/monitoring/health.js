const db = require('../database/connection');
const env = require('../config/env');

function getHealthStatus() {
  let dbOk = false;
  try {
    const row = db.prepare('SELECT 1 AS alive').get();
    dbOk = row && row.alive === 1;
  } catch (_) {
    dbOk = false;
  }

  return {
    ok: dbOk,
    message: dbOk ? 'Backend funcionando correctamente' : 'Error en la base de datos',
    db: dbOk ? 'connected' : 'disconnected',
    hasApiKey: !!env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  };
}

function getReadyStatus() {
  let dbOk = false;
  try {
    const row = db.prepare('SELECT 1 AS alive').get();
    dbOk = row && row.alive === 1;
  } catch (_) {
    dbOk = false;
  }

  return {
    ready: dbOk,
    status: dbOk ? 'ready' : 'not_ready',
    timestamp: Date.now()
  };
}

module.exports = {
  getHealthStatus,
  getReadyStatus
};
