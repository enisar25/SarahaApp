import { Router } from "express";
import * as authService from './auth.service.js';
import * as passwordService from './password.service.js';
import * as emailService from './email.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, loginSchema, resetPasswordSchema, signUpSchema } from "./auth.validation.js";
const authRouter = Router();

// src/modules/authModule/auth.controller.js

authRouter.post('/signup',validation(signUpSchema), authService.signup);
authRouter.post('/login',validation(loginSchema), authService.login);
authRouter.post('/confirm-email',auth(),validation(confirmEmailSchema), emailService.confirm_email);
authRouter.post('/resend-otp',auth(), emailService.resend_otp);
authRouter.post('/get-access-token', authService.getAccessToken);
authRouter.post('/forget-password', passwordService.forget_password);
authRouter.post('/reset-password', passwordService.reset_password);
authRouter.post('/social-login', authService.social_login);
authRouter.post('/request-email-update', auth(), emailService.update_email);
authRouter.post('/confirm-email-update', auth(), emailService.confirm_update_email);

export default authRouter;