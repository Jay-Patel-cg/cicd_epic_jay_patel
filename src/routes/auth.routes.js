const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../validators/authValidator');
const {
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  validate: systemValidate,
} = require('../validators/systemValidator');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Public Authentications protected by strict brute-forcing limits
router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', forgotPasswordRules, systemValidate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, systemValidate, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Secure Session Protected Operations
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);
router.delete('/profile', protect, authController.deleteAccount);
router.post('/change-password', protect, changePasswordRules, systemValidate, authController.changePassword);

// Sessions tracking
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:id', protect, authController.removeSession);

// Multi-Factor 2FA
router.post('/2fa/enable', protect, authController.enable2FA);
router.post('/2fa/disable', protect, authController.disable2FA);

module.exports = router;
