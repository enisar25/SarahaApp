import Joi from "joi";
//src/modules/authModule/auth.validation.js

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  age: Joi.number().min(0).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
export const confirmEmailSchema = Joi.object({
  otp: Joi.string().length(6).required()
});