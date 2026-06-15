const express = require('express');
const systemController = require('../controllers/systemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection globally to notifications
router.use(protect);

router.get('/', systemController.getNotifications);
router.patch('/:id/read', systemController.markNotificationRead);
router.delete('/:id', systemController.deleteNotification);

module.exports = router;
