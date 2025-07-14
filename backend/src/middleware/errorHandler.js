// backend/src/middleware/errorHandler.js
// Global error handling middleware
const { NODE_ENV } = require('../config/environment');
const { logger } = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    return new ApiError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors }
    );
  }
  
  return error;
};

// Database error handler
const handleDatabaseError = (error) => {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      return new ApiError(
        'Duplicate entry found',
        409,
        'DUPLICATE_ENTRY',
        { constraint: error.constraint }
      );
      
    case '23503': // Foreign key violation
      return new ApiError(
        'Referenced record not found',
        400,
        'FOREIGN_KEY_VIOLATION',
        { constraint: error.constraint }
      );
      
    case '23502': // Not null violation
      return new ApiError(
        'Required field missing',
        400,
        'MISSING_REQUIRED_FIELD',
        { column: error.column }
      );
      
    case '22001': // String data too long
      return new ApiError(
        'Data too long for field',
        400,
        'DATA_TOO_LONG',
        { column: error.column }
      );
      
    case '08003': // Connection does not exist
    case '08006': // Connection failure
      return new ApiError(
        'Database connection error',
        503,
        'DATABASE_CONNECTION_ERROR'
      );
      
    case '53300': // Too many connections
      return new ApiError(
        'Service temporarily unavailable',
        503,
        'SERVICE_OVERLOADED'
      );
      
    default:
      logger.error('Unhandled database error:', {
        code: error.code,
        message: error.message,
        detail: error.detail
      });
      
      return new ApiError(
        'Database operation failed',
        500,
        'DATABASE_ERROR'
      );
  }
};

// Stripe error handler
const handleStripeError = (error) => {
  switch (error.type) {
    case 'StripeCardError':
      return new ApiError(
        'Payment failed: ' + error.message,
        400,
        'PAYMENT_CARD_ERROR',
        { decline_code: error.decline_code }
      );
      
    case 'StripeRateLimitError':
      return new ApiError(
        'Too many requests to payment processor',
        429,
        'PAYMENT_RATE_LIMIT'
      );
      
    case 'StripeInvalidRequestError':
      return new ApiError(
        'Invalid payment request',
        400,
        'PAYMENT_INVALID_REQUEST'
      );
      
    case 'StripeAPIError':
      return new ApiError(
        'Payment processor error',
        502,
        'PAYMENT_API_ERROR'
      );
      
    case 'StripeConnectionError':
      return new ApiError(
        'Payment processor unavailable',
        503,
        'PAYMENT_CONNECTION_ERROR'
      );
      
    case 'StripeAuthenticationError':
      return new ApiError(
        'Payment configuration error',
        500,
        'PAYMENT_AUTH_ERROR'
      );
      
    default:
      logger.error('Unhandled Stripe error:', {
        type: error.type,
        message: error.message
      });
      
      return new ApiError(
        'Payment processing error',
        500,
        'PAYMENT_ERROR'
      );
  }
};

// JWT error handler
const handleJWTError = (error) => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new ApiError(
        'Invalid authentication token',
        401,
        'INVALID_TOKEN'
      );
      
    case 'TokenExpiredError':
      return new ApiError(
        'Authentication token expired',
        401,
        'TOKEN_EXPIRED'
      );
      
    case 'NotBeforeError':
      return new ApiError(
        'Authentication token not active yet',
        401,
        'TOKEN_NOT_ACTIVE'
      );
      
    default:
      return new ApiError(
        'Authentication error',
        401,
        'AUTH_ERROR'
      );
  }
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  let err = error;
  
  // Handle different types of errors
  if (error.name === 'ValidationError') {
    err = handleValidationError(error);
  } else if (error.code && typeof error.code === 'string' && error.code.match(/^[0-9]+$/)) {
    err = handleDatabaseError(error);
  } else if (error.type && error.type.startsWith('Stripe')) {
    err = handleStripeError(error);
  } else if (error.name && ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
    err = handleJWTError(error);
  } else if (!(error instanceof ApiError)) {
    // Convert unknown errors to ApiError
    err = new ApiError(
      NODE_ENV === 'production' ? 'Internal server error' : error.message,
      error.statusCode || 500,
      error.code || 'INTERNAL_ERROR'
    );
  }
  
  // Log error details
  const logData = {
    error_id: require('uuid').v4(),
    message: err.message,
    code: err.code,
    status_code: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user_agent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  // Add request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.credit_card;
    delete sanitizedBody.cvv;
    
    logData.request_body = sanitizedBody;
  }
  
  // Add stack trace for server errors in development
  if (err.statusCode >= 500) {
    logger.error('Server error:', {
      ...logData,
      stack: NODE_ENV === 'development' ? err.stack : undefined,
      original_error: NODE_ENV === 'development' ? error : undefined
    });
  } else {
    logger.warn('Client error:', logData);
  }
  
  // Prepare response
  const response = {
    error: true,
    message: err.message,
    code: err.code,
    timestamp: new Date().toISOString(),
    path: req.path,
    error_id: logData.error_id
  };
  
  // Add error details in development or for validation errors
  if (NODE_ENV === 'development' || err.statusCode === 400) {
    if (err.details) {
      response.details = err.details;
    }
    
    if (NODE_ENV === 'development' && err.stack) {
      response.stack = err.stack;
    }
  }
  
  // Add retry information for rate limits
  if (err.statusCode === 429) {
    response.retry_after = 60; // seconds
  }
  
  // Add help information for common errors
  if (err.statusCode === 401) {
    response.help = 'Authentication required. Please provide a valid token.';
  } else if (err.statusCode === 403) {
    response.help = 'Access denied. You do not have permission to perform this action.';
  } else if (err.statusCode === 404) {
    response.help = 'The requested resource was not found.';
  }
  
  res.status(err.statusCode).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create specific error types
const createApiError = (message, statusCode = 500, code = 'API_ERROR', details = null) => {
  return new ApiError(message, statusCode, code, details);
};

const createValidationError = (message, errors = []) => {
  return new ApiError(message, 400, 'VALIDATION_ERROR', { errors });
};

const createNotFoundError = (resource = 'Resource') => {
  return new ApiError(`${resource} not found`, 404, 'NOT_FOUND');
};

const createUnauthorizedError = (message = 'Authentication required') => {
  return new ApiError(message, 401, 'UNAUTHORIZED');
};

const createForbiddenError = (message = 'Access denied') => {
  return new ApiError(message, 403, 'FORBIDDEN');
};

const createConflictError = (message = 'Resource already exists') => {
  return new ApiError(message, 409, 'CONFLICT');
};

module.exports = {
  errorHandler,
  asyncHandler,
  ApiError,
  createApiError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError
};