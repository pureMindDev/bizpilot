import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  statusCode = statusCode || 500;
  message = message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    if (err instanceof ApiError) {
      console.warn(`[${statusCode}] ${message}`);
    } else {
      console.error(err);
    }
  }

  // Only ApiError carries a semantic string code (e.g. EMAIL_NOT_VERIFIED) —
  // Mongoose's duplicate-key err.code (11000) is numeric and unrelated, so we
  // must not confuse the two here.
  const semanticCode = err instanceof ApiError && typeof err.code === 'string' ? err.code : undefined;

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(semanticCode ? { code: semanticCode } : {}),
  });
};

export default errorHandler;
