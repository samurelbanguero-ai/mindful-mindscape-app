const express = require('express');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { accountRateLimit } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

// Perfil de otra persona: requiere sesión y solo devuelve campos públicos
router.get('/:userId', authMiddleware, profileController.getProfile);
router.put('/account', authMiddleware, accountRateLimit, profileController.updateAccount);
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;
