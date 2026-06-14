const AppError = require('./AppError');

class AuthError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}
module.exports = AuthError;
