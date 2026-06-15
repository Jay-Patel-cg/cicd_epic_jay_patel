const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Authentication validation middleware
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Not authorized, session token is missing');
  }

  try {
    // Verify token using strictly validated secret config
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database, excluding password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('The user associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`JWT Exception verification: ${err.message}`);
    throw new UnauthorizedError('Not authorized, token verification failed or expired');
  }
});

module.exports = { protect };
