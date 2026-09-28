function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;

  const status = error.status || (error.name === 'ValidationError' ? 400 : error.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  const message = error.code === 'LIMIT_FILE_SIZE'
    ? 'Evidence file exceeds the configured upload limit'
    : status >= 500 ? 'Internal server error' : error.message;
  if (status >= 500) console.error(error);
  res.status(status).json({ ok: false, error: message });
}

module.exports = errorHandler;