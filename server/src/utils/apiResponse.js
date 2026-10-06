export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
