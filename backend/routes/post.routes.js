const express = require('express');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// Rutas públicas de comunidad (requieren auth)
router.get('/posts', postController.getPosts);
router.post('/posts', postController.createPost);
router.post('/posts/:postId/replies', postController.replyPost);
router.post('/posts/:postId/react', postController.reactPost);
router.post('/posts/:postId/report', postController.reportPost);

module.exports = router;
