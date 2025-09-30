import { Router } from "express";
import * as authService from './auth.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, loginSchema, resetPasswordSchema, signUpSchema } from "./auth.validation.js";
const authRouter = Router();

// src/modules/authModule/auth.controller.js

authRouter.post('/signup',validation(signUpSchema), authService.signup);
authRouter.post('/login',validation(loginSchema), authService.login);
authRouter.post('/confirm-email',auth(),validation(confirmEmailSchema), authService.confirm_email);
authRouter.post('/resend-otp',auth(), authService.resend_otp);
authRouter.post('/get-access-token', authService.getAccessToken);
authRouter.post('/forget-password', authService.forget_password);
authRouter.post('/reset-password',validation(resetPasswordSchema), authService.reset_password);
authRouter.post('/social-login', authService.social_login);

export default authRouter;