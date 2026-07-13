const express = require('express');
const env = require('./config/env');
const { initDatabase } = require('./database/init');
const configureExpress = require('./config/express');
const configureRoutes = require('./config/routes');
const configureGlobalMiddlewares = require('./config/middlewares');
const logger = require('./utils/logger');

const app = express();
const PORT = env.PORT;

try {
  // 1. Inicializar y migrar la base de datos
  initDatabase();

  // 2. Configurar Express, cabeceras seguras (Helmet) y CORS
  configureExpress(app);

  // 3. Montar los enrutadores modulares de la API
  configureRoutes(app);

  // 4. Registrar gestor global de errores y rutas no encontradas
  configureGlobalMiddlewares(app);

  // 5. Iniciar la escucha del servidor
  app.listen(PORT, () => {
    logger.info(`✅ Servidor de producción corriendo en http://localhost:${PORT}`);
    logger.info(`🔑 API Key de Anthropic: ${env.ANTHROPIC_API_KEY ? 'configurada' : '⚠️ NO configurada (modo offline)'}`);
  });

} catch (err) {
  logger.error('Fallo fatal en el arranque del servidor backend', { error: err.message, stack: err.stack });
  process.exit(1);
}
