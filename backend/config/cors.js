const env = require('./env');

// Parsear múltiples orígenes desde FRONTEND_URL (separados por comas)
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3031'];

module.exports = {
  origin: function (origin, callback) {
    // Si no hay origen (peticiones desde Postman, curl, etc.), permitir
    if (!origin) return callback(null, true);

    // En desarrollo, permitir todos los orígenes
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // En producción, verificar contra lista blanca
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido para este origen'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
