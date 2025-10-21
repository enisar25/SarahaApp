import { ValidationError } from '../utils/errorHandler.js';

// src/middlewares/validation.middleware.js
export const validation = (schema) => {
  return (req, res, next) => {
    const data = {
        ...req.body,
        ...req.params,
        ...req.query,
        ...req.file,
        ...req.files
    }

    const result = schema.validate(data, { abortEarly: false });
    if (result.error) {
      return next(new ValidationError(result.error));
    }
    next();
  };
};