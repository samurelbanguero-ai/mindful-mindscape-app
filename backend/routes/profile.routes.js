const express = require('express');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/:userId', profileController.getProfile);
router.put('/account', authMiddleware, profileController.updateAccount);
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;
