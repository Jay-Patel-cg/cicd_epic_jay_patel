const { ForbiddenError } = require('../utils/appError');

/**
 * Admin role authorization middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ForbiddenError('Access denied, administrator privileges are required'));
  }
};

module.exports = { admin };
