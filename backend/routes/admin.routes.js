const express = require('express');
const authController = require('../controllers/auth.controller');
const postController = require('../controllers/post.controller');
const auditController = require('../controllers/audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

router.post('/create-psychologist', authController.createPsychologist);
router.post('/create-user', authController.createUserAdmin);
router.post('/posts/:postId/approve', postController.approvePost);
router.post('/posts/:postId/reject', postController.rejectPost);
router.put('/posts/:postId', postController.editPostAdmin);
router.get('/audit-logs', auditController.getAuditLogs);

module.exports = router;
