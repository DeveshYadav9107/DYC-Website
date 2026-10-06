import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import User from '../models/User.js';
import env from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ApiError(401, 'User associated with this token no longer exists'));
    }
    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};
