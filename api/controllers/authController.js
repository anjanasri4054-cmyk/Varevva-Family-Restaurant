import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Admin login
// @route   POST /api/auth/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (admin && (await admin.comparePassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Utility to seed initial admin (only works if admin database is empty)
// @route   POST /api/auth/register-initial
export const registerInitialAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminCount = await Admin.countDocuments({});
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Initial admin account already registered!' });
    }

    const admin = await Admin.create({ email, password });
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
