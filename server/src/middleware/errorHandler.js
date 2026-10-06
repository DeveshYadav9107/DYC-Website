import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  
  if (env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  const response = {
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};
