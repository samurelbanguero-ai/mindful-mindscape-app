const jwt = require('jsonwebtoken');
const env = require('../config/env');
const spotifyClient = require('../integrations/spotify/spotify.client');
const spotifyRepository = require('../repositories/spotify.repository');
const userRepository = require('../repositories/user.repository');
const ValidationError = require('../exceptions/ValidationError');
const AppError = require('../exceptions/AppError');
const { sendSuccess } = require('../responses/success');
const { SPOTIFY_QUERIES } = require('../shared/constants');

// El state firmado solo sirve para este flujo OAuth
const SPOTIFY_STATE_PURPOSE = 'spotify_oauth';

class SpotifyController {
  async connectSpotify(req, res, next) {
    try {
      if (!spotifyClient.isConfigured()) {
        throw new AppError('Spotify no está configurado en el servidor.', 503);
      }

      const state = jwt.sign({ userId: req.user.id, purpose: SPOTIFY_STATE_PURPOSE }, env.JWT_SECRET, { expiresIn: '15m' });
      const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

      const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyClient.clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(spotifyClient.redirectUri)}&state=${state}`;

      return sendSuccess(res, { url }, 200);
    } catch (err) {
      next(err);
    }
  }

  async callback(req, res, next) {
    const { code, state, error } = req.query;
    const frontendUrl = env.FRONTEND_URL;

    if (error) {
      return res.redirect(`${frontendUrl}/spotify?spotify_connected=error&error=${encodeURIComponent(error)}`);
    }

    try {
      let userId;
      try {
        const decoded = jwt.verify(state, env.JWT_SECRET);
        if (decoded.purpose !== SPOTIFY_STATE_PURPOSE) throw new Error('state con propósito inválido');
        userId = decoded.userId;
      } catch (_) {
        return res.redirect(`${frontendUrl}/spotify?spotify_connected=error`);
      }

      const tokens = await spotifyClient.exchangeCode(code);
      spotifyRepository.saveToken(userId, tokens.accessToken, tokens.refreshToken, tokens.expiresAt);

      const user = userRepository.findById(userId);
      let profileData = {};
      try {
        profileData = JSON.parse(user.profile_data || '{}');
      } catch (_) {}
      profileData.spotifyConnected = true;

      userRepository.update(userId, {
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        alias: user.alias,
        visibility: user.visibility,
        profile_data: JSON.stringify(profileData)
      });

      return res.redirect(`${frontendUrl}/spotify?spotify_connected=success`);
    } catch (err) {
      return res.redirect(`${frontendUrl}/spotify?spotify_connected=error`);
    }
  }

  async getPlaylists(req, res, next) {
    try {
      let token = await spotifyClient.getValidToken(req.user.id);
      
      // Fallback a token de aplicación general si el usuario no tiene cuenta vinculada
      if (!token) {
        token = await spotifyClient.getClientCredentialsToken();
      }

      if (!token) {
        throw new ValidationError('Spotify no está configurado en el servidor o no se pudo autenticar');
      }

      const parentMood = req.query.parentMood || 'calma';
      
      const searchQuery = SPOTIFY_QUERIES[parentMood] || SPOTIFY_QUERIES.calma;
      const playlists = await spotifyClient.searchPlaylists(token, searchQuery);

      return sendSuccess(res, { playlists }, 200);
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      spotifyRepository.deleteToken(req.user.id);
      
      let profileData = {};
      try {
        profileData = JSON.parse(req.user.profile_data || '{}');
      } catch (_) {}
      profileData.spotifyConnected = false;

      userRepository.update(req.user.id, {
        name: req.user.name,
        bio: req.user.bio,
        avatar: req.user.avatar,
        alias: req.user.alias,
        visibility: req.user.visibility,
        profile_data: JSON.stringify(profileData)
      });

      return sendSuccess(res, { success: true, message: 'Spotify desconectado' }, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SpotifyController();
