const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Public Routes protected by strict rate limit to prevent credential brute-forcing
router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);

// Protected Routes
router.get('/profile', protect, authController.getProfile);
router.post('/bookmarks', protect, authController.toggleBookmark);

module.exports = router;
