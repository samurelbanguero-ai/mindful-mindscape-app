const express = require('express');
const mlController = require('../controllers/ml.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { professionalOnly } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/anxiety', mlController.getMyAnxiety);
router.get('/anxiety/request/:requestId', professionalOnly, mlController.getRequestAnxiety);

module.exports = router;
