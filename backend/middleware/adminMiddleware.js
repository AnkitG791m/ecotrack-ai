const { HTTP_STATUS } = require('../config/constants');

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Admin resource only' });
  }
};

module.exports = { admin };
