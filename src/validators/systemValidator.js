const { body, validationResult } = require('express-validator');
const response = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      response.error('Input validation failed', {
        status: 400,
        type: 'ValidationError',
        errors: errors.array(),
      })
    );
  }
  next();
};

const createAlertRules = [
  body('metric')
    .trim()
    .notEmpty()
    .withMessage('metric target parameter is required'),
  body('limit')
    .trim()
    .notEmpty()
    .withMessage('limit threshold condition is required'),
  body('action')
    .trim()
    .notEmpty()
    .withMessage('action notice trigger is required'),
];

const blockIpRules = [
  body('ip')
    .trim()
    .notEmpty()
    .withMessage('ip address parameter is required')
    .isIP()
    .withMessage('Please provide a valid IPv4 or IPv6 address format'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
];

const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Password reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

module.exports = {
  createAlertRules,
  blockIpRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  validate,
};
