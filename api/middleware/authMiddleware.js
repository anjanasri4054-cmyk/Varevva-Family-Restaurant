import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;
  console.log('--- Auth Middleware ---');
  console.log('Authorization Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? `${token.substring(0, 15)}...` : 'EMPTY');
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET env variable is not defined!');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, admin ID:', decoded.id);
      
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        console.error('Admin user not found in DB for decoded ID:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, admin user not found' });
      }
      console.log('Admin authorization successful for:', req.admin.email);
      return next();
    } catch (error) {
      console.error('JWT validation error:', error.message);
      return res.status(401).json({ message: `Not authorized, token failed: ${error.message}` });
    }
  }

  if (!token) {
    console.error('No authorization token provided in headers');
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
