const express = require('express');
const knowledgeController = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  createKnowledgeRules,
  updateKnowledgeRules,
  checkIdParam,
  validate,
} = require('../validators/knowledgeValidator');

const router = express.Router();

// Public Routes (Browsing)
router.get('/', knowledgeController.getAll);
router.get('/:id', checkIdParam, validate, knowledgeController.getById);

// Admin-Only Routes (Mutations)
router.post('/', protect, admin, createKnowledgeRules, validate, knowledgeController.create);
router.put('/:id', protect, admin, updateKnowledgeRules, validate, knowledgeController.update);
router.delete('/:id', protect, admin, checkIdParam, validate, knowledgeController.remove);

module.exports = router;
