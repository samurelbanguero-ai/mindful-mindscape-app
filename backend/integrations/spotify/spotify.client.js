const env = require('../../config/env');
const spotifyRepository = require('../../repositories/spotify.repository');
const logger = require('../../utils/logger');

class SpotifyClient {
  constructor() {
    this.clientId = env.SPOTIFY_CLIENT_ID;
    this.clientSecret = env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = env.SPOTIFY_REDIRECT_URI;
  }

  isConfigured() {
    return !!(this.clientId && this.clientSecret);
  }

  async getValidToken(userId) {
    if (!this.isConfigured()) {
      logger.warn('Credenciales de Spotify no configuradas.');
      return null;
    }

    const tokenRecord = spotifyRepository.findTokenByUserId(userId);
    if (!tokenRecord) return null;

    // Si expira en más de 60 segundos, usar el actual
    if (Date.now() < tokenRecord.expires_at - 60000) {
      return tokenRecord.access_token;
    }

    // De lo contrario, refrescarlo
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', tokenRecord.refresh_token);

      const authHeader = 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        },
        body: params.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        logger.error('Error al refrescar token de Spotify', { data });
        return null;
      }

      const access_token = data.access_token;
      const expires_at = Date.now() + (data.expires_in * 1000);
      const refresh_token = data.refresh_token || tokenRecord.refresh_token;

      spotifyRepository.saveToken(userId, access_token, refresh_token, expires_at);
      return access_token;
    } catch (err) {
      logger.error('Error en refresh de token de Spotify', { error: err.message });
      return null;
    }
  }

  async getClientCredentialsToken() {
    if (!this.isConfigured()) {
      logger.warn('Credenciales de Spotify del servidor no configuradas.');
      return null;
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');

      const authHeader = 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        },
        body: params.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        logger.error('Error al obtener token Client Credentials de Spotify', { data });
        return null;
      }

      return data.access_token;
    } catch (err) {
      logger.error('Error en request Client Credentials de Spotify', { error: err.message });
      return null;
    }
  }

  async exchangeCode(code) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);

    const authHeader = 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      },
      body: params.toString()
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.error || 'Error al intercambiar código OAuth');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    };
  }

  async searchPlaylists(token, query) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`;

    const res = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Error en búsqueda de playlists de Spotify');
    }

    const items = data.playlists?.items || [];
    return items.map(item => ({
      name: item.name,
      description: item.description || '',
      tracks: item.tracks?.total || 0,
      url: item.external_urls?.spotify || '',
      image: item.images?.[0]?.url || ''
    }));
  }
}

module.exports = new SpotifyClient();
