function notFoundHandler(_req, res, _next) {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found.',
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error', err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && err.stack
      ? { stack: err.stack.split('\n') }
      : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
