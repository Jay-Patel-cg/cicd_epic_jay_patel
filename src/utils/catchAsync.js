/**
 * Wrapper to catch rejected promises in async Express handlers and forward to the error-handler
 * @param {Function} fn - Async controller route function
 * @returns {Function} Express middleware handler
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
