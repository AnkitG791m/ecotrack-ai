const { HTTP_STATUS } = require('../config/constants');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    requestId: Date.now()
  });
};

module.exports = {
  ApiError,
  errorHandler
};
