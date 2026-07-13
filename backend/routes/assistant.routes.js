const express = require('express');
const assistantController = require('../controllers/assistant.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { chatRateLimit, helpbotRateLimit } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.post('/assistant/chat', authMiddleware, chatRateLimit, (req, res, next) => assistantController.chat(req, res, next));
router.post('/helpbot/chat', helpbotRateLimit, (req, res, next) => assistantController.helpbot(req, res, next));

module.exports = router;
