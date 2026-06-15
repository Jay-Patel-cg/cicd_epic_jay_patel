const express = require('express');
const knowledgeController = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly retrieve comments on a specific resource
router.get('/:workflowId', knowledgeController.getComments);

// Secure comment mutations
router.post('/:workflowId', protect, knowledgeController.addComment);
router.patch('/:commentId', protect, knowledgeController.updateComment);
router.delete('/:commentId', protect, knowledgeController.deleteComment);

module.exports = router;
