const { body, validationResult } = require('express-validator');
const response = require('../utils/response');

// Middleware to run validation checks
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      response.error('Validation failed', {
        status: 400,
        errors: errors.array(),
      })
    );
  }
  next();
};

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required and cannot be empty'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  registerRules,
  loginRules,
  validate,
};
