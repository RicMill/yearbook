import jwt from 'jsonwebtoken';
import Alumni from '../models/Alumni.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for Token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (exclude password) and attach to req.user
      req.user = await Alumni.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in system' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
