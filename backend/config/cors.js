const env = require('./env');

// Orígenes del frontend autorizados a llamar a la API con cookies (separados por comas)
const allowedOrigins = env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean);

module.exports = {
  origin(origin, callback) {
    // Sin cabecera Origin: peticiones del mismo origen (proxy de Vite), curl o health checks
    if (!origin) return callback(null, true);

    // Con credentials: true, reflejar cualquier origen permitiría a otra web leer
    // respuestas autenticadas; solo se acepta la lista blanca, también en desarrollo.
    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
