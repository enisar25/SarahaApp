import { Router } from "express";
import * as authService from './auth.service.js';
import * as passwordService from './password.service.js';
import * as emailService from './email.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, emailUpdateSchema, forgetPassSchema, loginSchema, resetPassSchema, signUpSchema } from "./auth.validation.js";
const authRouter = Router();

// src/modules/authModule/auth.controller.js

authRouter.post('/signup',
    validation(signUpSchema),
    authService.signup);

authRouter.post('/login',
    validation(loginSchema),
    authService.login);

authRouter.post('/confirm-email',
    auth(),
    validation(confirmEmailSchema),
    emailService.confirm_email);

authRouter.post('/resend-otp',
    auth(),
    emailService.resend_otp);

authRouter.post('/get-access-token',
    authService.getAccessToken);

authRouter.post('/forget-password',
    validation(forgetPassSchema),
    passwordService.forget_password);

authRouter.post('/reset-password',
    validation(resetPassSchema),
    passwordService.reset_password);

authRouter.post('/social-login',
    authService.social_login);

authRouter.post('/request-email-update',
    auth(),
    validation(emailUpdateSchema),
    emailService.update_email);

authRouter.post('/confirm-email-update',
    auth(),
    validation(confirmEmailSchema),
    emailService.confirm_update_email);

export default authRouter;