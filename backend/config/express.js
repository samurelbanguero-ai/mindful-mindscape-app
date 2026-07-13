const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsConfig = require('./cors');
const securityConfig = require('./security');

function configureExpress(app) {
  // Inyectar parser de cabeceras seguras (Helmet)
  app.use(helmet(securityConfig.helmetOptions));

  // Inyectar CORS
  app.use(cors(corsConfig));

  // Parseadores de payloads JSON y URL encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
