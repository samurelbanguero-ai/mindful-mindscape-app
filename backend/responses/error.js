function sendError(res, message, statusCode = 500) {
  return res.status(statusCode).json({ error: message });
}

module.exports = {
  sendError
};
