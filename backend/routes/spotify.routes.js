const express = require('express');
const spotifyController = require('../controllers/spotify.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas de Spotify OAuth bajo /auth/spotify
router.get('/auth/spotify', spotifyController.connectSpotify);
router.get('/auth/spotify/callback', spotifyController.callback);

// Rutas de Spotify API bajo /spotify/...
router.get('/spotify/playlists', authMiddleware, spotifyController.getPlaylists);
router.post('/spotify/disconnect', authMiddleware, spotifyController.disconnect);

module.exports = router;
