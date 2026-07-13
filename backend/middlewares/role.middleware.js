const AppError = require('../exceptions/AppError');

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return next(new AppError('Acceso denegado. Se requiere rol de administrador.', 403));
  }
  next();
}

function professionalOnly(req, res, next) {
  if (req.user.role !== 'psicologo' && req.user.role !== 'admin') {
    return next(new AppError('Acceso denegado. Se requiere rol profesional.', 403));
  }
  next();
}

module.exports = {
  adminOnly,
  professionalOnly
};
