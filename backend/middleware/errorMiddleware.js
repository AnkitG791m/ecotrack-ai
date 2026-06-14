const { ZodError } = require('zod');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = undefined;

  // Handle Zod Schema validation errors
  if (err.name === 'ZodError' || (err.constructor && err.constructor.name === 'ZodError') || err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    const issues = err.issues || err.errors || [];
    errors = issues.map(issue => ({
      field: Array.isArray(issue.path) ? issue.path.join('.') : 'field',
      message: issue.message
    }));
  }

  // Log error via Winston logger safely
  try {
    logger.error(`${statusCode} - ${message} - ${req.method} ${req.originalUrl} - Stack: ${err.stack}`);
  } catch (logError) {
    console.error('Winston logging failed:', logError);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    requestId: Date.now()
  });
};

module.exports = {
  ApiError,
  errorHandler
};
