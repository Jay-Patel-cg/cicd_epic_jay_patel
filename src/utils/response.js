/**
 * Format standard success response
 * @param {string} message - User-friendly success message
 * @param {object} data - Payload data object or array
 * @returns {object} Standard success payload
 */
const success = (message = 'Success', data = {}) => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Format standard error response
 * @param {string} message - User-friendly error message
 * @param {object} error - Detailed error structure or context
 * @returns {object} Standard error payload
 */
const error = (message = 'An error occurred', error = {}) => {
  return {
    success: false,
    message,
    error,
  };
};

module.exports = {
  success,
  error,
};
