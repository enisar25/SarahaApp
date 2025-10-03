import Joi from "joi";
import { generalValidations } from '../../utils/general.validation.js'

//src/modules/authModule/auth.validation.js

export const signUpSchema = Joi.object().keys({
  name: generalValidations.name.required(),
  email: generalValidations.email.required(),
  age: generalValidations.age,
  password: generalValidations.password.required(),
  confirmPassword: generalValidations.confirmPassword.required(),
  gender: generalValidations.gender,
  role: generalValidations.role,
  phone: generalValidations.phone,
})

export const loginSchema = Joi.object().keys({
  email: generalValidations.email.required(),
  password: generalValidations.password.required(),
})

export const confirmEmailSchema = Joi.object().keys({
  otp:generalValidations.otp.required()
})

export const forgetPassSchema = Joi.object().keys({
  email: generalValidations.email.required()
})

export const resetPassSchema = Joi.object().keys({
  email: generalValidations.email.required(),
  otp: generalValidations.otp.required(),
  newPassword: generalValidations.password.required(),
  confirmNewPassword: generalValidations.confirmPassword.required(),
})

export const emailUpdateSchema = Joi.object().keys({
  newEmail: generalValidations.email.required(),
})

export const confirmEmailUpdateSchema = Joi.object().keys({
  otp: generalValidations.otp.required(),
  newEmail: generalValidations.email.required(),
})
