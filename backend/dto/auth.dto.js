const { serializeUser } = require('../shared/helpers');

class AuthDTO {
  toResponse(user, token) {
    return {
      token,
      accessToken: token,
      user: serializeUser(user)
    };
  }

  toUserResponse(user) {
    return {
      user: serializeUser(user)
    };
  }
}

module.exports = new AuthDTO();
