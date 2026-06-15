const express = require('express');
const knowledgeController = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Retrieve reviews list publicly
router.get('/:workflowId', knowledgeController.getReviews);

// Add rating review securely
router.post('/:workflowId', protect, knowledgeController.addReview);

module.exports = router;
