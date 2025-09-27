import { Router } from "express";
import * as authService from './auth.service.js';
import { auth } from "../../middlewares/auth.middleware.js";
const authRouter = Router();

// src/modules/authModule/auth.controller.js

authRouter.post('/signup', authService.signup);
authRouter.post('/login', authService.login);
authRouter.post('/confirm-email',auth(), authService.confirm_email);
authRouter.post('/resend-otp',auth(), authService.resend_otp);
authRouter.post('/get-access-token', authService.getAccessToken);
authRouter.post('/forget-password', authService.forget_password);
authRouter.post('/reset-password', authService.reset_password);
authRouter.post('/social-login', authService.social_login);

export default authRouter;