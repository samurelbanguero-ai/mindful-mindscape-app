const express = require('express');
const diaryController = require('../controllers/diary.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/entries', diaryController.getEntries);
router.post('/entries', diaryController.createEntry);
router.get('/entries/:id', diaryController.getEntryById);
router.put('/entries/:id', diaryController.updateEntry);

module.exports = router;
