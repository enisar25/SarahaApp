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