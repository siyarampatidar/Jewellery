import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (excluding password, otp, etc.)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    // Ensure user has verified their email (if required)
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. Please verify your email first.',
        unverified: true,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid or expired. Please log in again.',
    });
  }
};

// Restrict access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'guest'}) is not authorized to access this resource.`,
      });
    }
    next();
  };
};
