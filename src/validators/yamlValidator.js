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

const validateContentRules = [
  body('content')
    .notEmpty()
    .withMessage('YAML content is required and cannot be empty')
    .isString()
    .withMessage('YAML content must be a string value'),
];

const compareContentRules = [
  body('contentA')
    .notEmpty()
    .withMessage('contentA is required and cannot be empty')
    .isString()
    .withMessage('contentA must be a string value'),
  body('contentB')
    .notEmpty()
    .withMessage('contentB is required and cannot be empty')
    .isString()
    .withMessage('contentB must be a string value'),
];

const convertJsonRules = [
  body('json')
    .notEmpty()
    .withMessage('json parameter object is required and cannot be empty'),
];

module.exports = {
  validateContentRules,
  compareContentRules,
  convertJsonRules,
  validate,
};
