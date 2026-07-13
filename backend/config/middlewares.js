const errorHandler = require('../middlewares/error-handler.middleware');

function configureGlobalMiddlewares(app) {
  // Manejo de rutas no encontradas
  app.use((req, res, next) => {
    res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
  });

  // Manejo centralizado de excepciones (debe ser el ÚLTIMO middleware)
  app.use(errorHandler);
}

module.exports = configureGlobalMiddlewares;
