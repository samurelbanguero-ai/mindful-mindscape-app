const jwt = require('jsonwebtoken');
const env = require('../config/env');
const spotifyClient = require('../integrations/spotify/spotify.client');
const spotifyRepository = require('../repositories/spotify.repository');
const userRepository = require('../repositories/user.repository');
const ValidationError = require('../exceptions/ValidationError');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const { sendSuccess } = require('../responses/success');

class SpotifyController {
  async connectSpotify(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        throw new ValidationError('Token es requerido');
      }

      let userId;
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        userId = decoded.id;
      } catch (_) {
        throw new UnauthorizedError('Token inválido');
      }

      if (!spotifyClient.isConfigured()) {
        const frontendUrl = env.FRONTEND_URL;
        return res.redirect(`${frontendUrl}/spotify?spotify_connected=error&error=${encodeURIComponent('Spotify no está configurado en el servidor. Agrega tu SPOTIFY_CLIENT_ID y SECRET en el archivo .env.')}`);
      }

      const state = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
      const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
      
      const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyClient.clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(spotifyClient.redirectUri)}&state=${state}`;
      
      return res.redirect(spotifyAuthUrl);
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
      
      const queries = {
        calma: 'calm sleep ambient relaxation chill',
        alegria: 'happy upbeat pop feel good feelgood dance energetic',
        tristeza: 'sad piano melancholy slow chill acoustic sadness',
        ansiedad: 'anxiety relief peaceful soft rain focus mediation',
        energia: 'workout motivation party high energy rock gym electronic'
      };

      const searchQuery = queries[parentMood] || queries.calma;
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
