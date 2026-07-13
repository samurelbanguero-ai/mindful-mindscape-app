const express = require('express');
const { getHealthStatus, getReadyStatus } = require('../monitoring/health');

const router = express.Router();

router.get('/health', (req, res) => {
  const status = getHealthStatus();
  return res.status(status.ok ? 200 : 503).json(status);
});

router.get('/ready', (req, res) => {
  const status = getReadyStatus();
  return res.status(status.ready ? 200 : 503).json(status);
});

module.exports = router;
