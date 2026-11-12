export function logRequest(req, res, next) {
  const start = Date.now();
  const colors = {
    GET: '\x1b[32m',    // Green
    POST: '\x1b[33m',   // Yellow
    PUT: '\x1b[34m',    // Blue
    DELETE: '\x1b[31m', // Red
    RESET: '\x1b[0m',
    CYAN: '\x1b[36m',
    MAGENTA: '\x1b[35m'
  };

  const methodColor = colors[req.method] || colors.RESET;

  // Log when request starts
  console.log(
    `${methodColor}[${req.method}]${colors.RESET} ${colors.CYAN}${req.originalUrl}${colors.RESET}`
  );

  // Capture response finish to log the status and time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (status >= 300) statusColor = '\x1b[33m'; // Yellow for 3xx
    if (status >= 400) statusColor = '\x1b[31m'; // Red for 4xx/5xx

    console.log(
      `  ${statusColor}↳ ${status}${colors.RESET} (${duration}ms) ${colors.MAGENTA}${req.ip}${colors.RESET}`
    );
  });

  next();
}
