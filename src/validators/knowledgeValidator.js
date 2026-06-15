const { body, param, validationResult } = require('express-validator');
const response = require('../utils/response');

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

const createKnowledgeRules = [
  body('instruction')
    .trim()
    .notEmpty()
    .withMessage('Instruction is required and cannot be empty'),
  body('output')
    .trim()
    .notEmpty()
    .withMessage('Output is required and cannot be empty'),
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required and cannot be empty')
    .toLowerCase(),
  body('difficulty')
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required and cannot be empty')
    .toLowerCase()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Difficulty must be one of: beginner, intermediate, advanced, expert'),
];

const updateKnowledgeRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Knowledge record ID format'),
  body('instruction')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Instruction cannot be empty if provided'),
  body('output')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Output cannot be empty if provided'),
  body('topic')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Topic cannot be empty if provided')
    .toLowerCase(),
  body('difficulty')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Difficulty cannot be empty if provided')
    .toLowerCase()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Difficulty must be one of: beginner, intermediate, advanced, expert'),
];

const checkIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Knowledge ID format'),
];

module.exports = {
  createKnowledgeRules,
  updateKnowledgeRules,
  checkIdParam,
  validate,
};
