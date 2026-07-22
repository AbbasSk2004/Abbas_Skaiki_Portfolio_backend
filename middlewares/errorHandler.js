/**
 * Wraps an async route handler so rejected promises are forwarded to Express.
 * Removes the need for repetitive try/catch blocks in controllers.
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for unmatched routes.
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

// Centralized error handler returning consistent JSON responses.
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Multer upload errors (file too large, too many files, unexpected field).
  // Without this they'd surface as an opaque 500 — or, when a proxy/AV drops the
  // oversized body first, as a "Failed to fetch"/CORS error in the browser with
  // no usable message. Turning them into a clean 413/400 means the admin UI can
  // show "File too large" instead of a misleading network/CORS failure.
  if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Please use a file under 5 MB.'
        : `Upload error: ${err.message}`;
  }

  // Our own fileFilter rejection (non-image upload).
  if (err.message === 'Only image files are allowed') {
    statusCode = 400;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', err);
  }

  res.status(statusCode).json({ success: false, message });
};
