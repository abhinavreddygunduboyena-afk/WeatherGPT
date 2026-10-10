/**
 * Centralized error handling middleware.
 * Ensures consistent, secure error responses without exposing internal stack traces or secrets.
 */

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
}

export function errorHandler(err, req, res, next) {
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'An unexpected internal server error occurred.',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
}
