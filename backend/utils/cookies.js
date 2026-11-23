// Cookie HttpOnly del refresh token (mismas opciones al crearla y al borrarla)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined
};
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE_MS });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
}

module.exports = { setRefreshCookie, clearRefreshCookie };
