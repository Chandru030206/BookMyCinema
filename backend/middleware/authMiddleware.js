/**
 * BookMyCinema - JWT Authentication Middleware
 * 
 * Protects routes that require authentication
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Middleware to verify JWT token
 * Adds user info to req.user if valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const users = await query(
      'SELECT user_id, name, email FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      });
    }

    // Add user info to request
    req.user = {
      userId: users[0].user_id,
      name: users[0].name,
      email: users[0].email
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const users = await query(
      'SELECT user_id, name, email FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length > 0) {
      req.user = {
        userId: users[0].user_id,
        name: users[0].name,
        email: users[0].email
      };
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
