const rateLimit = require('express-rate-limit');

/**
 * Global API Rate Limiter
 * Maximum 200 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    error: { status: 429 },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Authentication Rate Limiter
 * Maximum 15 requests per 15 minutes per IP (Brute-force security gate)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again after 15 minutes to safeguard your account.',
    error: { status: 429 },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
};
