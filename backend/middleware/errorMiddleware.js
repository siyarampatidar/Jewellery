// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('\x1b[31m%s\x1b[0m', `[Express Error] Path: ${req.path} | Error: ${err.message}`);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const message = `An account with this ${key} already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication session. Please log in again.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication session expired. Please log in again.' });
  }

  // General server errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error. Something went wrong internally.',
  });
};

export default errorMiddleware;
