export function logRequest(req, res, next) {
  const start = Date.now();
  req.logId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  console.info(`[request:${req.logId}] ${req.method} ${req.path}`);
  res.on('finish', () => {
    console.info(`[request:${req.logId}] ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
