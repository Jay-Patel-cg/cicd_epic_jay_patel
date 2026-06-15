const config = require('../config/config');
const response = require('../utils/response');

/**
 * Global Express Centralized Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let errorInstance = { ...err };
  errorInstance.message = err.message;
  errorInstance.statusCode = err.statusCode || 500;

  // Log detailed error console dumps in non-production
  if (config.env === 'development') {
    console.error('--- Operational/System Error Caught ---');
    console.error(err);
  } else {
    // In production, log system crashes/bugs to error logs/aggregators
    if (!err.isOperational) {
      console.error('--- UNHANDLED SYSTEM CRASH ERROR ---');
      console.error(err.stack || err);
    }
  }

  // Handle Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    const msg = `Resource not found with invalid ID: ${err.value}`;
    return res.status(404).json(
      response.error(msg, { status: 404, type: 'NotFoundError' })
    );
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    const msg = `Duplicate entry: value for field(s) [ ${fields} ] already exists.`;
    return res.status(400).json(
      response.error(msg, { status: 400, type: 'DuplicateKeyError' })
    );
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const fieldsDetails = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json(
      response.error('Input validation constraints violated', {
        status: 400,
        type: 'ValidationError',
        details: fieldsDetails,
      })
    );
  }

  // Handle JWT Validation Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      response.error('Not authorized, invalid authentication token', {
        status: 401,
        type: 'UnauthorizedError',
      })
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      response.error('Not authorized, session token has expired', {
        status: 401,
        type: 'TokenExpiredError',
      })
    );
  }

  // Handle express-validator errors explicitly if passed down
  if (err.type === 'express-validator') {
    return res.status(400).json(
      response.error('Input validation failed', {
        status: 400,
        type: 'ValidationError',
        errors: err.errors,
      })
    );
  }

  // Production vs Development Payload Delivery
  if (config.env === 'development') {
    return res.status(errorInstance.statusCode).json(
      response.error(errorInstance.message, {
        status: errorInstance.statusCode,
        isOperational: err.isOperational || false,
        stack: err.stack,
      })
    );
  } else {
    // In Production: Deliver clean messages for operational errors, hide technical details for others
    if (err.isOperational) {
      return res.status(errorInstance.statusCode).json(
        response.error(errorInstance.message, {
          status: errorInstance.statusCode,
        })
      );
    } else {
      // Hidden bug/database crash
      return res.status(500).json(
        response.error('Something went wrong on our side. Please try again later.', {
          status: 500,
        })
      );
    }
  }
};

module.exports = errorHandler;
