/**
 * Centralized error handler middleware.
 * Catches all errors thrown in route handlers and sends appropriate JSON responses.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
  }

  // Multer general error
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: err.message });
  }

  // express-validator / custom validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({ error: `A record with this ${field} already exists` });
  }

  // Prisma: record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Default to 500
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = { errorHandler };
