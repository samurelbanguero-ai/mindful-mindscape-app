const express = require('express');
const spotifyController = require('../controllers/spotify.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// OAuth: el frontend pide la URL de autorización con su sesión en el header
// Authorization (nunca en la URL); Spotify redirige luego al callback.
router.post('/spotify/connect', authMiddleware, spotifyController.connectSpotify);
router.get('/auth/spotify/callback', spotifyController.callback);

// Rutas de Spotify API bajo /spotify/...
router.get('/spotify/playlists', authMiddleware, spotifyController.getPlaylists);
router.post('/spotify/disconnect', authMiddleware, spotifyController.disconnect);

module.exports = router;
