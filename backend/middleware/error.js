import env from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  if (!env.isProd) {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    message: env.isProd ? err.publicMessage || 'Something went wrong' : err.message || 'Something went wrong',
    data: null
  });
}
