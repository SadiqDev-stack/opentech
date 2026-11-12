import env from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  // LOG EVERYTHING TO TERMINAL FOR DEBUGGING
  console.error(`\n\x1b[31m[ERROR] ${req.method} ${req.originalUrl}\x1b[0m`);
  console.error(`\x1b[31mStatus: ${status}\x1b[0m`);
  console.error(`\x1b[31mMessage: ${err.message}\x1b[0m`);
  console.error(`\x1b[31mStack: ${err.stack}\x1b[0m\n`);

  res.status(status).json({
    success: false,
    message: env.isProd ? 'Something went wrong' : err.message,
    data: null
  });
}
