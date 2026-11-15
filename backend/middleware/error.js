import env from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

export function errorHandler(err, req, res, next) {
  const requestedStatus = err.status || err.statusCode || 500;
  const status = requestedStatus >= 400 && requestedStatus < 600 ? requestedStatus : 500;
  const requestId = req.logId || 'untracked';
  console.error(`[error:${requestId}] ${req.method} ${req.path} status=${status} message=${err.message}`);
  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    success: false,
    message: status >= 500 && env.isProd ? 'Something went wrong. Please try again.' : err.message,
    errorId: requestId,
    data: null
  });
}
