/**
 * Centralized Response Handler
 * Standardizes all API responses to maintain consistent contract
 */

/**
 * Send success response with standardized format
 * @param {Object} res - Express response object
 * @param {*} data - Response data (content, creations, message, etc.)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  // Determine response structure based on data type
  let response = { success: true };

  if (typeof data === 'string') {
    // String data (e.g., content, message)
    response.content = data;
  } else if (Array.isArray(data)) {
    // Array data (e.g., creations list)
    response.creations = data;
  } else if (typeof data === 'object' && data !== null) {
    // Object data - merge into response
    response = { ...response, ...data };
  } else {
    // Fallback: wrap in data field
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response (delegates to error handler)
 * This is kept for backward compatibility but errors should use errorHandler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message: message || 'Internal server error',
  });
};
