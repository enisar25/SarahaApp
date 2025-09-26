// src/utils/successHandler.js
export const successHandler = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
  });
};
