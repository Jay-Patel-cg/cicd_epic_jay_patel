const authService = require('../services/authService');
const knowledgeService = require('../services/knowledgeService');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { BadRequestError } = require('../utils/appError');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userData = await authService.registerUser(name, email, password, role);

  return res.status(201).json(
    response.success('Registration successful', userData)
  );
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const device = req.headers['user-agent'] || 'Unknown Browser';
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  const userData = await authService.loginUser(email, password, device, ip);

  // Set refresh token in HTTP-only cookie if required in production
  return res.status(200).json(
    response.success('Login successful', userData)
  );
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  // sessionId is obtained from request header or body
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new BadRequestError('sessionId is required in request body');
  }

  await authService.logoutUser(req.user._id, sessionId);
  return res.status(200).json(
    response.success('Logout successful', null)
  );
});

/**
 * Refresh JWT token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = catchAsync(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new BadRequestError('userId parameter is required in request body');
  }

  const token = await authService.refreshJWT(userId);
  return res.status(200).json(
    response.success('Token refreshed successfully', { token })
  );
});

/**
 * Get user profile (Protected)
 * GET /api/v1/auth/profile
 */
const getProfile = catchAsync(async (req, res) => {
  const userProfile = await authService.getUserProfile(req.user._id);

  return res.status(200).json(
    response.success('Profile details fetched successfully', userProfile)
  );
});

/**
 * Update profile details (Protected)
 * PATCH /api/v1/auth/profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  const updated = await authService.updateUserProfile(req.user._id, name, email);
  return res.status(200).json(
    response.success('Profile updated successfully', updated)
  );
});

/**
 * Delete User Account (Protected)
 * DELETE /api/v1/auth/profile
 */
const deleteAccount = catchAsync(async (req, res) => {
  await authService.deleteUserAccount(req.user._id);
  return res.status(200).json(
    response.success('User account deleted successfully', null)
  );
});

/**
 * Change Password (Protected)
 * POST /api/v1/auth/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  return res.status(200).json(
    response.success('Password changed successfully', null)
  );
});

/**
 * Forgot Password
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const resetToken = await authService.forgotPassword(email);
  return res.status(200).json(
    response.success('Password reset token generated successfully. Send this token to the reset endpoint.', { resetToken })
  );
});

/**
 * Reset Password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  return res.status(200).json(
    response.success('Password reset successfully', null)
  );
});

/**
 * Verify Email
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new BadRequestError('verification token is required');
  }

  await authService.verifyEmail(token);
  return res.status(200).json(
    response.success('Email verified successfully', null)
  );
});

/**
 * Retrieve User Sessions (Protected)
 * GET /api/v1/auth/sessions
 */
const getSessions = catchAsync(async (req, res) => {
  const sessions = await authService.getUserSessions(req.user._id);
  return res.status(200).json(
    response.success('Active user login sessions fetched successfully', { sessions })
  );
});

/**
 * Remove active session (Protected)
 * DELETE /api/v1/auth/sessions/:id
 */
const removeSession = catchAsync(async (req, res) => {
  await authService.removeUserSession(req.user._id, req.params.id);
  return res.status(200).json(
    response.success('Active session disconnected successfully', null)
  );
});

/**
 * Enable MFA (Protected)
 * POST /api/v1/auth/2fa/enable
 */
const enable2FA = catchAsync(async (req, res) => {
  const twoFactorData = await authService.enable2FA(req.user._id);
  return res.status(200).json(
    response.success('Multi-factor authentication (2FA) registered successfully', twoFactorData)
  );
});

/**
 * Disable MFA (Protected)
 * POST /api/v1/auth/2fa/disable
 */
const disable2FA = catchAsync(async (req, res) => {
  await authService.disable2FA(req.user._id);
  return res.status(200).json(
    response.success('Multi-factor authentication (2FA) disabled successfully', null)
  );
});

/**
 * Toggle bookmark for a DevOps guide
 * POST /api/v1/auth/bookmarks
 */
const toggleBookmark = catchAsync(async (req, res) => {
  const knowledgeId = req.params.id || (req.body && req.body.knowledgeId);

  const mongoose = require('mongoose');
  if (!knowledgeId || !mongoose.Types.ObjectId.isValid(knowledgeId)) {
    throw new BadRequestError('A valid knowledgeId or workflow ID parameter is required');
  }

  const bookmarkResult = await knowledgeService.toggleBookmark(req.user._id, knowledgeId);
  const message = bookmarkResult.isBookmarked
    ? 'Bookmark added successfully'
    : 'Bookmark removed successfully';

  return res.status(200).json(
    response.success(message, bookmarkResult)
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  deleteAccount,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getSessions,
  removeSession,
  enable2FA,
  disable2FA,
  toggleBookmark,
};
