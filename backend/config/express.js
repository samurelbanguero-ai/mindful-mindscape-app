const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsConfig = require('./cors');
const securityConfig = require('./security');

function configureExpress(app) {
  // Confiar en X-Forwarded-For solo si la petición viene de una red privada
  // (el proxy de Vite en la red de Docker). Así req.ip es la IP real del cliente
  // para auditoría y límites de peticiones, sin que alguien de internet pueda falsearla.
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Inyectar parser de cabeceras seguras (Helmet)
  app.use(helmet(securityConfig.helmetOptions));

  // Inyectar CORS
  app.use(cors(corsConfig));

  // Parseadores de payloads JSON y URL encoded con límites de tamaño estrictos (mitigación DoS)
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // Parser de Cookies nativo ligero para soportar Refresh Token seguro sin dependencias extra
  app.use((req, res, next) => {
    req.cookies = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          req.cookies[key] = decodeURIComponent(val);
        }
      });
    }
    next();
  });
}

module.exports = configureExpress;
