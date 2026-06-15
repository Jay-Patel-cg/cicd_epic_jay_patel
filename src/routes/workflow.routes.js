const express = require('express');
const workflowController = require('../controllers/workflowController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

// Public Retrieval Queries
router.get('/', workflowController.getAll);
router.get('/random', workflowController.getRandom);
router.get('/latest', workflowController.getLatest);
router.get('/trending', workflowController.getTrending);
router.get('/popular', workflowController.getPopular);
router.get('/:id', workflowController.getById);

// Protected Operations
router.get('/recommended', protect, workflowController.getRecommended);
router.get('/history/:id', protect, workflowController.getHistory);
router.get('/:id/versions', protect, workflowController.getVersions);
router.get('/:id/logs', protect, workflowController.getLogs);
router.get('/:id/metrics', protect, workflowController.getMetrics);
router.post('/:id/run', protect, workflowController.triggerRun);
router.post('/:id/cancel', protect, workflowController.cancelRun);
router.post('/:id/bookmark', protect, authController.toggleBookmark); // Bookmark target guide

// Administrative Mutations
router.post('/', protect, admin, workflowController.create);
router.put('/:id', protect, admin, workflowController.update);
router.patch('/:id/content', protect, admin, workflowController.patchContent);
router.delete('/:id', protect, admin, workflowController.remove);
router.patch('/:id/archive', protect, admin, workflowController.archive);
router.patch('/:id/restore', protect, admin, workflowController.restore);
router.post('/:id/clone', protect, admin, workflowController.clone);

module.exports = router;
