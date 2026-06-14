const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { HTTP_STATUS } = require('../config/constants');
const env = require('../config/env');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Get user from the token
      req.user = await userRepository.findByIdWithoutPassword(decoded.id);
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
