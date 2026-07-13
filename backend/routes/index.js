const express = require('express');

const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const diaryRoutes = require('./diary.routes');
const postRoutes = require('./post.routes');
const adminRoutes = require('./admin.routes');
const spotifyRoutes = require('./spotify.routes');
const supportRoutes = require('./support.routes');
const assistantRoutes = require('./assistant.routes');
const monitoringRoutes = require('./monitoring.routes');

const router = express.Router();

// Rutas agrupadas bajo prefijos
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/diary', diaryRoutes);
router.use('/community', postRoutes);
router.use('/admin', adminRoutes);
router.use('/support', supportRoutes);

// Rutas montadas directamente en /api para alineación y compatibilidad exacta
router.use('/', spotifyRoutes);
router.use('/', assistantRoutes);
router.use('/', monitoringRoutes);

module.exports = router;
