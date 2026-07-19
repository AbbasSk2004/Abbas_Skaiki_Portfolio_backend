import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { catchAsync } from '../middlewares/errorHandler.js';

// Signs a JWT carrying the admin id.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Builds the HttpOnly cookie options.
const cookieOptions = () => {
  const days = Number(process.env.COOKIE_EXPIRES_DAYS || 7);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};

/**
 * POST /api/auth/login
 * Authenticates an admin and issues a JWT via an HttpOnly cookie.
 */
export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username and password.',
    });
  }

  // password has select:false, so explicitly request it
  const admin = await Admin.findOne({ username }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  const token = signToken(admin._id);

  res.cookie('token', token, cookieOptions());

  res.status(200).json({
    success: true,
    data: { id: admin._id, username: admin.username },
  });
});

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export const logout = catchAsync(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 0,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated admin (requires protect middleware).
 */
export const checkMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { id: req.admin._id, username: req.admin.username },
  });
});
