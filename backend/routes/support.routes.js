const express = require('express');
const supportController = require('../controllers/support.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { professionalOnly } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/request', supportController.requestSupport);
router.get('/request/me', supportController.getMyRequest);
router.get('/requests', professionalOnly, supportController.getAllRequests);
router.get('/requests/:id/messages', supportController.getRequestMessages);
router.post('/requests/:id/messages', supportController.sendSupportMessage);
router.post('/requests/:id/resolve', supportController.resolveSupportRequest);
router.get('/unread-count', supportController.getUnreadCount);

module.exports = router;
