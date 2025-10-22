import Joi from "joi";
import { generalValidations } from '../../utils/general.validation.js'

//src/modules/userModule/user.validation.js

export const updateUserSchema = Joi.object().keys({
  name: generalValidations.name,
  age: generalValidations.age,
  email: generalValidations.email,
  phone: generalValidations.phone,
})

export const userIdSchema = Joi.object().keys({
  id: generalValidations.id.required()
})

export const profileImageSchema = Joi.object().keys({
  fieldname: generalValidations.fieldname.required(),
  originalname: generalValidations.originalname.required(),
  encoding: generalValidations.encoding.required(),
  mimetype: generalValidations.mimetype.required(),
  // destination: generalValidations.destination.required(),
  // filename: generalValidations.filename.required(),
  size: generalValidations.size.required(),
  buffer: generalValidations.buffer.required(),
  // path: generalValidations.path.required(),
})