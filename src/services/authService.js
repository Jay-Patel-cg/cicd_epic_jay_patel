const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const User = require('../models/User');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/appError');

/**
 * Generate a JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

/**
 * Register a new user
 */
const registerUser = async (name, email, password, role = 'user') => {
  const emailLower = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: emailLower });
  if (userExists) {
    throw new BadRequestError('User account already registered with this email address');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  const user = await User.create({
    name,
    email: emailLower,
    password,
    role,
    verificationToken,
  });

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    verificationToken, // Returned for easy mock testing/verification
    token,
  };
};

/**
 * Authenticate/Login user and track session
 */
const loginUser = async (email, password, device = 'Unknown Browser', ip = '127.0.0.1') => {
  const emailLower = email.toLowerCase().trim();

  const user = await User.findOne({ email: emailLower });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  if (user.isBlocked) {
    throw new UnauthorizedError('Your account has been blocked by an administrator');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  // Create session
  const sessionId = crypto.randomBytes(16).toString('hex');
  user.sessions.push({ sessionId, device, ip, lastActive: new Date() });
  await user.save();

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    sessionId,
  };
};

/**
 * Register Logout
 */
const logoutUser = async (userId, sessionId) => {
  const user = await User.findById(userId);
  if (user) {
    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
    await user.save();
  }
  return true;
};

/**
 * Get active profile details
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('bookmarks');

  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  return user;
};

/**
 * Update profile details
 */
const updateUserProfile = async (userId, name, email) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  if (name) user.name = name;
  if (email) {
    const emailLower = email.toLowerCase().trim();
    if (emailLower !== user.email) {
      const emailExists = await User.findOne({ email: emailLower });
      if (emailExists) {
        throw new BadRequestError('Email address is already in use by another account');
      }
      user.email = emailLower;
    }
  }

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

/**
 * Delete User Account (Profile delete)
 */
const deleteUserAccount = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }
  return true;
};

/**
 * Change Password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new BadRequestError('Current password entered is incorrect');
  }

  user.password = newPassword;
  await user.save();
  return true;
};

/**
 * Forgot Password (Request token)
 */
const forgotPassword = async (email) => {
  const emailLower = email.toLowerCase().trim();
  const user = await User.findOne({ email: emailLower });
  if (!user) {
    throw new NotFoundError('No account found with this email address');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  return resetToken; // Returned for easy mock testing/verification
};

/**
 * Reset Password
 */
const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Password reset token is invalid or has expired');
  }

  user.password = newPassword;
  user.resetPasswordToken = '';
  user.resetPasswordExpire = undefined;
  await user.save();
  return true;
};

/**
 * Verify Email by token
 */
const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new BadRequestError('Email verification token is invalid or has expired');
  }

  user.emailVerified = true;
  user.verificationToken = '';
  await user.save();
  return true;
};

/**
 * Retrieve User Session lists
 */
const getUserSessions = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }
  return user.sessions;
};

/**
 * Remove session by ID
 */
const removeUserSession = async (userId, sessionId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
  await user.save();
  return true;
};

/**
 * Enable Multi-Factor Authentication
 */
const enable2FA = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  const secret = crypto.randomBytes(10).toString('hex').toUpperCase(); // Dummy authenticator secret
  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  await user.save();

  return {
    secret,
    qrCodeMock: `otpauth://totp/DevOpsPlatform:${user.email}?secret=${secret}&issuer=DevOpsPlatform`,
  };
};

/**
 * Disable Multi-Factor Authentication
 */
const disable2FA = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account profile not found');
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = '';
  await user.save();
  return true;
};

/**
 * Refresh JWT Token
 */
const refreshJWT = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.isBlocked) {
    throw new UnauthorizedError('Access token refreshing failed');
  }
  return generateToken(user._id);
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getUserSessions,
  removeUserSession,
  enable2FA,
  disable2FA,
  refreshJWT,
};
