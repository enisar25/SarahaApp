import Joi from "joi"
import mongoose from 'mongoose'
import { Gender, Roles } from "../DB/models/user.model.js"
//src/utils/general.validation.js

const checkId = (value, helpers) => {
  if (mongoose.isValidObjectId(value)) {
    return true
  } else {
    return helpers.message('invalid object id')
  }
}

export const generalValidations = {
  //user validations
  name: Joi.string().min(3).max(18),
  email: Joi.string().email(),
  age: Joi.number().min(18).max(50),
  password: Joi.string().min(8).max(20),
  confirmPassword: Joi.string().valid(Joi.ref('password')),
  gender: Joi.string().valid(Gender.male, Gender.female),
  phone: Joi.string().min(10).max(13).regex(/^(\+20|0020|0?)(1)([0125])\d{8}$/),
  otp: Joi.string().length(6),
  id: Joi.string().custom(checkId),
  role: Joi.string().valid(Roles.user, Roles.admin),
  //file validations
  fieldname: Joi.string(),
  originalname: Joi.string(),
  encoding: Joi.string(),
  mimetype: Joi.string(),
  destination: Joi.string(),
  filename: Joi.string(),
  path: Joi.string(),
  size: Joi.number().max(10 * 1024 * 1024), // 10MB
  buffer: Joi.any(),
}
