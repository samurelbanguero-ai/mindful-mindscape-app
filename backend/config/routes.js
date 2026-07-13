const apiRouter = require('../routes/index');
const monitoringRouter = require('../routes/monitoring.routes');

function configureRoutes(app) {
  // Montar health check en la raíz para monitoreo externo (Kubernetes/Load Balancer)
  app.use('/', monitoringRouter);

  // Montar todas las API en el prefijo /api
  app.use('/api', apiRouter);
}

module.exports = configureRoutes;
