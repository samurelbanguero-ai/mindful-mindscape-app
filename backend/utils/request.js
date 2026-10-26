const MAX_USER_AGENT_LENGTH = 300;

/**
 * IP y user-agent del cliente para auditoría. La IP real llega en req.ip gracias a
 * `trust proxy` (config/express.js) cuando la petición pasa por el proxy de Vite.
 */
function getClientInfo(req) {
  const rawIp = req.ip || req.socket?.remoteAddress || '';
  // Express entrega las IPv4 como IPv6 mapeadas (::ffff:1.2.3.4)
  const ip = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;
  const userAgent = String(req.headers?.['user-agent'] || '').slice(0, MAX_USER_AGENT_LENGTH);
  return { ip, userAgent };
}

module.exports = {
  getClientInfo
};
