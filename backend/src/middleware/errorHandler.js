// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error('[ErrorHandler]', err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
