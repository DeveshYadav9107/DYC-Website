import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { successResponse } from '../utils/apiResponse.js';
import env from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide an email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 200, 'User data retrieved', user);
  } catch (error) {
    next(error);
  }
};
